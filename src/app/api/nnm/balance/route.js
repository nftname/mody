import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// منع الكاش لضمان أرقام حقيقية كل مرة
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawWallet = searchParams.get('wallet');

  if (!rawWallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  // توحيد صيغة المحفظة لتجنب مشاكل الحروف الكبيرة والصغيرة
  const wallet = rawWallet.toLowerCase();

  try {
    // --- 1. المصحح الذكي (Auditor Logic) ---
    // نقوم بحساب الرصيد من سجل العمليات لضمان الدقة 100%

    // أ) حساب نقاط الطباعة (Mint = 3 WNNM)
    const { count: mintCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'Mint')
      .ilike('to_address', wallet); // ilike تتجاهل حالة الأحرف

    // ب) حساب نقاط الشراء من الماركت (Sale = 1 WNNM)
    const { count: buyCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'Sale')
      .ilike('to_address', wallet);

    // ج) حساب النقاط التي تم إنفاقها (Support Spent = 1 WNNM)
    const { count: spentCount } = await supabase
      .from('nnm_conviction_ledger')
      .select('*', { count: 'exact', head: true })
      .ilike('supporter_wallet', wallet);

    // د) المعادلة النهائية لرصيد الوقود
    // الرصيد = (طباعة × 3) + (شراء × 1) - (ما تم إنفاقه)
    const calculatedWNNM = ((mintCount || 0) * 3) + ((buyCount || 0) * 1) - (spentCount || 0);

    // --- 2. تحديث قاعدة البيانات بالرقم الصحيح ---
    // نقوم بتحديث الجدول الرئيسي لكي يكون متزامناً دائماً
    const { data: updatedWallet, error: upsertError } = await supabase
      .from('nnm_wallets')
      .upsert({ 
        wallet_address: wallet,
        wnnm_balance: calculatedWNNM,
        // ملاحظة: رصيد NNM (الكاش) نتركه كما هو أو نجلب قيمته الحالية لعدم تصفيره
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' })
      .select('wnnm_balance, nnm_balance, total_earned_nnm')
      .single();

    if (upsertError) {
      console.error('Balance Sync Error:', upsertError);
      // في حالة فشل التحديث، نرسل القيمة المحسوبة مباشرة
      return NextResponse.json({
        success: true,
        data: {
          wnnm_balance: calculatedWNNM,
          nnm_balance: 0, // أو القيمة القديمة إذا توفرت
          total_earned_nnm: 0
        }
      });
    }

    // --- 3. إرسال الرد للداشبورد ---
    return NextResponse.json({
      success: true,
      data: updatedWallet,
      debug: {
        mints: mintCount,
        buys: buyCount,
        spent: spentCount,
        logic: 'Re-calculated from history logs'
      }
    });

  } catch (err) {
    console.error('Balance API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
