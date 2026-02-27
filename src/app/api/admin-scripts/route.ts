import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const walletsPath = path.join(process.cwd(), 'data', 'new_100_wallets_secret.json');

const getAdminWallets = () => {
    if (!fs.existsSync(walletsPath)) return [];
    const data = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
    return data.map((w: any) => w.address.toLowerCase());
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const adminWallets = getAdminWallets();

    if (type === 'inventory') {
        const inventory: Record<string, any[]> = { founder: [], elite: [], immortal: [] };

        const { data: assets } = await supabase
            .from('my_assets')
            .select('*');

        if (assets) {
            for (const asset of assets) {
                if (adminWallets.includes(asset.owner_wallet)) {
                    const tier = asset.tier.toLowerCase();
                    const item = { id: asset.id, name: asset.name, wallet: asset.owner_wallet };
                    
                    if (tier === 'immortal') inventory.immortal.push(item);
                    else if (tier === 'elite') inventory.elite.push(item);
                    else inventory.founder.push(item);
                }
            }
        }
        
        return NextResponse.json({ success: true, inventory });
    }

    if (type === 'external_activity') {
        const { data: assets } = await supabase
            .from('my_assets')
            .select('id, owner_wallet');
        
        const ownedIds = new Set<string>();
        if (assets) {
            for (const asset of assets) {
                if (adminWallets.includes(asset.owner_wallet)) {
                    ownedIds.add(asset.id.toString());
                }
            }
        }

        const { data: salesData } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_type', 'Sale')
            .order('created_at', { ascending: false })
            .limit(1000);

        const sales = [];
        if (salesData) {
            for (const sale of salesData) {
                const seller = sale.from_address?.toLowerCase();
                const buyer = sale.to_address?.toLowerCase();
                if (adminWallets.includes(seller) && !adminWallets.includes(buyer)) {
                    sales.push({
                        id: sale.token_id,
                        name: `NNM #${sale.token_id}`,
                        price: sale.price,
                        buyer: buyer,
                        seller: seller,
                        date: sale.created_at
                    });
                }
            }
        }

        const { data: offersData } = await supabase
            .from('offers')
            .select('*')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(1000);

        const offers = [];
        if (offersData) {
            for (const offer of offersData) {
                const bidder = offer.bidder_address?.toLowerCase();
                if (ownedIds.has(offer.token_id.toString()) && !adminWallets.includes(bidder)) {
                    offers.push({
                        id: offer.token_id,
                        name: `NNM #${offer.token_id}`,
                        price: offer.price,
                        wallet: bidder,
                        expiry: new Date(offer.expiration * 1000).toLocaleDateString()
                    });
                }
            }
        }

        return NextResponse.json({ success: true, sales, offers });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, scriptName, assetId } = body;

        if (action === 'remove_from_cache' && assetId) {
            const { error } = await supabase
                .from('my_assets')
                .delete()
                .eq('id', assetId);
            
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }
        
        if (action === 'start' || action === 'stop') {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
