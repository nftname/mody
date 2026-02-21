import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, offerId, tokenId, bidderAddress, ownerAddress, price, expiration, signature } = body;

        if (action === 'accept') {
            const { error: updateError } = await supabaseAdmin
                .from('offers')
                .update({ status: 'accepted' })
                .eq('id', offerId);
            
            if (updateError) throw updateError;

            const { error: activityError } = await supabaseAdmin
                .from('activities')
                .insert([{
                    token_id: Number(tokenId),
                    activity_type: 'Sale',
                    from_address: ownerAddress,
                    to_address: bidderAddress,
                    price: Number(price),
                    created_at: new Date().toISOString()
                }]);

            if (activityError) throw activityError;

            return NextResponse.json({ success: true });
        }

        if (action === 'cancel') {
             const { error: cancelError } = await supabaseAdmin
                .from('offers')
                .update({ status: 'cancelled' })
                .eq('id', offerId);

            if (cancelError) throw cancelError;
            return NextResponse.json({ success: true });
        }

        const { error } = await supabaseAdmin
            .from('offers')
            .insert([{ 
                token_id: tokenId, 
                bidder_address: bidderAddress, 
                price: price, 
                expiration: expiration, 
                status: 'active', 
                signature: signature 
            }]);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

