import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userWallet, amountNNM } = body;

    // 1. التحقق من الرصيد
    const { data: userData } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (!userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 2. تطبيق قاعدة الـ 5 سنت (The 5-Cent Rule)
    // نحسب القيمة الدولارية المستحقة ونخزنها
    const usdValue = amountNNM * 0.05; 

    // 3. خصم الرصيد من المحفظة
    const newBalance = parseFloat(userData.nnm_balance) - amountNNM;
    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({ 
        nnm_balance: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq('wallet_address', userWallet);

    if (updateError) throw new Error("Failed to update balance: " + updateError.message);

    // 4. تسجيل الطلب مع القيمة الدولارية المثبتة
    // نترك (exchange_rate) و (tx_hash) للكود الأخير ليملأها وقت الصرف
    const { error: logError } = await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: usdValue, // هنا نثبت حق العميل بالدولار
      status: 'PENDING',
      created_at: new Date().toISOString()
    }]);

    if (logError) {
        // حماية: إذا فشل التسجيل نرجع خطأ (يمكنك إضافة كود لإعادة الرصيد هنا مستقبلاً)
        console.error("Database Insert Error:", logError);
        throw new Error("Failed to log request: " + logError.message);
    }

    return NextResponse.json({ success: true, message: "Claim queued successfully" });

  } catch (err: any) {
    console.error('Claim Request Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
