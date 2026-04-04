import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetUserId = params.id;
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check existing follow relationship
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow (Cancel request or remove follower)
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false, isPending: false });
    } else {
      // Instant Follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
          status: "ACCEPTED",
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: currentUserId,
          type: "FOLLOW",
        },
      });

      return NextResponse.json({ message: "Successfully followed", isFollowing: true, isPending: false });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Failed to process follow" }, { status: 500 });
  }
}
