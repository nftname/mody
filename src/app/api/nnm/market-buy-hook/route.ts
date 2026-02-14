
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerWallet, tokenId, price } = body;

    if (!buyerWallet) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });

    const wnnmReward = 100;

    const { data: walletData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance')
      .eq('wallet_address', buyerWallet)
      .single();

    const currentWNNM = walletData ? Number(walletData.wnnm_balance) : 0;
    const newWNNM = currentWNNM + wnnmReward;

    const { error } = await supabase
      .from('nnm_wallets')
      .upsert({ 
        wallet_address: buyerWallet, 
        wnnm_balance: newWNNM,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (error) throw error;


    return NextResponse.json({ success: true, addedWNNM: wnnmReward });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
