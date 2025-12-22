import { NextResponse } from "next/server";

const MASTER_IMAGE_URI = "ipfs://Bafkreiech2mqddofl5af7k24qglnbpxqmvmxaehbudrlxs2drhprxcsmvu";

const GLOBAL_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    if (!process.env.PINATA_JWT) {
      return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const formattedTier = tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : "Founder";
    
    const currentDate = new Date();
    const mintDate = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const metadata = {
      name: name,
      description: GLOBAL_DESCRIPTION,
      image: MASTER_IMAGE_URI,
      attributes: [
        { trait_type: "Tier", value: formattedTier },
        { trait_type: "Mint Date", value: mintDate },
        { trait_type: "Platform", value: "NNM Registry" },
        { trait_type: "Collection", value: "Genesis - 001" },
        { trait_type: "Generation", value: "Gen-0" },
        { trait_type: "Asset Type", value: "Digital Name" }
      ]
    };

    const jsonUploadRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: { name: `${name}.json` }
        }),
    });

    if (!jsonUploadRes.ok) {
        throw new Error(`JSON Upload Failed`);
    }

    const jsonResult = await jsonUploadRes.json();
    const tokenUri = `ipfs://${jsonResult.IpfsHash}`;

    return NextResponse.json({ 
      success: true, 
      tokenUri: tokenUri,
      uri: tokenUri 
    });

  } catch (error: any) {
    console.error("Mint Prep Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to upload assets" 
    }, { status: 500 });
  }
}
