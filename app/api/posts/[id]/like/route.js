import { NextResponse as Response } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unawaitedParams = await params;
    const postId = unawaitedParams.id;
    const userId = session.user.id;

    // Check if the like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return Response.json({ message: "Unliked" }, { status: 200 });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      // Fetch post to notify author
      const post = await prisma.post.findUnique({ where: { id: postId }});
      if (post && post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: userId,
            type: "LIKE",
            postId: postId,
          }
        });
      }

      return Response.json({ message: "Liked" }, { status: 200 });
    }
  } catch (error) {
    return Response.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
