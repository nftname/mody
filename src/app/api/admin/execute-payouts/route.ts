import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, fallback, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// إعداد شبكة بوليجون (عدة خطوط لضمان عدم الانقطاع)
const transport = fallback([
  http("https://polygon-rpc.com"),
  http("https://rpc-mainnet.maticvigil.com"),
  http("https://polygon-bor-rpc.publicnode.com")
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. إعداد المحفظة الساخنة (Hot Wallet)
    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Server Error: Missing Hot Wallet Key");

    const account = privateKeyToAccount(pk.startsWith('0x') ? pk as `0x${string}` : `0x${pk}` as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: transport
    }).extend(publicActions);

    // 2. جلب الطلبات المعلقة (PENDING)
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('nnm_payout_logs')
      .select('*')
      .eq('status', 'PENDING')
      .limit(50);

    if (fetchError) throw new Error(`Database Error: ${fetchError.message}`);
    if (!pendingRequests || pendingRequests.length === 0) {
      return NextResponse.json({ success: true, message: "No pending payouts found." });
    }

    // 3. جلب سعر POL الحالي (Live Price)
    // هذا هو أهم جزء لضمان دقة الـ 5 سنت
    let currentPolPrice = 0.40; // سعر افتراضي للأمان
    try {
        const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT', { signal: AbortSignal.timeout(5000) });
        const priceData = await priceRes.json();
        currentPolPrice = parseFloat(priceData.price);
        console.log(`Current POL Price: $${currentPolPrice}`);
    } catch (e) {
        console.warn("Price Fetch Failed, using fallback.");
    }

    const results = [];

    // 4. حلقة الدفع (The Payout Loop)
    for (const req of pendingRequests) {
      try {
        // المعادلة الذهبية:
        // المبلغ المراد تحويله (POL) = القيمة الدولارية المثبتة / سعر العملة الحالي
        // إذا كان usd_value_at_time فارغاً، نحسبه احتياطياً (NNM * 0.05)
        const targetUsdValue = req.usd_value_at_time || (req.amount_nnm * 0.05);
        
        // حساب كمية البول بدقة
        const polAmountToSend = targetUsdValue / currentPolPrice;
        
        // التحويل لوحدة Wei
        // toFixed(18) تمنع الكسور الطويلة جداً التي ترفضها الشبكة
        const valueInWei = parseEther(polAmountToSend.toFixed(18));

        console.log(`Processing ID ${req.id}: Sending ${polAmountToSend} POL ($${targetUsdValue}) to ${req.wallet_address}`);

        // تنفيذ التحويل على البلوكشين
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueInWei,
          chain: polygon
        });

        // تحديث حالة الطلب في قاعدة البيانات
        await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'PAID', // تم الدفع
            tx_hash: hash,
            exchange_rate_used: currentPolPrice, // نسجل السعر الذي تم التحويل به للمراجعة
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);

        results.push({ id: req.id, status: 'SUCCESS', hash, polSent: polAmountToSend });

      } catch (txError: any) {
        console.error(`Payout Failed for ID ${req.id}:`, txError);
        
        // تسجيل الفشل ولكن لا نحذف الطلب، يبقى PENDING أو FAILED للمحاولة لاحقاً
        await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'FAILED', 
            error_reason: txError.message || 'Tx Failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);

        results.push({ id: req.id, status: 'FAILED', reason: txError.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length, 
      priceUsed: currentPolPrice,
      details: results 
    });

  } catch (err: any) {
    console.error('Critical Expert Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
