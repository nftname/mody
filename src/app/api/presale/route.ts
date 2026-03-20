import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet')?.toLowerCase();

  if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 });

  try {
    const { data, error } = await supabaseAdmin
      .from('presale_transactions')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const history = data || [];
    
    const totalInvestedUsd = history.reduce((sum: number, tx: any) => sum + Number(tx.amount_usd), 0);
    const totalTokensBought = history.reduce((sum: number, tx: any) => sum + Number(tx.tokens_bought), 0);

    return NextResponse.json({
      success: true,
      totalInvestedUsd,
      totalTokensBought,
      history
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, txHash, amountUsd, tokensBought } = body;

    // التحقق فقط من وصول البيانات من الواجهة الأمامية
    if (!wallet || !txHash || amountUsd === undefined || tokensBought === undefined) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // إدراج البيانات مباشرة في Supabase (بناءً على تأكيد الواجهة الأمامية)
    const { error } = await supabaseAdmin
      .from('presale_transactions')
      .insert([
        {
          wallet_address: wallet.toLowerCase(),
          tx_hash: txHash,
          amount_usd: Number(amountUsd).toFixed(2),
          tokens_bought: Number(tokensBought).toFixed(2)
        }
      ]);

    if (error) {
      // إذا كانت المعاملة مسجلة مسبقاً، نعتبرها ناجحة ولا نكررها
      if (error.code === '23505') {
        return NextResponse.json({ success: true }); 
      }
      return NextResponse.json({ error: 'Database Insert Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
