import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// إصلاح 1: إضافة علامة !
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http("https://polygon-rpc.com") 
});

const CONTRACT_ABI = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)"
]);

// إصلاح 2: تحديد نوع الـ request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supporterWallet, assetId, assetOwner } = body;

    if (!supporterWallet || !assetId) {
      return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
    }

    let realOwner = assetOwner;
    try {
        const ownerResult = await publicClient.readContract({
            address: NFT_COLLECTION_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(assetId)]
        });
        realOwner = ownerResult.toString().toLowerCase();
    } catch (e) {
        console.warn("Could not verify on-chain owner, using provided owner.");
    }

    if (realOwner && realOwner.toLowerCase() === supporterWallet.toLowerCase()) {
        return NextResponse.json({ 
            success: false, 
            message: '⛔ You cannot support your own asset. Integrity First.' 
        }, { status: 403 });
    }

    const { data: walletData, error: walletError } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance')
      .eq('wallet_address', supporterWallet)
      .single();

    if (walletError || !walletData || walletData.wnnm_balance < 1) {
      return NextResponse.json({ 
          success: false, 
          message: '⚠️ Insufficient WNNM balance. Mint or Buy assets to earn voting power.' 
      }, { status: 400 });
    }

    const newWNNM = walletData.wnnm_balance - 1;
    const newNNM = parseFloat(walletData.nnm_balance) + 1;

    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({ 
          wnnm_balance: newWNNM, 
          nnm_balance: newNNM,
          updated_at: new Date().toISOString()
      })
      .eq('wallet_address', supporterWallet);

    if (updateError) throw updateError;

    await supabase.from('conviction_votes').insert({
        token_id: assetId.toString(),
        supporter_address: supporterWallet,
        amount: 1
    });

    return NextResponse.json({
      success: true,
      message: '🔥 Conviction Registered! +1 NNM added to your withdrawable balance.',
      newBalance: { wnnm: newWNNM, nnm: newNNM }
    });

  } catch (err) {
    console.error('Support Error:', err);
    return NextResponse.json({ success: false, message: 'Server error processing support.' }, { status: 500 });
  }
}
