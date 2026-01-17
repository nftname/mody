import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { supporterWallet, tokenId, ownerWallet } = body;

    const COST_WNNM = 1;       
    const REWARD_USER = 3;     
    const REWARD_OWNER = 1;    

    const { data, error } = await supabase.rpc('process_support_transaction', {
      supporter_wallet: supporterWallet,
      token_id: tokenId,
      owner_wallet: ownerWallet,
      wnnm_cost: COST_WNNM,
      nnm_reward_user: REWARD_USER,
      nnm_reward_owner: REWARD_OWNER
    });

    if (error) throw error;

    if (!data.success) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      newBalance: REWARD_USER, 
      message: 'Conviction registered successfully!' 
    });

  } catch (err) {
    console.error('Conviction Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
