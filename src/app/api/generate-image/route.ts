import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    if (!name || !tier) {
      return NextResponse.json({ error: 'Name and Tier required' }, { status: 400 });
    }

    // --- 1. إصلاح مسارات الملفات (Critical Fix) ---
    // استخدام path.resolve أكثر دقة في بيئات السيرفر
    const imageDirectory = path.resolve('./public/images-mint'); 
    const fontDirectory = path.resolve('./public/fonts');
    
    const filePath = path.join(imageDirectory, `${tier.toUpperCase()}.jpg`);
    const fontPath = path.join(fontDirectory, 'font.ttf');

    // التحقق من وجود الصورة
    if (!fs.existsSync(filePath)) {
      throw new Error(`Base image missing at: ${filePath}`);
    }

    // --- 2. قراءة الخط بطريقة آمنة ---
    let fontBase64;
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
      console.log("Font loaded successfully from disk.");
    } else {
      // هنا المشكلة: إذا لم يجد الخط، يجب أن نتوقف أو نستخدم خطاً بديلاً مضموناً
      // كحل مؤقت، سنرمي خطأ لنعرف أن المشكلة هنا بدلاً من طباعة صورة فارغة
      console.error(`Font NOT found at: ${fontPath}`);
      // في حالة الإنتاج (Vercel)، يفضل وضع الخط في مجلد root أو استخدام رابط خارجي
      throw new Error("System Font missing - Cannot render text.");
    }

    // --- 3. توليد الصورة (كما هو في كودك لكن مع تأكيد الخط) ---
    const svgText = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                @font-face {
                    font-family: 'CustomNFTFont';
                    src: url("data:font/ttf;charset=utf-8;base64,${fontBase64}");
                }
            </style>
        </defs>
        <text x="512" y="420" 
              style="fill: #FCD535; font-size: 80px; font-family: 'CustomNFTFont', sans-serif; font-weight: bold; text-anchor: middle; filter: drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.6));">
              ${name.toUpperCase()}
        </text>
      </svg>
    `;

    const originalBuffer = fs.readFileSync(filePath);
    const finalImageBuffer = await sharp(originalBuffer)
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .png()
      .toBuffer();

    // --- 4. الرفع إلى Pinata (الصورة) ---
    const formDataImage = new FormData();
    const imageBlob = new Blob([new Uint8Array(finalImageBuffer)], { type: 'image/png' });
    formDataImage.append('file', imageBlob, `NNM-${name}-${tier}.png`);
    formDataImage.append('pinataMetadata', JSON.stringify({ name: `IMG-${name}` }));
    formDataImage.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const uploadImageRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: formDataImage,
    });

    if (!uploadImageRes.ok) throw new Error('Failed to upload image to Pinata');
    const imageData = await uploadImageRes.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    // --- 5. الخطوة الجديدة (Pro Step): رفع الميتاداتا JSON هنا ---
    // هذا يضمن أن الـ TokenURI جاهز وصحيح
    const metadata = {
        name: `NNM: ${name}`,
        description: "Official NNM Protocol Record...", // الوصف الطويل هنا
        image: imageUrl, // الرابط الذي تم توليده للتو
        attributes: [
            { trait_type: "Tier", value: tier },
            { trait_type: "Name", value: name }
        ]
    };

    const formDataMeta = new FormData();
    const metaBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    formDataMeta.append('file', metaBlob, `META-${name}.json`);
    formDataMeta.append('pinataMetadata', JSON.stringify({ name: `META-${name}` }));
    formDataMeta.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const uploadMetaRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        body: formDataMeta,
    });

    if (!uploadMetaRes.ok) throw new Error('Failed to upload metadata');
    const metaDataResponse = await uploadMetaRes.json();
    
    // --- 6. النتيجة النهائية ---
    // نعيد رابط الميتاداتا مباشرة ليستخدمه العقد الذكي
    return NextResponse.json({ 
      success: true,
      tokenUri: `https://gateway.pinata.cloud/ipfs/${metaDataResponse.IpfsHash}`,
      imageUrl: imageUrl 
    });

  } catch (error: any) {
    console.error('Generator Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
