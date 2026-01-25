import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    // 1. التحقق من البيانات (نفس منطقك الأصلي تماماً)
    if (!name || !tier) {
      console.error("Missing name or tier in request");
      return NextResponse.json({ error: 'Name and Tier are required' }, { status: 400 });
    }

    // 2. تحديد مسارات الملفات (استخدام path.resolve لضمان الدقة في السيرفر)
    const tierFilename = `${tier.toUpperCase()}.jpg`; 
    const filePath = path.resolve(process.cwd(), 'public', 'images-mint', tierFilename);
    const fontPath = path.resolve(process.cwd(), 'public', 'fonts', 'font.ttf');

    if (!fs.existsSync(filePath)) {
      console.error(`Base image not found: ${filePath}`);
      return NextResponse.json({ error: `Base image for ${tier} not found` }, { status: 404 });
    }

    // 3. معالجة الخط (تحويله لـ Base64 لضمان الحقن المباشر)
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }

    // 4. تصميم طبقة الـ SVG (التعديل الجراحي لضبط الحجم والموقع وحل مشكلة المربعات)
    const svgText = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'NFTFont';
              src: url(data:application/font-truetype;charset=utf-8;base64,${fontBase64});
            }
          </style>
        </defs>
        <style>
          .name-style { 
            fill: #FCD535; 
            font-size: 120px; /* التعديل: تكبير الخط ليتناسب مع التصميم */
            font-family: 'NFTFont', sans-serif; 
            font-weight: bold; 
            text-anchor: middle; 
            filter: drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.6));
          }
        </style>
        /* التعديل: رفع النص إلى y="320" ليتوسط المسافة الرخامية السوداء */
        <text x="512" y="320" class="name-style">${name.toUpperCase()}</text>
      </svg>
    `;

    // 5. المعالجة باستخدام Sharp (نفس منطقك الأصلي)
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
      .png() 
      .toBuffer();

    // 6. تجهيز البيانات للرفع إلى Pinata (نفس منطقك الأصلي تماماً)
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(finalImageBuffer)], { type: 'image/png' });
    formData.append('file', blob, `NNM-${name}-${tier}.png`);

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

    // 7. الرفع الفعلي (نفس منطقك الأصلي)
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
      throw new Error(errorData.error?.details || 'Failed to upload to Pinata');
    }

    const pinataData = await uploadRes.json();

    return NextResponse.json({ 
      success: true,
      ipfsHash: pinataData.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}` 
    });

  } catch (error: any) {
    console.error('Critical Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

