'use client';

import { useState, useEffect, useMemo } from 'react';
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

export function useMarketData(timeFilter: string = 'All') {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState({ pol: 0, eth: 0 });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/prices');
                if (!res.ok) throw new Error('Price API failed');
                const data = await res.json();
                setExchangeRates({ pol: data.pol || 0, eth: data.eth || 0 });
            } catch (e) { 
                console.error("Price fetch error:", e);
                setExchangeRates({ pol: 0.40, eth: 3000 }); 
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchMarketData = async () => {
            setLoading(true);
            try {
                const data = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });
                const [tokenIds, prices] = data;
                
                if (!tokenIds || tokenIds.length === 0) { 
                    setListings([]); 
                    setLoading(false); 
                    return; 
                }

                const tokenIdsStr = tokenIds.map(id => id.toString());

               
                const CHUNK_SIZE = 150;
                const chunks = [];
                for (let i = 0; i < tokenIdsStr.length; i += CHUNK_SIZE) {
                    chunks.push(tokenIdsStr.slice(i, i + CHUNK_SIZE));
                }

                const metadataPromises = chunks.map(chunk => 
                    supabase.from('assets_metadata').select('*').in('token_id', chunk)
                );

                const votesPromises = chunks.map(chunk => 
                    supabase.from('conviction_votes').select('token_id, amount').in('token_id', chunk)
                );

                const [
                    metadataResults,
                    votesResults,
                    { data: allActivities },
                    { data: offersData }
                ] = await Promise.all([
                    Promise.all(metadataPromises),
                    Promise.all(votesPromises),
                    supabase.from('activities').select('*').order('created_at', { ascending: false }),
                    supabase.from('offers').select('token_id').eq('status', 'active')
                ]);

                const dbMetadata = metadataResults.flatMap(res => res.data || []);
                const votesData = votesResults.flatMap(res => res.data || []);

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
                        
                        if (act.activity_type === 'List') {
                            if (actTime > statsMap[tid].listedTime) statsMap[tid].listedTime = actTime;
                        }

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
                
                // 
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

                setListings(items);
            } catch (error) { 
                console.error("Market Data Error:", error); 
                setLoading(false);
            } finally { 
                setLoading(false); 
            }
        };
        fetchMarketData();
    }, []);

    const filteredData = useMemo(() => {
        let data = [...listings];
        if (timeFilter !== 'All') {
            let timeLimit = Infinity;
            if (timeFilter === '1H') timeLimit = 3600 * 1000;
            else if (timeFilter === '6H') timeLimit = 3600 * 6 * 1000;
            else if (timeFilter === '24H') timeLimit = 3600 * 24 * 1000;
            else if (timeFilter === '7D') timeLimit = 3600 * 24 * 7 * 1000;
            
            const now = Date.now();
            data = data.filter(item => (now - (item.lastActive || 0)) <= timeLimit);
        }
        return data;
    }, [listings, timeFilter]);

    const getTrendingItems = () => [...filteredData].sort((a, b) => b.trendingScore - a.trendingScore);
    const getTopItems = () => [...filteredData].sort((a, b) => b.volume - a.volume);
    const getNewListings = () => [...listings].filter(i => i.listedTime > 0).sort((a, b) => b.listedTime - a.listedTime);

    return {
        listings: filteredData,
        allListings: listings,
        loading,
        exchangeRates,
        getTrendingItems,
        getTopItems,
        getNewListings
    };
}
