import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// نمنع التخزين المؤقت لضمان توليد صورة جديدة كل مرة
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    if (!name || !tier) {
      return NextResponse.json({ error: 'Name and Tier are required' }, { status: 400 });
    }

    // 1. تحديد مسار الصورة الخام بناءً على التير
    // تأكد أن الصور موجودة في public/images-mint وبصيغة jpg
    const tierFilename = `${tier.toUpperCase()}.jpg`; 
    const filePath = path.join(process.cwd(), 'public', 'images-mint', tierFilename);

    // التأكد من وجود الملف
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ error: `Base image for ${tier} not found on server` }, { status: 404 });
    }

    // 2. تصميم طبقة النص (SVG)
    const width = 1000; 
    const height = 1000; 
    
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: #FCD535; font-size: 60px; font-family: sans-serif; font-weight: bold; text-anchor: middle; }
          .shadow { fill: #000000; font-size: 60px; font-family: sans-serif; font-weight: bold; text-anchor: middle; opacity: 0.5; }
        </style>
        <text x="50%" y="85%" class="shadow" dy="5">${name}</text>
        <text x="50%" y="85%" class="title">${name}</text>
      </svg>
    `;

    // 3. المعالجة باستخدام Sharp
    const originalBuffer = fs.readFileSync(filePath);
    
    const finalImageBuffer = await sharp(originalBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        },
      ])
      .toFormat('png')
      .toBuffer();

    // 4. تجهيز الملف للرفع لبيناتا (هنا تم حل مشكلة الـ TypeScript)
    const formData = new FormData();
    
    // الحل: تحويل البفر إلى Uint8Array ليقبله الـ Blob بدون مشاكل
    const blob = new Blob([new Uint8Array(finalImageBuffer)], { type: 'image/png' });
    
    formData.append('file', blob, `NNM-${name}-${tier}.png`);

    const pinataMetadata = JSON.stringify({
      name: `NNM Asset: ${name} (${tier})`,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // 5. الرفع لبيناتا
    console.log('Uploading to Pinata...');
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
    const ipfsHash = pinataData.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return NextResponse.json({ 
      success: true,
      ipfsHash,
      gatewayUrl 
    });

  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
