import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const commentId = params.commentId;
    const userId = session.user.id;

    // Check if like exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      // Notify comment author
      const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true, postId: true } });
      if (comment && comment.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            actorId: userId,
            type: "COMMENT_LIKE",
            postId: comment.postId,
            commentId: comment.id,
          }
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
