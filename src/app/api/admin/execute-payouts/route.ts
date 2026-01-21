import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, fallback, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

// نستخدم RPC قوي وسريع لتجنب مشاكل الاتصال
const transport = fallback([
  http("https://polygon-bor-rpc.publicnode.com"),
  http("https://polygon-rpc.com"),
  http("https://1rpc.io/matic")
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting Payout Process...");

    // 1. إعداد المحفظة الساخنة
    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Missing Private Key in Env");

    // تنظيف المفتاح من أي مسافات زائدة
    const cleanPk = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
    const account = privateKeyToAccount(cleanPk as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: transport
    }).extend(publicActions);

    console.log(`✅ Wallet Ready: ${account.address}`);

    // 2. جلب الطلبات المعلقة
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('nnm_payout_logs')
      .select('*')
      .eq('status', 'PENDING')
      .limit(10); // نبدأ بـ 10 طلبات فقط للتجربة

    if (fetchError) throw new Error(`DB Error: ${fetchError.message}`);
    if (!pendingRequests || pendingRequests.length === 0) {
      return NextResponse.json({ success: true, message: "No pending payouts" });
    }

    console.log(`found ${pendingRequests.length} pending requests`);

    // 3. تحديد السعر (تثبيت السعر يدوياً لتجاوز مشاكل الـ API)
    // سنجبر السعر على 0.40 دولار لكل POL مؤقتاً لضمان عمل الكود
    const FIXED_POL_PRICE = 0.40; 
    console.log(`ℹ️ Using Fixed POL Price: $${FIXED_POL_PRICE}`);

    const results = [];

    // 4. حلقة التنفيذ
    for (const req of pendingRequests) {
      try {
        console.log(`Processing ID: ${req.id} for Wallet: ${req.wallet_address}`);

        // حساب القيمة المستحقة
        // إذا كان الجدول يحتوي على قيمة دولارية نستخدمها، وإلا نحسبها (الرصيد * 0.05)
        const targetUsd = req.usd_value_at_time && req.usd_value_at_time > 0 
                          ? parseFloat(req.usd_value_at_time) 
                          : (parseFloat(req.amount_nnm) * 0.05);

        // المعادلة: الدولار / السعر = كمية POL
        const polAmount = targetUsd / FIXED_POL_PRICE;
        
        // تحويل لرقم نصوصي آمن (بحد أقصى 18 خانة عشرية)
        const valString = polAmount.toFixed(18);
        const valueInWei = parseEther(valString);

        console.log(`💰 Sending ${valString} POL ($${targetUsd})`);

        // تنفيذ التحويل
        const hash = await walletClient.sendTransaction({
          to: req.wallet_address as `0x${string}`,
          value: valueInWei,
          chain: polygon
        });

        console.log(`✅ Sent! Hash: ${hash}`);

        // تحديث قاعدة البيانات فوراً
        const { error: updateError } = await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'PAID', 
            tx_hash: hash,
            exchange_rate_used: FIXED_POL_PRICE,
            processed_at: new Date().toISOString()
          })
          .eq('id', req.id);

        if(updateError) console.error("Update DB Failed:", updateError);

        results.push({ id: req.id, status: 'SUCCESS', hash });

      } catch (txError: any) {
        console.error(`❌ Failed ID ${req.id}:`, txError);
        
        // تسجيل الفشل في الجدول لنعرف السبب
        await supabase
          .from('nnm_payout_logs')
          .update({ 
            status: 'FAILED', 
            error_reason: txError.message?.substring(0, 200) || 'Unknown Error'
          })
          .eq('id', req.id);

        results.push({ id: req.id, status: 'FAILED', reason: txError.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });

  } catch (err: any) {
    console.error('🔥 Critical Script Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
