import { polygon } from "viem/chains";

export const NETWORK_CHAIN = polygon;
export const CHAIN_ID = 137;

// هذا الرابط مهم جداً لحل مشكلة Ankr 403 الموجودة في السجلات
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-rpc.com";

// 1. عنوان الريجستري
export const NFT_COLLECTION_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "").toLowerCase();

// الحفاظ على التوافق
export const CONTRACT_ADDRESS = NFT_COLLECTION_ADDRESS;
export const CONTRACT_NAME = "NNMRegistry11"; 

// 2. عنوان الماركت بليس
export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "").toLowerCase();
