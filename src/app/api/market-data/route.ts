
import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { polygon } from 'viem/chains';
import { supabase } from '@/lib/supabase';
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

const publicClient = createPublicClient({
    chain: polygon,
    transport: http("https://polygon-bor.publicnode.com")
});

export const revalidate = 30;

export async function GET() {
    try {
        const data = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'getAllListings'
        });
        const [tokenIds, prices] = data as [bigint[], bigint[], string[]];
        
        if (!tokenIds || tokenIds.length === 0) { 
            return NextResponse.json({ items: [] });
        }

        const tokenIdsStr = tokenIds.map(id => id.toString());
        const CHUNK_SIZE = 150;
        const chunks: string[][] = [];
        for (let i = 0; i < tokenIdsStr.length; i += CHUNK_SIZE) {
            chunks.push(tokenIdsStr.slice(i, i + CHUNK_SIZE));
        }

        const fetchAllRecords = async (tableName: string, selectQuery: string, targetChunks: string[][], orderBy?: string) => {
            let allResults: any[] = [];
            for (const chunk of targetChunks) {
                let from = 0;
                const limit = 1000;
                let fetchMore = true;
                while (fetchMore) {
                    let query = supabase.from(tableName).select(selectQuery).in('token_id', chunk).range(from, from + limit - 1);
                    if (orderBy) query = query.order(orderBy, { ascending: false });
                    
                    const { data, error } = await query;
                    if (error) {
                        fetchMore = false;
                        break;
                    }
                    if (data && data.length > 0) {
                        allResults.push(...data);
                        from += limit;
                        if (data.length < limit) fetchMore = false;
                    } else {
                        fetchMore = false;
                    }
                }
            }
            return allResults;
        };

        const metadataPromises = chunks.map(chunk => 
            supabase.from('assets_metadata').select('*').in('token_id', chunk)
        );

        const [
            metadataResults,
            votesData,
            allActivities,
            { data: offersData }
        ] = await Promise.all([
            Promise.all(metadataPromises),
            fetchAllRecords('conviction_votes', 'token_id, amount', chunks),
            fetchAllRecords('activities', '*', chunks, 'created_at'),
            supabase.from('offers').select('token_id').eq('status', 'active')
        ]);

        const dbMetadata = metadataResults.flatMap(res => res.data || []);

        const assetsMap: Record<string, any> = {};
        if (dbMetadata) {
            dbMetadata.forEach((a: any) => {
                const id = a.token_id.toString();
                if (!assetsMap[id]) assetsMap[id] = a;
                else {
                    if (!assetsMap[id].name && a.name) assetsMap[id].name = a.name;
                    if (!assetsMap[id].tier && a.tier) assetsMap[id].tier = a.tier;
                }
            });
        }

        const votesMap: Record<string, number> = {};
        if (votesData) {
            votesData.forEach((v: any) => {
                const idStr = String(v.token_id).trim();
                votesMap[idStr] = (votesMap[idStr] || 0) + (Number(v.amount) || 100);
            });
        }

        const offersCountMap: Record<number, number> = {};
        if (offersData) offersData.forEach((o: any) => offersCountMap[o.token_id] = (offersCountMap[o.token_id] || 0) + 1);

        const statsMap: Record<number, any> = {};
        if (allActivities) {
            allActivities.forEach((act: any) => {
                const tid = Number(act.token_id);
                const price = Number(act.price) || 0;
                const actTime = new Date(act.created_at).getTime();

                if (!statsMap[tid]) statsMap[tid] = { volume: 0, sales: 0, lastSale: 0, listedTime: 0, lastActive: 0, mintTime: 0 };
                
                if (actTime > statsMap[tid].lastActive) statsMap[tid].lastActive = actTime;
                if (act.activity_type === 'Mint') statsMap[tid].mintTime = actTime;
                if (act.activity_type === 'List' && actTime > statsMap[tid].listedTime) statsMap[tid].listedTime = actTime;
                if (act.activity_type === 'Sale') {
                    statsMap[tid].volume += price;
                    statsMap[tid].sales += 1;
                    if (statsMap[tid].lastSale === 0 || actTime >= statsMap[tid].lastActive) {
                        statsMap[tid].lastSale = price;
                    }
                }
            });
        }

        const items = tokenIds.map((id, index) => {
            const tid = Number(id);
            const idStr = id.toString();
            
            const dbRecord = assetsMap[idStr] || {};
            const finalName = dbRecord.name || `Asset #${tid}`;
            const finalTier = dbRecord.tier || 'Common';
            
            const stats = statsMap[tid] || { volume: 0, sales: 0, lastSale: 0, listedTime: 0, lastActive: 0, mintTime: 0 };
            const offersCount = offersCountMap[tid] || 0;
            const rawVotes = votesMap[idStr] || 0;
            
            let baseDeduction = 0;
            const tierLower = finalTier.toLowerCase().trim();
            if (tierLower === 'immortal') baseDeduction = 300000;
            else if (tierLower === 'elite') baseDeduction = 200000;
            else if (tierLower.includes('founder')) baseDeduction = 100000;

            const organicVotes = Math.max(0, rawVotes - baseDeduction);
            const organicPoints = (organicVotes / 100); 

            const trendingScore = (stats.sales * 40) + (offersCount * 10) + organicPoints;
            const pricePol = parseFloat(formatEther(prices[index]));
            
            let change = 0;
            if (stats.lastSale > 0) {
                change = ((pricePol - stats.lastSale) / stats.lastSale) * 100;
            }

            const mintYear = stats.mintTime > 0 ? new Date(stats.mintTime).getFullYear() : 2026;

            return {
                id: tid,
                name: finalName,
                tier: finalTier,
                pricePol: pricePol,
                lastSale: stats.lastSale,
                volume: stats.volume,
                listedTime: stats.listedTime,
                lastActive: stats.lastActive,
                mintYear: mintYear,
                trendingScore: trendingScore,
                offersCount: offersCount,
                convictionScore: rawVotes,
                change: change,
                currencySymbol: 'POL'
            };
        }); 
        
        const itemsMissingNames = items.filter(item => item.name.startsWith('Asset #'));
        if (itemsMissingNames.length > 0) {
            await Promise.all(itemsMissingNames.map(async (item) => {
                try {
                    const uri = await publicClient.readContract({
                        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                        abi: parseAbi(["function tokenURI(uint256) view returns (string)"]),
                        functionName: 'tokenURI',
                        args: [BigInt(item.id)]
                    });
                    const metaRes = await fetch(resolveIPFS(uri as string));
                    const meta = await metaRes.json();
                    if (meta.name) {
                        item.name = meta.name; 
                        item.tier = meta.attributes?.find((a:any) => a.trait_type === 'Tier')?.value || item.tier;
                    }
                } catch (e) { } 
            }));
        }

        return NextResponse.json(
            { items },
            {
                headers: {
                    'Cache-Control': 's-maxage=30, stale-while-revalidate=59',
                },
            }
        );
    } catch (error) { 
        return NextResponse.json({ items: [] }, { status: 500 });
    }
}


