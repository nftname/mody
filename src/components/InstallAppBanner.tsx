'use client';

import { useEffect } from 'react';

const InstallAppBanner = () => {
  
  useEffect(() => {
    // نترك هذا المكون فارغاً ليعمل المتصفح بشكله الافتراضي
    // المتصفح سيقرأ البيانات من ملف manifest.json تلقائياً
  }, []);

  return null;
};

export default InstallAppBanner;
