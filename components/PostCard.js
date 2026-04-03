"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function PostCard({ post }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  
  // Calculate if the current user liked it
  const isInitiallyLiked = session?.user && post.likes?.some(l => l.userId === session.user.id);
  const [liked, setLiked] = useState(isInitiallyLiked || false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      alert("Please sign in to like posts.");
      return;
    }
    
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (res.ok) {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-card-background" style={{ backgroundColor: post.color }} />
      <p className="post-content literary-text">{post.content}</p>
      
      <div className="post-footer">
        <Link href={`/users/${post.authorId}`} className="post-author" style={{ textDecoration: "none" }}>
          {post.author?.image ? (
            <img src={post.author.image} alt={post.author.name} className="author-avatar" />
          ) : (
            <div className="author-avatar" />
          )}
          <span>{post.author?.name?.split(" ")[0] || "Anonymous"}</span>
        </Link>
        
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
  );
}
