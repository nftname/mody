'use client';

import { useState, useEffect, useMemo } from 'react';

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
                const res = await fetch('/api/market-data');
                if (!res.ok) throw new Error('API failed');
                const data = await res.json();
                setListings(data.items || []);
            } catch (error) { 
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
