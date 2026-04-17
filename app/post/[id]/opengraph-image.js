import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export const alt = 'Verso Post Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }) {
  try {
    const resolvedParams = await params;
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: { author: true }
    });

    if (!post) {
        return new Response('Not Found', { status: 404 });
    }

    const displayName = post.author?.displayName || post.author?.name || "Anonymous";

    // ULTRA MINIMAL SATORI TO PREVENT CSS EXCEPTIONS
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', fontSize: '64px' }}>
          Hello {displayName}!
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response(`Error: ${error.message}`, {
      status: 200, // force 200 so Vercel doesn't replace it with 500 html page
    });
  }
}
