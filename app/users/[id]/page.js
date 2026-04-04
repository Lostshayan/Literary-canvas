"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import LiteraryLoader from "@/components/LiteraryLoader";
import { UserPlus, Clock, Check, ArrowLeft } from "lucide-react";

export default function UserProfile({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      // Optimistic update
      const prevStatus = data.followStatus;
      setData(prev => ({
        ...prev,
        followStatus: prevStatus === "NONE" ? "ACCEPTED" : "NONE",
      }));

      const res = await fetch(`/api/users/${id}/follow`, { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({
          ...prev,
          followStatus: result.isFollowing ? "ACCEPTED" : "NONE",
        }));
      } else {
        // Revert
        setData(prev => ({ ...prev, followStatus: prevStatus }));
      }
    } catch {
      // Silent error handling for UI flow
    }
  };

  if (loading) {
    return <LiteraryLoader />;
  }

  if (!data?.profile) {
    return <div style={{ textAlign: "center", padding: "4rem 0" }}>User not found.</div>;
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="btn btn-outline"
        style={{ marginBottom: "1rem", gap: "0.4rem" }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="profile-header" style={{ alignItems: "flex-start" }}>
        <img src={data.profile.image || "/placeholder.jpg"} alt="Profile" className="profile-avatar" />
        <div className="profile-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, wordBreak: "break-word" }}>{data.profile.displayName || data.profile.name}</h1>
            {session && session.user.id !== id && (
              <button
                onClick={handleFollow}
                className={data.followStatus === "NONE" ? "btn btn-primary" : "btn btn-outline"}
                style={{ padding: "0.45rem 1.2rem", flexShrink: 0, whiteSpace: "nowrap" }}
              >
                {data.followStatus === "NONE" && <><UserPlus size={16} /> Follow</>}
                {data.followStatus === "ACCEPTED" && <><Check size={16} /> Following</>}
              </button>
            )}
          </div>
          <p style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", color: "var(--text-primary)", fontWeight: "500", flexWrap: "wrap" }}>
            <span>{data.profile._count.followers} Followers</span>
            <span>{data.profile._count.following} Following</span>
          </p>
          {data.profile.bio && (
            <p style={{ marginTop: "1rem", fontStyle: "italic" }}>{data.profile.bio}</p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 className="literary-text" style={{ fontSize: "1.8rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
          Timeline
        </h2>
      </div>

      {data.posts.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>This user hasn't posted anything yet.</p>
      ) : (
        <div className="profile-grid">
          {data.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
