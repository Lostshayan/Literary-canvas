import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const followingRecords = await prisma.follow.findMany({
      where: { followerId: session.user.id, status: "ACCEPTED" },
      select: { followingId: true },
    });

    const followingIds = followingRecords.map((record) => record.followingId);

    // Include the user's own posts in their feed
    const authorIds = [...new Set([...followingIds, session.user.id])];

    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      include: {
        author: { select: { id: true, name: true, displayName: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
