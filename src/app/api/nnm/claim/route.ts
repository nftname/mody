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

    const { data: userData } = await supabase
      .from('nnm_claim_balances')
      .select('claimable_nnm')
      .eq('wallet_address', userWallet)
      .single();

    if (!userData || parseFloat(userData.claimable_nnm) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const usdValue = amountNNM * 0.05; 

    const newBalance = parseFloat(userData.claimable_nnm) - amountNNM;
    const { error: updateError } = await supabase
      .from('nnm_claim_balances')
      .update({ 
        claimable_nnm: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq('wallet_address', userWallet);

    if (updateError) throw new Error("Failed to update balance: " + updateError.message);

    const { error: logError } = await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: usdValue,
      status: 'PENDING',
      created_at: new Date().toISOString()
    }]);

    if (logError) {
        console.error("Database Insert Error:", logError);
        throw new Error("Failed to log request: " + logError.message);
    }

    return NextResponse.json({ success: true, message: "Claim queued successfully" });

  } catch (err: any) {
    console.error('Claim Request Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
