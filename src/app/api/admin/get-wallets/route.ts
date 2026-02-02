import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        // 1. تحديد المسار بدقة
        const filePath = path.join(process.cwd(), 'data', 'market_wallets_secret.json');

        // 2. التحقق من الوجود (Silent fail on production)
        if (!fs.existsSync(filePath)) {
            // Return empty array silently - this is expected on Vercel (secrets not in git)
            return NextResponse.json({ wallets: [] }, { status: 200 });
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

        // 6. الإرسال
        return NextResponse.json({ wallets: safeWallets });

    } catch (error: any) {
        // Silent error handling - return empty array on production
        return NextResponse.json({ wallets: [] }, { status: 200 });
    }
}
