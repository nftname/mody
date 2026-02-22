import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let activitiesQuery = supabase.from('activities').select('*').order('created_at', { ascending: false });
  
  if (start && end) {
    activitiesQuery = activitiesQuery.gte('created_at', start).lte('created_at', end);
  }

  const [
    { data: settings },
    { data: activities },
    { data: payouts },
    { data: bans }
  ] = await Promise.all([
    supabase.from('app_settings').select('*').single(),
    activitiesQuery,
    supabase.from('affiliate_payouts').select('*').eq('status', 'PENDING').order('created_at', { ascending: false }),
    supabase.from('banned_wallets').select('*').order('created_at', { ascending: false })
  ]);

  return NextResponse.json({
    settings: settings || {},
    activities: activities || [],
    payouts: payouts || [],
    bans: bans || []
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, payload } = body;

  if (action === 'update_settings') {
    await supabase.from('app_settings').update(payload).eq('id', 1);
  } else if (action === 'mark_paid') {
    await supabase.from('affiliate_payouts').update({ status: 'PAID', tx_hash: payload.hash }).eq('id', payload.id);
  } else if (action === 'ban_wallet') {
    await supabase.from('banned_wallets').insert([{ wallet_address: payload.wallet.toLowerCase() }]);
  } else if (action === 'unban_wallet') {
    await supabase.from('banned_wallets').delete().eq('wallet_address', payload.wallet.toLowerCase());
  }

  return NextResponse.json({ success: true });
}
