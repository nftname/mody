
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const activeProcesses = new Map<string, any>();

export async function POST(req: Request) {
    try {
        const { action, scriptName } = await req.json();

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

            if (activeProcesses.has(scriptName)) {
                return NextResponse.json({ success: false, message: "Already running" });
            }

            const processInstance = exec(command);
            activeProcesses.set(scriptName, processInstance);

            return NextResponse.json({ success: true, message: `Started ${scriptName}` });
        }

        if (action === 'stop') {
            const processInstance = activeProcesses.get(scriptName);
            if (processInstance) {
                processInstance.kill();
                activeProcesses.delete(scriptName);
                return NextResponse.json({ success: true, message: `Stopped ${scriptName}` });
            }
            return NextResponse.json({ error: "Script not running" }, { status: 400 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'new_100_wallets_secret.json');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const walletsData = JSON.parse(fileData);
        
        const walletAddresses = walletsData.map((w: any) => w.address);

        return NextResponse.json({
            success: true,
            protectedWalletsCount: walletAddresses.length,
            addresses: walletAddresses
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load wallets" }, { status: 500 });
    }
}
