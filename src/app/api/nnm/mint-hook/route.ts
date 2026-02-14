import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, tier, tokenId } = body;

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
      .select('nnm_balance')
      .eq('wallet_address', wallet)
      .single();

    const currentNNM = walletData ? Number(walletData.nnm_balance) : 0;
    const newNNM = currentNNM + rewardAmount;

    const { error: walletError } = await supabase
      .from('nnm_wallets')
      .upsert({ 
        wallet_address: wallet, 
        nnm_balance: newNNM,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (walletError) throw walletError;

    if (tokenId) {
        const { error: voteError } = await supabase
            .from('conviction_votes')
            .insert({
                token_id: tokenId.toString(),
                supporter_address: wallet,
                amount: rewardAmount, 
                created_at: new Date().toISOString()
            });
            
        if (voteError) console.error("Failed to insert conviction record:", voteError);
    }

    return NextResponse.json({ success: true, added: rewardAmount, type: 'NNM' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
