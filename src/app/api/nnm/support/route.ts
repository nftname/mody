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

    if (!supporterWallet || !assetId || !assetOwner) {
      return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
    }

    if (supporterWallet.toLowerCase() === assetOwner.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Cannot support your own asset.' }, { status: 403 });
    }

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

    const { data: supporterData } = await supabase
      .from('nnm_wallets')
      .select('wnnm_balance, nnm_balance')
      .eq('wallet_address', supporterWallet)
      .single();

    if (!supporterData || supporterData.wnnm_balance < 100) {
      return NextResponse.json({ success: false, message: 'Insufficient WNNM balance.' }, { status: 400 });
    }

    await supabase.from('nnm_wallets').update({
      wnnm_balance: supporterData.wnnm_balance - 100,
      nnm_balance: parseFloat(supporterData.nnm_balance) + 100, 
      updated_at: new Date().toISOString()
    }).eq('wallet_address', supporterWallet);

    const { data: ownerData } = await supabase.from('nnm_wallets').select('nnm_balance').eq('wallet_address', assetOwner).single();
    const currentOwnerBalance = ownerData ? parseFloat(ownerData.nnm_balance) : 0;
    
    await supabase.from('nnm_wallets').upsert({
      wallet_address: assetOwner,
      nnm_balance: currentOwnerBalance + 100, 
      updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });

    await supabase.from('conviction_votes').insert({ 
      token_id: assetId.toString(), 
      supporter_address: supporterWallet,
      amount: 100, 
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
