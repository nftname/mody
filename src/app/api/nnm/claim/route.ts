import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, fallback } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

const transport = fallback([
  http("https://polygon-rpc.com"),
  http("https://rpc-mainnet.maticvigil.com"),
  http("https://polygon-bor-rpc.publicnode.com"),
  http("https://1rpc.io/matic")
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  let deducted = false;
  let userWalletAddress = '';
  let originalAmount = 0;

  try {
    const body = await request.json();
    const { userWallet, amountNNM } = body;
    userWalletAddress = userWallet;
    originalAmount = amountNNM;

    const pk = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!pk) throw new Error("Server Config Error: Missing Wallet Key");

    const account = privateKeyToAccount(pk.startsWith('0x') ? pk as `0x${string}` : `0x${pk}` as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: transport
    });

    const { data: userData, error: fetchError } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (fetchError || !userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance or User not found' }, { status: 400 });
    }

    const newBalance = parseFloat(userData.nnm_balance) - amountNNM;
    const { error: deductError } = await supabase
      .from('nnm_wallets')
      .update({ 
        nnm_balance: newBalance,
        updated_at: new Date().toISOString() 
      })
      .eq('wallet_address', userWallet);

    if (deductError) throw new Error("Database Error: Failed to deduct balance.");
    
    deducted = true; 

    let currentPolPrice = 0;
    const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT', { 
        signal: AbortSignal.timeout(5000)
    });

    if (!priceRes.ok) throw new Error("Market Data Unavailable");

    const priceData = await priceRes.json();
    currentPolPrice = parseFloat(priceData.price);

    if (!currentPolPrice || currentPolPrice <= 0) throw new Error("Invalid Price Data");

    const usdValue = amountNNM * 0.05;
    const polAmount = usdValue / currentPolPrice;
    const valueToSend = parseEther(polAmount.toFixed(18));

    const hash = await walletClient.sendTransaction({
      to: userWallet as `0x${string}`,
      value: valueToSend,
      chain: polygon 
    });

    await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: usdValue,
      exchange_rate_used: currentPolPrice,
      tx_hash: hash,
      status: 'COMPLETED'
    }]);

    return NextResponse.json({ success: true, txHash: hash });

  } catch (err: any) {
    console.error('[Payout Failed]', err.message);

    if (deducted && userWalletAddress) {
        const { data: currentData } = await supabase
            .from('nnm_wallets')
            .select('nnm_balance')
            .eq('wallet_address', userWalletAddress)
            .single();
            
        if (currentData) {
            await supabase.from('nnm_wallets').update({
                nnm_balance: parseFloat(currentData.nnm_balance) + originalAmount,
                updated_at: new Date().toISOString()
            }).eq('wallet_address', userWalletAddress);
        }
    }

    return NextResponse.json({ 
        error: err.message || 'Transaction processing failed',
        refunded: deducted 
    }, { status: 500 });
  }
}
