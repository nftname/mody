import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RPC_URL = "https://polygon-rpc.com"; 
const provider = new ethers.JsonRpcProvider(RPC_URL);
// نستخدم متغير البيئة للمحفظة
const wallet = new ethers.Wallet(process.env.NNM_HOT_WALLET_PRIVATE_KEY, provider);

export async function POST(request) {
  try {
    const body = await request.json();
    const { userWallet, amountNNM } = body;

    if (!userWallet || !amountNNM || amountNNM <= 0) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    // 1. التحقق من الرصيد
    const { data: userData, error: fetchError } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (fetchError || !userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient NNM balance' }, { status: 400 });
    }

    // 2. الحسابات المالية
    const FIXED_RATE = 0.10; 
    const totalUsdValue = amountNNM * FIXED_RATE;

    const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT');
    const priceData = await priceRes.json();
    const currentPolPrice = parseFloat(priceData.price);

    if (!currentPolPrice) throw new Error('Failed to fetch POL price');

    const polToSend = totalUsdValue / currentPolPrice;
    const txValue = ethers.parseEther(polToSend.toFixed(18));

    // 3. التحويل
    const tx = await wallet.sendTransaction({
      to: userWallet,
      value: txValue
    });

    // 4. الخصم
    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({
        nnm_balance: parseFloat(userData.nnm_balance) - amountNNM,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', userWallet);

    if (updateError) {
      console.error('Critical Error: Money sent but DB not updated!', userWallet);
    }

    // 5. التسجيل
    await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: totalUsdValue,
      tx_hash: tx.hash,
      status: 'COMPLETED'
    }]);

    return NextResponse.json({
      success: true,
      message: `Sent ${polToSend.toFixed(4)} POL successfully`,
      txHash: tx.hash
    });

  } catch (err) {
    console.error('Payout Error:', err);
    if (err.code === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json({ error: 'System busy (Treasury Maintenance). Try again later.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Payout transaction failed' }, { status: 500 });
  }
}
