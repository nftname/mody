import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther, formatEther, fallback } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// إعداد الاتصال بالبلوكشين
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

// --- دالة السعر الذكية (Smart Price Fetcher) ---
async function getRealTimePolPrice() {
  try {
    // محاولة 1: Binance (الأسرع)
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=POLUSDT', { next: { revalidate: 0 } });
    if (res.ok) {
        const data = await res.json();
        const price = parseFloat(data.price);
        console.log(`✅ Price from Binance: $${price}`);
        return price;
    }
  } catch (e) { console.warn("Binance Failed, trying CoinGecko..."); }

  try {
    // محاولة 2: CoinGecko (الاحتياطي)
    // ملاحظة: CoinGecko قد يسمي العملة matic-network
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd', { next: { revalidate: 0 } });
    if (res.ok) {
        const data = await res.json();
        const price = data['matic-network'].usd;
        console.log(`✅ Price from CoinGecko: $${price}`);
        return price;
    }
  } catch (e) { console.warn("CoinGecko Failed."); }

  // سعر الطوارئ فقط إذا انقطع الإنترنت عن السيرفر تماماً
  console.warn("⚠️ All APIs failed. Using fallback $0.40");
  return 0.40; 
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting Real-Time Payout...");

    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Missing Private Key");

    const cleanPk = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
    const account = privateKeyToAccount(cleanPk as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport
    });

    // 1. جلب السعر الحقيقي الآن
    const currentPolPrice = await getRealTimePolPrice();

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
        // المعادلة: المبلغ بالدولار (NNM * 0.05) / سعر العملة الحالي
        // مثال: 0.15$ / 0.32$ = 0.468 POL
        const targetUsd = req.usd_value_at_time || (parseFloat(req.amount_nnm) * 0.05);
        
        const polAmount = targetUsd / currentPolPrice;
        
        // تقريب آمن لـ 18 خانة عشرية
        const valueInWei = parseEther(polAmount.toFixed(18));

        console.log(`💸 Paying ${req.wallet_address}: $${targetUsd} USD = ${polAmount.toFixed(4)} POL (@ $${currentPolPrice})`);

        // إرسال المعاملة
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueInWei,
          chain: polygon
        });

        // انتظار التأكيد
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
        await supabase
          .from('nnm_payout_logs')
          .update({ status: 'FAILED', error_reason: err.message })
          .eq('id', req.id);
        results.push({ id: req.id, status: 'FAILED', reason: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, usedPrice: currentPolPrice, details: results });

  } catch (err: any) {
    console.error('Critical Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
