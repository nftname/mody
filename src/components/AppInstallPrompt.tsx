"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PROMPT_STORAGE_KEY = "nnm_install_prompt_last_shown_v2";
const PROMPT_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

export default function AppInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const eligiblePath = pathname === "/" || pathname?.startsWith("/market");

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
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 30px)",
        maxWidth: "420px",
        background: "#0B0E11",
        color: "#EAECEF",
        border: "1px solid rgba(252, 213, 53, 0.35)",
        borderRadius: "14px",
        boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
        zIndex: 1200,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(180deg, #FCD535 0%, #F0B90B 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B0E11",
            fontWeight: 800,
            letterSpacing: "0.5px",
            boxShadow: "0 8px 20px rgba(252, 213, 53, 0.35)",
            flexShrink: 0,
          }}
        >
          N
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <h6 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FCD535" }}>Install NNM App</h6>
            <button
              aria-label="Close install prompt"
              onClick={handleLater}
              style={{
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "2px",
                lineHeight: 1,
              }}
            >
              <i className="bi bi-x-lg" style={{ fontSize: "14px" }}></i>
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "#cfd6e4", lineHeight: 1.5 }}>
            Add the NNM experience to your home screen for faster access on mobile and desktop. We will remind you again in 12 hours.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={handleLater}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#cfd6e4",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                cursor: "pointer",
              }}
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              style={{
                background: "linear-gradient(180deg, #FCD535 0%, #F0B90B 100%)",
                border: "none",
                color: "#0B0E11",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(252, 213, 53, 0.35)",
              }}
            >
              Install Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
