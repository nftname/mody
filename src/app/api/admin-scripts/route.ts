import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { MARKETPLACE_ADDRESS } from '@/data/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const publicClient = createPublicClient({
    chain: polygon,
    transport: http("https://polygon-bor.publicnode.com")
});

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

export async function GET(req: Request) {
    try {
        const { data: walletsData, error: walletsError } = await supabase
            .from('admin_wallets')
            .select('address');

        if (walletsError) throw walletsError;

        const adminWalletsArray = walletsData.map((w: any) => w.address?.toLowerCase());
        const adminWallets = new Set(adminWalletsArray);

        const marketData = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'getAllListings'
        });
        
        const [tokenIds, prices, sellers] = marketData as [bigint[], bigint[], string[]];

        const adminTokenIds: string[] = [];
        const adminTokenMap: Record<string, string> = {}; 

        for (let i = 0; i < tokenIds.length; i++) {
            const seller = sellers[i].toLowerCase();
            if (adminWallets.has(seller)) {
                const idStr = tokenIds[i].toString();
                adminTokenIds.push(idStr);
                adminTokenMap[idStr] = seller;
            }
        }

        const { data: salesData } = await supabase
            .from('activities')
            .select('token_id, price, from_address, to_address, created_at')
            .eq('activity_type', 'Sale')
            .order('created_at', { ascending: false })
            .limit(500);

        const sales = [];
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
            .limit(500);

        const offers = [];
        if (offersData) {
            const adminOwnedSet = new Set(adminTokenIds);
            for (const offer of offersData) {
                const bidder = offer.bidder_address?.toLowerCase();
                if (adminOwnedSet.has(offer.token_id.toString()) && bidder && !adminWallets.has(bidder)) {
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

        return NextResponse.json({ 
            success: true, 
            adminTokenIds, 
            adminTokenMap,
            sales,
            offers
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
