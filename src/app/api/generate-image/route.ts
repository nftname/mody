import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    if (!name || !tier) {
      return NextResponse.json({ error: 'Name and Tier are required' }, { status: 400 });
    }

    const tierFilename = `${tier.toUpperCase()}.jpg`; 
    const filePath = path.resolve(process.cwd(), 'public', 'images-mint', tierFilename);
    const fontPath = path.resolve(process.cwd(), 'public', 'fonts', 'font.ttf');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Image not found` }, { status: 404 });
    }

    // 1. قراءة الخط وتحويله لـ Base64 (أبقيناه كما هو للحفاظ على منطقك)
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }

    // 2. تصميم الـ SVG: التعديل الجراحي هنا فقط في الـ font-family و الإحداثيات
    const svgText = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'NFTFont';
              src: url(data:font/ttf;base64,${fontBase64});
            }
          </style>
        </defs>
        <text 
          x="512" 
          y="512" 
          fill="#FCD535" 
          font-family="sans-serif" 
          font-size="80" 
          font-weight="bold" 
          text-anchor="middle"
          dominant-baseline="middle"
          filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.5))"
        >
          ${name.toUpperCase()}
        </text>
      </svg>
    `;

    // 3. المعالجة باستخدام Sharp (نفس منطقك تماماً)
    const originalBuffer = fs.readFileSync(filePath);
    const finalImageBuffer = await sharp(originalBuffer)
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .png()
      .toBuffer();

    // 4. الرفع إلى Pinata (نفس منطقك الأصلي دون تغيير سطر واحد)
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(finalImageBuffer)], { type: 'image/png' });
    formData.append('file', blob, `NNM-${name}-${tier}.png`);

    const pinataMetadata = JSON.stringify({
      name: `NNM: ${name}`,
      keyvalues: { tier, name }
    });
    formData.append('pinataMetadata', pinataMetadata);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const uploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: formData,
    });

    const pinataData = await uploadRes.json();

    return NextResponse.json({ 
      success: true,
      ipfsHash: pinataData.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}` 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
