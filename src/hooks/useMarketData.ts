
'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePublicClient } from "wagmi";
import { parseAbi, formatEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { MARKETPLACE_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

export function useMarketData(timeFilter: string = 'All') {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState({ pol: 0, eth: 0 });
    const publicClient = usePublicClient();

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/prices');
                const data = await res.json();
                setExchangeRates({ pol: data.pol || 0, eth: data.eth || 0 });
            } catch (e) { console.error(e); }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchMarketData = async () => {
            if (!publicClient) return;
            try {
                const data = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });
                const [tokenIds, prices] = data;
                
                if (tokenIds.length === 0) { 
                    setListings([]); 
                    setLoading(false); 
                    return; 
                }

                const tokenIdsStr = tokenIds.map(id => id.toString());

                const [
                    { data: dbAssets },
                    { data: allActivities },
                    { data: offersData },
                    { data: votesData }
                ] = await Promise.all([
                    supabase.from('assets_metadata').select('*').in('token_id', tokenIdsStr),
                    supabase.from('activities').select('*').order('created_at', { ascending: false }),
                    supabase.from('offers').select('token_id').eq('status', 'active'),
                    supabase.from('conviction_votes').select('token_id, amount')
                ]);

                const assetsMap: Record<string, any> = {};
                if (dbAssets) dbAssets.forEach((a: any) => assetsMap[a.token_id.toString()] = a);

                const votesMap: Record<string, number> = {};
                if (votesData) {
                    votesData.forEach((v: any) => {
                        const idStr = String(v.token_id).trim();
                        votesMap[idStr] = (votesMap[idStr] || 0) + (Number(v.amount) || 0);
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
                    
                    const meta = assetsMap[idStr] || { name: `Asset #${id}`, tier: 'Common' };
                    const stats = statsMap[tid] || { volume: 0, sales: 0, lastSale: 0, listedTime: 0, lastActive: 0, mintTime: 0 };
                    const offersCount = offersCountMap[tid] || 0;
                    
                    const rawVotes = votesMap[idStr] || 0;
                    let baseDeduction = 0;
                    const tierLower = meta.tier ? meta.tier.toLowerCase() : 'common';
                    
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
                        name: meta.name,
                        tier: meta.tier,
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
                
                setListings(items);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchMarketData();
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
