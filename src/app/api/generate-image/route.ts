import { NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const LONG_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

export async function POST(req: Request) {
  try {
    const reqFormData = await req.formData();
    
    const file = reqFormData.get('file') as File;
    const name = reqFormData.get('name') as string;
    const tier = reqFormData.get('tier') as string;

    if (!file || !name || !tier) {
      return NextResponse.json(
        { error: 'Missing required data' }, 
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const imgData = new FormData();
    imgData.append('file', imageBuffer, { filename: `NNM-${name}.png` });
    
    const imgMetadata = JSON.stringify({
        name: `NNM IMG: ${name}`,
        keyvalues: { tier, name, type: "image" }
    });
    imgData.append('pinataMetadata', imgMetadata);
    imgData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const imgRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', imgData, {
        headers: { 
            'Authorization': `Bearer ${process.env.PINATA_JWT}`, 
            ...imgData.getHeaders() 
        },
        maxBodyLength: Infinity
    });
    
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imgRes.data.IpfsHash}`;

    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const metadataObj = {
        name: name,
        description: LONG_DESCRIPTION,
        image: imageUrl,
        attributes: [
            { trait_type: "Asset Type", value: "Digital Name" },
            { trait_type: "Generation", value: "Gen-0" },
            { trait_type: "Tier", value: tier },
            { trait_type: "Platform", value: "NNM Registry" },
            { trait_type: "Collection", value: "Genesis - 001" },
            { trait_type: "Mint Date", value: dynamicDate }
        ]
    };

    const metadataString = JSON.stringify(metadataObj);
    
    const metaFormData = new FormData();
    metaFormData.append('file', Buffer.from(metadataString), { filename: `NNM-${name}.json` });

    const metaPinataMetadata = JSON.stringify({
        name: `NNM JSON: ${name}`,
        keyvalues: { name, type: "metadata" }
    });
    metaFormData.append('pinataMetadata', metaPinataMetadata);
    metaFormData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const metaRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', metaFormData, {
        headers: { 
            'Authorization': `Bearer ${process.env.PINATA_JWT}`, 
            ...metaFormData.getHeaders() 
        },
        maxBodyLength: Infinity
    });

    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metaRes.data.IpfsHash}`;

    return NextResponse.json({ 
        success: true,
        gatewayUrl: imageUrl,
        metadataUri: metadataUri,
        attributes: metadataObj.attributes,
        dynamicDate: dynamicDate
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
