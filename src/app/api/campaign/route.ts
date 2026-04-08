import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, tokenIds, tokenId, isFav, taskId, proof, points, type } = body;
        let { address } = body;

        if (!address && action !== 'getLeaderboard') {
            return NextResponse.json({ error_message: 'Missing address' }, { status: 400 });
        }

        if (address) {
            address = address.toLowerCase();
        }

        if (action === 'getFavorites') {
            const { data, error } = await supabaseAdmin.from('favorites').select('token_id').ilike('wallet_address', address);
            if (error) throw error;
            return NextResponse.json({ data });
        }

        if (action === 'toggleFavorite') {
            if (isFav) {
                await supabaseAdmin.from('favorites').delete().ilike('wallet_address', address).eq('token_id', tokenId);
            } else {
                await supabaseAdmin.from('favorites').insert({ wallet_address: address, token_id: tokenId });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'getOffers') {
            let query = supabaseAdmin.from('offers').select('*');
            if (tokenIds && tokenIds.length > 0) {
                const idsString = tokenIds.join(',');
                query = query.or(`bidder_address.ilike.${address},token_id.in.(${idsString})`);
            } else {
                query = query.ilike('bidder_address', address);
            }
            const { data, error } = await query;
            if (error) throw error;
            return NextResponse.json({ data });
        }

        if (action === 'getCreated') {
            const { data, error } = await supabaseAdmin.from('activities').select('*').eq('activity_type', 'Mint').or(`to_address.ilike.${address},from_address.ilike.${address}`);
            if (error) throw error;
            return NextResponse.json({ data });
        }

        if (action === 'getActivity') {
            const { data: actData, error: actError } = await supabaseAdmin.from('activities').select('*').or(`from_address.ilike.${address},to_address.ilike.${address}`).order('created_at', { ascending: false });
            if (actError) throw actError;
            
            const { data: offData, error: offError } = await supabaseAdmin.from('offers').select('*').ilike('bidder_address', address).order('created_at', { ascending: false });
            if (offError) throw offError;
            
            return NextResponse.json({ activities: actData, offers: offData });
        }

        if (action === 'submitTask') {
            const TASK_POINTS: { [key: string]: number } = {
                'tw_rt': 30,
                'tw_like': 30,
                'tg_like': 30,
                'fb_like': 30,
                'ig_like': 30,
                'md_like': 30,
                'tw_follow': 100,
                'tg_join': 100,
                'fb_follow': 100,
                'ig_follow': 100,
                'md_follow': 100
            };

            const securePoints = TASK_POINTS[taskId];

            if (securePoints === undefined) {
                return NextResponse.json({ error_message: 'Invalid Task ID' }, { status: 400 });
            }

            const { data: existingTasks } = await supabaseAdmin
                .from('nnm_task_ledger')
                .select('created_at')
                .eq('wallet_address', address)
                .eq('task_id', taskId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (existingTasks && existingTasks.length > 0) {
                const lastTask = existingTasks[0];
                if (type === 'once') {
                    return NextResponse.json({ error_message: 'Task already completed permanently' }, { status: 400 });
                } else if (type === 'daily' && lastTask.created_at) {
                    const lastCompletionTime = new Date(lastTask.created_at).getTime();
                    const currentTime = new Date().getTime();
                    const hoursPassed = (currentTime - lastCompletionTime) / (1000 * 60 * 60);
                    
                    if (hoursPassed < 24) {
                        return NextResponse.json({ error_message: 'Daily cooldown not met. Please wait 24 hours.' }, { status: 400 });
                    }
                }
            }

            const { error: ledgerError } = await supabaseAdmin.from('nnm_task_ledger').insert({
                wallet_address: address,
                task_id: taskId,
                task_type: type,
                proof_provided: proof,
                points_awarded: securePoints
            });

            if (ledgerError) throw ledgerError;

            const { data: userData } = await supabaseAdmin
                .from('nnm_social_leaderboard')
                .select('total_social_points')
                .eq('wallet_address', address)
                .limit(1);

            const userRecord = userData && userData.length > 0 ? userData[0] : null;

            if (userRecord) {
                const newTotal = userRecord.total_social_points + securePoints;
                await supabaseAdmin.from('nnm_social_leaderboard').update({ 
                    total_social_points: newTotal,
                    last_active_at: new Date().toISOString()
                }).eq('wallet_address', address);
            } else {
                await supabaseAdmin.from('nnm_social_leaderboard').insert({ 
                    wallet_address: address, 
                    total_social_points: securePoints 
                });
            }

            return NextResponse.json({ success: true });
        }


        if (action === 'getLeaderboard') {
            const { data: socialData, error: socialError } = await supabaseAdmin
                .from('nnm_social_leaderboard')
                .select('wallet_address, total_social_points, last_active_at');
                
            if (socialError) throw socialError;

            const { data: claimData, error: claimError } = await supabaseAdmin
                .from('nnm_claim_balances')
                .select('wallet_address, claimable_nnm');

            if (claimError) throw claimError;

            const userMap = new Map();

            if (socialData) {
                socialData.forEach((item: any) => {
                    const wallet = item.wallet_address.toLowerCase();
                    userMap.set(wallet, {
                        wallet_address: item.wallet_address,
                        total_points: Number(item.total_social_points) || 0,
                        last_active_date: item.last_active_at || new Date().toISOString()
                    });
                });
            }

            if (claimData) {
                claimData.forEach((item: any) => {
                    const wallet = item.wallet_address.toLowerCase();
                    const convictionPts = Number(item.claimable_nnm) || 0;
                    
                    if (userMap.has(wallet)) {
                        const existing = userMap.get(wallet);
                        existing.total_points += convictionPts;
                        userMap.set(wallet, existing);
                    } else {
                        userMap.set(wallet, {
                            wallet_address: item.wallet_address,
                            total_points: convictionPts,
                            last_active_date: new Date().toISOString()
                        });
                    }
                });
            }

            const combinedArray = Array.from(userMap.values());
            combinedArray.sort((a, b) => b.total_points - a.total_points);
            const top50 = combinedArray.slice(0, 50);

            return NextResponse.json({ data: top50 });
        }

        if (action === 'getConviction') {
            const { data: walletData } = await supabaseAdmin.from('nnm_claim_balances').select('wnnm_balance, claimable_nnm').ilike('wallet_address', address).limit(1);
            const wallet = walletData && walletData.length > 0 ? walletData[0] : null;

            const { data: mints } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Mint' }).ilike('to_address', address);
            const { data: sales } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Sale' }).ilike('to_address', address);
            const { data: votes } = await supabaseAdmin.from('conviction_votes').select('*').ilike('supporter_address', address);
            const { data: pays } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Pay' }).ilike('to_address', address);
            
            const { data: lbData } = await supabaseAdmin
                .from('nnm_social_leaderboard')
                .select('total_social_points')
                .ilike('wallet_address', address)
                .limit(1);

            const socialPointsTotal = lbData && lbData.length > 0 ? lbData[0].total_social_points : 0;
            
            const { data: completedTasks, error: tasksError } = await supabaseAdmin
                .from('nnm_task_ledger')
                .select('task_id, task_type, created_at')
                .ilike('wallet_address', address)
                .order('created_at', { ascending: false });
            
            const lockedTaskIds = new Set<string>();
            const currentTime = new Date().getTime();

            if (!tasksError && completedTasks) {
                completedTasks.forEach((item: any) => {
                    const taskId = item.task_id;
                    const isOnceTask = item.task_type === 'once';

                    if (isOnceTask) {
                        lockedTaskIds.add(taskId);
                    } else {
                        if (item.created_at && !lockedTaskIds.has(taskId)) {
                            const taskTime = new Date(item.created_at).getTime();
                            const hoursPassed = (currentTime - taskTime) / (1000 * 60 * 60);
                            if (hoursPassed < 24) {
                                lockedTaskIds.add(taskId);
                            }
                        }
                    }
                });
            }

            return NextResponse.json({ 
                wallet, 
                mints, 
                sales, 
                votes, 
                pays,
                social_points: socialPointsTotal,
                ecosystem_points: 0,
                completed_tasks: Array.from(lockedTaskIds)
            });
        }

        return NextResponse.json({ error_message: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error("🔥 ERROR DETECTED IN API:", JSON.stringify(error, null, 2));
        return NextResponse.json({ 
            success: false, 
            error_message: error.message || "Unknown error occurred",
            error_details: error 
        }, { status: 500 });
    }
}

