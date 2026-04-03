"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Don't show if dismissed recently (within 7 days)
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS detection
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show custom iOS prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
      return;
    }

    // Android/Desktop — listen for the browser's native event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "5rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      width: "calc(100% - 2rem)",
      maxWidth: "420px",
      animation: "pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #3D2410 0%, #2C1C10 100%)",
        border: "1px solid rgba(210, 145, 65, 0.35)",
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(210,145,65,0.1)",
        backdropFilter: "blur(20px)",
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
      }}>
        <img src="/icon-192.png" alt="Verso" style={{ width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0 }} />

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "600", color: "#F0EBE1", marginBottom: "0.2rem", fontSize: "1rem" }}>
            Install Verso
          </p>
          {isIOS ? (
            <p style={{ color: "#C9BFB5", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Tap the <Share size={12} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Share</strong> button in Safari, then <strong>"Add to Home Screen"</strong>
            </p>
          ) : (
            <p style={{ color: "#C9BFB5", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Add Verso to your home screen for the full app experience.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              style={{
                marginTop: "0.75rem",
                background: "rgba(210, 145, 65, 0.2)",
                border: "1px solid rgba(210, 145, 65, 0.4)",
                color: "#F0C97A",
                borderRadius: "8px",
                padding: "0.45rem 1rem",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Download size={14} /> Install Now
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          style={{ background: "none", border: "none", color: "#9B9185", cursor: "pointer", padding: "0.1rem", flexShrink: 0 }}
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
