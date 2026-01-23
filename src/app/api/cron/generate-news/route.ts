import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// إعدادات لضمان عمل السكريبت
export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

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

// --- Helper Functions ---

async function fetchWithRetry(url: string, retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`CoinGecko Status: ${res.status}`);
            const data = await res.json();
            if (Object.keys(data).length === 0) throw new Error("Empty Data");
            return data;
        } catch (err) {
            console.warn(`Fetch attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

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

// --- [منطق الصور الذكي والمتسلسل] ---
async function getSequentialImage() {
    try {
        // 1. معرفة آخر صورة تم استخدامها
        const { data } = await supabase
            .from('news_posts')
            .select('image_url')
            .order('created_at', { ascending: false })
            .limit(1);

        let nextNum = 1;

        // محاولة استخراج الرقم السابق
        if (data && data.length > 0 && data[0].image_url) {
            const match = data[0].image_url.match(/\/(\d+)\.jpg$/);
            if (match && match[1]) {
                nextNum = parseInt(match[1], 10) + 1; // الرقم التالي
            }
        }

        // 2. التحقق: هل صورة الرقم التالي موجودة فعلاً؟
        const expectedFileName = `${nextNum}.jpg`;
        const dirPath = path.join(process.cwd(), 'public', 'news-assets');
        const fullPath = path.join(dirPath, expectedFileName);

        if (fs.existsSync(fullPath)) {
            // الصورة موجودة -> استخدمها (نستمر للأمام)
            console.log(`✅ Sequence continues: Using ${expectedFileName}`);
            return expectedFileName;
        } else {
            // الصورة غير موجودة (وصلنا للنهاية) -> نعود للبداية (1.jpg)
            console.warn(`🔄 End of sequence (Image ${nextNum} not found). Resetting to 1.jpg`);
            return '1.jpg';
        }

    } catch (error) {
        console.error("FileSystem check failed, defaulting to 1.jpg", error);
        return '1.jpg';
    }
}

export async function GET() {
    try {
        // --- [الجدول الزمني: الاثنين، الأربعاء، الجمعة] ---
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri
        
        // أيام العمل المسموحة (Mon=1, Wed=3, Fri=5)
        const allowedDays = [1, 3, 5];

        if (!allowedDays.includes(dayOfWeek)) {
            return NextResponse.json({ 
                success: true, 
                message: "Skipping today. Schedule is Mon, Wed, Fri only." 
            });
        }

        // --- A. تجميع البيانات ---
        
        const allIds = [
            ...TOKENS.nam, ...TOKENS.art, ...TOKENS.gam, ...TOKENS.utl, ...TOKENS.market
        ].join(',');

        let cgData;
        try {
            cgData = await fetchWithRetry(
                `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
            );
        } catch (fetchError) {
            console.error("Failed to fetch market data after retries.");
            return NextResponse.json({ success: false, message: "Market data unavailable. Article skipped." }, { status: 503 });
        }

        const calculateSector = (ids: string[], name: string) => {
            let totalChange = 0;
            let count = 0;
            let validPrices = 0;

            ids.forEach(id => {
                const coin = cgData[id];
                if (coin && coin.usd !== undefined) {
                    if (coin.usd > 0) {
                        totalChange += coin.usd_24h_change || 0;
                        count++;
                        validPrices++;
                    }
                }
            });

            const avgChange = count ? (totalChange / count) : 0;
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

        const validSectors = rawSectors.filter(s => s.isValid);
        
        if (validSectors.length < 2) {
            console.warn("Market Alert: More than 2 sectors have zero data or >20% crash. Skipping article.");
            return NextResponse.json({ success: false, message: "Market instability detected. Article skipped for safety." });
        }

        validSectors.sort((a, b) => b.change - a.change);
        const topSector = validSectors[0];
        const lowSector = validSectors[validSectors.length - 1];

        const ethCoin = cgData['ethereum'];
        const polCoin = cgData['matic-network'];
        
        const ethPrice = (ethCoin?.usd > 0) ? ethCoin.usd : 0;
        const ethChange = ethCoin?.usd_24h_change || 0;
        const polPrice = (polCoin?.usd > 0) ? polCoin.usd : 0;

        let marketString = "";
        if (ethPrice > 0 && polPrice > 0) {
            marketString = `General Market: ETH is $${ethPrice} (${ethChange.toFixed(2)}%), POL is $${polPrice}.`;
        } else if (ethPrice > 0) {
            marketString = `General Market: ETH is $${ethPrice} (${ethChange.toFixed(2)}%).`;
        } else if (polPrice > 0) {
            marketString = `General Market: POL is $${polPrice}.`;
        } else {
            marketString = "General Market data is currently neutral.";
        }

        const ngxMomentum = (validSectors.reduce((acc, curr) => acc + curr.change, 0) / validSectors.length); 
        let marketMood = 'Neutral';
        if (ngxMomentum > 2) marketMood = 'Greed / High Demand';
        else if (ngxMomentum < -2) marketMood = 'Fear / Correction';

        const nnmInternal = await getNNMInternalVolume();
        
        // --- استدعاء دالة الصور المتسلسلة ---
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

        // --- D. إضافة الحماية القانونية ---
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
                category: 'MARKET UPDATE',
                created_at: new Date().toISOString(),
                is_published: true
            });

        if (insertError) throw insertError;

        return NextResponse.json({ 
            success: true, 
            article: result.title, 
            image_used: selectedImageFilename,
            frequency: "Mon-Wed-Fri Mode Active"
        });

    } catch (error: any) {
        console.error('News Generation Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
