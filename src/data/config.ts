import { polygon } from "viem/chains";

export const NETWORK_CHAIN = polygon;
export const CHAIN_ID = 137;

// --- 1. ربط عقد الريجستري بملف البيئة (Dynamic Registry) ---
// يقرأ العنوان من ملف .env.local ويحوله لحروف صغيرة لمنع مشاكل المطابقة
export const NFT_COLLECTION_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "").toLowerCase();

// هذا المتغير يعتمد على الذي قبله (لا تغيره)
export const CONTRACT_ADDRESS = NFT_COLLECTION_ADDRESS;

// --- 2. تحديث اسم العقد (Update Name) ---
// تم التحديث إلى النسخة 11
export const CONTRACT_NAME = "NNMRegistry11";

// --- 3. ربط الماركت بليس بملف البيئة (Dynamic Marketplace) ---
export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "").toLowerCase();
