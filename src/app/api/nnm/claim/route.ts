import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// 1. إعداد خطوط الاتصال المتعددة (Fallback RPCs)
const RPC_URLS = [
  "https://polygon-rpc.com",                // الخط الرسمي
  "https://rpc-mainnet.maticvigil.com",     // خط احتياطي 1
  "https://polygon-bor-rpc.publicnode.com", // خط احتياطي 2
  "https://1rpc.io/matic"                   // خط احتياطي 3
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// دالة ذكية للاتصال بأول خط متاح
async function getProvider() {
  for (const url of RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getNetwork(); // تجربة الاتصال
      console.log(`Connected to RPC: ${url}`);
      return provider;
    } catch (e) {
      console.warn(`RPC Failed: ${url}, trying next...`);
    }
  }
  throw new Error("All RPCs failed");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userWallet, amountNNM } = body;

    const privateKey = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    if (!privateKey) return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });

    // 1. الاتصال بالشبكة عبر الخطوط البديلة
    const provider = await getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);

    // 2. التحقق من الرصيد في الداتا بيز
    const { data: userData } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance')
      .eq('wallet_address', userWallet)
      .single();

    if (!userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 3. الحسابات (بدون أي تدخل في الغاز)
    // 1 NNM = 0.05 USD
    const usdValue = amountNNM * 0.05;
    
    // جلب سعر POL الحالي
    const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT');
    const priceData = await priceRes.json();
    const currentPolPrice = parseFloat(priceData.price);
    
    // حساب الكمية بـ POL
    const polToSend = usdValue / currentPolPrice;
    const txValue = ethers.parseEther(polToSend.toFixed(18));

    // 4. الإرسال (تركنا الشبكة تحدد الغاز تلقائياً كما طلبت)
    const tx = await wallet.sendTransaction({
      to: userWallet,
      value: txValue
    });

    // 5. الخصم من الداتا بيز فوراً بعد إرسال الطلب
    await supabase.from('nnm_wallets').update({
        nnm_balance: parseFloat(userData.nnm_balance) - amountNNM,
        updated_at: new Date().toISOString()
      }).eq('wallet_address', userWallet);

    // تسجيل العملية
    await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      tx_hash: tx.hash,
      status: 'COMPLETED'
    }]);

    return NextResponse.json({ success: true, txHash: tx.hash });

  } catch (err) {
    console.error('Payout Error:', err);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}
