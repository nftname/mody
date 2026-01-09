'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SiteController() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // 1. جلب الإعدادات عند التحميل
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Settings error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // 2. تفعيل التحديث الفوري (Real-time)
    const subscription = supabase
      .channel('settings_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, (payload) => {
        setSettings(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  // عدم حجب صفحة الأدمن أبداً لكي لا تغلق الموقع على نفسك
  const isAdminPage = pathname?.startsWith('/admin');
  const isMaintenance = settings?.is_maintenance_mode;

  // --- 1. شاشة الصيانة (الإيقاف التام) ---
  if (isMaintenance && !isAdminPage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-5 text-center">
          <div className="max-w-2xl border border-red-900 bg-[#110000] p-10 rounded-2xl shadow-2xl">
             <i className="bi bi-cone-striped text-6xl text-red-600 mb-6 block"></i>
             <h1 className="text-4xl font-bold mb-4 text-white">System Under Maintenance</h1>
             <p className="text-gray-400 text-lg mb-8">
               The marketplace is currently paused for a scheduled upgrade or security check. 
               Please check back shortly. All assets are safe.
             </p>
             <div className="text-xs text-red-900 font-mono border-t border-red-900 pt-4 mt-4">
               ERROR_CODE: 503_SERVICE_UNAVAILABLE | NNM_SECURITY_PROTOCOL
             </div>
          </div>
      </div>
    );
  }

  // --- 2. شريط الرسائل (التنبيهات) ---
  if (!loading && settings?.announcement_text) {
    return (
      <div className="w-full bg-[#FCD535] text-black text-center py-2 px-4 font-bold text-sm sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
         <i className="bi bi-info-circle-fill"></i>
         {settings.announcement_text}
      </div>
    );
  }

  return null; // لا شيء للعرض إذا كان الموقع يعمل طبيعياً
}
