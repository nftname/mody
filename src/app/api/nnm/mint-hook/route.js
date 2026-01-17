import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    export async function POST(request) {
      try {
          const body = await request.json();
              const { wallet } = body;

                  if (!wallet) {
                        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
                            }

                                const REWARD_AMOUNT = 3; 

                                    // 1. البحث عن المحفظة
                                        const { data: existingUser, error: fetchError } = await supabase
                                              .from('nnm_wallets')
                                                    .select('wnnm_balance')
                                                          .eq('wallet_address', wallet)
                                                                .single();

                                                                    if (fetchError && fetchError.code !== 'PGRST116') {
                                                                          throw fetchError;
                                                                              }

                                                                                  let error;

                                                                                      if (!existingUser) {
                                                                                            // مستخدم جديد
                                                                                                  const { error: insertError } = await supabase
                                                                                                          .from('nnm_wallets')
                                                                                                                  .insert([{
                                                                                                                            wallet_address: wallet,
                                                                                                                                      wnnm_balance: REWARD_AMOUNT,
                                                                                                                                                nnm_balance: 0
                                                                                                                                                        }]);
                                                                                                                                                              error = insertError;
                                                                                                                                                                  } else {
                                                                                                                                                                        // مستخدم موجود
                                                                                                                                                                              const newBalance = parseFloat(existingUser.wnnm_balance) + REWARD_AMOUNT;
                                                                                                                                                                                    
                                                                                                                                                                                          const { error: updateError } = await supabase
                                                                                                                                                                                                  .from('nnm_wallets')
                                                                                                                                                                                                          .update({ 
                                                                                                                                                                                                                    wnnm_balance: newBalance,
                                                                                                                                                                                                                              updated_at: new Date().toISOString()
                                                                                                                                                                                                                                      })
                                                                                                                                                                                                                                              .eq('wallet_address', wallet);
                                                                                                                                                                                                                                                    error = updateError;
                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                            if (error) throw error;

                                                                                                                                                                                                                                                                return NextResponse.json({ success: true, message: 'Mint reward added successfully' });

                                                                                                                                                                                                                                                                  } catch (err) {
                                                                                                                                                                                                                                                                      console.error('Mint Hook Error:', err);
                                                                                                                                                                                                                                                                          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            