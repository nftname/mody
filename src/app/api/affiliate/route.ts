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
  transport: http()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) return NextResponse.json({ error: 'Wallet missing' }, { status: 400 });

  const { data: earningsData } = await supabase.from('affiliate_earnings').select('*').eq('referrer_wallet', wallet).order('created_at', { ascending: false });
  const { data: payoutsData } = await supabase.from('affiliate_payouts').select('*').eq('wallet_address', wallet).order('created_at', { ascending: false });
  const { count: relationshipsCount } = await supabase.from('affiliate_relationships').select('*', { count: 'exact', head: true }).eq('parent_wallet', wallet);

  return NextResponse.json({ earnings: earningsData || [], payouts: payoutsData || [], relationshipsCount: relationshipsCount || 0 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    console.log("API CALLED - Action:", action);

    if (action === 'claim') {
      const { wallet, amount } = body;
      if (!wallet || !amount || amount < 50) return NextResponse.json({ error: 'Invalid claim request' }, { status: 400 });
      const { error } = await supabase.from('affiliate_payouts').insert([{ wallet_address: wallet, amount: amount, status: 'PENDING' }]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'mint') {
      const { transactionHash, referrerWallet } = body;
      console.log("Mint Action - TxHash:", transactionHash, "Referrer:", referrerWallet);

      if (!transactionHash) return NextResponse.json({ error: 'Missing transaction hash' }, { status: 400 });

      const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });
      console.log("Tx Fetched - To:", tx.to, "Value:", tx.value.toString());

      const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash as `0x${string}` });
      console.log("Receipt Fetched - Status:", receipt.status);

      if (receipt.status !== 'success') return NextResponse.json({ error: 'Transaction failed' }, { status: 400 });
      
      if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
         console.log("Contract Mismatch - Expected:", CONTRACT_ADDRESS, "Got:", tx.to);
         return NextResponse.json({ error: 'Invalid contract address' }, { status: 400 });
      }

      const { data: existingTx, error: selectError } = await supabase.from('affiliate_earnings').select('id').eq('tx_hash', transactionHash).maybeSingle();
      if (selectError) console.log("Select Error:", selectError);
      
      if (existingTx) {
         console.log("Tx Already Processed:", transactionHash);
         return NextResponse.json({ error: 'Already processed' }, { status: 400 });
      }

      const buyerWallet = tx.from;
      const amountPaid = parseFloat(formatEther(tx.value));
      console.log("Buyer:", buyerWallet, "AmountPaid:", amountPaid);

      if (referrerWallet && referrerWallet.toLowerCase() !== buyerWallet.toLowerCase()) {
        console.log("Upserting Relationship...");
        const { error: relError } = await supabase.from('affiliate_relationships').upsert({ parent_wallet: referrerWallet.toLowerCase(), child_wallet: buyerWallet.toLowerCase() }, { onConflict: 'child_wallet' });
        
        if (relError) {
            console.error("Relationship Upsert Error:", relError);
            throw relError;
        }

        if (amountPaid > 0) {
            const commissionAmount = amountPaid * 0.30;
            console.log("Inserting Earnings - Amount:", commissionAmount);
            const { error: earnError } = await supabase.from('affiliate_earnings').insert([{ referrer_wallet: referrerWallet.toLowerCase(), source_wallet: buyerWallet.toLowerCase(), amount: commissionAmount, earnings_type: 'MINT', status: 'UNPAID', tx_hash: transactionHash }]);
            
            if (earnError) {
                console.error("Earnings Insert Error:", earnError);
                throw earnError;
            }
        } else {
            console.log("Amount is 0 - Skipping earnings insert");
        }
      }

      console.log("Mint Process Completed Successfully");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

