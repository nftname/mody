import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        const { data: walletsData, error: walletsError } = await supabase
            .from('admin_wallets')
            .select('address');

        if (walletsError) throw walletsError;
        
        const adminWalletsArray = walletsData?.map((w: any) => w.address?.toLowerCase()) || [];
        const adminWallets = new Set(adminWalletsArray);

        const { data: salesData } = await supabase
            .from('activities')
            .select('token_id, price, from_address, to_address, created_at')
            .eq('activity_type', 'Sale')
            .order('created_at', { ascending: false })
            .limit(1000);

        const sales: any[] = [];
        if (salesData) {
            for (const sale of salesData) {
                const seller = sale.from_address?.toLowerCase();
                const buyer = sale.to_address?.toLowerCase();
                if (seller && adminWallets.has(seller) && (!buyer || !adminWallets.has(buyer))) {
                    sales.push({
                        id: sale.token_id,
                        name: `NNM #${sale.token_id}`,
                        price: sale.price,
                        buyer: buyer || '',
                        seller: seller,
                        date: sale.created_at
                    });
                }
            }
        }

        const { data: offersData } = await supabase
            .from('offers')
            .select('token_id, price, bidder_address, expiration')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(1000);

        return NextResponse.json({ 
            success: true, 
            adminWallets: adminWalletsArray,
            sales,
            allOffers: offersData || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;
        if (action === 'start' || action === 'stop') {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
