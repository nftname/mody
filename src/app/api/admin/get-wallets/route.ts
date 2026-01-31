
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        // 1. تحديد مسار الملف السري (داخل السيرفر)
        const filePath = path.join(process.cwd(), 'data', 'market_wallets_secret.json');

        // 2. التحقق من وجود الملف
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Wallets file not found' }, { status: 404 });
        }

        // 3. قراءة وتحليل البيانات
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const walletsData = JSON.parse(fileContent);

        // 4. التنقية الأمنية (Security Sanitization)
        // استخراج العناوين فقط وحذف المفاتيح الخاصة نهائياً
        const safeWallets = walletsData.map((w: any) => w.address.toLowerCase());

        // 5. إرسال القائمة النظيفة
        return NextResponse.json({ wallets: safeWallets });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


