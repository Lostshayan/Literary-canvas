"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
import LiteraryLoader from "@/components/LiteraryLoader";
import { Grid, Edit2, Check, LogOut, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const fetchProfileData = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts);
            setProfile(data.profile);
            setBioInput(data.profile?.bio || "");
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [status]);

  const handleSaveBio = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioInput })
      });
      if (res.ok) {
        setProfile(prev => ({ ...prev, bio: bioInput }));
        setIsEditingBio(false);
      }
    } catch(e) {
      console.error(e);
    }
  };

  if (status === "loading" || loading) {
    return <LiteraryLoader />;
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="btn btn-ghost"
        style={{ marginBottom: "1rem", gap: "0.4rem", paddingLeft: "0" }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="profile-header">
        {session.user.image ? (
          <img src={session.user.image} alt={session.user.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar" style={{ backgroundColor: "var(--border)" }} />
        )}
        <div className="profile-info" style={{ flexGrow: 1 }}>
          <h1 className="literary-text">{session.user.name}</h1>
          <p style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", color: "var(--text-primary)", fontWeight: "500" }}>
            <span>{profile?._count?.followers || 0} Followers</span>
            <span>{profile?._count?.following || 0} Following</span>
            <span>{posts.length} Posts</span>
          </p>

          <div style={{ marginTop: "1rem" }}>
            {isEditingBio ? (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <textarea 
                  value={bioInput} 
                  onChange={e => setBioInput(e.target.value)} 
                  maxLength={150}
                  style={{ 
                    minHeight: "80px",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--surface)",
                    caretColor: "var(--text-primary)",
                  }}
                  placeholder="Tell us about your writing..."
                />
                <button onClick={handleSaveBio} className="btn btn-primary" style={{ padding: "0.5rem" }}><Check size={18} /></button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p style={{ fontStyle: profile?.bio ? "italic" : "normal", color: profile?.bio ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {profile?.bio || "No bio added yet."}
                </p>
                <button onClick={() => setIsEditingBio(true)} className="btn btn-ghost" style={{ padding: "0.25rem" }}><Edit2 size={14} /></button>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-outline"
              style={{ gap: "0.5rem", fontSize: "0.9rem" }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
        <Grid size={20} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: "500" }}>Your Verso</h2>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)" }}>
          <p>You haven't posted anything yet.</p>
        </div>
      ) : (
        <div className="profile-grid">
          {posts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
