"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import LiteraryLoader from "@/components/LiteraryLoader";
import { Compass, Check, LogIn } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useAvatar } from "@/components/Providers";

const PRESET_AVATARS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
  "/avatars/avatar-7.png",
  "/avatars/avatar-8.png",
  "/avatars/avatar-9.png",
  "/avatars/avatar-10.png",
];

function OnboardingFlow({ session, onComplete }) {
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(session?.user?.image || PRESET_AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const { setAvatar } = useAvatar();

  const handleSave = async () => {
    if (!displayName.trim()) {
      alert("Please enter a display name.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          image: selectedAvatar,
        }),
      });

      if (res.ok) {
        setAvatar(selectedAvatar);
        await onComplete(); // Triggers session.update() in Home
      } else {
        alert("Failed to save profile.");
        setSaving(false);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
      <h1 className="literary-text" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Welcome to Verso</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>
        Let's set up your literary persona before you start exploring.
      </p>

      <div style={{ marginBottom: "2.5rem", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "var(--text-primary)" }}>
          Your Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="e.g. Jane Austen"
          style={{
            width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", backgroundColor: "var(--bg)",
            color: "var(--text-primary)", fontSize: "1rem", outline: "none"
          }}
          disabled={saving}
        />
      </div>

      <div style={{ marginBottom: "3rem", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "1rem", fontWeight: "500", color: "var(--text-primary)" }}>
          Choose an Avatar (Optional)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
          {PRESET_AVATARS.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedAvatar(src)}
              disabled={saving}
              style={{
                padding: 0, border: selectedAvatar === src ? "3px solid var(--accent-hover)" : "3px solid transparent",
                borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s",
                transform: selectedAvatar === src ? "scale(1.05)" : "scale(1)",
                background: "none",
                position: "relative"
              }}
            >
              <img src={src} alt="Avatar option" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              {selectedAvatar === src && (
                <div style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "var(--accent-hover)", borderRadius: "50%", padding: "2px", color: "white" }}>
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !displayName.trim()}
        className="btn btn-primary"
        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", justifyContent: "center" }}
      >
        {saving ? "Setting up..." : "Enter Verso"}
      </button>
    </div>
  );
}

export default function Home() {
  const { data: session, status, update } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Derive if onboarding is needed directly from session!
  // No extra fetches, completely immune to hydration mismatches caused by redirects.
  const needsOnboarding = status === "authenticated" && !session?.user?.displayName;

  useEffect(() => {
    if (status === "unauthenticated" || needsOnboarding) {
      setLoadingFeed(false);
      return;
    }
    if (status === "authenticated" && !needsOnboarding) {
      const fetchFeed = async () => {
        try {
          const res = await fetch("/api/feed");
          if (res.ok) {
            const data = await res.json();
            setPosts(data);
          }
        } catch (error) {
          console.error("Failed to fetch feed:", error);
        } finally {
          setLoadingFeed(false);
        }
      };

      fetchFeed();
    }
  }, [status, needsOnboarding]);

  if (status === "loading" || (loadingFeed && status === "authenticated" && !needsOnboarding)) {
    return <LiteraryLoader />;
  }

  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <h1 className="literary-text" style={{ fontSize: "3rem", marginBottom: "1rem" }}>Verso</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          A private space for short poetic texts and literary pieces.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
          <Link href="/explore" className="btn btn-outline" style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}>
            <Compass size={18} />
            Explore Public Board
          </Link>
          <button onClick={() => signIn("google")} className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}>
            <LogIn size={18} />
            Sign in with Google
          </button>
        </div>

        <div style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto", padding: "2rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <h2 className="literary-text" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>What is Verso?</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1rem" }}>
            Verso is a minimalist sanctuary for writers, poets, and thinkers. It's a place to share bite-sized thoughts, beautiful quotes, or snippets of stories without the noise of traditional social media.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Write on canvas-like cards, curate your feed by following other literary minds, and immerse yourself in a dark academia aesthetic designed to let words breathe.
          </p>
        </div>
      </div>
    );
  }

  // Inject onboarding directly here!
  if (needsOnboarding) {
    return <OnboardingFlow session={session} onComplete={async () => {
      // Refresh the session in NextAuth so the UI instantly updates to the feed without reloading
      await update();
    }} />;
  }

  return (
    <div>
      <h2 className="literary-text" style={{ fontSize: "1.8rem", marginBottom: "2rem" }}>Your Feed</h2>
      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p style={{ marginBottom: "1rem" }}>Your timeline is empty. Follow some authors to fill it up!</p>
          <Link href="/explore" className="btn btn-outline" style={{ border: "2px solid var(--text-secondary)", padding: "0.6rem 1.4rem", fontWeight: "500" }}>Go to Explore →</Link>
        </div>
      ) : (
        <div className="masonry-grid">
          {posts.map((post) => (
            <div key={post.id} className="masonry-item">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
