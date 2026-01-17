
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// إعداد الاتصال بقاعدة البيانات
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// إعداد الاتصال بشبكة بوليجون
const RPC_URL = "https://polygon-rpc.com"; 
const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    const { userWallet, amountNNM } = body;

    // 1. جلب المفتاح السري من متغيرات البيئة (السيرفر فقط يراه)
    const privateKey = process.env.NNM_HOT_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
        return NextResponse.json({ error: 'Server Config Error: Missing Wallet Key' }, { status: 500 });
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    if (!userWallet || !amountNNM || amountNNM <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 2. خطوة أمان: التأكد من أن المستخدم يملك هذا الرصيد فعلاً في قاعدة البيانات
    // (رغم أن الداشبورد حسبها، السيرفر يجب أن يتأكد قبل دفع المال)
    const { data: userData, error: fetchError } = await supabase
      .from('nnm_wallets')
      .select('nnm_balance') // نتحقق من رصيد الكاش NNM
      .eq('wallet_address', userWallet)
      .single();

    // إذا لم نجد رصيداً كافياً في القاعدة، نرفض العملية
    if (fetchError || !userData || parseFloat(userData.nnm_balance) < amountNNM) {
      return NextResponse.json({ error: 'Insufficient NNM balance in records' }, { status: 400 });
    }

    // 3. حساب القيمة المالية (1 NNM = 0.10$) وتحويلها لعملة POL
    const FIXED_RATE = 0.10; // سعر العملة بالدولار
    const totalUsdValue = amountNNM * FIXED_RATE;

    // جلب سعر POL الحالي
    const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT');
    const priceData = await priceRes.json();
    const currentPolPrice = parseFloat(priceData.price);

    if (!currentPolPrice) throw new Error('Failed to fetch POL price');

    // كمية POL المطلوب إرسالها
    const polToSend = totalUsdValue / currentPolPrice;
    
    // تحويل الرقم لصيغة البلوكشين (Wei)
    const txValue = ethers.parseEther(polToSend.toFixed(18));

    // 4. تنفيذ التحويل (إرسال المال)
    const tx = await wallet.sendTransaction({
      to: userWallet,
      value: txValue
    });

    // 5. خصم الرصيد وتوثيق العملية
    // نخصم المبلغ من رصيد NNM
    const { error: updateError } = await supabase
      .from('nnm_wallets')
      .update({
        nnm_balance: parseFloat(userData.nnm_balance) - amountNNM,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', userWallet);

    // نسجل العملية في السجل
    await supabase.from('nnm_payout_logs').insert([{
      wallet_address: userWallet,
      amount_nnm: amountNNM,
      usd_value_at_time: totalUsdValue,
      tx_hash: tx.hash,
      status: 'COMPLETED'
    }]);

    return NextResponse.json({
      success: true,
      message: `Sent ${polToSend.toFixed(4)} POL successfully`,
      txHash: tx.hash
    });

  } catch (err) {
    console.error('Payout Error:', err);
    return NextResponse.json({ error: 'Transaction failed or Treasury empty' }, { status: 500 });
  }
}
