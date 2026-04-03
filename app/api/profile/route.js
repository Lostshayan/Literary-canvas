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
      select: { bio: true, _count: { select: { followers: true, following: true } } }
    });

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
    return Response.json({ posts, profile: userProfile });
  } catch (error) {
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { bio } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { bio },
    });

    return Response.json({ message: "Bio updated successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to update bio" }, { status: 500 });
  }
}
