import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

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

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const adminWallets = getAdminWallets();

    if (type === 'inventory') {
        let inventory = { founder: [], elite: [], immortal: [] };
        if (fs.existsSync(cachePath)) {
            inventory = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        }
        return NextResponse.json({ success: true, inventory });
    }

    if (type === 'external_activity') {
        const sales = [
            { id: '1', name: 'Alpha', price: '50', buyer: '0xabc123', seller: adminWallets[0], date: new Date().toISOString() }
        ];
        const offers = [
            { id: '2', name: 'Beta', price: '45', wallet: '0xxyz987', owner: adminWallets[1], expiry: '2026-12-31' }
        ];
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
                    inventory[tier] = inventory[tier].filter((item: any) => item.id !== assetId);
                }
                updateInventoryCache(inventory);
                return NextResponse.json({ success: true });
            }
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
