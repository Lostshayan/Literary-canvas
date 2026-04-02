"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
import { Loader2, Grid } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchProfilePosts = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            setPosts(data);
          }
        } catch (error) {
          console.error("Failed to fetch profile posts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfilePosts();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <Loader2 className="animate-spin" style={{ color: "var(--text-secondary)" }} size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="profile-header">
        {session.user.image ? (
          <img src={session.user.image} alt={session.user.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar" style={{ backgroundColor: "var(--border)" }} />
        )}
        <div className="profile-info">
          <h1 className="literary-text">{session.user.name}</h1>
          <p>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
        <Grid size={20} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: "500" }}>Your Canvas</h2>
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
