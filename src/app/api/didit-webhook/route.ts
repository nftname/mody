import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, session_id, status, decision } = body;

    // 1. 
    if (type !== 'verification_session.completed') {
      return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
    }

    // 2. (Wallet Address) 
    
    const walletAddress = body.client_user_id;

    if (!walletAddress) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 400 });
    }

    // 3. 
    const isApproved = decision === 'approved';

    if (isApproved) {
      // 4(Supabase)
     
      const { error } = await supabase
        .from('chainface_wallet_verifications')
        .upsert({ 
          wallet_address: walletAddress.toLowerCase(),
          is_phone_verified: true,
          is_kyc_verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'wallet_address' });

      if (error) {
        console.error('Supabase Error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
