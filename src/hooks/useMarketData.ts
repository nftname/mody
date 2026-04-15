'use client';

import { useState, useEffect, useMemo } from 'react';
import { parseAbi, formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { MARKETPLACE_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
        }
    }
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
                const data = await fetchWithRetry(() => 
                    publicClient.readContract({
                        address: MARKETPLACE_ADDRESS as `0x${string}`,
                        abi: MARKET_ABI,
                        functionName: 'getAllListings'
                    })
                );
                
                const [tokenIds, prices] = data as [bigint[], bigint[], `0x${string}`[]];
                
                if (!tokenIds || tokenIds.length === 0) {
                    if (isMounted) {
                        setListings([]);
                        setLoading(false);
                    }
                    return;
                }

                const tokenIdsNumbers = tokenIds.map(id => Number(id));
                // Reduced batch size to prevent Supabase timeout
                const BATCH_SIZE = 300; 
                let dbStats: any[] = [];
                
                for (let i = 0; i < tokenIdsNumbers.length; i += BATCH_SIZE) {
                    const batch = tokenIdsNumbers.slice(i, i + BATCH_SIZE);
                    try {
                        const { data: statsBatch, error } = await supabase
                            .from('market_stats_view')
                            .select('*')
                            .in('token_id', batch);
                            
                        if (error) {
                            console.error("Supabase Batch Error:", error);
                            continue; // Skip this batch and try the next
                        }
                        
                        if (statsBatch) {
                            dbStats = [...dbStats, ...statsBatch];
                        }
                    } catch (err) {
                        console.error("Request Failed:", err);
                    }
                }

                const statsMap: Record<string, any> = {};
                let maxVolume = 0;
                let maxSales = 0;
                let maxOffers = 0;
                let maxConviction = 0;

                for (let i = 0; i < dbStats.length; i++) {
                    const s = dbStats[i];
                    statsMap[String(s.token_id)] = s;
                    
                    const vol = Number(s.volume) || 0;
                    const sales = Number(s.sales) || 0;
                    const offers = Number(s.offerscount) || 0;
                    
                    const tierLower = (s.tier || 'Common').toLowerCase().trim();
                    let baseDeduction = 0;
                    if (tierLower === 'immortal') baseDeduction = 300000;
                    else if (tierLower === 'elite') baseDeduction = 200000;
                    else if (tierLower.includes('founder')) baseDeduction = 100000;
                    
                    const rawVotes = Number(s.convictionscore) || 0;
                    const organicPoints = Math.max(0, rawVotes - baseDeduction) / 1000;

                    if (vol > maxVolume) maxVolume = vol;
                    if (sales > maxSales) maxSales = sales;
                    if (offers > maxOffers) maxOffers = offers;
                    if (organicPoints > maxConviction) maxConviction = organicPoints;
                }

                const items = new Array(tokenIds.length);
                
                for (let index = 0; index < tokenIds.length; index++) {
                    const id = tokenIds[index];
                    const tid = Number(id);
                    const idStr = String(id);
                    
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
                    const organicPoints = (organicVotes / 1000);

                    const salesCount = Number(dbRecord.sales) || 0;
                    const offersCount = Number(dbRecord.offerscount) || 0;
                    const itemVolume = Number(dbRecord.volume) || 0;

                    const volScore = maxVolume > 0 ? (itemVolume / maxVolume) * 20 : 0;
                    const salesScore = maxSales > 0 ? (salesCount / maxSales) * 15 : 0;
                    const convictionScorePercent = maxConviction > 0 ? (organicPoints / maxConviction) * 50 : 0;
                    const offersScore = maxOffers > 0 ? (offersCount / maxOffers) * 15 : 0;

                    const trendingScore = volScore + salesScore + convictionScorePercent + offersScore;
                    const pricePol = parseFloat(formatEther(prices[index]));
                    const lastSale = Number(dbRecord.lastsale) || 0;

                    let change = 0;
                    if (lastSale > 0) {
                        change = ((pricePol - lastSale) / lastSale) * 100;
                    }

                    const mintYear = dbRecord.minttime > 0 ? new Date(Number(dbRecord.minttime)).getFullYear() : 2026;

                    items[index] = {
                        id: tid,
                        name: finalName,
                        tier: finalTier,
                        pricePol: pricePol,
                        lastSale: lastSale,
                        volume: itemVolume,
                        listedTime: Number(dbRecord.listedtime) || 0,
                        lastActive: Number(dbRecord.lastactive) || 0,
                        mintYear: mintYear,
                        trendingScore: trendingScore,
                        offersCount: offersCount,
                        convictionScore: rawVotes,
                        change: change,
                        currencySymbol: 'POL'
                    };
                }
                
                if (isMounted) {
                    setListings(items);
                    setLoading(false); 
                }

            } catch (error) {
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
