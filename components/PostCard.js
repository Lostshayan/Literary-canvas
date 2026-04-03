"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const isInitiallyLiked = session?.user && post.likes?.some(l => l.userId === session.user.id);
  const [liked, setLiked] = useState(isInitiallyLiked || false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [savedContent, setSavedContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

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

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === savedContent) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        setSavedContent(editContent.trim());
        setIsEditing(false);
      }
    } catch {
      // keep editing open on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(savedContent);
    setIsEditing(false);
  };

  if (deleted) return null;

  return (
    <div className="post-card">
      <div className="post-card-background" style={{ backgroundColor: post.color }} />

      {/* Content — either editable textarea or plain text */}
      {isEditing ? (
        <div style={{ position: "relative", zIndex: 1, padding: "0.25rem 0 0.75rem" }}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              minHeight: "120px",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid rgba(255,255,255,0.4)",
              color: "var(--text-primary)",
              fontSize: "inherit",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              lineHeight: "1.7",
              resize: "vertical",
              outline: "none",
              caretColor: "var(--text-primary)",
              padding: "0.25rem 0",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", justifyContent: "flex-end" }}>
            <button
              onClick={handleCancelEdit}
              className="like-button"
              aria-label="Cancel edit"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={15} />
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="like-button"
              aria-label="Save edit"
              style={{ color: "#4CAF50", opacity: saving ? 0.6 : 1 }}
            >
              <Check size={15} />
            </button>
          </div>
        </div>
      ) : (
        <p className="post-content literary-text" style={{ color: "var(--text-primary)" }}>
          {savedContent}
        </p>
      )}

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
          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="like-button"
                aria-label="Edit post"
                style={{ color: "var(--text-secondary)" }}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="like-button"
                aria-label="Delete post"
                style={{ color: "#C0392B" }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className={`like-button ${liked ? "liked" : ""}`}
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
