import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: { content: content.trim() },
    });
    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

