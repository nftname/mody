# 🔌 دليل تخصيص Wallet Connection Modal - RainbowKit

**تاريخ الإنشاء:** 6 يناير 2026  
**المشروع:** NNM Market  
**الهدف:** تخصيص تصميم Modal الاتصال بالمحفظة دون كسر الوظائف

---

## 📋 **1. إعداد RainbowKit الحالي**

**📁 الملف:** `src/app/providers.tsx`

```tsx
'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'viem/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://Nftnnm.com';

const config = getDefaultConfig({
  appName: 'NNM Market',
  appDescription: 'Nexus Digital Name NFTs Market',
  appUrl: origin,
  appIcon: `${origin}/icons/icon.svg`,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '9e2e602f47e436db24b660ee7f01f141',
  chains: [polygon],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
            theme={darkTheme({
                accentColor: '#FCD535',           // 🔸 اللون الذهبي الرئيسي
                accentColorForeground: 'black',   // 🔸 لون النص على الأزرار الذهبية
                borderRadius: 'small',            // 🔸 حجم الزوايا المستديرة
                fontStack: 'system',              // 🔸 نوع الخط
                overlayBlur: 'small',             // 🔸 تأثير الضبابية على الخلفية
            })}
            modalSize="compact"                   // 🔸 حجم النافذة المنبثقة
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### **📌 النقاط المهمة:**
- `accentColor: '#FCD535'` → اللون الذهبي المستخدم في الأزرار والعناصر النشطة
- `darkTheme()` → يستخدم Theme داكن من RainbowKit
- `polygon` → الشبكة المستخدمة هي Polygon
- `modalSize="compact"` → حجم Modal صغير

---

## 🔘 **2. زر الاتصال المخصص في Navbar**

**📁 الملف:** `src/components/Navbar.tsx`

### **الكود الكامل للزر المخصص:**

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

// تعريف الألوان المستخدمة
const exactDarkColor = '#0b0e11';       // 🔸 خلفية الموقع الرئيسية
const dropdownColor = '#0a0c10';        // 🔸 لون القوائم المنسدلة
const metallicGoldHex = '#F0C420';      // 🔸 الذهبي الرئيسي
const paleGoldHex = '#D4C49D';          // 🔸 ذهبي باهت للتفاصيل
const subtleBorder = 'rgba(255, 255, 255, 0.08)';  // حدود شفافة
const offWhiteText = '#E0E0E0';         // 🔸 نص أبيض مائل للرمادي

const elementHeight = '29px';           // 🔸 ارتفاع العناصر
const elementFontSize = '11px';         // 🔸 حجم الخط

// ستايل زر "Connect Wallet" (قبل الاتصال)
const customDisconnectStyle = {
  background: 'transparent',
  color: metallicGoldHex,                    // ذهبي #F0C420
  border: `1px solid ${metallicGoldHex}`,
  fontWeight: '600' as const,
  fontSize: elementFontSize,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
  padding: '0 8px',
  transition: 'all 0.2s ease',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap' as const
};

// ستايل الزر بعد الاتصال (يعرض اسم المحفظة)
const customConnectStyle = {
  background: '#141414',                     // أسود فحمي
  color: '#E0E0E0',                          // أبيض مائل للرمادي
  border: `1px solid rgba(240, 196, 32, 0.3)`,  // حدود ذهبية شفافة
  fontWeight: '500' as const,
  fontSize: elementFontSize,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
  gap: '6px',
  padding: '0 8px'
};

// المكون المخصص للزر
const CustomWalletTrigger = ({ isMobile }: { isMobile: boolean }) => {
  const height = isMobile ? '28px' : elementHeight;
  const minWidth = isMobile ? '80px' : '110px';
  const fontSize = isMobile ? '11px' : elementFontSize;
  const btnText = isMobile ? 'Connect' : 'Connect Wallet';

  return (
    <div style={{ position: 'relative', height: height, minWidth: minWidth, display: 'inline-block' }}>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
          
          return (
            <div 
              {...(!ready && { 
                'aria-hidden': true, 
                'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' } 
              })} 
              style={{ width: '100%', height: '100%' }}
            >
              {(() => {
                // حالة 1: غير متصل - عرض زر "Connect Wallet"
                if (!connected) {
                  return (
                    <div onClick={openConnectModal} style={customDisconnectStyle} className="hover-effect-btn">
                      {btnText}
                    </div>
                  );
                }
                
                // حالة 2: شبكة خاطئة - عرض "Wrong Net"
                if (chain.unsupported) {
                  return (
                    <div 
                      onClick={openConnectModal} 
                      style={{...customDisconnectStyle, borderColor: '#ff4d4d', color: '#ff4d4d'}}
                    >
                      Wrong Net
                    </div>
                  );
                }
                
                // حالة 3: متصل - عرض اسم المحفظة مع نقطة خضراء
                return (
                  <div onClick={openAccountModal} style={{...customConnectStyle, fontSize}}>
                    {/* نقطة خضراء تشير إلى الاتصال النشط */}
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: '#27ae60', 
                      boxShadow: '0 0 8px rgba(39, 174, 96, 0.6)', 
                      flexShrink: 0 
                    }}></div>
                    <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {account.displayName}
                    </span>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
```

### **📌 الوظائف المتاحة من ConnectButton.Custom:**
```tsx
{
  account: {
    address: string;           // عنوان المحفظة الكامل
    displayName: string;       // الاسم المختصر (مثل: 0x1234...5678)
    displayBalance: string;    // الرصيد
    ensAvatar?: string;        // صورة ENS إن وجدت
    ensName?: string;          // اسم ENS إن وجد
    hasPendingTransactions: boolean;
  },
  chain: {
    id: number;                // رقم الشبكة
    name: string;              // اسم الشبكة
    unsupported: boolean;      // هل الشبكة غير مدعومة؟
  },
  openAccountModal: () => void;   // 🔸 فتح نافذة تفاصيل الحساب
  openChainModal: () => void;     // 🔸 فتح نافذة تغيير الشبكة
  openConnectModal: () => void;   // 🔸 فتح نافذة الاتصال بالمحفظة
  authenticationStatus: 'loading' | 'authenticated' | 'unauthenticated';
  mounted: boolean;                // هل المكون جاهز؟
}
```

---

## 🎨 **3. الألوان المستخدمة في المشروع**

### **من Navbar.tsx:**
```tsx
const exactDarkColor = '#0b0e11';       // 🔸 خلفية الموقع الرئيسية (أسود فحمي)
const dropdownColor = '#0a0c10';        // 🔸 لون القوائم المنسدلة (أغمق قليلاً)
const metallicGoldHex = '#F0C420';      // 🔸 الذهبي الرئيسي (للأزرار والعناصر النشطة)
const paleGoldHex = '#D4C49D';          // 🔸 ذهبي باهت (للتفاصيل الثانوية)
const subtleBorder = 'rgba(255, 255, 255, 0.08)';  // حدود شفافة
const offWhiteText = '#E0E0E0';         // 🔸 نص أبيض مائل للرمادي
```

### **من globals.css:**
```css
:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 11, 14, 17;
  --background-end-rgb: 11, 14, 17;
}

html, body {
  background-color: #0b0e11;  /* 🔸 الأسود الفحمي */
  color: white;
}
```

### **من providers.tsx (RainbowKit):**
```tsx
accentColor: '#FCD535'          // 🔸 اللون الذهبي في RainbowKit Modal
```

### **📊 جدول الألوان الكامل:**

| الاستخدام | الكود HEX | ملاحظات |
|-----------|-----------|----------|
| **الذهبي الرئيسي** | `#F0C420` | للأزرار والعناصر النشطة |
| **الذهبي في Modal** | `#FCD535` | لون RainbowKit الرئيسي |
| **ذهبي باهت** | `#D4C49D` | للتفاصيل الثانوية |
| **الأسود الفحمي (خلفية)** | `#0b0e11` | الخلفية الرئيسية للموقع |
| **أسود أغمق (dropdown)** | `#0a0c10` | للقوائم المنسدلة |
| **أسود للأزرار** | `#141414` | خلفية الأزرار بعد الاتصال |
| **نص أبيض مائل للرمادي** | `#E0E0E0` | النص العادي |
| **حدود شفافة** | `rgba(255, 255, 255, 0.08)` | للحدود الخفيفة |
| **أخضر (اتصال نشط)** | `#27ae60` | نقطة الاتصال الخضراء |
| **أحمر (خطأ)** | `#ff4d4d` | لعرض "Wrong Network" |

---

## 📦 **4. الحزم المستخدمة (Dependencies)**

```json
{
  "@rainbow-me/rainbowkit": "الإصدار الحالي",
  "wagmi": "الإصدار الحالي",
  "viem": "الإصدار الحالي",
  "@tanstack/react-query": "الإصدار الحالي"
}
```

---

## 🛠️ **5. كيفية التخصيص**

### **خيار 1: تخصيص Theme الحالي**
عدّل في `src/app/providers.tsx`:

```tsx
<RainbowKitProvider
  theme={darkTheme({
    accentColor: '#F0C420',           // غيّر اللون الرئيسي
    accentColorForeground: 'black',   // لون النص على الأزرار
    borderRadius: 'large',            // 'none' | 'small' | 'medium' | 'large'
    fontStack: 'rounded',             // 'rounded' | 'system'
    overlayBlur: 'large',             // 'none' | 'small' | 'large'
  })}
  modalSize="wide"                    // 'compact' | 'wide'
>
```

### **خيار 2: إنشاء Custom Theme كامل**

```tsx
import { Theme } from '@rainbow-me/rainbowkit';

const customTheme: Theme = {
  colors: {
    accentColor: '#F0C420',
    accentColorForeground: '#000000',
    actionButtonBorder: 'rgba(255, 255, 255, 0.08)',
    actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
    actionButtonSecondaryBackground: '#141414',
    closeButton: '#E0E0E0',
    closeButtonBackground: '#0b0e11',
    connectButtonBackground: 'transparent',
    connectButtonBackgroundError: '#ff4d4d',
    connectButtonInnerBackground: '#141414',
    connectButtonText: '#F0C420',
    connectButtonTextError: '#ff4d4d',
    connectionIndicator: '#27ae60',
    downloadBottomCardBackground: '#0a0c10',
    downloadTopCardBackground: '#0b0e11',
    error: '#ff4d4d',
    generalBorder: 'rgba(255, 255, 255, 0.08)',
    generalBorderDim: 'rgba(255, 255, 255, 0.04)',
    menuItemBackground: '#141414',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    modalBackground: '#0b0e11',
    modalBorder: 'rgba(255, 255, 255, 0.08)',
    modalText: '#E0E0E0',
    modalTextDim: 'rgba(224, 224, 224, 0.6)',
    modalTextSecondary: '#D4C49D',
    profileAction: '#141414',
    profileActionHover: '#1a1a1a',
    profileForeground: '#0b0e11',
    selectedOptionBorder: '#F0C420',
    standby: '#F0C420',
  },
  fonts: {
    body: 'system-ui, -apple-system, sans-serif',
  },
  radii: {
    actionButton: '6px',
    connectButton: '6px',
    menuButton: '6px',
    modal: '12px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0 4px 12px rgba(0, 0, 0, 0.1)',
    dialog: '0 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0 2px 6px rgba(0, 0, 0, 0.1)',
    selectedOption: '0 0 0 1px #F0C420',
    selectedWallet: '0 0 0 1px #F0C420',
    walletLogo: '0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
};

// ثم استخدمه:
<RainbowKitProvider theme={customTheme}>
```

### **خيار 3: إنشاء Modal مخصص تماماً**

إذا أردت التحكم الكامل، يمكنك:
1. عدم استخدام `openConnectModal` من RainbowKit
2. إنشاء Modal خاص بك
3. استخدام `useConnect()` من wagmi مباشرة

```tsx
import { useConnect } from 'wagmi';
import { useState } from 'react';

function CustomWalletModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { connect, connectors } = useConnect();

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Connect Wallet</button>
      
      {isOpen && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Connect Your Wallet</h2>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setIsOpen(false);
                }}
              >
                {connector.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 🎯 **6. الملفات الأخرى التي تستخدم ConnectButton**

### **في صفحة Mint:**
📁 `src/app/mint/page.tsx` (السطر 349)

### **في صفحة Asset Details:**
📁 `src/app/asset/[id]/page.tsx` (السطر 529)
```tsx
<div style={{ width: '100%', height: '50px' }}>
  <ConnectButton />
</div>
```

---

## ✅ **7. الخطوات التالية المقترحة**

1. **للتخصيص البسيط:** عدّل `accentColor` و `theme` في `providers.tsx`
2. **للتخصيص المتوسط:** استخدم Custom Theme كامل
3. **للتحكم الكامل:** أنشئ Modal خاص بك باستخدام `useConnect()`

### **نصائح مهمة:**
- ✅ احتفظ بـ `openConnectModal` و `openAccountModal` لضمان عمل الوظائف
- ✅ استخدم `ConnectButton.Custom` لتخصيص الزر فقط
- ✅ اختبر على شبكة Polygon (الشبكة المستخدمة في المشروع)
- ✅ تأكد من أن `projectId` من WalletConnect صحيح

---

## 📚 **مصادر إضافية**

- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [RainbowKit Theming](https://www.rainbowkit.com/docs/theming)
- [RainbowKit Custom Connect Button](https://www.rainbowkit.com/docs/custom-connect-button)
- [Wagmi Docs](https://wagmi.sh/)

---

**📝 ملاحظة نهائية:**  
هذا الملف يحتوي على جميع المعلومات والأكواد الموجودة حالياً في المشروع. يمكنك نسخه واستخدامه كمرجع أثناء التطوير مع المطور الآخر.

**تم إنشاء هذا الملف بواسطة:** GitHub Copilot  
**التاريخ:** 6 يناير 2026
