import { NextResponse as Response } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true, image: true },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(posts);
  } catch (error) {
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, color } = await req.json();

    if (!content || content.split(" ").length > 120) {
      return Response.json({ error: "Invalid content length. Max ~100 words allowed." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        color: color || "#F5F5DC", // default beige
        authorId: session.user.id,
      },
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error("DEBUG POST ERROR:", error);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
