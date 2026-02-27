'use client';

import { useState, useEffect, useMemo } from 'react';
import { parseAbi, formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
};

export function useMarketData(timeFilter: string = 'All') {
    const publicClient = usePublicClient();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState({ pol: 0, eth: 0 });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/prices');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setExchangeRates({ pol: data.pol || 0, eth: data.eth || 0 });
            } catch (e) {
                setExchangeRates(prev => prev.pol === 0 ? { pol: 0.40, eth: 3000 } : prev);
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchMarketData = async () => {
            if (!publicClient) return;
            if (isMounted) setLoading(true);
            try {
                const data = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });
                const [tokenIds, prices] = data as [bigint[], bigint[], `0x${string}`[]];
                
                if (!tokenIds || tokenIds.length === 0) {
                    if (isMounted) {
                        setListings([]);
                        setLoading(false);
                    }
                    return;
                }

                const tokenIdsStr = tokenIds.map(id => id.toString());
                const CHUNK_SIZE = 150;
                const chunks: string[][] = [];
                for (let i = 0; i < tokenIdsStr.length; i += CHUNK_SIZE) {
                    chunks.push(tokenIdsStr.slice(i, i + CHUNK_SIZE));
                }

                const fetchStats = async (targetChunks: string[][]) => {
                    let allResults: any[] = [];
                    for (const chunk of targetChunks) {
                        try {
                            const { data, error } = await supabase
                                .from('market_stats_view')
                                .select('*')
                                .in('token_id', chunk);
                            if (data) allResults.push(...data);
                        } catch (e) {}
                    }
                    return allResults;
                };

                const dbStats = await fetchStats(chunks);
                const statsMap: Record<string, any> = {};
                dbStats.forEach((s: any) => {
                    statsMap[s.token_id.toString()] = s;
                });

                const items = tokenIds.map((id, index) => {
                    const tid = Number(id);
                    const idStr = id.toString();
                    
                    const dbRecord = statsMap[idStr] || {};
                    const finalName = dbRecord.name || `Asset #${tid}`;
                    const finalTier = dbRecord.tier || 'Common';
                    
                    const rawVotes = Number(dbRecord.convictionscore) || 0;
                    let baseDeduction = 0;
                    const tierLower = finalTier.toLowerCase().trim();
                    
                    if (tierLower === 'immortal') baseDeduction = 300000;
                    else if (tierLower === 'elite') baseDeduction = 200000;
                    else if (tierLower.includes('founder')) baseDeduction = 100000;

                    const organicVotes = Math.max(0, rawVotes - baseDeduction);
                    const organicPoints = (organicVotes / 100);

                    const salesCount = Number(dbRecord.sales) || 0;
                    const offersCount = Number(dbRecord.offerscount) || 0;
                    
                    const trendingScore = (salesCount * 40) + (offersCount * 10) + organicPoints;
                    const pricePol = parseFloat(formatEther(prices[index]));
                    const lastSale = Number(dbRecord.lastsale) || 0;
                    
                    let change = 0;
                    if (lastSale > 0) {
                        change = ((pricePol - lastSale) / lastSale) * 100;
                    }

                    const mintYear = dbRecord.minttime > 0 ? new Date(Number(dbRecord.minttime)).getFullYear() : 2026;

                    return {
                        id: tid,
                        name: finalName,
                        tier: finalTier,
                        pricePol: pricePol,
                        lastSale: lastSale,
                        volume: Number(dbRecord.volume) || 0,
                        listedTime: Number(dbRecord.listedtime) || 0,
                        lastActive: Number(dbRecord.lastactive) || 0,
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
                    await Promise.allSettled(itemsMissingNames.map(async (item) => {
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
                        } catch (e) {}
                    }));
                }

                if (isMounted) setListings(items);
            } catch (error) {
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchMarketData();

        return () => {
            isMounted = false;
        };
    }, [publicClient]);

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

    const getTrendingItems = () => [...filteredData].sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
        if (b.volume !== a.volume) return b.volume - a.volume;
        return b.id - a.id;
    });
    const getTopItems = () => [...filteredData].sort((a, b) => {
        if (b.volume !== a.volume) return b.volume - a.volume;
        return b.id - a.id;
    });
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
