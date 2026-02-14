
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, sender, receiver, amount } = body;

    const { error: voteError } = await supabase.from('conviction_votes').insert({
        token_id: tokenId.toString(),
        supporter_address: sender || 'visitor_payment',
        created_at: new Date().toISOString()
    });

    if (voteError) throw voteError;

    await supabase.from('activities').insert({
        token_id: tokenId,
        activity_type: 'Pay',
        from_address: sender || 'Visitor',
        to_address: receiver,
        price: amount,
        created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


