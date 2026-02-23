import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, address, tokenIds, tokenId, isFav } = body;

        if (!address) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        if (action === 'getFavorites') {
            const { data, error } = await supabaseAdmin.from('favorites').select('token_id').eq('wallet_address', address);
            if (error) throw error;
            return NextResponse.json({ data });
        }

        if (action === 'toggleFavorite') {
            if (isFav) {
                await supabaseAdmin.from('favorites').delete().match({ wallet_address: address, token_id: tokenId });
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

        if (action === 'getConviction') {
            const { data: wallet } = await supabaseAdmin.from('nnm_wallets').select('wnnm_balance, nnm_balance').eq('wallet_address', address).maybeSingle();
            const { data: mints } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Mint' }).ilike('to_address', address);
            const { data: sales } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Sale' }).ilike('to_address', address);
            const { data: votes } = await supabaseAdmin.from('conviction_votes').select('*').ilike('supporter_address', address);
            const { data: pays } = await supabaseAdmin.from('activities').select('*').match({ activity_type: 'Pay' }).ilike('to_address', address);
            
            return NextResponse.json({ wallet, mints, sales, votes, pays });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
