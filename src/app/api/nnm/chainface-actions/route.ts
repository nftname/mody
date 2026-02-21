import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        if (action === 'send_message') {
            const { tokenId, messageText, senderWallet } = payload;
            const { error } = await supabaseAdmin
                .from('chainface_messages')
                .insert([{ 
                    token_id: Number(tokenId), 
                    message_text: messageText, 
                    sender_wallet: senderWallet 
                }]);

            if (error) throw error;
            return NextResponse.json({ success: true });
        } 
        
        else if (action === 'update_wallet') {
            const { tokenId, ownerAddress, columnMap, coin, walletAddr } = payload;
            
            const updates: any = { 
                owner_address: ownerAddress, 
                updated_at: new Date().toISOString() 
            };
            updates[columnMap[coin]] = walletAddr;

            const { data: existingProfile } = await supabaseAdmin
                .from('chainface_profiles')
                .select('token_id')
                .eq('token_id', Number(tokenId))
                .maybeSingle();

            if (existingProfile) {
                const { error } = await supabaseAdmin
                    .from('chainface_profiles')
                    .update(updates)
                    .eq('token_id', Number(tokenId));
                if (error) throw error;
            } else {
                const { error } = await supabaseAdmin
                    .from('chainface_profiles')
                    .insert([{ token_id: Number(tokenId), ...updates }]);
                if (error) throw error;
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
