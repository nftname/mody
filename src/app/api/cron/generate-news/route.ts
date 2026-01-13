import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // السماح بدقيقة كاملة للتنفيذ

// 1. إعدادات الاتصال
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // مفتاح الكتابة الحصري
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
            
            if (saleDate >= yesterday) {
                volToday += price;
            } else {
                volYest += price;
            }
        });

        // حساب النسبة المئوية
        let percentChange = 0;
        if (volYest === 0) {
            percentChange = volToday > 0 ? 100 : 0;
        } else {
            percentChange = ((volToday - volYest) / volYest) * 100;
        }

        return { change: percentChange.toFixed(1), volume: volToday };
    } catch (e) {
        return { change: 0, volume: 0 };
    }
}

// *** المنطق الجديد لاختيار الصور بالتسلسل ***
async function getSequentialImage() {
    try {
        const { count, error } = await supabase
            .from('news_posts')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error('Error fetching count:', error);
            return 'A1.jpg';
        }

        const currentCount = count || 0;
        const nextImageNumber = currentCount + 1;
        
        const expectedFileName = `${nextImageNumber}.jpg`;
        const dirPath = path.join(process.cwd(), 'public', 'news-assets');
        const fullPath = path.join(dirPath, expectedFileName);

        if (fs.existsSync(fullPath)) {
            return expectedFileName;
        } else {
            return 'A1.jpg';
        }

    } catch (error) {
        console.error('Image selection error:', error);
        return 'A1.jpg';
    }
}

export async function GET() {
    try {
        // --- A. تجميع البيانات الحية (Data Aggregation) ---
        
        const allIds = [
            ...TOKENS.nam, ...TOKENS.art, ...TOKENS.gam, ...TOKENS.utl, ...TOKENS.market
        ].join(',');

        const cgResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
            { cache: 'no-store' }
        );
        const cgData = await cgResponse.json();

        // حساب أداء القطاعات
        const calculateSector = (ids: string[], name: string) => {
            let totalChange = 0;
            let count = 0;
            ids.forEach(id => {
                if (cgData[id]) {
                    totalChange += cgData[id].usd_24h_change || 0;
                    count++;
                }
            });
            return { name, change: count ? (totalChange / count) : 0 };
        };

        // هنا نستخدم أسماء عامة للكود، لكن في البرومبت سنعطي الأسماء السوقية الدقيقة
        const sectors = [
            calculateSector(TOKENS.nam, 'Digital Names'),
            calculateSector(TOKENS.art, 'Digital Art'),
            calculateSector(TOKENS.gam, 'Gaming Assets'),
            calculateSector(TOKENS.utl, 'Virtual Land')
        ];

        sectors.sort((a, b) => b.change - a.change);
        const topSector = sectors[0];
        const lowSector = sectors[sectors.length - 1];

        const ethPrice = cgData['ethereum']?.usd || 0;
        const ethChange = cgData['ethereum']?.usd_24h_change || 0;
        const polPrice = cgData['matic-network']?.usd || 0;

        const ngxMomentum = (sectors.reduce((acc, curr) => acc + curr.change, 0) / 4); 
        let marketMood = 'Neutral';
        if (ngxMomentum > 2) marketMood = 'Greed / High Demand';
        else if (ngxMomentum < -2) marketMood = 'Fear / Correction';

        const nnmInternal = await getNNMInternalVolume();
        const selectedImageFilename = await getSequentialImage();


        // --- B. هندسة البرومبت SEO Professional (The SEO Engine) ---
        
        // تعليمات النظام: نحدد شخصية الخبير في الـ SEO والسوق
        const systemPrompt = `
        You are a senior crypto market analyst and SEO Strategist for "NNM News".
        Your goal is to write a sophisticated, narrative-driven market update that ranks #1 on Google for NFT and Web3 terms.
        
        Style Guide:
        - Tone: Professional, Authoritative (like Bloomberg/TechCrunch), yet engaging.
        - Structure: Flowing narrative paragraphs (No bullet points).
        - SEO Strategy: Use "Contextual Injection" to weave in high-value keywords naturally without sounding robotic.
        `;

        // تعليمات المستخدم: نحدد البيانات والكلمات المفتاحية الإجبارية
        const userPrompt = `
        Write a market report based on this LIVE data:
        
        1. **Lead Story**: The ${topSector.name} sector is leading with ${topSector.change.toFixed(2)}%.
        2. **Lagging**: ${lowSector.name} is at ${lowSector.change.toFixed(2)}%.
        3. **Market**: ETH $${ethPrice}, POL $${polPrice}. Mood: ${marketMood}.
        4. **Internal Growth**: NNM Protocol volume change: ${nnmInternal.change}%.

        **MANDATORY SEO VOCABULARY (Must include naturally):**
        - You MUST use the term **"NNM Protocol"** and **"NNM Registry"** as the authoritative source of data.
        - You MUST use the verbs **"Mint"** or **"Minted"** when describing creation or growth (e.g., "assets being minted", "fresh supply minted").
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

        // --- D. حفظ المقال في قاعدة البيانات ---

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
