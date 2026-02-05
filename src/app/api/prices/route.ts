import { NextResponse } from 'next/server';

// ذاكرة مؤقتة على مستوى السيرفر
let cachedPrices: any = null;
let lastUpdate = 0;

const CACHE_DURATION = 60 * 1000; // تحديث كل دقيقة واحدة (60 ثانية)

export async function GET() {
    const now = Date.now();

    // إذا كان لدينا سعر محفوظ ولم تمر عليه دقيقة، نرجعه فوراً
    if (cachedPrices && (now - lastUpdate < CACHE_DURATION)) {
        return NextResponse.json(cachedPrices);
    }

    try {
        // طلب الأسعار من مصدر موثوق (CoinGecko)
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd',
            { next: { revalidate: 60 } } // كاش إضافي من Next.js
        );

        const data = await response.json();

        // استخلاص الأسعار بدقة
        const polPrice = data['polygon-ecosystem-token']?.usd || data['matic-network']?.usd || 0;
        const ethPrice = data['ethereum']?.usd || 0;

        const prices = {
            pol: polPrice,
            eth: ethPrice,
            usd: 1, // مرجع ثابت
            timestamp: new Date().toISOString()
        };

        // تحديث الذاكرة المؤقتة
        cachedPrices = prices;
        lastUpdate = now;

        return NextResponse.json(prices);

    } catch (error) {
        console.error("Price API Fetch Error:", error);
        
        // في حال فشل الاتصال، نرجع آخر سعر محفوظ لدينا بدلاً من الصفر
        if (cachedPrices) return NextResponse.json(cachedPrices);

        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
}
