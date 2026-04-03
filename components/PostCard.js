"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const isInitiallyLiked = session?.user && post.likes?.some(l => l.userId === session.user.id);
  const [liked, setLiked] = useState(isInitiallyLiked || false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const displayName = post.author?.displayName || post.author?.name?.split(" ")[0] || "Anonymous";
  const isOwner = session?.user?.id === post.authorId;

  const handleLike = async () => {
    if (!session) { alert("Please sign in to like posts."); return; }
    if (loading) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(prev => wasLiked ? prev - 1 : prev + 1);
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(wasLiked);
        setLikes(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch {
      setLiked(wasLiked);
      setLikes(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleted(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(post.id);
      } else {
        setDeleted(false);
      }
    } catch {
      setDeleted(false);
    }
  };

  if (deleted) return null;

  return (
    <div className="post-card">
      <div className="post-card-background" style={{ backgroundColor: post.color }} />
      <p className="post-content literary-text" style={{ color: "var(--text-primary)" }}>{post.content}</p>
      
      <div className="post-footer">
        <Link href={`/users/${post.authorId}`} className="post-author" style={{ textDecoration: "none", color: "var(--text-secondary)" }}>
          {post.author?.image ? (
            <img src={post.author.image} alt={displayName} className="author-avatar" />
          ) : (
            <div className="author-avatar" />
          )}
          <span>{displayName}</span>
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="like-button"
              aria-label="Delete post"
              style={{ color: "var(--text-secondary)" }}
            >
              <Trash2 size={16} />
            </button>
          )}
          <button 
            className={`like-button ${liked ? 'liked' : ''}`} 
            onClick={handleLike}
            disabled={loading}
            aria-label="Like post"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
