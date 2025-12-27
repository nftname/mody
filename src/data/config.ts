import { defineChain } from "thirdweb";

// 1. إعداد الشبكة (Polygon Mainnet) - ضروري جداً لمكتبة v5
export const NETWORK_CHAIN = defineChain(137);
export const CHAIN_ID = 137; // للإبقاء على التوافق مع الملفات القديمة

// 2. عقد الطباعة (NFT Collection)
// نعرفه بالاسم الجديد الذي تطلبه صفحة الماركت
export const NFT_COLLECTION_ADDRESS = "0x8e46C897bC74405922871A8a6863cCf5cD1Fc721";

// ونعرفه أيضاً بالاسم القديم لكي لا تتعطل صفحة Mint أو أي صفحة أخرى
export const CONTRACT_ADDRESS = NFT_COLLECTION_ADDRESS;

export const CONTRACT_NAME = "NNMRegistryV99";

// 3. عقد الماركت (Marketplace V3) - الجديد
export const MARKETPLACE_ADDRESS = "0xf3176f68c906B3fDD22dD5a0d39e67EA5db23F44";
