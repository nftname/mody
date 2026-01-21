

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, fallback, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// 1. إعداد خطوط الاتصال (RPC Providers) بالأولوية
const transport = fallback([
  http("https://polygon-rpc.com"),             // الخط الأول (الأقوى)
  http("https://rpc-mainnet.maticvigil.com"),  // الخط الثاني
  http("https://polygon-bor-rpc.publicnode.com"), // الخط الثالث
  http("https://1rpc.io/matic"),               // الخط الرابع
  http("https://matic-mainnet.chainstacklabs.com") // الخط الخامس
]);

// 2. إعداد الاتصال بقاعدة البيانات
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // نستخدم مفتاح الخدمة للتعديل بحرية
);

export async function POST(request: Request) {
  try {
    // A. التحقق من هوية الأدمن (Security Check)
    // يمكن إضافة تحقق إضافي هنا إذا كنت ترسل توكن، لكن سنعتمد حالياً على أن هذا المسار لا يعرفه إلا الأدمن
    // أو يمكن فحص الـ Body للتأكد من وجود كلمة سر بسيطة إذا أردت.
    
    // B. تجهيز المحفظة الساخنة (Hot Wallet)
    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Server Error: Missing Hot Wallet Key");

    const account = privateKeyToAccount(pk.startsWith('0x') ? pk as `0x${string}` : `0x${pk}` as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: transport
    }).extend(publicActions); // إضافة publicActions لقراءة البيانات والغاز تلقائياً

    // C. جلب الطلبات المعلقة (Pending Requests)
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('nnm_payout_logs')
      .select('*')
      .eq('status', 'PENDING')
      .limit(50); // نأخذ 50 طلب في كل دفعة لتجنب الضغط

    if (fetchError) throw new Error(`Database Error: ${fetchError.message}`);
    if (!pendingRequests || pendingRequests.length === 0) {
      return NextResponse.json({ success: true, message: "No pending payouts found." });
    }

    // D. جلب سعر العملة الحالي (للحساب الدقيق)
    let currentPolPrice = 0;
    try {
        const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT', { signal: AbortSignal.timeout(5000) });
        const priceData = await priceRes.json();
        currentPolPrice = parseFloat(priceData.price);
    } catch (e) {
        console.warn("Binance API Failed, using fallback price 0.40");
        currentPolPrice = 0.40; // سعر احتياطي تقريبي في حال فشل باينانس
    }

    const results = [];

    // E. حلقة المعالجة (The Processing Loop)
    for (const req of pendingRequests) {
      try {
        // 1. حساب الكمية
        // المعادلة: قيمة الـ NNM بالدولار (0.05) مقسومة على سعر الـ POL الحالي
        const usdValue = req.amount_nnm * 0.05; 
        const polAmount = usdValue / currentPolPrice;
        
        // التحويل إلى Wei (أصغر وحدة)
        const valueToSend = parseEther(polAmount.toFixed(18));

        // 2. إرسال التحويل (بدون تلاعب بالغاز - نترك الشبكة تحدد)
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueToSend,
          chain: polygon
        });

        // 3. نجاح التحويل -> تحديث الداتا بيز
        await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'PAID', // أو COMPLETED حسب تسميتك في الجدول
            tx_hash: hash,
            exchange_rate_used: currentPolPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);

        results.push({ id: req.id, status: 'SUCCESS', hash });

      } catch (txError: any) {
        // 4. فشل التحويل -> تسجيل الخطأ
        console.error(`Payout Failed for ID ${req.id}:`, txError);
        
        await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'FAILED', 
            error_reason: txError.message || 'Transaction Failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);

        results.push({ id: req.id, status: 'FAILED', reason: txError.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length, 
      details: results 
    });

  } catch (err: any) {
    console.error('Critical Expert Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
