import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { wallet, tokenId } = body; // تأكد أن الصفحة ترسل tokenId أيضاً إن أمكن

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const REWARD_AMOUNT = 3; 

    // --- 1. تسجيل النشاط في السجل (هذا هو الجزء المفقود!) ---
    // هذا التسجيل هو ما سيجعل ملف Balance يرى العملية ويحسبها، ويجعلها تظهر في الجدول
    const { error: activityError } = await supabase.from('activities').insert([{
      activity_type: 'Mint',
      token_id: tokenId || 0, // رقم التوكن (أو 0 إذا لم يتوفر)
      from_address: 'NullAddress',
      to_address: wallet,
      price: 0,
      created_at: new Date().toISOString()
    }]);

    if (activityError) {
      console.error('Failed to log mint activity:', activityError);
    }

    // --- 2. تحديث الرصيد الفوري (للسرعة فقط) ---
    // نقوم بتحديث الرصيد يدوياً هنا أيضاً لكي يراه العميل فوراً قبل أن يعمل "المفتش"
    const { data: existingUser } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance')
      .eq('wallet_address', wallet)
      .single();

    if (!existingUser) {
      await supabase.from('nnm_wallets').insert([{
        wallet_address: wallet,
        wnnm_balance: REWARD_AMOUNT,
        nnm_balance: 0
      }]);
    } else {
      await supabase
        .from('nnm_wallets')
        .update({ 
          wnnm_balance: parseFloat(existingUser.wnnm_balance) + REWARD_AMOUNT,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet);
    }

    return NextResponse.json({ success: true, message: 'Mint processed and logged correctly' });

  } catch (err) {
    console.error('Mint Hook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
