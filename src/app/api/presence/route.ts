import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sessionId, wallet } = await req.json();
    let isAdmin = false;

    if (wallet) {
      const { data } = await supabase
        .from('admin_wallets')
        .select('*')
        .ilike('wallet_address', wallet)
        .single();

      if (data) isAdmin = true;
    }

    await supabase.from('live_visitors').upsert({
      session_id: sessionId,
      wallet_address: wallet ? wallet.toLowerCase() : null,
      is_admin: isAdmin,
      last_ping: new Date().toISOString(),
    }, { onConflict: 'session_id' });

    const timeLimit = new Date(Date.now() - 40000).toISOString();
    await supabase.from('live_visitors').delete().lt('last_ping', timeLimit);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const timeLimit = new Date(Date.now() - 40000).toISOString();
    await supabase.from('live_visitors').delete().lt('last_ping', timeLimit);

    const { data, error } = await supabase.from('live_visitors').select('*');
    if (error) throw error;

    let total = 0;
    let connected = 0;
    let anonymous = 0;
    let walletsList: any[] = [];
    let totalPages = 0;

    if (data) {
      const publicVisitors = data.filter(v => v.is_admin === false);
      total = publicVisitors.length;

      let connectedVisitors = publicVisitors.filter(v => v.wallet_address !== null);
      connected = connectedVisitors.length;
      anonymous = total - connected;

      if (search) {
        connectedVisitors = connectedVisitors.filter(v => 
          v.wallet_address.toLowerCase().includes(search.toLowerCase())
        );
      }

      connectedVisitors.sort((a, b) => new Date(b.last_ping).getTime() - new Date(a.last_ping).getTime());

      totalPages = Math.ceil(connectedVisitors.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      walletsList = connectedVisitors.slice(startIndex, endIndex).map(v => ({
        wallet: v.wallet_address,
        time: v.last_ping
      }));
    }

    return NextResponse.json({ total, connected, anonymous, wallets: walletsList, totalPages });
  } catch (error) {
    return NextResponse.json({ total: 0, connected: 0, anonymous: 0, wallets: [], totalPages: 0 }, { status: 500 });
  }
}
