
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tokenId, activityType, fromAddress, toAddress, price } = body;

        const { error } = await supabaseAdmin
            .from('activities')
            .insert([{
                token_id: Number(tokenId),
                activity_type: activityType,
                from_address: fromAddress,
                to_address: toAddress,
                price: Number(price),
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

