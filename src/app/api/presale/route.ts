import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet')?.toLowerCase();

  if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 });

  try {
    const { data, error } = await supabaseAdmin
      .from('presale_transactions')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const history = data || [];
    
    const totalInvestedUsd = history.reduce((sum: number, tx: any) => sum + Number(tx.amount_usd), 0);
    const totalTokensBought = history.reduce((sum: number, tx: any) => sum + Number(tx.tokens_bought), 0);

    return NextResponse.json({
      success: true,
      totalInvestedUsd,
      totalTokensBought,
      history
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, txHash, amountUsd, tokensBought } = body;

    if (!wallet || !txHash || !amountUsd || !tokensBought) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const rpcUrl = 'https://polygon-rpc.com';
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });
    
    const rpcData = await response.json();
    const receipt = rpcData.result;

    if (!receipt || receipt.status !== '0x1') {
      return NextResponse.json({ error: 'Transaction failed on blockchain' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('presale_transactions')
      .insert([
        {
          wallet_address: wallet.toLowerCase(),
          tx_hash: txHash,
          amount_usd: amountUsd,
          tokens_bought: tokensBought
        }
      ]);

    if (error) {
      return NextResponse.json({ error: 'Database Insert Error', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
