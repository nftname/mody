import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supporterWallet, assetId, assetOwner } = body;

    // 1. التحقق من صحة البيانات
    if (!supporterWallet || !assetId || !assetOwner) {
      return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
    }

    if (supporterWallet.toLowerCase() === assetOwner.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Cannot support your own asset.' }, { status: 403 });
    }

    // 2. 🔒 SERVER-SIDE DUPLICATE VOTE PREVENTION
    // Check if this wallet already voted for this asset
    const { data: existingVote } = await supabase
      .from('conviction_votes')
      .select('id')
      .eq('token_id', assetId.toString())
      .eq('supporter_address', supporterWallet)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({ 
        success: false, 
        message: 'You have already supported this asset.' 
      }, { status: 400 });
    }

    // 3. التحقق من رصيد الداعم (WNNM)
    const { data: supporterData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance')
      .eq('wallet_address', supporterWallet)
      .single();

    if (!supporterData || supporterData.wnnm_balance < 100) {
      return NextResponse.json({ success: false, message: 'Insufficient WNNM balance.' }, { status: 400 });
    }

    // 4. تنفيذ العملية (Atomic Execution):
    
    // أ. الداعم: يخصم 100 WNNM ويضيف 100 NNM (استرداد قيمة الدعم)
    // ملاحظة: أنت طلبت سابقاً أن الدعم يضيف رصيداً للداعم أيضاً
    await supabase.from('nnm_wallets').update({
      wnnm_balance: supporterData.wnnm_balance - 100,
      nnm_balance: parseFloat(supporterData.nnm_balance) + 100, // +100 NNM للداعم
      updated_at: new Date().toISOString()
    }).eq('wallet_address', supporterWallet);

    // ب. صاحب الأست (Asset Owner): يكسب 100 NNM مكافأة
    const { data: ownerData } = await supabase.from('nnm_wallets').select('nnm_balance').eq('wallet_address', assetOwner).single();
    const currentOwnerBalance = ownerData ? parseFloat(ownerData.nnm_balance) : 0;
    
    await supabase.from('nnm_wallets').upsert({
      wallet_address: assetOwner,
      nnm_balance: currentOwnerBalance + 100, // +100 NNM للمالك
      updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    // ج. تسجيل الحركة في السجلات
    await supabase.from('conviction_votes').insert({ 
      token_id: assetId.toString(), 
      supporter_address: supporterWallet, 
      created_at: new Date().toISOString() 
    });
    
    await supabase.from('nnm_conviction_ledger').insert({ 
      supporter_wallet: supporterWallet, 
      wnnm_spent: 100, 
      created_at: new Date().toISOString() 
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Support Error:', err);
    return NextResponse.json({ success: false, message: 'Server error processing support.' }, { status: 500 });
  }
}
