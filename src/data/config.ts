import { polygon } from "viem/chains";

export const NETWORK_CHAIN = polygon;
export const CHAIN_ID = 137;

export const RPC_URL = "https://polygon-rpc.com";

export const NFT_COLLECTION_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x264D75F04b135e58E2d5cC8A6B9c1371dAc3ad81").toLowerCase();

export const CONTRACT_ADDRESS = NFT_COLLECTION_ADDRESS;
export const CONTRACT_NAME = "NNMRegistry1";

export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "0xd0d0359d478a34757a7C6778004d4AE19735B34a").toLowerCase();

