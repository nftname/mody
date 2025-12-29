import { polygon } from "viem/chains";

// 1. Network Configuration (Polygon Mainnet)
export const NETWORK_CHAIN = polygon;
export const CHAIN_ID = 137;

// 2. NFT Contract (Registry)
export const NFT_COLLECTION_ADDRESS = "0x8e46C897bC74405922871A8a6863cCf5cD1Fc721";

// Alias for backward compatibility
export const CONTRACT_ADDRESS = NFT_COLLECTION_ADDRESS;

export const CONTRACT_NAME = "NNMRegistryV99";

// 3. Marketplace Contract (NNMMarketplaceZeroPlus) - NEW
export const MARKETPLACE_ADDRESS = "0x4b55f2e3ae747189539b956E42F36D46b4a7fE86";
