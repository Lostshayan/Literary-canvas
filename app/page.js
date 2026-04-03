"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import LiteraryLoader from "@/components/LiteraryLoader";
import { Compass } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
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
          setLoading(false);
        }
      };

      fetchFeed();
    }
  }, [status]);

  if (loading) return <LiteraryLoader />;

  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <h1 className="literary-text" style={{ fontSize: "3rem", marginBottom: "1rem" }}>Verso</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          A private space for short poetic texts and literary pieces.
        </p>
        <Link href="/explore" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}>
          <Compass size={18} />
          Explore Public Board
        </Link>
      </div>
    );
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
