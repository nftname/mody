import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// نمنع التخزين المؤقت لضمان توليد صورة جديدة فريدة لكل مستخدم
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    // 1. التحقق من البيانات (المنطق الأصلي)
    if (!name || !tier) {
      console.error("Missing name or tier in request");
      return NextResponse.json({ error: 'Name and Tier are required' }, { status: 400 });
    }

    // 2. تحديد مسارات الملفات (الصورة والخط)
    const tierFilename = `${tier.toUpperCase()}.jpg`; 
    const filePath = path.join(process.cwd(), 'public', 'images-mint', tierFilename);
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'font.ttf');

    // التأكد من وجود الصورة الأصلية
    if (!fs.existsSync(filePath)) {
      console.error(`Base image not found: ${filePath}`);
      return NextResponse.json({ error: `Base image for ${tier} not found` }, { status: 404 });
    }

    // 3. معالجة الخط (الحل الجذري لاختفاء النص)
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    } else {
      console.warn("Font file not found, falling back to system fonts.");
    }

    // 4. تصميم طبقة الـ SVG (الإحداثيات الهندسية الدقيقة 1024x1024)
    // وضعنا Y=420 ليكون النص فوق كلمة ELITE تماماً على الرخام
    const svgText = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <style>
          @font-face {
            font-family: 'NFTFont';
            ${fontBase64 ? `src: url(data:font/truetype;charset=utf-8;base64,${fontBase64});` : ''}
          }
          .name-style { 
            fill: #FCD535; 
            font-size: 80px; 
            font-family: 'NFTFont', sans-serif; 
            font-weight: bold; 
            text-anchor: middle; 
            filter: drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.6));
          }
        </style>
        <text x="512" y="420" class="name-style">${name.toUpperCase()}</text>
      </svg>
    `;

    // 5. المعالجة باستخدام Sharp (دمج الطبقات)
    console.log(`Processing image for: ${name}...`);
    const originalBuffer = fs.readFileSync(filePath);
    
    const finalImageBuffer = await sharp(originalBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        },
      ])
      .png() // نحولها لـ PNG لضمان بقاء النص حاداً وواضحاً
      .toBuffer();

    // 6. تجهيز البيانات للرفع إلى Pinata (حل مشكلة TypeScript/Vercel)
    const formData = new FormData();
    
    // تحويل الـ Buffer إلى Uint8Array لضمان قبول الـ Blob في بيئة Vercel
    const blob = new Blob([new Uint8Array(finalImageBuffer)], { type: 'image/png' });
    formData.append('file', blob, `NNM-${name}-${tier}.png`);

    // إضافة الميتاداتا (المنطق الكامل الذي طلبته)
    const pinataMetadata = JSON.stringify({
      name: `NNM Asset: ${name} (${tier})`,
      keyvalues: {
        tier: tier,
        name: name,
        generatedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    // 7. الرفع الفعلي إلى Pinata
    console.log('Uploading to Pinata IPFS...');
    const uploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.error('Pinata Upload Error:', errorData);
      throw new Error(errorData.error?.details || 'Failed to upload to Pinata');
    }

    const pinataData = await uploadRes.json();
    console.log('Successfully minted image IPFS:', pinataData.IpfsHash);

    // 8. إرسال النتيجة النهائية
    return NextResponse.json({ 
      success: true,
      ipfsHash: pinataData.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}` 
    });

  } catch (error: any) {
    console.error('Critical Generation Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: "Check server logs for more information"
    }, { status: 500 });
  }
}
