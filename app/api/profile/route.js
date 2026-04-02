import { NextResponse as Response } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
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
    return Response.json({ error: "Failed to fetch profile posts" }, { status: 500 });
  }
}
