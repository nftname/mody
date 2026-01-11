import { createClient } from '@supabase/supabase-js';

// 1. رابط المشروع والمفتاح
const supabaseUrl = 'https://cigztdxswhkkyootcywr.supabase.co';
const supabaseKey = 'sb_publishable_nKXYCwAJm8LOu6xtCzHNAQ_nCErFW5I';

// 2. تعريف متغير عالمي لحفظ النسخة (لمنع التكرار أثناء التطوير)
const globalForSupabase = global as unknown as { supabase: any };

export const supabase =
  globalForSupabase.supabase ||
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true, // الحفاظ على تسجيل الدخول
      autoRefreshToken: true,
    },
  });

// 3. حفظ النسخة في المتغير العالمي إذا كنا في وضع التطوير
if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}
