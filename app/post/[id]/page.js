import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true }
  });

  if (!post) return { title: "Post Not Found | Verso" };

  const displayName = post.author?.displayName || post.author?.name || "Anonymous";
  const snippet = post.content.length > 160 
    ? post.content.substring(0, 157) + "..." 
    : post.content;

  return {
    title: `A piece by ${displayName} | Verso`,
    description: snippet,
    openGraph: {
      title: `A piece by ${displayName} on Verso`,
      description: snippet,
      type: "article",
      siteName: "Verso",
      images: [
        {
          url: `/api/og?id=${post.id}&v=${new Date().getTime()}`,
          width: 1200,
          height: 630,
          alt: "Verso preview",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `A piece by ${displayName} on Verso`,
      description: snippet,
      images: [`/api/og?id=${post.id}&v=${new Date().getTime()}`],
    },
  };
}

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
        }
      },
      likes: {
        select: {
          userId: true,
        }
      },
    }
  });

  if (!post) notFound();

  return (
    <div 
      className="single-post-container" 
      style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        padding: "2rem 1rem",
        animation: "fadeIn 0.5s ease-out" 
      }}
    >
      <Link 
        href="/" 
        className="btn btn-outline" 
        style={{ marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
      >
        <ArrowLeft size={18} />
        Back to Feed
      </Link>
      
      <div 
        className="focused-post"
        style={{
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden"
        }}
      >
        <PostCard post={post} />
      </div>

      <CommentSection postId={post.id} />

      {/* Note: fadeIn animation is already handled by inline style + some global CSS or simple transition */}
    </div>
  );
}

