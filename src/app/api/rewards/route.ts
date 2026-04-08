import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
    try {
        const { count, error } = await supabase
            .from('assets_metadata')
            .select('*', { count: 'exact', head: true })
            .in('tier', ['IMMORTAL', 'ELITE']);

        if (error) throw error;

        return NextResponse.json({ totalPremiumMints: count || 0 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
