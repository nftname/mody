import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createWalletClient, http, publicActions, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CONTRACT_ADDRESS = '0x264D75F04b135e58E2d5cC8A6B9c1371dAc3ad81';

const ABI = parseAbi([
  "function mintPublic(string _name, uint8 _tier, string _tokenURI) payable",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
]);

export async function POST(request: Request) {
  try {
    const secureToken = request.headers.get('x-secure-token');
    const secureTimestamp = request.headers.get('x-secure-timestamp');

    if (!secureToken || !secureTimestamp) {
        return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const timeDiff = Date.now() - parseInt(secureTimestamp);
    if (timeDiff > 180000 || timeDiff < 0) {
        return NextResponse.json({ error: 'Request expired or invalid.' }, { status: 401 });
    }

    const { wallet, name, tokenURI, tierName, imageUrl } = await request.json();
    
    if (!wallet || !wallet.startsWith('0x')) {
        return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const { data: existingActivity } = await supabase
      .from('activities')
      .select('id')
      .eq('to_address', wallet)
      .eq('activity_type', 'Mint Founder')
      .limit(1);

    if (existingActivity && existingActivity.length > 0) {
      return NextResponse.json({ error: 'Founder tier already claimed.' }, { status: 403 });
    }

    const rawPrivateKey = process.env.NNM_Airdrop_WALLET_PRIVATE_KEY || '';
    const formattedPrivateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
    
    const client = createWalletClient({ account, chain: polygon, transport: http('https://polygon-bor.publicnode.com') }).extend(publicActions);

    const mintHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'mintPublic',
      args: [name, 2, tokenURI],
      value: BigInt(0),
      chain: polygon,
      account: account
    });

    const mintReceipt = await client.waitForTransactionReceipt({ hash: mintHash });

    let mintedTokenId = BigInt(0);
    for (const log of mintReceipt.logs) {
      try {
        if(log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
          mintedTokenId = BigInt(log.topics[3]!);
        }
      } catch (e) {}
    }

    if (mintedTokenId === BigInt(0)) throw new Error("Token ID extraction failed");

    const transferHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'transferFrom',
      args: [account.address, wallet as `0x${string}`, mintedTokenId],
      chain: polygon,
      account: account
    });
    
    await client.waitForTransactionReceipt({ hash: transferHash });

    await supabase.from('activities').insert([{
        token_id: Number(mintedTokenId),
        activity_type: 'Mint Founder',
        from_address: account.address,
        to_address: wallet,
        price: '0.0000',
        created_at: new Date().toISOString()
    }]);

    const nnmReward = 100000;
    const wnnmReward = 1000;

    const { data: walletData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance')
      .eq('wallet_address', wallet)
      .single();

    await supabase.from('nnm_wallets').upsert({
        wallet_address: wallet,
        nnm_balance: (walletData ? Number(walletData.nnm_balance) : 0) + nnmReward,
        wnnm_balance: (walletData ? Number(walletData.wnnm_balance) : 0) + wnnmReward,
        updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    const { data: claimData } = await supabase
      .from('nnm_claim_balances')
      .select('wnnm_balance, claimable_nnm')
      .eq('wallet_address', wallet)
      .single();

    await supabase.from('nnm_claim_balances').upsert({
        wallet_address: wallet,
        wnnm_balance: (claimData ? Number(claimData.wnnm_balance) : 0) + wnnmReward,
        claimable_nnm: claimData ? Number(claimData.claimable_nnm) : 0,
        updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    await supabase.from('conviction_votes').insert({
        token_id: mintedTokenId.toString(),
        supporter_address: wallet,
        amount: nnmReward,
        created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, tokenId: Number(mintedTokenId) });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
