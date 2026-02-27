'use client';

import { useState, useEffect } from 'react';
import { parseAbi } from 'viem';
import { usePublicClient } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { MARKETPLACE_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

export function useAdminScanner() {
    const publicClient = usePublicClient();
    const [inventory, setInventory] = useState<{ founder: any[], elite: any[], immortal: any[] }>({ founder: [], elite: [], immortal: [] });
    const [activity, setActivity] = useState<{ sales: any[], offers: any[] }>({ sales: [], offers: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAdminData = async () => {
            if (!publicClient) return;
            if (isMounted) setLoading(true);

            try {
                const res = await fetch('/api/admin-scripts');
                if (!res.ok) throw new Error();
                const apiData = await res.json();
                
                if (!apiData.success) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const { adminWallets, sales, allOffers } = apiData;
                const adminWalletsSet = new Set(adminWallets);

                const marketData = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });

                const [tokenIds, prices, sellers] = marketData as [bigint[], bigint[], `0x${string}`[]];

                const adminTokenIds: string[] = [];
                const adminTokenMap: Record<string, string> = {}; 

                for (let i = 0; i < tokenIds.length; i++) {
                    const seller = sellers[i].toLowerCase();
                    if (adminWalletsSet.has(seller)) {
                        const idStr = tokenIds[i].toString();
                        adminTokenIds.push(idStr);
                        adminTokenMap[idStr] = seller;
                    }
                }

                const adminOwnedSet = new Set(adminTokenIds);
                const filteredOffers: any[] = [];
                
                for (const offer of allOffers) {
                    const bidder = offer.bidder_address?.toLowerCase();
                    if (adminOwnedSet.has(offer.token_id.toString()) && bidder && !adminWalletsSet.has(bidder)) {
                        filteredOffers.push({
                            id: offer.token_id,
                            name: `NNM #${offer.token_id}`,
                            price: offer.price,
                            wallet: bidder,
                            expiry: new Date(offer.expiration * 1000).toLocaleDateString()
                        });
                    }
                }

                if (isMounted) {
                    setActivity({ sales, offers: filteredOffers });
                }

                if (adminTokenIds.length === 0) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const CHUNK_SIZE = 150;
                const chunks: string[][] = [];
                for (let i = 0; i < adminTokenIds.length; i += CHUNK_SIZE) {
                    chunks.push(adminTokenIds.slice(i, i + CHUNK_SIZE));
                }

                const fetchStats = async (targetChunks: string[][]) => {
                    const promises = targetChunks.map(async (chunk) => {
                        try {
                            const { data } = await supabase
                                .from('market_stats_view')
                                .select('token_id, name, tier')
                                .in('token_id', chunk);
                            return data || [];
                        } catch (e) {
                            return [];
                        }
                    });
                    const results = await Promise.all(promises);
                    return results.flat();
                };

                const dbStats = await fetchStats(chunks);
                const newInventory: { founder: any[], elite: any[], immortal: any[] } = { founder: [], elite: [], immortal: [] };

                dbStats.forEach((stat: any) => {
                    const idStr = stat.token_id.toString();
                    const tier = (stat.tier || 'founder').toLowerCase();
                    const item = {
                        id: idStr,
                        name: stat.name || `NNM #${idStr}`,
                        wallet: adminTokenMap[idStr] || ''
                    };

                    if (tier.includes('immortal')) newInventory.immortal.push(item);
                    else if (tier.includes('elite')) newInventory.elite.push(item);
                    else newInventory.founder.push(item);
                });

                if (isMounted) {
                    setInventory(newInventory);
                    setLoading(false);
                }

            } catch (error) {
                if (isMounted) setLoading(false);
            }
        };

        fetchAdminData();

        return () => {
            isMounted = false;
        };
    }, [publicClient]);

    return {
        inventory,
        activity,
        loading
    };
}
