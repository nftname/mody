import { NextResponse } from 'next/server';

// نستخدم هذا التوجيه لضمان عدم تخزين النسخ المؤقتة، نريد معالجة فورية لكل طلب
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. استلام البيانات من الطلب القادم من الصفحة
    const formData = await req.formData();
    
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const tier = formData.get('tier') as string;

    // 2. التحقق الأمني: هل البيانات كاملة؟
    if (!file || !name || !tier) {
      console.error("Missing Data: File, Name, or Tier is missing.");
      return NextResponse.json(
        { error: 'Missing required data (file, name, or tier)' }, 
        { status: 400 }
      );
    }

    console.log(`[API] Received snapshot for Name: ${name}, Tier: ${tier}`);

    // 3. تجهيز البيانات للإرسال إلى Pinata (بدقة عالية كما طلبت)
    const pinataFormData = new FormData();
    
    // إرفاق ملف الصورة المستلم
    pinataFormData.append('file', file);

    // إعداد الميتاداتا الخاصة بـ Pinata (لترتيب الملفات في حسابك)
    // نستخدم نفس المنطق الموجود في ملفك القديم لضمان عدم ضياع التنسيق
    const pinataMetadata = JSON.stringify({
      name: `NNM Asset: ${name} (${tier})`, // اسم الملف كما سيظهر في لوحة تحكم بيناتا
      keyvalues: {
        tier: tier,
        name: name,
        generatedAt: new Date().toISOString(),
        source: "Client-Snapshot-Engine", // تمييز أن هذا الملف جاء من النظام الجديد
        project: "NNM-Gen0"
      }
    });
    pinataFormData.append('pinataMetadata', pinataMetadata);

    // إعداد خيارات بيناتا (CID Version 1)
    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    pinataFormData.append('pinataOptions', pinataOptions);

    // 4. تنفيذ عملية الرفع (الاتصال بسيرفرات بيناتا)
    console.log('[API] Uploading to Pinata IPFS...');
    
    const uploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`, // المفتاح السري
      },
      body: pinataFormData,
    });

    // 5. التحقق من استجابة بيناتا
    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.error('[API] Pinata Upload Error:', errorData);
      throw new Error(errorData.error?.details || 'Failed to upload to Pinata');
    }

    const pinataData = await uploadRes.json();
    console.log('[API] Upload Success. Hash:', pinataData.IpfsHash);

    // 6. الرد النهائي للعميل بالرابط الجديد
    return NextResponse.json({ 
      success: true,
      ipfsHash: pinataData.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}` 
    });

  } catch (error: any) {
    // صيد أي خطأ غير متوقع وطباعته بوضوح
    console.error('[API] Critical Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
