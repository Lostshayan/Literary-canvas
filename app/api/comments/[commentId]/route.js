import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const unawaitedParams = await params;
    const commentId = unawaitedParams.commentId;

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (existingComment.authorId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
