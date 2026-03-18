
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();

    if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 });

    try {
        const history: any[] = []; 
        
        const totalInvestedUsd = history.reduce((sum, tx) => sum + Number(tx.amount_usd), 0);
        const totalTokensBought = history.reduce((sum, tx) => sum + Number(tx.tokens_bought), 0);

        return NextResponse.json({
            success: true,
            totalInvestedUsd,
            totalTokensBought,
            history
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { wallet, txHash, amountUsd, tokensBought } = body;

        if (!wallet || !txHash || !amountUsd || !tokensBought) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}



