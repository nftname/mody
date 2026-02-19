import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LONG_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const tier = formData.get('tier') as string;

    if (!file || !name || !tier) {
      return NextResponse.json(
        { error: 'Missing required data' }, 
        { status: 400 }
      );
    }

    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    const pinataMetadata = JSON.stringify({
      name: `NNM Asset: ${name} (${tier})`, 
      keyvalues: { tier: tier, name: name, type: "image" }
    });
    pinataFormData.append('pinataMetadata', pinataMetadata);
    pinataFormData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
    
    const uploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: pinataFormData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.error?.details || 'Failed to upload image to Pinata');
    }

    const imagePinataData = await uploadRes.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imagePinataData.IpfsHash}`;

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
    const pinataJSONBody = {
      pinataContent: metadataObj,
      pinataMetadata: {
        name: `NNM JSON: ${name}`, 
        keyvalues: { tier: tier, name: name, type: "metadata" }
      },
      pinataOptions: { cidVersion: 1 }
    };

    const metaRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_JWT}` 
      },
      body: JSON.stringify(pinataJSONBody),
    });

    if (!metaRes.ok) {
      const errorData = await metaRes.json();
      throw new Error(errorData.error?.details || 'Failed to upload metadata to Pinata');
    }

    const metaPinataData = await metaRes.json();
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metaPinataData.IpfsHash}`;


    return NextResponse.json({ 
      success: true,
      ipfsHash: metaPinataData.IpfsHash,
      gatewayUrl: imageUrl,
      metadataUri: metadataUri,
      attributes: metadataObj.attributes,
      dynamicDate: dynamicDate
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
