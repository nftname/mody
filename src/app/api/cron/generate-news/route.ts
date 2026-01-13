import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // السماح بدقيقة كاملة للتنفيذ لمحاولات جلب البيانات

// 1. إعدادات الاتصال
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. تعريفات البيانات
const TOKENS = {
    nam: ['ethereum-name-service', 'space-id', 'bonfida'],
    art: ['apecoin', 'blur', 'render-token'],
    gam: ['immutable-x', 'gala', 'beam-2'],
    utl: ['decentraland', 'the-sandbox', 'highstreet'],
    market: ['ethereum', 'matic-network']
};

// --- Helper Functions (Logic Core) ---

// دالة جلب البيانات مع نظام إعادة المحاولة (Retry Mechanism)
// تحاول 5 مرات مع انتظار 5 ثواني بين كل محاولة (المجموع حوالي 25-30 ثانية)
async function fetchWithRetry(url: string, retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`CoinGecko Status: ${res.status}`);
            const data = await res.json();
            // تأكد أن البيانات ليست فارغة
            if (Object.keys(data).length === 0) throw new Error("Empty Data");
            return data;
        } catch (err) {
            console.warn(`Fetch attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            if (i === retries - 1) throw err; // إذا فشلت آخر محاولة، ارمِ الخطأ
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// حساب نسبة تغير فوليوم البورصة الداخلي
async function getNNMInternalVolume() {
    try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        const { data: sales, error } = await supabase
            .from('activities')
            .select('price, created_at')
            .eq('activity_type', 'Sale')
            .gte('created_at', twoDaysAgo.toISOString());

        if (error || !sales) return { change: 0, volume: 0 };

        let volToday = 0;
        let volYest = 0;

        sales.forEach((sale: any) => {
            const price = Number(sale.price) || 0;
            const saleDate = new Date(sale.created_at);
            if (saleDate >= yesterday) volToday += price;
            else volYest += price;
        });

        let percentChange = 0;
        if (volYest === 0) percentChange = volToday > 0 ? 100 : 0;
        else percentChange = ((volToday - volYest) / volYest) * 100;

        return { change: percentChange.toFixed(1), volume: volToday };
    } catch (e) {
        return { change: 0, volume: 0 };
    }
}

// اختيار الصور بالتسلسل
async function getSequentialImage() {
    try {
        const { count, error } = await supabase
            .from('news_posts')
            .select('*', { count: 'exact', head: true });
        
        if (error) return 'A1.jpg';

        const currentCount = count || 0;
        const nextImageNumber = currentCount + 1;
        
        const expectedFileName = `${nextImageNumber}.jpg`;
        const dirPath = path.join(process.cwd(), 'public', 'news-assets');
        const fullPath = path.join(dirPath, expectedFileName);

        return fs.existsSync(fullPath) ? expectedFileName : 'A1.jpg';
    } catch (error) {
        return 'A1.jpg';
    }
}

export async function GET() {
    try {
        // --- A. تجميع البيانات الحية (Data Aggregation & Safety) ---
        
        const allIds = [
            ...TOKENS.nam, ...TOKENS.art, ...TOKENS.gam, ...TOKENS.utl, ...TOKENS.market
        ].join(',');

        // 1. جلب البيانات باستخدام نظام إعادة المحاولة
        let cgData;
        try {
            cgData = await fetchWithRetry(
                `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
            );
        } catch (fetchError) {
            console.error("Failed to fetch market data after retries.");
            return NextResponse.json({ success: false, message: "Market data unavailable. Article skipped." }, { status: 503 });
        }

        // 2. منطق تحليل القطاعات (Sector Analysis)
        const calculateSector = (ids: string[], name: string) => {
            let totalChange = 0;
            let count = 0;
            let validPrices = 0;

            ids.forEach(id => {
                const coin = cgData[id];
                if (coin && coin.usd !== undefined) {
                    // استبعاد العملات الصفرية
                    if (coin.usd > 0) {
                        totalChange += coin.usd_24h_change || 0;
                        count++;
                        validPrices++;
                    }
                }
            });

            // حساب المتوسط
            const avgChange = count ? (totalChange / count) : 0;
            
            // **Crash Protection**: التحقق هل القطاع سليم؟
            // يعتبر "تالف" إذا كان التغير أقل من -20% (انهيار) أو لا توجد بيانات (validPrices = 0)
            const isCrashed = avgChange < -20;
            const isZeroData = validPrices === 0;

            return { name, change: avgChange, isValid: !isCrashed && !isZeroData };
        };

        const rawSectors = [
            calculateSector(TOKENS.nam, 'Digital Names'),
            calculateSector(TOKENS.art, 'Digital Art'),
            calculateSector(TOKENS.gam, 'Gaming Assets'),
            calculateSector(TOKENS.utl, 'Virtual Land')
        ];

        // 3. فلترة القطاعات (Kill Switch Check)
        const validSectors = rawSectors.filter(s => s.isValid);
        
        // **Kill Switch Condition**: إذا تم رفض أكثر من قطاعين (أي تبقى أقل من 2)، نلغي المقال
        if (validSectors.length < 2) {
            console.warn("Market Alert: More than 2 sectors have zero data or >20% crash. Skipping article.");
            return NextResponse.json({ success: false, message: "Market instability detected. Article skipped for safety." });
        }

        // ترتيب القطاعات الصالحة فقط
        validSectors.sort((a, b) => b.change - a.change);
        const topSector = validSectors[0];
        const lowSector = validSectors[validSectors.length - 1];

        // 4. منطق السوق العام (ETH & POL Zero Logic)
        const ethCoin = cgData['ethereum'];
        const polCoin = cgData['matic-network'];
        
        const ethPrice = (ethCoin?.usd > 0) ? ethCoin.usd : 0;
        const ethChange = ethCoin?.usd_24h_change || 0;
        const polPrice = (polCoin?.usd > 0) ? polCoin.usd : 0;

        // بناء جملة السوق بناءً على توفر البيانات
        let marketString = "";
        if (ethPrice > 0 && polPrice > 0) {
            marketString = `General Market: ETH is $${ethPrice} (${ethChange.toFixed(2)}%), POL is $${polPrice}.`;
        } else if (ethPrice > 0) {
            marketString = `General Market: ETH is $${ethPrice} (${ethChange.toFixed(2)}%).`;
        } else if (polPrice > 0) {
            marketString = `General Market: POL is $${polPrice}.`;
        } else {
            // إذا كلاهما صفر، لا نكتب شيئاً
            marketString = "General Market data is currently neutral.";
        }

        // 5. حالة السوق
        const ngxMomentum = (validSectors.reduce((acc, curr) => acc + curr.change, 0) / validSectors.length); 
        let marketMood = 'Neutral';
        if (ngxMomentum > 2) marketMood = 'Greed / High Demand';
        else if (ngxMomentum < -2) marketMood = 'Fear / Correction';

        const nnmInternal = await getNNMInternalVolume();
        const selectedImageFilename = await getSequentialImage();


        // --- B. هندسة البرومبت SEO Professional ---
        
        const systemPrompt = `
        You are a senior crypto market analyst and SEO Strategist for "NNM News".
        Your goal is to write a sophisticated, narrative-driven market update that ranks #1 on Google for NFT and Web3 terms.
        
        Style Guide:
        - Tone: Professional, Authoritative (like Bloomberg/TechCrunch), yet engaging.
        - Structure: Flowing narrative paragraphs (No bullet points).
        - SEO Strategy: Use "Contextual Injection" to weave in high-value keywords naturally without sounding robotic.
        `;

        const userPrompt = `
        Write a market report based on this LIVE data (Ignore any missing sectors):
        
        1. **Lead Story**: The ${topSector.name} sector is leading with ${topSector.change.toFixed(2)}%.
        2. **Lagging**: ${lowSector.name} is at ${lowSector.change.toFixed(2)}%.
        3. **Market Context**: ${marketString} Market Mood: ${marketMood}.
        4. **Internal Growth**: NNM Protocol volume change: ${nnmInternal.change}%.

        **MANDATORY SEO VOCABULARY (Must include naturally):**
        - You MUST use the term **"NNM Protocol"** and **"NNM Registry"** as the authoritative source of data.
        - You MUST use the verbs **"Mint"** or **"Minted"** when describing creation or growth.
        - You MUST use the word **"NFTs"** (plural) at least 3 times.
        - You MUST use the word **"NFT"** (singular) at least once.
        - You MUST mention **"Visual Identity"** assets.

        **MARKET TERMINOLOGY (Use these specific terms for sectors):**
        - When discussing Names: Use **"Digital Names"**, **"Web3 Domains"**, or **"Identity Assets"**.
        - When discussing Land: Use **"Virtual Land"** or **"Metaverse Real Estate"**.
        - When discussing Art: Use **"Digital Art"** or **"Blue-Chip NFTs"**.
        - When discussing Games: Use **"Gaming Assets"** or **"GameFi"**.

        **Requirements**:
        - Title: Catchy, includes "NFT" or "Web3".
        - Summary: 2 sentences max, engaging.
        - Content: 300-350 words, clean HTML (<p>, <h3>, <strong>).
        - **Crucial**: Make the keywords flow naturally. Do not list them.
        
        Output JSON: { "title": "...", "summary": "...", "content": "..." }
        `;

        // --- C. استدعاء الذكاء الاصطناعي ---
        
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "gpt-4-turbo",
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        // --- D. إضافة الحماية القانونية (Legal Disclaimer) ---
        // يتم إضافتها تلقائياً لنهاية محتوى المقال
        const legalDisclaimer = `
        <br><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.85rem; color: #888; font-style: italic; line-height: 1.4;">
            <strong>Disclaimer:</strong> The information provided in this article regarding the <strong>NNM Protocol</strong>, <strong>NFTs</strong>, and digital assets is for informational purposes only and does not constitute financial advice. 
            All market data, including the <strong>NGX Index</strong> and sector performance, is automated and subject to volatility. 
            Users should conduct their own research (DYOR) before minting or trading any <strong>Visual Identity</strong> assets or crypto products.
        </p>
        `;
        
        result.content = result.content + legalDisclaimer;

        // --- E. حفظ المقال في قاعدة البيانات ---

        const imagePath = `/news-assets/${selectedImageFilename}`;

        const { error: insertError } = await supabase
            .from('news_posts')
            .insert({
                title: result.title,
                summary: result.summary,
                content: result.content,
                image_url: imagePath,
                created_at: new Date().toISOString(),
            });

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, article: result.title, image_used: selectedImageFilename });

    } catch (error: any) {
        console.error('News Generation Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
