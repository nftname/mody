
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet missing' }, { status: 400 });
  }

  const { data: earningsData } = await supabase
    .from('affiliate_earnings')
    .select('*')
    .eq('referrer_wallet', wallet)
    .order('created_at', { ascending: false });

  const { data: payoutsData } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('wallet_address', wallet)
    .order('created_at', { ascending: false });

  const { count: relationshipsCount } = await supabase
    .from('affiliate_relationships')
    .select('*', { count: 'exact', head: true })
    .eq('parent_wallet', wallet);

  return NextResponse.json({
    earnings: earningsData || [],
    payouts: payoutsData || [],
    relationshipsCount: relationshipsCount || 0
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { wallet, amount } = body;

  if (!wallet || !amount || amount < 50) {
    return NextResponse.json({ error: 'Invalid claim request' }, { status: 400 });
  }

  const { error } = await supabase
    .from('affiliate_payouts')
    .insert([
      {
        wallet_address: wallet,
        amount: amount,
        status: 'PENDING'
      }
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
