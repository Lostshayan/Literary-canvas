import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, displayName: true, image: true } },
        likes: true,
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, displayName: true, image: true } },
            likes: true,
          }
        }
      }
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { text, parentId } = body;

    if (!text || text.trim() === "") {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        postId: params.id,
        authorId: session.user.id,
        parentId: parentId || null
      },
      include: {
        author: { select: { id: true, name: true, displayName: true, image: true } },
        likes: true,
        replies: true, // newly created comment won't have replies yet, but good for type matching
      }
    });

    // Notify post author (if not self)
    const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (post && post.authorId !== session.user.id && !parentId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: session.user.id,
          type: "COMMENT",
          postId: params.id,
          commentId: comment.id,
        }
      });
    }

    // Notify parent comment author (if reply to another comment)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
      if (parentComment && parentComment.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            actorId: session.user.id,
            type: "REPLY",
            postId: params.id,
            commentId: comment.id,
          }
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
