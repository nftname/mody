"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PROMPT_STORAGE_KEY = "nnm_install_prompt_last_shown_v3";
const PROMPT_INTERVAL_MS = 1 * 60 * 60 * 1000; // 1 hour

export default function AppInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const eligiblePath = pathname === "/";

  const isStandalone = () => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any)?.standalone === true
    );
  };

  const shouldShowPrompt = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!eligiblePath) return false;
    if (isStandalone()) return false;

    const lastShownRaw = localStorage.getItem(PROMPT_STORAGE_KEY);
    const lastShown = lastShownRaw ? Number(lastShownRaw) : 0;
    if (!lastShown) return true;
    const elapsed = Date.now() - lastShown;
    return Number.isFinite(elapsed) && elapsed >= PROMPT_INTERVAL_MS;
  }, [eligiblePath]);

  const markShownNow = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROMPT_STORAGE_KEY, Date.now().toString());
  }, []);

  const tryShowPrompt = useCallback(
    (event?: BeforeInstallPromptEvent | null) => {
      const promptEvent = event || deferredPrompt;
      if (!promptEvent) return;
      if (!shouldShowPrompt()) return;

      setDeferredPrompt(promptEvent);
      setVisible(true);
      markShownNow();
    },
    [deferredPrompt, markShownNow, shouldShowPrompt]
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      tryShowPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(PROMPT_STORAGE_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [tryShowPrompt]);

  useEffect(() => {
    if (!deferredPrompt) return;
    tryShowPrompt(deferredPrompt);
  }, [pathname, deferredPrompt, tryShowPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setVisible(false);
      return;
    }

    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch (err) {
      console.warn("Install prompt dismissed or failed", err);
    }
    setVisible(false);
  };

  const handleLater = () => {
    setVisible(false);
    markShownNow();
  };

  if (!visible || !deferredPrompt || !eligiblePath) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "64px", // تحت النافبار الثابت
        left: 0,
        width: "100%",
        background: "#0B0E11",
        color: "#EAECEF",
        borderBottom: "1px solid rgba(252, 213, 53, 0.25)",
        zIndex: 1066, // أعلى من شريط الإعلان والنافبار
        padding: "8px 12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        transform: "translateY(0)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/icons/icon.svg" alt="NNM" width={22} height={22} style={{ display: "block" }} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Install App</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleInstall}
            style={{
              background: "transparent",
              border: "1px solid rgba(252, 213, 53, 0.5)",
              color: "#FCD535",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Install
          </button>
          <button
            aria-label="Close"
            onClick={handleLater}
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <i className="bi bi-x-lg" style={{ fontSize: "14px" }}></i>
          </button>
        </div>
      </div>
    </div>
  );
}
