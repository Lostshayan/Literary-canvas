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

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        bio: true,
        displayName: true,
        name: true,
        _count: { select: { followers: { where: { status: "ACCEPTED" } }, following: { where: { status: "ACCEPTED" } } } }
      }
    });

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, name: true, displayName: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ posts, profile: userProfile });
  } catch (error) {
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { bio, displayName } = await req.json();

    const data = {};
    if (bio !== undefined) data.bio = bio;
    if (displayName !== undefined) data.displayName = displayName.trim().slice(0, 40);

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return Response.json({ message: "Profile updated successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
