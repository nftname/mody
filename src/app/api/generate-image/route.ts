import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import TextToSVG from 'text-to-svg';

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

    const textToSVG = TextToSVG.loadSync(fontPath);
    const pathData = textToSVG.getD(name.toUpperCase(), {
      x: 512,
      y: 400,
      fontSize: 80,
      anchor: 'center middle'
    });

    const svgText = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow">
          <feDropShadow dx="3" dy="3" stdDeviation="2" flood-opacity="0.5"/>
        </filter>
        <path d="${pathData}" fill="#FCD535" filter="url(#shadow)" />
      </svg>
    `;

    const originalBuffer = fs.readFileSync(filePath);
    const finalImageBuffer = await sharp(originalBuffer)
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .png()
      .toBuffer();

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
