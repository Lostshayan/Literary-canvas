"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="literary-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Literary Canvas
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
          Discover and share bite-sized poetry, quotes, and stories.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Loader2 className="animate-spin" style={{ color: "var(--text-secondary)" }} size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p>No posts available yet. Be the first to write something!</p>
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
