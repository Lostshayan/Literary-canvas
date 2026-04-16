"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Heart, Reply, Trash2, Send } from "lucide-react";
import Link from "next/link";

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        setComments(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (parentId = null, textOverride = null) => {
    if (!session) return alert("Please sign in to comment.");
    const textToPost = textOverride || newComment;
    if (!textToPost.trim()) return;

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newCommentObj = {
      id: tempId,
      text: textToPost.trim(),
      createdAt: new Date().toISOString(),
      authorId: session.user.id,
      postId: postId,
      parentId: parentId || null,
      author: { ...session.user },
      likes: [],
      replies: []
    };

    if (parentId) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
        ? { ...c, replies: [...(c.replies || []), newCommentObj] }
        : c
      ));
      setReplyingTo(null);
    } else {
      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToPost, parentId }),
      });
      if (res.ok) {
        const generatedComment = await res.json();
        // Replace temp comment with actual comment id
        if (parentId) {
          setComments(prev => prev.map(c => 
            c.id === parentId 
            ? { ...c, replies: c.replies.map(r => r.id === tempId ? generatedComment : r) }
            : c
          ));
        } else {
          setComments(prev => prev.map(c => c.id === tempId ? generatedComment : c));
        }
      } else {
        // Revert on error
        fetchComments();
      }
    } catch {
      fetchComments(); // Revert on network error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete comment?")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) fetchComments();
  };

  const handleLike = async (commentId) => {
    if (!session) return;
    
    // Optimistic UI toggle for likes
    const toggleLike = (commentList) => {
      return commentList.map(c => {
        if (c.id === commentId) {
          const isLiked = c.likes?.some(l => l.userId === session.user.id);
          const newLikes = isLiked 
            ? c.likes.filter(l => l.userId !== session.user.id)
            : [...(c.likes || []), { userId: session.user.id, commentId }];
          return { ...c, likes: newLikes };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: toggleLike(c.replies) };
        }
        return c;
      });
    };
    
    setComments(prev => toggleLike(prev));

    const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    if (!res.ok) fetchComments(); // Revert on failure
  };

  const renderComment = (comment, isReply = false) => {
    const isOwner = session?.user?.id === comment.authorId;
    const isLiked = session && comment.likes?.some(l => l.userId === session.user.id);
    const displayName = comment.author?.displayName || comment.author?.name || "Anonymous";

    return (
      <div key={comment.id} style={{ 
        display: "flex", gap: "10px", marginTop: "1.5rem", 
        borderLeft: isReply ? "2px solid var(--border)" : "none",
        paddingLeft: isReply ? "1rem" : "0",
        marginLeft: isReply ? "1.5rem" : "0"
      }}>
        <Link href={`/users/${comment.authorId}`}>
           {comment.author?.image ? (
             <img src={comment.author.image} alt={displayName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
           ) : (
             <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--border)" }} />
           )}
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Link href={`/users/${comment.authorId}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", textDecoration: "none" }}>
              {displayName}
            </Link>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p style={{ marginTop: "4px", fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.5, wordWrap: "break-word" }}>
            {comment.text}
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "6px" }}>
            <button onClick={() => handleLike(comment.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: isLiked ? "#E74C3C" : "var(--text-secondary)", fontSize: "0.8rem", transition: "color 0.2s" }}>
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} /> {comment.likes?.length || 0}
            </button>
            {!isReply && (
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: replyingTo === comment.id ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "0.8rem", transition: "color 0.2s" }}>
                <Reply size={14} /> Reply
              </button>
            )}
            {isOwner && (
              <button onClick={() => handleDelete(comment.id)} title="Delete comment" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-secondary)", opacity: 0.7, transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Reply Input Box */}
          {replyingTo === comment.id && !isReply && (
             <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
               <input 
                 autoFocus
                 style={{ flex: 1, padding: "8px 12px", borderRadius: "16px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }}
                 placeholder={`Reply to ${displayName}...`}
                 onKeyDown={(e) => {
                   if (e.key === "Enter") {
                     handlePostComment(comment.id, e.target.value);
                     e.target.value = '';
                   }
                 }}
               />
               <button onClick={() => setReplyingTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                 Cancel
               </button>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", color: "var(--text-primary)", fontWeight: 500 }}>
        <MessageCircle size={20} /> {comments.length} Comments
      </h3>
      
      {session ? (
        <div style={{ display: "flex", gap: "10px", marginBottom: "3rem" }}>
          <img src={session.user?.image} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
          <div style={{ flex: 1, display: "flex", position: "relative" }}>
            <input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, padding: "10px 40px 10px 15px", borderRadius: "20px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePostComment() }}
              onFocus={(e) => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            <button 
              onClick={() => handlePostComment()} disabled={submitting || !newComment.trim()}
              title="Post comment"
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: submitting || !newComment.trim() ? "var(--text-secondary)" : "var(--text-primary)", transition: "color 0.2s" }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Sign in to join the discussion.</p>
      )}

      {isLoading ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0", opacity: 0.5 }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0", fontStyle: "italic", opacity: 0.8 }}>No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              <div style={{ marginTop: "0.5rem" }}>
                {comment.replies?.map((reply) => renderComment(reply, true))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
