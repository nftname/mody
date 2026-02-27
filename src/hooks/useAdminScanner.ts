
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdminScanner() {
    const [inventory, setInventory] = useState({ founder: [], elite: [], immortal: [] });
    const [activity, setActivity] = useState({ sales: [], offers: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAdminData = async () => {
            try {
                setLoading(true);
                
                const res = await fetch('/api/admin-scripts');
                if (!res.ok) throw new Error();
                const apiData = await res.json();
                
                if (!apiData.success) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const { adminTokenIds, adminTokenMap, sales, offers } = apiData;

                if (isMounted) {
                    setActivity({ sales, offers });
                }

                if (!adminTokenIds || adminTokenIds.length === 0) {
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
                
                const newInventory: any = { founder: [], elite: [], immortal: [] };

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
    }, []);

    return {
        inventory,
        activity,
        loading
    };
}

