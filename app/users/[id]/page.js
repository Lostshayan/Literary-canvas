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
        followStatus: prevStatus === "NONE" ? "PENDING" : "NONE",
      }));

      const res = await fetch(`/api/users/${id}/follow`, { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({
          ...prev,
          followStatus: result.isPending ? "PENDING" : result.isFollowing ? "ACCEPTED" : "NONE",
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
        className="btn btn-ghost"
        style={{ marginBottom: "1rem", gap: "0.4rem", paddingLeft: "0" }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="profile-header" style={{ position: "relative" }}>
        <img src={data.profile.image || "/placeholder.jpg"} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h1>{data.profile.name}</h1>
          <p style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", color: "var(--text-primary)", fontWeight: "500" }}>
            <span>{data.profile._count.followers} Followers</span>
            <span>{data.profile._count.following} Following</span>
          </p>
          {data.profile.bio && (
            <p style={{ marginTop: "1rem", fontStyle: "italic" }}>{data.profile.bio}</p>
          )}
        </div>

        {session && session.user.id !== id && (
          <button 
            onClick={handleFollow}
            className={data.followStatus === "NONE" ? "btn btn-primary" : "btn btn-outline"} 
            style={{ position: "absolute", right: "2rem", top: "2rem", padding: "0.5rem 1.5rem" }}
          >
            {data.followStatus === "NONE" && <><UserPlus size={18} /> Follow</>}
            {data.followStatus === "PENDING" && <><Clock size={18} /> Requested</>}
            {data.followStatus === "ACCEPTED" && <><Check size={18} /> Following</>}
          </button>
        )}
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
