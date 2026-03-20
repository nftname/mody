import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const PRESALE_ADDRESS = "0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72".toLowerCase();
const RPC_URL = "https://polygon.llamarpc.com";

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

    if (!wallet || !txHash || amountUsd === undefined || tokensBought === undefined) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const rpcResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    if (!rpcResponse.ok) {
       return NextResponse.json({ error: 'RPC Fetch Failed' }, { status: 500 });
    }

    const rpcData = await rpcResponse.json();
    const receipt = rpcData.result;

    if (!receipt) {
      return NextResponse.json({ error: 'Transaction not found on blockchain' }, { status: 400 });
    }

    const isSuccess = receipt.status === '0x1';
    const isFromValid = receipt.from.toLowerCase() === wallet.toLowerCase();
    const isToValid = receipt.to && receipt.to.toLowerCase() === PRESALE_ADDRESS;

    if (!isSuccess || !isFromValid || !isToValid) {
      return NextResponse.json({ error: 'Transaction security check failed' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('presale_transactions')
      .insert([
        {
          wallet_address: wallet.toLowerCase(),
          tx_hash: txHash,
          amount_usd: Number(amountUsd).toFixed(2),
          tokens_bought: Number(tokensBought).toFixed(2)
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true }); 
      }
      return NextResponse.json({ error: 'Database Insert Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
