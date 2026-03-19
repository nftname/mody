import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, parseAbiItem, decodeEventLog, formatEther } from 'viem';
import { polygon } from 'viem/chains';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http()
});

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
    const { wallet, txHash } = body;

    if (!wallet || !txHash) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: txHash as `0x${string}` 
    });
    
    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction invalid on blockchain' }, { status: 400 });
    }

    const purchasedEventAbi = parseAbiItem('event Purchased(address indexed buyer, uint256 usdAmount, uint256 tokenAmount, string method)');
    
    let amountUsd = 0;
    let tokensBought = 0;
    let eventFound = false;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: [purchasedEventAbi],
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === 'Purchased' && decoded.args.buyer.toLowerCase() === wallet.toLowerCase()) {
          amountUsd = Number(formatEther(decoded.args.usdAmount));
          tokensBought = Number(formatEther(decoded.args.tokenAmount));
          eventFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!eventFound) {
      return NextResponse.json({ error: 'Purchase event not found' }, { status: 400 });
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
