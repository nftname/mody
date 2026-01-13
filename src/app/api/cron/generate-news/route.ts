import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // السماح بدقيقة كاملة للتنفيذ لأن GPT قد يأخذ وقتاً

// 1. إعدادات الاتصال
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // مفتاح الكتابة الحصري
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. تعريفات البيانات (نفس العملات المستخدمة في مؤشراتك)
const TOKENS = {
    nam: ['ethereum-name-service', 'space-id', 'bonfida'],
    art: ['apecoin', 'blur', 'render-token'],
    gam: ['immutable-x', 'gala', 'beam-2'],
    utl: ['decentraland', 'the-sandbox', 'highstreet'],
    market: ['ethereum', 'matic-network'] // ETH & POL
};

// --- Helper Functions (Logic Core) ---

// حساب نسبة تغير فوليوم البورصة الداخلي (نفس المنطق الدقيق الأصلي)
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
// يبحث عن الصورة رقم (عدد المقالات + 1).jpg، إذا لم يجدها يستخدم A1.jpg
async function getSequentialImage() {
    try {
        // 1. معرفة عدد المقالات الحالي في الموقع
        const { count, error } = await supabase
            .from('news_posts')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error('Error fetching count:', error);
            return 'A1.jpg';
        }

        const currentCount = count || 0;
        const nextImageNumber = currentCount + 1; // الصورة المطلوبة هي العدد الحالي + 1
        
        // 2. التحقق هل الصورة موجودة فعلياً في المجلد؟
        const expectedFileName = `${nextImageNumber}.jpg`;
        const dirPath = path.join(process.cwd(), 'public', 'news-assets');
        const fullPath = path.join(dirPath, expectedFileName);

        if (fs.existsSync(fullPath)) {
            return expectedFileName; // وجدنا الصورة الجديدة المتسلسلة
        } else {
            return 'A1.jpg'; // لم نجد صورة جديدة، نعود للصورة الافتراضية
        }

    } catch (error) {
        console.error('Image selection error:', error);
        return 'A1.jpg'; // في حال حدوث أي خطأ نضمن وجود صورة
    }
}

export async function GET() {
    try {
        // --- A. تجميع البيانات الحية (Data Aggregation) ---
        
        // 1. جلب بيانات CoinGecko لجميع العملات
        const allIds = [
            ...TOKENS.nam, ...TOKENS.art, ...TOKENS.gam, ...TOKENS.utl, ...TOKENS.market
        ].join(',');

        const cgResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
            { cache: 'no-store' }
        );
        const cgData = await cgResponse.json();

        // 2. حساب أداء القطاعات
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

        const sectors = [
            calculateSector(TOKENS.nam, 'Digital Names (DNA)'),
            calculateSector(TOKENS.art, 'Digital Art'),
            calculateSector(TOKENS.gam, 'Gaming Assets'),
            calculateSector(TOKENS.utl, 'Virtual Land')
        ];

        // ترتيب القطاعات
        sectors.sort((a, b) => b.change - a.change);
        const topSector = sectors[0];
        const lowSector = sectors[sectors.length - 1];

        // 3. بيانات السوق العامة
        const ethPrice = cgData['ethereum']?.usd || 0;
        const ethChange = cgData['ethereum']?.usd_24h_change || 0;
        const polPrice = cgData['matic-network']?.usd || 0;

        // 4. حالة السوق (السياق)
        const ngxMomentum = (sectors.reduce((acc, curr) => acc + curr.change, 0) / 4); 
        let marketMood = 'Neutral';
        if (ngxMomentum > 2) marketMood = 'Greed / High Demand';
        else if (ngxMomentum < -2) marketMood = 'Fear / Correction';

        // 5. بيانات البورصة الداخلية (NNM Volume) - المعادلة الأصلية
        const nnmInternal = await getNNMInternalVolume();

        // 6. اختيار الصورة (المنطق التسلسلي الجديد)
        const selectedImageFilename = await getSequentialImage();


        // --- B. هندسة البرومبت (The Prompt Engineering) ---
        
        const systemPrompt = `
        You are a senior crypto market analyst writing for "NNM News". 
        Your goal is to write a sophisticated, narrative-driven article (NOT a listicle) based on real-time data.
        
        Style Guide:
        - Tone: Professional, Insightful, Wall Street Journal style.
        - Structure: Start with the "Lead Story" (the biggest mover), then weave in other data points naturally.
        - Philosophy: Promote the "Nexus Shift" (the move from speculation to utility/infrastructure).
        - No Bullet Points: Use flowing paragraphs.
        - Length: 300-400 words (HTML format).
        `;

        const userPrompt = `
        Write a market report based on this LIVE data:
        
        1. **Top Story**: The ${topSector.name} sector is leading the market with a ${topSector.change.toFixed(2)}% move.
        2. **Lagging Sector**: ${lowSector.name} is showing weakness/consolidation at ${lowSector.change.toFixed(2)}%.
        3. **General Market**: ETH is at $${ethPrice} (${ethChange.toFixed(2)}%), POL is at $${polPrice}. Market Mood: ${marketMood}.
        4. **NNM Internal Data (CRITICAL)**: Our local exchange volume change in the last 24h is ${nnmInternal.change}%. 
           - If positive: Hype it as organic growth independent of the global market.
           - If negative: Frame it as a consolidation phase before the next leg up.
        
        **Requirements**:
        - Create a catchy, professional Title.
        - Create a short Summary (2 sentences max).
        - Write the full Content in clean HTML (use <p>, <h3>, <strong> only). 
        - Mention "NNM" and the "NGX Index" as the source of truth.
        
        Output JSON format: { "title": "...", "summary": "...", "content": "..." }
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

        // نستخدم الصورة التي حددها الكود مسبقاً
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
