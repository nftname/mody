import { createClient } from '@supabase/supabase-js';

// 1. ضع رابط مشروعك هنا (بين علامات التنصيص)
const supabaseUrl = 'https://cigztdxswhkkyootcywr.supabase.co';

// 2. ضع المفتاح الطويل هنا (بين علامات التنصيص)
const supabaseKey = 'sb_publishable_nKXYCwAJm8LOu6xtCzHNAQ_nCErFW5I';

export const supabase = createClient(supabaseUrl, supabaseKey);