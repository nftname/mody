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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supporterWallet, assetId, assetOwner } = body;

    if (!supporterWallet || !assetId || !assetOwner) {
      return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
    }

    if (supporterWallet.toLowerCase() === assetOwner.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Cannot support your own asset.' }, { status: 403 });
    }

    // Check Balance
    const { data: supporterData } = await supabase.from('nnm_wallets').select('*').eq('wallet_address', supporterWallet).single();
    if (!supporterData || supporterData.wnnm_balance < 1) {
      return NextResponse.json({ success: false, message: 'Insufficient WNNM balance.' }, { status: 400 });
    }

    // 1. Process Supporter (Deduct WNNM, Add NNM)
    await supabase.from('nnm_wallets').update({
      wnnm_balance: supporterData.wnnm_balance - 1,
      nnm_balance: parseFloat(supporterData.nnm_balance) + 1,
      updated_at: new Date().toISOString()
    }).eq('wallet_address', supporterWallet);

    // 2. Process Asset Owner (Add NNM Reward)
    const { data: ownerData } = await supabase.from('nnm_wallets').select('nnm_balance').eq('wallet_address', assetOwner).single();
    const currentOwnerBalance = ownerData ? parseFloat(ownerData.nnm_balance) : 0;
    await supabase.from('nnm_wallets').upsert({
      wallet_address: assetOwner,
      nnm_balance: currentOwnerBalance + 1,
      updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    // 3. Record Vote & Ledger
    await supabase.from('conviction_votes').insert({ token_id: assetId.toString(), supporter_address: supporterWallet, created_at: new Date().toISOString() });
    await supabase.from('nnm_conviction_ledger').insert({ supporter_wallet: supporterWallet, wnnm_spent: 1, created_at: new Date().toISOString() });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Support Error:', err);
    return NextResponse.json({ success: false, message: 'Server error processing support.' }, { status: 500 });
  }
}
