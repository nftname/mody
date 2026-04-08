
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
  
        const { 
            token_id, 
            name, 
            tier, 
            image_url, 
            description, 
            attributes, 
            mint_date, 
            metadata_uri 
        } = body;

        console.log(`📥 API: Saving Asset #${token_id} - ${name}`);

        const { error } = await supabaseAdmin
            .from('assets_metadata')
            .upsert({
                token_id: token_id,       // Numeric
                name: name,               // Text
                tier: tier,               // Text
                image_url: image_url,     // Text
                description: description, // Text
                attributes: attributes,   // JSONB
                mint_date: mint_date,     // Text
                metadata_uri: metadata_uri, // Text
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error(`❌ DB Error:`, error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
