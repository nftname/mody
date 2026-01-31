import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        // 1. تحديد المسار بدقة
        const filePath = path.join(process.cwd(), 'data', 'market_wallets_secret.json');
        console.log("📂 API: Looking for wallets file at:", filePath);

        // 2. التحقق من الوجود
        if (!fs.existsSync(filePath)) {
            console.error("❌ API: File not found!");
            return NextResponse.json({ wallets: [], error: 'File not found' }, { status: 404 });
        }

        // 3. قراءة الملف
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let walletsData;
        
        try {
            walletsData = JSON.parse(fileContent);
        } catch (e) {
            console.error("❌ API: JSON Parse Failed");
            return NextResponse.json({ wallets: [], error: 'Invalid JSON format' }, { status: 500 });
        }

        // 4. معالجة الهياكل المختلفة (Array vs Object)
        let itemsArray = [];
        if (Array.isArray(walletsData)) {
            itemsArray = walletsData;
        } else if (walletsData && typeof walletsData === 'object') {
            // محاولة العثور على مصفوفة داخل الكائن (قد تكون تحت اسم 'wallets' أو 'accounts')
            // إذا لم نجد، نحول الكائن نفسه لمصفوفة
            if (Array.isArray(walletsData.wallets)) itemsArray = walletsData.wallets;
            else if (Array.isArray(walletsData.accounts)) itemsArray = walletsData.accounts;
            else itemsArray = Object.values(walletsData); // محاولة أخيرة
        }

        // 5. الاستخراج الآمن (التعامل مع address و Address)
        const safeWallets = itemsArray
            .filter((w: any) => w && (w.address || w.Address)) // التأكد من وجود عنوان
            .map((w: any) => {
                const addr = w.address || w.Address;
                return addr.toString().trim().toLowerCase(); // تنظيف وتوحيد
            });

        console.log(`✅ API: Successfully extracted ${safeWallets.length} wallets.`);

        // 6. الإرسال
        return NextResponse.json({ wallets: safeWallets });

    } catch (error: any) {
        console.error('🔥 API Critical Error:', error);
        return NextResponse.json({ wallets: [], error: error.message }, { status: 500 });
    }
}
