import { NextResponse } from "next/server";

// --- 
const GLOBAL_DESCRIPTION = `GEN-0 Genesis

A singular, unreplicable digital artifact.

This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency.

Ownership is absolute, cryptographically secured, and fully transferable.
No subscriptions. No recurring fees. No centralized control.

This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

export async function POST(req: Request) {
  try {
    const { name, tier } = await req.json();

    // 
    if (!process.env.PINATA_JWT) {
      console.error("Missing PINATA_JWT");
      return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 1. 
    const svgContent = generateSVG(name, tier);
    
    // 
    const buffer = Buffer.from(svgContent);
    const blob = new Blob([buffer], { type: "image/svg+xml" });

    // 2. 
    const formData = new FormData();
    formData.append('file', blob, `${name}.svg`);
    formData.append('pinataMetadata', JSON.stringify({ name: `${name}.svg` }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    const imageUploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });

    if (!imageUploadRes.ok) {
      throw new Error(`Image Upload Failed`);
    }

    const imageResult = await imageUploadRes.json();
    const imageUri = `ipfs://${imageResult.IpfsHash}`;

    // 3.
    const formattedTier = tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : "Founder";
    
    const metadata = {
      name: name,
      description: GLOBAL_DESCRIPTION, // ا
      image: imageUri,
      attributes: [
        { trait_type: "Generation", value: "GEN-0 Genesis" },
        { trait_type: "Tier", value: formattedTier },
        { trait_type: "Year", value: "2025" },
        { trait_type: "Platform", value: "NNM Market" }
      ]
    };

    // 4.  (JSON)
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

// --- -
function generateSVG(name: string, tier: string) {
  let styles = {
    bg1: "#002b36", bg2: "#004d40",
    border: "rgba(0, 255, 200, 0.4)",
    textColor: "#FCD535",
    glow: "rgba(0, 255, 200, 0.2)"
  };

  const t = tier?.toLowerCase() || 'founder';

  if (t === 'immortal') {
    styles = {
      bg1: "#0a0a0a", bg2: "#1c1c1c",
      border: "rgba(252, 213, 53, 0.5)",
      textColor: "#FCD535",
      glow: "rgba(252, 213, 53, 0.3)"
    };
  } else if (t === 'elite') {
    styles = {
      bg1: "#2b0505", bg2: "#4a0a0a",
      border: "rgba(255, 50, 50, 0.5)",
      textColor: "#FCD535",
      glow: "rgba(255, 50, 50, 0.3)"
    };
  }

  return `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${styles.bg1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${styles.bg2};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#B3882A" />
    </linearGradient>
    <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <rect width="100%" height="100%" fill="#0d1117" />
  <rect x="50" y="50" width="500" height="500" rx="20" ry="20" 
        fill="url(#bgGradient)" 
        stroke="${styles.border}" stroke-width="4"
        filter="url(#glow)" />

  <text x="300" y="150" text-anchor="middle" font-family="serif" font-size="24" fill="url(#goldText)" letter-spacing="4" font-weight="bold">GEN-0 GENESIS</text>
  
  <line x1="150" y1="180" x2="450" y2="180" stroke="${styles.border}" stroke-width="1" opacity="0.5" />
  
  <text x="300" y="300" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-size="60" fill="url(#goldText)" font-weight="900" letter-spacing="2" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${name.toUpperCase()}</text>
  
  <line x1="150" y1="420" x2="450" y2="420" stroke="${styles.border}" stroke-width="1" opacity="0.5" />
  
  <text x="300" y="480" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#ffffff" letter-spacing="3" opacity="0.8">OWNED & MINTED</text>
  <text x="300" y="510" text-anchor="middle" font-family="serif" font-size="20" fill="${styles.border}" letter-spacing="2" font-weight="bold">2025</text>
</svg>
  `.trim();
}
