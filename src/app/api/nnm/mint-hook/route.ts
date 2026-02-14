import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, tier } = body;

    if (!wallet) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });

    let rewardAmount = 0;
    const tierUpper = tier ? tier.toUpperCase() : 'FOUNDER';

    if (tierUpper === 'IMMORTAL') {
        rewardAmount = 300000;
    } else if (tierUpper === 'ELITE') {
        rewardAmount = 200000;
    } else {
        rewardAmount = 100000;
    }

    const { data: walletData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance')
      .eq('wallet_address', wallet)
      .single();

    const currentWNNM = walletData ? Number(walletData.wnnm_balance) : 0;
    const newWNNM = currentWNNM + rewardAmount;

    const { error } = await supabase
      .from('nnm_wallets')
      .upsert({ 
        wallet_address: wallet, 
        wnnm_balance: newWNNM,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (error) throw error;

    return NextResponse.json({ success: true, added: rewardAmount });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}