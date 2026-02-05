'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePublicClient } from "wagmi";
import { parseAbi, formatEther } from 'viem';
import { MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase'; 

// تعريف ABI المصغر الخاص بالمعرض فقط
const GALLERY_ABI = parseAbi([
    "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)"
]);

const resolveIPFS = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri || '';

export default function AssetGallery({ tokenId, favoriteIds, onToggleFavorite }: any) {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const publicClient = usePublicClient();
    
    // 🛑 القفل: لمنع إعادة التحميل اللانهائي
    const loadedRef = useRef("");

    useEffect(() => {
        if (!tokenId || !publicClient) return;
        
        // إذا كنا قد حملنا هذا المعرض سابقاً لهذا الـ ID، لا تفعل شيئاً
        if (loadedRef.current === tokenId) return;

        const loadGallery = async () => {
            loadedRef.current = tokenId; // إغلاق القفل فوراً
            setLoading(true);

            // استخدام BigInt لحل مشاكل التايب سكريبت القديمة
            const startId = BigInt(tokenId);
            const nextIds = [
                (startId + BigInt(1)).toString(), 
                (startId + BigInt(2)).toString(), 
                (startId + BigInt(3)).toString()
            ];

            // 1. الموجة السريعة: جلب الصور والأسماء من الداتا بيز
            const { data: dbAssets } = await supabase
                .from('assets_metadata')
                .select('*')
                .in('token_id', nextIds);

            if (!dbAssets || dbAssets.length === 0) {
                setAssets([]);
                setLoading(false);
                return;
            }

            // عرض الصور فوراً
            const initialAssets = dbAssets.map((meta: any) => ({
                id: meta.token_id,
                name: meta.name,
                image: meta.image_url ? resolveIPFS(meta.image_url) : '',
                price: '...', 
                isListed: false
            }));

            setAssets(initialAssets);
            setLoading(false);

            // 2. الموجة البطيئة: التحقق من الأسعار من البلوك تشين (Lazy Load)
            const updatedAssets = await Promise.all(initialAssets.map(async (asset: any) => {
                try {
                    const listingData = await publicClient.readContract({ 
                        address: MARKETPLACE_ADDRESS as `0x${string}`, 
                        abi: GALLERY_ABI, 
                        functionName: 'listings', 
                        args: [BigInt(asset.id)] 
                    });
                    
                    const listingArr = listingData as [string, bigint, boolean];
                    if (listingArr[2]) { 
                        const rawPrice = formatEther(listingArr[1]);
                        // تنسيق السعر لـ 4 أرقام عشرية
                        const finalPrice = parseFloat(rawPrice).toFixed(4).replace(/\.?0+$/, "") + ' POL';
                        return { ...asset, price: finalPrice, isListed: true };
                    }
                    return { ...asset, price: 'Not Listed', isListed: false };
                } catch (e) { 
                    return { ...asset, price: 'Not Listed', isListed: false };
                }
            }));
            
            // تحديث الحالة بالأسعار النهائية
            setAssets(updatedAssets);
        };

        loadGallery();

    }, [tokenId, publicClient]);

    if (loading && assets.length === 0) return <div className="text-muted text-center w-100 py-3">Loading gallery...</div>;

    return (
        <div className="d-flex gap-3 overflow-auto pb-3 px-3" style={{ scrollbarWidth: 'none' }}>
            {assets.length > 0 ? assets.map(item => {
                const isItemFav = favoriteIds?.has(item.id);
                return (
                    <Link key={item.id} href={`/asset/${item.id}`} className="text-decoration-none">
                        <div className="h-100 d-flex flex-column" style={{ width: '220px', backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                                <button 
                                    onClick={(e) => onToggleFavorite && onToggleFavorite(e, item.id)} 
                                    className="btn position-absolute top-0 end-0 m-2 p-0 border-0 bg-transparent" 
                                    style={{ zIndex: 10 }}
                                >
                                    <i className={`bi ${isItemFav ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: isItemFav ? '#FFFFFF' : 'white', fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}></i>
                                </button>
                                {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-image text-secondary"></i></div>)}
                            </div>
                            <div className="p-3 d-flex flex-column flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div className="text-white fw-bold text-truncate" style={{ fontSize: '14px', maxWidth: '80%' }}>{item.name}</div>
                                    <div style={{ fontSize: '12px', color: '#cccccc' }}>#{item.id}</div>
                                </div>
                                <div className="text-white mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>NNM Registry</div>
                                <div className="mt-auto">
                                    <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{item.isListed ? item.price : <span className="fw-normal" style={{ fontSize: '12px', color: '#cccccc' }}>Not Listed</span>}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            }) : (
                <div className="text-muted text-center w-100 py-3">No more assets found.</div>
            )}
        </div>
    );
}
