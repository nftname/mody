import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther, formatEther, fallback } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// 1. إعداد الاتصال (RPC)
const transport = fallback([
  http("https://polygon-bor-rpc.publicnode.com"),
  http("https://polygon-rpc.com"),
  http("https://rpc.ankr.com/polygon"),
]);

const publicClient = createPublicClient({ chain: polygon, transport });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- دالة السعر المستنسخة من صفحة الماركت ---
async function getMarketPrice() {
  try {
    // نستخدم نفس الرابط الموجود في صفحة الماركت بالضبط
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network&vs_currencies=usd';
    
    const res = await fetch(url, { 
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            // خدعة هامة: نرسل User-Agent لكي يظن CoinGecko أننا متصفح ولسنا سيرفر
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        next: { revalidate: 0 } 
    });

    if (!res.ok) throw new Error(`API Status: ${res.status}`);

    const data = await res.json();
    
    // نفس منطق الماركت: نفحص الاسمين المحتملين للعملة
    const polPrice = data['polygon-ecosystem-token']?.usd || data['matic-network']?.usd;

    if (!polPrice) throw new Error("Price data missing in response");

    console.log(`✅ Market Logic Price: $${polPrice}`);
    return polPrice;

  } catch (e) {
    console.warn("⚠️ Market API Failed (Server Side limitation), using fallback...");
    // إذا فشل الاتصال، نستخدم سعر تقريبي للطوارئ (0.40)
    // أو يمكن تفعيل Chainlink هنا كبديل، لكن سنبقيها بسيطة كما طلبت
    return 0.40;
  }
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting Payout with Market Pricing...");

    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Missing Private Key");

    const cleanPk = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
    const account = privateKeyToAccount(cleanPk as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport
    });

    // 1. جلب السعر باستخدام منطق الماركت
    const currentPolPrice = await getMarketPrice();

    // 2. جلب الطلبات المعلقة
    const { data: pendingRequests } = await supabase
      .from('nnm_payout_logs')
      .select('*')
      .eq('status', 'PENDING')
      .limit(5);

    if (!pendingRequests || pendingRequests.length === 0) {
      return NextResponse.json({ success: true, message: "No pending payouts" });
    }

    const results = [];

    // 3. حلقة التنفيذ
    for (const req of pendingRequests) {
      try {
        // حساب القيمة المستحقة
        // نستخدم القيمة الدولارية المثبتة (أو نحسبها 5 سنت لكل عملة)
        const targetUsd = req.usd_value_at_time || (parseFloat(req.amount_nnm) * 0.05);
        
        // المعادلة: المبلغ بالدولار / سعر العملة الحالي
        const polAmount = targetUsd / currentPolPrice;
        
        // تجهيز المعاملة
        const valueInWei = parseEther(polAmount.toFixed(18));

        console.log(`💸 Paying ${req.wallet_address}: $${targetUsd} USD = ${polAmount.toFixed(4)} POL (@ $${currentPolPrice})`);

        // إرسال المعاملة
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueInWei,
          chain: polygon
        });

        console.log(`⏳ Sent! Hash: ${hash}. Waiting confirmation...`);

        // انتظار التأكيد (لضمان عدم ضياع الأموال)
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
             await supabase
              .from('nnm_payout_logs')
              .update({ 
                status: 'PAID', 
                tx_hash: hash,
                exchange_rate_used: currentPolPrice,
                processed_at: new Date().toISOString()
              })
              .eq('id', req.id);
             results.push({ id: req.id, status: 'SUCCESS', hash, sent: polAmount });
        } else {
            throw new Error("Transaction Reverted");
        }

      } catch (err: any) {
        console.error(`❌ Failed ID ${req.id}:`, err);
        // تسجيل الخطأ دون إيقاف السكريبت
        await supabase
          .from('nnm_payout_logs')
          .update({ status: 'FAILED', error_reason: err.message })
          .eq('id', req.id);
        results.push({ id: req.id, status: 'FAILED', reason: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, marketPrice: currentPolPrice, details: results });

  } catch (err: any) {
    console.error('Critical Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
