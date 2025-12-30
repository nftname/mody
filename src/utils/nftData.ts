import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { CONTRACT_ADDRESS } from '@/data/config';

// 1. Setup VIEM Client (Lightweight & Fast)
const client = createPublicClient({
  chain: polygon,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com')
});

// Minimal ABI for reading assets
const MINIMAL_ABI = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
]);

export interface NFTData {
  id: number;
  name: string;
  tier: string;
  image: string;
  description: string;
  owner: string;
}

// Helper: Convert IPFS to HTTP
export const resolveIPFS = (uri: string) => {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
};

// 2. Main Function: Fetch User Assets using VIEM
export const fetchUserAssets = async (userAddress: string): Promise<NFTData[]> => {
  if (!userAddress || !CONTRACT_ADDRESS) return [];

  try {
    // Determine contract address format
    const contractAddr = CONTRACT_ADDRESS as `0x${string}`;
    const userAddrLower = userAddress.toLowerCase();

    // Scanner Settings
    const SCAN_LIMIT = 50; 
    const promises = [];

    // Create parallel fetch requests
    for (let i = 1; i <= SCAN_LIMIT; i++) {
        promises.push(
            (async () => {
                try {
                    // Check Owner
                    const owner = await client.readContract({
                        address: contractAddr,
                        abi: MINIMAL_ABI,
                        functionName: 'ownerOf',
                        args: [BigInt(i)]
                    });

                    // If matches user
                    if (owner.toLowerCase() === userAddrLower) {
                        // Get Metadata URI
                        const tokenUri = await client.readContract({
                            address: contractAddr,
                            abi: MINIMAL_ABI,
                            functionName: 'tokenURI',
                            args: [BigInt(i)]
                        });

                        // Fetch Metadata JSON
                        // FIX: Added ': any' to prevent TypeScript strict inference error
                        let metadata: any = { name: `NNM #${i}`, image: '', description: '', attributes: [] };
                        
                        try {
                            const httpUri = resolveIPFS(tokenUri);
                            const res = await fetch(httpUri);
                            if (res.ok) metadata = await res.json();
                        } catch (e) {
                            // Metadata fetch failed, use defaults
                        }

                        // Return formatted NFT
                        return {
                            id: i,
                            name: metadata.name || `NNM #${i}`,
                            tier: metadata.attributes?.find((a: any) => a.trait_type === 'Tier')?.value || 'FOUNDER',
                            image: resolveIPFS(metadata.image),
                            description: metadata.description || '',
                            owner: owner
                        } as NFTData;
                    }
                } catch (err) {
                    // Token likely doesn't exist or error reading
                    return null;
                }
                return null;
            })()
        );
    }

    // Execute all requests
    const results = await Promise.all(promises);

    // Filter valid results
    const finalAssets = results.filter((item) => item !== null) as NFTData[];
    
    // Sort by ID
    return finalAssets.sort((a, b) => a.id - b.id);

  } catch (error) {
    console.error("Asset Fetch Error:", error);
    return [];
  }
};
