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
  const affStart = searchParams.get('affStart');
  const affEnd = searchParams.get('affEnd');
  const affWallet = searchParams.get('affWallet');

  let activitiesQuery = supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50000);
  if (start && end) {
    activitiesQuery = activitiesQuery.gte('created_at', start).lte('created_at', end);
  }

  let historyQuery = supabase.from('affiliate_payouts').select('*').neq('status', 'PENDING').order('created_at', { ascending: false }).limit(10000);
  if (affStart && affEnd) {
    historyQuery = historyQuery.gte('created_at', affStart).lte('created_at', affEnd);
  }
  if (affWallet) {
    historyQuery = historyQuery.ilike('wallet_address', `%${affWallet}%`);
  }

  const [
    { data: settings },
    { data: activitiesData },
    { data: pendingPayouts },
    { data: payoutHistory },
    { data: bans },
    { data: allMetadata } 
  ] = await Promise.all([
    supabase.from('app_settings').select('*').single(),
    activitiesQuery,
    supabase.from('affiliate_payouts').select('*').eq('status', 'PENDING').order('created_at', { ascending: false }),
    historyQuery,
    supabase.from('banned_wallets').select('*').order('created_at', { ascending: false }),
    supabase.from('assets_metadata').select('token_id, tier').limit(50000)
  ]);

  let activities = activitiesData || [];

  if (allMetadata) {
    const metadataMap: Record<string, string> = {};
    allMetadata.forEach(m => {
      if (m.token_id) {
        metadataMap[String(m.token_id)] = m.tier?.toUpperCase().trim();
      }
    });

    activities = activities.map(act => {
      let resolvedTier = metadataMap[String(act.token_id)];
      
      if (!resolvedTier) {
        const price = Number(act.price || 0);
        if (price >= 15) resolvedTier = 'IMMORTAL';
        else if (price >= 10) resolvedTier = 'ELITE';
        else if (price >= 5) resolvedTier = 'FOUNDER';
      }
      return { ...act, tier: resolvedTier || 'UNKNOWN' };
    });
  }

  return NextResponse.json({
    settings: settings || {},
    activities,
    pendingPayouts: pendingPayouts || [],
    payoutHistory: payoutHistory || [],
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
  } else if (action === 'delete_payout') {
    await supabase.from('affiliate_payouts').delete().eq('id', payload.id);
  } else if (action === 'ban_wallet') {
    await supabase.from('banned_wallets').insert([{ wallet_address: payload.wallet.toLowerCase() }]);
  } else if (action === 'unban_wallet') {
    await supabase.from('banned_wallets').delete().eq('wallet_address', payload.wallet.toLowerCase());
  }

  return NextResponse.json({ success: true });
}
