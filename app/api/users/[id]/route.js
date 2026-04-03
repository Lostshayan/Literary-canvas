import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = params.id;
    let currentUserId = session?.user?.id || null;

    const userProfile = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        _count: { select: { followers: true, following: true } }
      }
    });

    if (!userProfile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const posts = await prisma.post.findMany({
      where: { authorId: targetUserId },
      include: {
        author: { select: { name: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let followStatus = null; // NONE, PENDING, ACCEPTED
    if (currentUserId && currentUserId !== targetUserId) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } }
      });
      followStatus = follow ? follow.status : "NONE";
    }

    return NextResponse.json({ profile: userProfile, posts, followStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
