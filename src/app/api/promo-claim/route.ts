import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, wallet_address } = body;

        if (!wallet_address) {
            return NextResponse.json({ error: 'Required' }, { status: 400 });
        }

        const cleanAddress = wallet_address.toLowerCase();

        if (action === 'check') {
            const { data, error } = await supabase
                .from('promo_founder_claims')
                .select('wallet_address')
                .eq('wallet_address', cleanAddress)
                .maybeSingle();

            if (error) throw error;
            return NextResponse.json({ claimed: !!data });
        } 
        
        if (action === 'claim') {
            const { error } = await supabase
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
