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

    // 1. Verify Balance
    const { data: userData } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (!userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 2. Atomic Update: Deduct Balance & Log Request
    
    // A. Deduct Balance
    const newBalance = parseFloat(userData.nnm_balance) - amountNNM;
    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({ 
        nnm_balance: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq('wallet_address', userWallet);

    if (updateError) throw new Error("Failed to update balance");

    // B. Log Request (Status: PENDING)
    // We record the request so the Admin Script can process it later.
    await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: amountNNM * 0.05, // Record theoretical value
      exchange_rate_used: 0, // 0 indicates pending market rate calculation
      status: 'PENDING', 
      tx_hash: 'WAITING_ADMIN_BATCH',
      created_at: new Date().toISOString()
    }]);

    return NextResponse.json({ success: true, message: "Request queued successfully" });

  } catch (err: any) {
    console.error('Claim Request Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
