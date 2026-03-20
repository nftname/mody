import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const PRESALE_ADDRESS = "0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72".toLowerCase();

export async function GET(request: Request) {
  // ... (كود الـ GET كما هو بدون تغيير)
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet')?.toLowerCase();

  if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 });

  try {
    const { data, error } = await supabaseAdmin
      .from('presale_transactions')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Database Error' }, { status: 500 });

    const history = data || [];
    const totalInvestedUsd = history.reduce((sum: number, tx: any) => sum + Number(tx.amount_usd), 0);
    const totalTokensBought = history.reduce((sum: number, tx: any) => sum + Number(tx.tokens_bought), 0);

    return NextResponse.json({ success: true, totalInvestedUsd, totalTokensBought, history });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, txHash, amountUsd, tokensBought } = body;

    if (!wallet || !txHash || amountUsd === undefined || tokensBought === undefined) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!alchemyKey) {
      // تشخيص 1: التأكد من أن السيرفر يرى مفتاح الكيمياء
      return NextResponse.json({ error: 'DIAGNOSTIC: Alchemy key is undefined on server' }, { status: 500 });
    }

    const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`;

    const rpcResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    if (!rpcResponse.ok) {
       // تشخيص 2: فشل الاتصال برابط الكيمياء
       return NextResponse.json({ error: `DIAGNOSTIC: Alchemy Fetch Failed. Status: ${rpcResponse.status}` }, { status: 500 });
    }

    const rpcData = await rpcResponse.json();
    
    if (rpcData.error) {
      // تشخيص 3: الكيمياء ردت بخطأ في البارامترات
      return NextResponse.json({ error: 'DIAGNOSTIC: Alchemy returned RPC error', details: rpcData.error }, { status: 400 });
    }

    const receipt = rpcData.result;

    if (!receipt) {
      // تشخيص 4: المعاملة لم تسجل بعد أو الـ Hash خطأ
      return NextResponse.json({ error: 'DIAGNOSTIC: Transaction receipt is null. It might be pending or invalid.', txHash }, { status: 400 });
    }

    const isSuccess = receipt.status === '0x1';
    const isFromValid = receipt.from.toLowerCase() === wallet.toLowerCase();
    const isToValid = receipt.to && receipt.to.toLowerCase() === PRESALE_ADDRESS;

    if (!isSuccess || !isFromValid || !isToValid) {
      // تشخيص 5: الخلل الأمني! هنا سنرى ما هو الشرط الذي فشل ولماذا
      return NextResponse.json({ 
        error: 'DIAGNOSTIC: Security check failed', 
        details: {
          condition_Success: isSuccess,
          condition_FromValid: isFromValid,
          condition_ToValid: isToValid,
          actual_receipt_from: receipt.from,
          expected_wallet: wallet,
          actual_receipt_to: receipt.to,
          expected_contract: PRESALE_ADDRESS,
          actual_status: receipt.status
        }
      }, { status: 400 });
    }

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
      if (error.code === '23505') return NextResponse.json({ success: true }); 
      // تشخيص 6: خطأ في الداتا بيس
      return NextResponse.json({ error: 'DIAGNOSTIC: Database Insert Error', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'DIAGNOSTIC: Fatal Internal Error', details: error.message }, { status: 500 });
  }
}
