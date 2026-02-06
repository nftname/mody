import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// نستخدم مفتاح الأدمن أيضاً لضمان قراءة البيانات حتى لو كانت هناك قيود
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// دالة تسريع الصور (تحويل Pinata إلى بوابة سريعة)
const optimizeImage = (url: string) => {
    if (!url) return null;
    if (url.includes('gateway.pinata.cloud')) {
        return url.replace('https://gateway.pinata.cloud/ipfs/', 'https://cloudflare-ipfs.com/ipfs/');
    }
    if (url.startsWith('ipfs://')) {
        return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
    }
    return url;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Token ID required' }, { status: 400 });

    try {
        // جلب البيانات من الجدول
        const { data, error } = await supabaseAdmin
            .from('assets_metadata')
            .select('*')
            .eq('token_id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Asset not found in DB' }, { status: 404 });
        }

        // تحسين رابط الصورة قبل إرساله للموقع
        const optimizedImage = optimizeImage(data.image_url);

        // إرجاع البيانات نظيفة وجاهزة
        return NextResponse.json({
            success: true,
            asset: {
                ...data,
                image_url: optimizedImage // إرسال الرابط السريع
            }
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}



