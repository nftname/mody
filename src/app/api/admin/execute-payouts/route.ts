import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther, formatEther, fallback, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// 1. إعداد RPC سريع وموثوق
const transport = fallback([
  http("https://polygon-bor-rpc.publicnode.com"),
  http("https://polygon-rpc.com"),
  http("https://rpc.ankr.com/polygon"),
]);

const publicClient = createPublicClient({ chain: polygon, transport });

// 2. عقد Chainlink لجلب السعر (MATIC/USD Price Feed Address on Polygon)
const CHAINLINK_PRICE_FEED = "0xAB594600376Ec9fD91F8E885dADF0CE036862dE0";
const PRICE_FEED_ABI = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// دالة مساعدة لجلب السعر الحقيقي من البلوكشين
async function getLivePolPrice() {
  try {
    const data = await publicClient.readContract({
      address: CHAINLINK_PRICE_FEED,
      abi: PRICE_FEED_ABI,
      functionName: 'latestRoundData'
    });
    
    // Chainlink returns price with 8 decimals (e.g. 40000000 = $0.40)
    const price = Number(data[1]) / 1e8;
    console.log(`✅ Oracle Price: $${price}`);
    return price;
  } catch (e) {
    console.error("Oracle Failed, using fallback:", e);
    return 0.40; // سعر طوارئ فقط إذا فشل كل شيء
  }
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting Oracle-Based Payout...");

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
    const currentPolPrice = await getLivePolPrice();

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
        // حساب القيمة
        const targetUsd = req.usd_value_at_time || (parseFloat(req.amount_nnm) * 0.05);
        const polAmount = targetUsd / currentPolPrice;
        const valueInWei = parseEther(polAmount.toFixed(18));

        console.log(`💸 Processing ${req.wallet_address}: $${targetUsd} = ${polAmount.toFixed(4)} POL`);

        // إرسال المعاملة
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueInWei,
          chain: polygon
        });

        console.log(`⏳ Sent! Hash: ${hash} - Waiting for confirmation...`);

        // انتظار التأكيد (لضمان النجاح)
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
             results.push({ id: req.id, status: 'SUCCESS', hash });
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

    return NextResponse.json({ success: true, processed: results.length, oraclePrice: currentPolPrice, details: results });

  } catch (err: any) {
    console.error('Critical Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
