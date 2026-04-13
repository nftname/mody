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
  "function authorizedMint(string _name, uint8 _tier, string _tokenURI) payable",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
]);

import { createPublicClient as createViemPublicClient } from 'viem';

export async function POST(request: Request) {
  try {
    const { wallet, name, tokenURI, tierName, imageUrl, txHash, coin } = await request.json();

    if (!wallet || !wallet.startsWith('0x')) {
        return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (coin === 'POLYGON' || coin === 'MATIC') {
        try {
            const verifyClient = createViemPublicClient({ chain: polygon, transport: http('https://polygon-bor.publicnode.com') });
            const transaction = await verifyClient.getTransaction({ hash: txHash as `0x${string}` });
            if (!transaction || transaction.to?.toLowerCase() !== '0x066Ff37dBf6847FE79AF29ff20585532185b6bDB'.toLowerCase()) {
                throw new Error("Invalid EVM Transaction");
            }
        } catch (e) {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }
    }

    const { data: existingAsset } = await supabase.from('activities').select('id').eq('token_id', name).single();
    if (existingAsset) {
        return NextResponse.json({ error: 'Asset already processed' }, { status: 400 });
    }

    let nnmReward = 0;
    let wnnmReward = 0;
    let newSystemWnnm = 0;
    let tierIndex = 2;

    const tierUpper = tierName ? tierName.toUpperCase() : 'FOUNDER';

    if (tierUpper === 'IMMORTAL') {
        nnmReward = 300000;
        wnnmReward = 3000;
        newSystemWnnm = 3000;
        tierIndex = 0;
    } else if (tierUpper === 'ELITE') {
        nnmReward = 200000;
        wnnmReward = 2000;
        newSystemWnnm = 2000;
        tierIndex = 1;
    } else {
        nnmReward = 100000;
        wnnmReward = 1000;
        newSystemWnnm = 1000;
        tierIndex = 2;
    }

    const rawPrivateKey = process.env.NNM_Airdrop_WALLET_PRIVATE_KEY || '';
    const formattedPrivateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
    
    const client = createWalletClient({ account, chain: polygon, transport: http('https://polygon-bor.publicnode.com') }).extend(publicActions);

    let mintReceipt;
    let mintAttempt = 0;
    const MAX_RETRIES = 3;

    while (mintAttempt < MAX_RETRIES) {
        try {
            if (mintAttempt > 0) {
                const jitter = Math.floor(Math.random() * 2500) + 1000;
                await new Promise(res => setTimeout(res, jitter));
            }
            
            const transactionCount = await client.getTransactionCount({ address: account.address });

            const mintHash = await client.writeContract({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: 'authorizedMint',
                args: [name, tierIndex, tokenURI],
                value: BigInt(0),
                chain: polygon,
                account: account,
                nonce: transactionCount
            });

            mintReceipt = await client.waitForTransactionReceipt({ hash: mintHash });
            break;
        } catch (err: any) {
            mintAttempt++;
            if (mintAttempt >= MAX_RETRIES) throw err;
        }
    }

    let mintedTokenId = BigInt(0);
    if (mintReceipt && mintReceipt.logs) {
        for (const log of mintReceipt.logs) {
            try {
                if(log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                    mintedTokenId = BigInt(log.topics[3]!);
                }
            } catch (e) {}
        }
    }

    if (mintedTokenId === BigInt(0)) throw new Error("Token ID extraction failed");

    await new Promise(res => setTimeout(res, 4000));

    let transferAttempt = 0;
    while (transferAttempt < MAX_RETRIES) {
        try {
            if (transferAttempt > 0) {
                const jitter = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(res => setTimeout(res, jitter));
            }

            const transactionCount = await client.getTransactionCount({ address: account.address });

            const transferHash = await client.writeContract({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: 'transferFrom',
                args: [account.address, wallet as `0x${string}`, mintedTokenId],
                chain: polygon,
                account: account,
                nonce: transactionCount
            });
            
            await client.waitForTransactionReceipt({ hash: transferHash });
            break;
        } catch (err: any) {
            transferAttempt++;
            if (transferAttempt >= MAX_RETRIES) throw err;
        }
    }

    await supabase.from('activities').insert([{
        token_id: Number(mintedTokenId),
        activity_type: 'Mint Founder',
        from_address: account.address,
        to_address: wallet,
        price: '0.0000',
        created_at: new Date().toISOString()
    }]);

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
        wnnm_balance: (claimData ? Number(claimData.wnnm_balance) : 0) + newSystemWnnm,
        claimable_nnm: claimData ? Number(claimData.claimable_nnm) : 0,
        updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    await supabase.from('conviction_votes').insert({
        token_id: mintedTokenId.toString(),
        supporter_address: wallet,
        amount: nnmReward,
        created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
        success: true, 
        tokenId: Number(mintedTokenId),
        addedNNM: nnmReward, 
        addedWNNM: wnnmReward 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Network congested. Please try again." }, { status: 500 });
  }
}
