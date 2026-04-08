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

    let nnmReward = 0;   
    let wnnmReward = 0; 
    let newSystemWnnm = 0;

    const tierUpper = tier ? tier.toUpperCase() : 'FOUNDER';
    
    if (tierUpper === 'IMMORTAL') {
        nnmReward = 300000;
        wnnmReward = 3000;
        newSystemWnnm = 3000;
    } else if (tierUpper === 'ELITE') {
        nnmReward = 200000;
        wnnmReward = 2000;
        newSystemWnnm = 2000;
    } else {
        nnmReward = 100000;
        wnnmReward = 1000;
        newSystemWnnm = 1000;
    }
   
    const { data: walletData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance')
      .eq('wallet_address', wallet)
      .single();

    const currentNNM = walletData ? Number(walletData.nnm_balance) : 0;
    const currentWNNM = walletData ? Number(walletData.wnnm_balance) : 0;
    
    const newNNM = currentNNM + nnmReward;
    const newWNNM = currentWNNM + wnnmReward;
    
    const { error: walletError } = await supabase
      .from('nnm_wallets')
      .upsert({ 
        wallet_address: wallet, 
        nnm_balance: newNNM,
        wnnm_balance: newWNNM,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (walletError) throw walletError;

    const { data: claimData } = await supabase
      .from('nnm_claim_balances')
      .select('wnnm_balance, claimable_nnm')
      .eq('wallet_address', wallet)
      .single();

    const currentClaimWNNM = claimData ? Number(claimData.wnnm_balance) : 0;
    const currentClaimableNNM = claimData ? Number(claimData.claimable_nnm) : 0;

    const { error: claimError } = await supabase
      .from('nnm_claim_balances')
      .upsert({
        wallet_address: wallet,
        wnnm_balance: currentClaimWNNM + newSystemWnnm,
        claimable_nnm: currentClaimableNNM,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (claimError) console.error(claimError);

    if (tokenId) {
        const { error: voteError } = await supabase
            .from('conviction_votes')
            .insert({
                token_id: tokenId.toString(),
                supporter_address: wallet,
                amount: nnmReward, 
                created_at: new Date().toISOString()
            });
            
        if (voteError) console.error(voteError);
    }

    return NextResponse.json({ success: true, addedNNM: nnmReward, addedWNNM: wnnmReward, newSystemAddedWNNM: newSystemWnnm });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
