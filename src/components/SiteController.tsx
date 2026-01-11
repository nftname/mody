'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SiteController() {
  const [settings, setSettings] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // 1. جلب الإعدادات الأولية عند فتح الموقع
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };

    fetchSettings();

    // 2. الاشتراك في التحديثات الفورية (هنا كان الخطأ وتم إصلاحه)
    const subscription = supabase
      .channel('settings_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, (payload: any) => {
        // ✅ التعديل الجراحي: أضفنا :any للمتغير payload
        if (payload.new) {
            setSettings(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // إذا لم يتم تحميل البيانات بعد، لا نفعل شيئاً
  if (!settings) return null;

  // --- منطق وضع الصيانة (Maintenance Mode) ---
  // الشرط: إذا كان وضع الصيانة مفعل + المستخدم ليس في صفحة الأدمن
  if (settings.is_maintenance_mode && !pathname?.startsWith('/admin')) {
    return (
      <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#050505', 
          color: '#FCD535', 
          zIndex: 999999, // طبقة عالية جداً لتغطية كل شيء
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          fontFamily: 'sans-serif'
      }}>
        <i className="bi bi-cone-striped" style={{ fontSize: '60px', marginBottom: '20px' }}></i>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#fff' }}>Maintenance Mode</h1>
        <p style={{ color: '#888', maxWidth: '400px', lineHeight: '1.5' }}>
            The NNM Platform is currently undergoing scheduled upgrades. Access is restricted to administrators.
        </p>
      </div>
    );
  }

  // --- منطق شريط الإعلان (Announcement Banner) ---
  if (settings.announcement_text && !settings.is_maintenance_mode) {
    return (
      <div style={{ 
          backgroundColor: '#FCD535', 
          color: '#000', 
          textAlign: 'center', 
          padding: '8px 15px', 
          fontWeight: '700', 
          fontSize: '13px', 
          position: 'fixed', // مثبت في الأعلى
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1060, // أعلى من النافبار
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <i className="bi bi-megaphone-fill me-2"></i>
        {settings.announcement_text}
      </div>
    );
  }

  return null;
}
