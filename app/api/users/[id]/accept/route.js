import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const followerId = params.id;
    const currentUserId = session.user.id; // The person accepting (the 'followingId')

    const body = await req.json();
    const { action } = body; // "ACCEPT" or "DECLINE"

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: currentUserId,
        },
      },
    });

    if (!existingFollow || existingFollow.status !== "PENDING") {
      return NextResponse.json({ error: "No pending request found" }, { status: 404 });
    }

    if (action === "DECLINE") {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return NextResponse.json({ message: "Request declined" });
    }

    // Accept request
    await prisma.follow.update({
      where: { id: existingFollow.id },
      data: { status: "ACCEPTED" },
    });

    // Create notification to alert them it was accepted
    await prisma.notification.create({
      data: {
        userId: followerId,
        actorId: currentUserId,
        type: "FOLLOW_ACCEPTED",
      },
    });

    return NextResponse.json({ message: "Request accepted" });
  } catch (error) {
    console.error("Accept error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
