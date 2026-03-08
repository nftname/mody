import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, wallet_address } = body;

        if (!wallet_address) {
            return NextResponse.json({ error: 'Required' }, { status: 400 });
        }

        const cleanAddress = wallet_address.toLowerCase();

        if (action === 'check') {
            const { data, error } = await supabaseAdmin
                .from('promo_founder_claims')
                .select('wallet_address')
                .eq('wallet_address', cleanAddress)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return NextResponse.json({ claimed: !!data });
        } 
        
        if (action === 'claim') {
            const { error } = await supabaseAdmin
                .from('promo_founder_claims')
                .insert([{ 
                    wallet_address: cleanAddress,
                    claimed_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
