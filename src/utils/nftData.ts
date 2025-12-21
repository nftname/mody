import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '@/data/config';
import ABI from '@/data/abi.json';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com';
const READ_PROVIDER = new ethers.JsonRpcProvider(RPC_URL);

export interface NFTData {
  id: number;
  name: string;
  tier: string;
  image: string;
  description: string;
  owner: string;
}

// 1. معالج الصور
export const resolveIPFS = (uri: string) => {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
};

// 2. المحرك الجديد (نظام الماسح الضوئي - Scanner Mode)
export const fetchUserAssets = async (userAddress: string): Promise<NFTData[]> => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, READ_PROVIDER);
    const myAssets: NFTData[] = [];

    // سنقوم بمسح أول 50 اسم في العقد بحثاً عن ممتلكاتك
    // (يمكن زيادة الرقم لاحقاً مع نمو المشروع)
    const SCAN_LIMIT = 50; 
    
    // مصفوفة لتخزين عمليات البحث وتشغيلها بالتوازي للسرعة القصوى
    const promises = [];

    for (let i = 1; i <= SCAN_LIMIT; i++) {
        promises.push(
            (async () => {
                try {
                    // نسأل العقد: من يملك هذا الرقم؟
                    const owner = await contract.ownerOf(i);
                    
                    // إذا كان المالك هو أنت (userAddress)
                    if (owner.toLowerCase() === userAddress.toLowerCase()) {
                        
                        // نجلب رابط البيانات
                        const uri = await contract.tokenURI(i);
                        let metadata = { name: `GEN-0 #${i}`, image: '', attributes: [] };

                        try {
                            const httpUri = resolveIPFS(uri);
                            const res = await fetch(httpUri);
                            if (res.ok) metadata = await res.json();
                        } catch (e) {
                            console.warn(`Error fetching metadata for #${i}`);
                        }

                        // نضيف الكرت للقائمة
                        return {
                            id: i,
                            name: metadata.name || `NNM #${i}`,
                            tier: metadata.attributes?.find((a: any) => a.trait_type === 'Tier')?.value || 'FOUNDER',
                            image: resolveIPFS(metadata.image),
                            description: metadata.description,
                            owner: owner
                        } as NFTData;
                    }
                } catch (err) {
                    // نتجاهل الأرقام التي لم تصدر بعد
                    return null;
                }
                return null;
            })()
        );
    }

    // تشغيل الماسح الضوئي
    const results = await Promise.all(promises);

    // تصفية النتائج (حذف الفارغ والاحتفاظ بكروتك فقط)
    const finalAssets = results.filter((item) => item !== null) as NFTData[];
    
    // ترتيب الكروت (1, 2, 3...)
    return finalAssets.sort((a, b) => a.id - b.id);

  } catch (error) {
    console.error("Scanner Error:", error);
    return [];
  }
};
