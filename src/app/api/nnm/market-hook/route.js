import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { buyerWallet, sellerWallet, nftId, price } = body;

    if (!buyerWallet || !sellerWallet) {
      return NextResponse.json({ error: 'Wallets required' }, { status: 400 });
    }

    // إعدادات المكافأة (كما اتفقنا: 3 للمشتري و 3 للبائع)
    const BUYER_REWARD = 3;
    const SELLER_REWARD = 3;

    // دالة مساعدة لتحديث أو إنشاء المحفظة
    const rewardUser = async (wallet, amount) => {
      // 1. جلب المحفظة
      const { data: existingUser } = await supabase
        .from('nnm_wallets')
        .select('wnnm_balance')
        .eq('wallet_address', wallet)
        .single();

      if (!existingUser) {
        // مستخدم جديد (لم يسبق له التعامل)
        await supabase.from('nnm_wallets').insert([{
          wallet_address: wallet,
          wnnm_balance: amount,
          nnm_balance: 0
        }]);
      } else {
        // مستخدم موجود - تحديث الرصيد
        await supabase
          .from('nnm_wallets')
          .update({ 
            wnnm_balance: parseFloat(existingUser.wnnm_balance) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', wallet);
      }
    };

    // تنفيذ المكافآت بالتوازي
    await Promise.all([
      rewardUser(buyerWallet, BUYER_REWARD),
      rewardUser(sellerWallet, SELLER_REWARD)
    ]);

    // تسجيل العملية في السجل (Activity Log)
    await supabase.from('activities').insert([{
      activity_type: 'MarketReward',
      token_id: nftId || 0,
      from_address: sellerWallet, // البائع
      to_address: buyerWallet,    // المشتري
      price: price || 0,
      created_at: new Date().toISOString()
    }]);

    return NextResponse.json({ 
      success: true, 
      message: `Rewards distributed: Buyer +${BUYER_REWARD}, Seller +${SELLER_REWARD}` 
    });

  } catch (err) {
    console.error('Market Hook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
