import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { imageBase64, name } = await req.json();

    if (!imageBase64 || !name) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Prepare Image
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/svg+xml' });

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('file', blob, `${name}.svg`);

    const pinataMetadata = JSON.stringify({ name: `NNM-Registry-${name}` });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    // 3. Upload to Pinata
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

    // 🔥 التعديل الحاسم هنا: استخدام البوابة العامة المضمونة 🔥
    // Public Gateway ensures OpenSea & MetaMask can read the image without 403 errors
    const finalUrl = `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}`;

    return NextResponse.json({ 
      ipfsHash: json.IpfsHash,
      gatewayUrl: finalUrl 
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
