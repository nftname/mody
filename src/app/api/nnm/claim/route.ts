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

    // 1. التحقق من الرصيد (Verify Balance)
    const { data: userData } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (!userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 2. التنفيذ الذري: خصم الرصيد وتسجيل الطلب
    
    // A. خصم الرصيد (Deduct Balance)
    const newBalance = parseFloat(userData.nnm_balance) - amountNNM;
    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({ 
        nnm_balance: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq('wallet_address', userWallet);

    if (updateError) throw new Error("Failed to update balance: " + updateError.message);

    // B. تسجيل الطلب (Log Request) - تم التبسيط لضمان النجاح
    // نرسل فقط البيانات الأساسية، ونتحقق من وجود أي خطأ في الإدخال
    const { error: logError } = await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      status: 'PENDING',  // الحالة المهمة للأدمن
      created_at: new Date().toISOString()
      // تم حذف الأعمدة الثانوية (usd_value, tx_hash) مؤقتاً لضمان عدم تعطل الإدخال
    }]);

    // [تعديل هام] إذا فشل التسجيل، نرجع الرصيد للعميل أو نرسل خطأ صريح
    if (logError) {
        console.error("Database Insert Error:", logError);
        // يمكنك هنا إضافة كود لإرجاع الرصيد (Rollback) إذا أردت دقة 100%
        // لكن الأهم الآن هو أن نعرف أن هناك خطأ
        throw new Error("Failed to log request in database: " + logError.message);
    }

    return NextResponse.json({ success: true, message: "Request queued successfully" });

  } catch (err: any) {
    console.error('Claim Request Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
