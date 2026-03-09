import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, formatEther } from 'viem';
import { polygon } from 'viem/chains';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;

const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://1rpc.io/matic')

});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletParam = searchParams.get('wallet');

  if (!walletParam) {
    return NextResponse.json({ error: 'Wallet missing' }, { status: 400 });
  }

  const wallet = walletParam.toLowerCase();

  const { data: earningsData } = await supabase
    .from('affiliate_earnings')
    .select('*')
    .eq('referrer_wallet', wallet)
    .order('created_at', { ascending: false });

  const { data: payoutsData } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('wallet_address', wallet)
    .order('created_at', { ascending: false });

  const { count: relationshipsCount } = await supabase
    .from('affiliate_relationships')
    .select('*', { count: 'exact', head: true })
    .eq('parent_wallet', wallet);

  return NextResponse.json({
    earnings: earningsData || [],
    payouts: payoutsData || [],
    relationshipsCount: relationshipsCount || 0
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === 'claim') {
    const { wallet, amount } = body;

    if (!wallet || !amount || amount < 50) {
      return NextResponse.json({ error: 'Invalid claim request' }, { status: 400 });
    }

    const { error } = await supabase
      .from('affiliate_payouts')
      .insert([
        {
          wallet_address: wallet,
          amount: amount,
          status: 'PENDING'
        }
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'mint') {
    const { transactionHash, referrerWallet } = body;

    if (!transactionHash) {
      return NextResponse.json({ error: 'Missing transaction hash' }, { status: 400 });
    }

    try {
      const receipt = await publicClient.getTransactionReceipt({ 
          hash: transactionHash as `0x${string}`
      });

      if (!receipt || receipt.status !== 'success') {
         return NextResponse.json({ error: 'Transaction failed or pending' }, { status: 400 });
      }

      const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });

      if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
         return NextResponse.json({ error: 'Invalid contract address' }, { status: 400 });
      }

      const { data: existingTx } = await supabase
        .from('affiliate_earnings')
        .select('id')
        .eq('tx_hash', transactionHash)
        .maybeSingle();

      if (existingTx) {
         return NextResponse.json({ error: 'Commission already processed' }, { status: 400 });
      }

      const buyerWallet = tx.from.toLowerCase();
      const amountPaid = parseFloat(formatEther(tx.value));

      let finalReferrer = referrerWallet ? referrerWallet.toLowerCase() : null;

      if (!finalReferrer) {
          const { data: existingRel } = await supabase
              .from('affiliate_relationships')
              .select('parent_wallet')
              .eq('child_wallet', buyerWallet)
              .maybeSingle();
          if (existingRel) finalReferrer = existingRel.parent_wallet;
      }

      if (finalReferrer && finalReferrer !== buyerWallet) {
        await supabase
          .from('affiliate_relationships')
          .upsert(
            { parent_wallet: finalReferrer, child_wallet: buyerWallet },
            { onConflict: 'child_wallet' }
          );

        const commissionAmount = amountPaid * 0.30;
        const statusValue = commissionAmount > 0 ? 'UNPAID' : 'PAID';

        await supabase
          .from('affiliate_earnings')
          .insert([
            {
              referrer_wallet: finalReferrer,
              source_wallet: buyerWallet,
              amount: commissionAmount,
              earnings_type: 'MINT',
              status: statusValue,
              tx_hash: transactionHash
            }
          ]);
      }

      return NextResponse.json({ success: true });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
