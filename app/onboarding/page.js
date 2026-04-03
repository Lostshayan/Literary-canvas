"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAvatar } from "@/components/Providers";
import { Check, ArrowRight, Feather } from "lucide-react";

const PRESET_AVATARS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setAvatar } = useAvatar();

  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: name, 2: avatar

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status]);

  const handleFinish = async () => {
    if (!displayName.trim()) { setError("Please enter a name."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), image: selectedAvatar }),
      });
      if (res.ok) {
        setAvatar(selectedAvatar);
        router.replace("/");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        animation: "fadeUp 0.5s ease forwards",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "0.75rem",
          }}>
            <Feather size={28} style={{ color: "var(--accent-hover)" }} />
            <span className="literary-text" style={{ fontSize: "2rem", letterSpacing: "0.05em" }}>Verso</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Welcome! Let's set up your profile.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: "600",
                background: step >= s ? "var(--accent-hover)" : "var(--surface)",
                color: step >= s ? "#fff" : "var(--text-secondary)",
                border: step >= s ? "none" : "1px solid var(--border)",
                transition: "all 0.3s ease",
              }}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 2 && (
                <div style={{
                  width: "40px", height: "2px",
                  background: step > 1 ? "var(--accent-hover)" : "var(--border)",
                  borderRadius: "2px",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)",
          borderRadius: "20px",
          padding: "2rem",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}>

          {/* Step 1: Name */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <h2 className="literary-text" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                What shall we call you?
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
                This name will appear on all your posts.
              </p>

              <input
                type="text"
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && displayName.trim() && setStep(2)}
                maxLength={40}
                placeholder="Your pen name..."
                autoFocus
                style={{
                  width: "100%",
                  fontSize: "1.3rem",
                  padding: "0.9rem 1rem",
                  borderRadius: "12px",
                  border: "2px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--text-primary)",
                  caretColor: "var(--accent-hover)",
                  outline: "none",
                  fontFamily: "'Playfair Display', serif",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent-hover)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />

              {error && <p style={{ color: "var(--error, #C0392B)", marginTop: "0.6rem", fontSize: "0.85rem" }}>{error}</p>}

              <button
                onClick={() => displayName.trim() && setStep(2)}
                disabled={!displayName.trim()}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1.5rem", padding: "0.85rem", fontSize: "1rem", gap: "0.5rem", borderRadius: "12px", opacity: displayName.trim() ? 1 : 0.5 }}
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Avatar */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <h2 className="literary-text" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                Choose your avatar
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
                Pick the one that best represents you.
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.85rem",
                marginBottom: "1.75rem",
              }}>
                {PRESET_AVATARS.map(src => (
                  <button
                    key={src}
                    onClick={() => setSelectedAvatar(src)}
                    style={{
                      padding: 0,
                      border: selectedAvatar === src
                        ? "3px solid var(--accent-hover)"
                        : "3px solid transparent",
                      borderRadius: "14px",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "none",
                      transform: selectedAvatar === src ? "scale(1.06)" : "scale(1)",
                      transition: "all 0.2s ease",
                      boxShadow: selectedAvatar === src ? "0 0 0 4px rgba(210,145,65,0.15)" : "none",
                    }}
                  >
                    <img
                      src={src}
                      alt="Avatar"
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                    />
                  </button>
                ))}
              </div>

              {error && <p style={{ color: "var(--error, #C0392B)", marginBottom: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: "0.85rem", borderRadius: "12px" }}
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: "0.85rem", fontSize: "1rem", gap: "0.5rem", borderRadius: "12px" }}
                >
                  {saving ? "Setting up..." : "Enter Verso ✦"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
