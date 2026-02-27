import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const activeProcesses = new Map<string, any>();
const walletsPath = path.join(process.cwd(), 'data', 'new_100_wallets_secret.json');
const cachePath = path.join(process.cwd(), 'data', 'inventory_cache.json');

const getAdminWallets = () => {
    if (!fs.existsSync(walletsPath)) return [];
    const data = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
    return data.map((w: any) => w.address.toLowerCase());
};

const updateInventoryCache = (inventory: any) => {
    fs.writeFileSync(cachePath, JSON.stringify(inventory, null, 2), 'utf8');
};

const buildInventoryCache = async (adminWallets: string[]) => {
    const inventory: Record<string, any[]> = { founder: [], elite: [], immortal: [] };
    
    const { data: activities } = await supabase
        .from('activities')
        .select('token_id, to_address, activity_type')
        .order('created_at', { ascending: true });

    if (!activities) {
        updateInventoryCache(inventory);
        return inventory;
    }

    const currentOwners = new Map<string, string>();
    for (const act of activities) {
        if (act.activity_type === 'Mint' || act.activity_type === 'Transfer' || act.activity_type === 'Sale') {
            currentOwners.set(act.token_id.toString(), act.to_address?.toLowerCase());
        }
    }

    const { data: metadata } = await supabase.from('assets_metadata').select('token_id, name, tier');
    const metaMap = new Map();
    if (metadata) {
        for (const m of metadata) {
            metaMap.set(m.token_id.toString(), m);
        }
    }

    for (const [tokenId, owner] of currentOwners.entries()) {
        if (adminWallets.includes(owner)) {
            const meta = metaMap.get(tokenId);
            const tier = meta?.tier?.toLowerCase() || 'founder';
            const item = { id: tokenId, name: meta?.name || `NNM #${tokenId}`, wallet: owner };
            
            if (tier === 'immortal') inventory.immortal.push(item);
            else if (tier === 'elite') inventory.elite.push(item);
            else inventory.founder.push(item);
        }
    }

    updateInventoryCache(inventory);
    return inventory;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const adminWallets = getAdminWallets();

    if (type === 'inventory') {
        let inventory;
        if (fs.existsSync(cachePath)) {
            inventory = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        } else {
            inventory = await buildInventoryCache(adminWallets);
        }
        return NextResponse.json({ success: true, inventory });
    }

    if (type === 'external_activity') {
        let inventory;
        if (fs.existsSync(cachePath)) {
            inventory = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        } else {
            inventory = await buildInventoryCache(adminWallets);
        }

        const ownedIds = new Set<string>();
        ['founder', 'elite', 'immortal'].forEach(tier => {
            inventory[tier].forEach((item: any) => ownedIds.add(item.id.toString()));
        });

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
            if (fs.existsSync(cachePath)) {
                let inventory = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                for (const tier of ['founder', 'elite', 'immortal']) {
                    inventory[tier] = inventory[tier].filter((item: any) => item.id !== assetId.toString());
                }
                updateInventoryCache(inventory);
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: "Cache not found" }, { status: 404 });
        }

        const scriptMap: Record<string, string> = {
            "Market Maker Final": "npx ts-node scripts/market-maker-final.ts",
            "NNM Conviction Expert": "npx ts-node scripts/nnm-conviction-expert.ts",
            "Sweep All": "npx ts-node scripts/sweep-all.ts",
            "Add Money": "npx ts-node scripts/addMoney.ts",
            "Execute Sovereign Listings": "npx ts-node scripts/execute-sovereign-listings.ts",
            "Expert Admin Minter": "npx ts-node scripts/expert-admin-minter.ts"
        };

        if (action === 'start') {
            const command = scriptMap[scriptName];
            if (!command) return NextResponse.json({ error: "Script not found" }, { status: 400 });
            if (activeProcesses.has(scriptName)) return NextResponse.json({ success: false, message: "Running" });

            const processInstance = exec(command);
            activeProcesses.set(scriptName, processInstance);
            return NextResponse.json({ success: true });
        }

        if (action === 'stop') {
            const processInstance = activeProcesses.get(scriptName);
            if (processInstance) {
                processInstance.kill();
                activeProcesses.delete(scriptName);
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: "Not running" }, { status: 400 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
