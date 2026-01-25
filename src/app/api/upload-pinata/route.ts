import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. استلام البيانات من الواجهة الأمامية
    const { imageBase64, name } = await req.json();

    if (!imageBase64 || !name) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 2. تحويل الصورة من Base64 إلى ملف جاهز للرفع
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/svg+xml' });

    // 3. تجهيز البيانات لـ Pinata
    const formData = new FormData();
    formData.append('file', blob, `${name}.svg`); // اسم الملف في بيناتا

    // إضافة ميتا داتا لتنظيم الملفات في حسابك
    const pinataMetadata = JSON.stringify({ name: `NNM-Registry-${name}` });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    // 4. عملية الرفع الفعلية (تتصل بسيرفرات بيناتا)
    // لاحظ: نستخدم process.env.PINATA_JWT للأمان
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error?.details || 'Pinata upload failed');
    }

    // 5. بناء الرابط النهائي
    // نستخدم الرابط الخاص بك من ملف البيئة، وإذا لم يوجد نستخدم العام كاحتياط
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';
    const finalUrl = `${gateway}/ipfs/${json.IpfsHash}`;

    // إرجاع الرابط للصفحة
    return NextResponse.json({ 
      ipfsHash: json.IpfsHash,
      gatewayUrl: finalUrl 
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
