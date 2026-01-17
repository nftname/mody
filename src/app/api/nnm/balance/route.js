import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  // جلب البيانات من الرابط في النظام الجديد
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance, total_earned_nnm')
      .eq('wallet_address', wallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const balanceData = data || {
      wnnm_balance: 0,
      nnm_balance: 0,
      total_earned_nnm: 0
    };

    return NextResponse.json({
      success: true,
      data: balanceData
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
