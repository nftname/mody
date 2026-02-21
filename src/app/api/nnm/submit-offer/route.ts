import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tokenId, bidderAddress, price, expiration, signature } = body;

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