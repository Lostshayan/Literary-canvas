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

    // SAFE SATORI UI (No BoxShadow, No Inset Absolutes)
    const displayName = post.author?.displayName || post.author?.name || "Anonymous";

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDF9F1',
            padding: '80px',
          }}
        >
          {/* Verso Branding */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '60px',
              display: 'flex',
              fontSize: '28px',
              color: '#7A6F65',
              fontWeight: 600,
            }}
          >
            Verso
          </div>

          {/* Post Card Mimic */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E8DDCE',
              padding: '60px',
            }}
          >
            {/* Post Content */}
            <div
              style={{
                fontSize: post.content.length > 100 ? '42px' : '54px',
                lineHeight: 1.5,
                color: '#38302A',
                marginBottom: '60px',
                textAlign: 'left',
              }}
            >
              "{post.content.length > 250 ? post.content.substring(0, 247) + '...' : post.content}"
            </div>

            {/* Footer Line */}
            <div style={{ width: '100%', height: '1px', backgroundColor: '#E8DDCE', marginBottom: '30px' }} />

            {/* Author Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '35px', 
                backgroundColor: '#E8DDCE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#7A6F65',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#38302A' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '18px', color: '#7A6F65', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Literary Collector
                </div>
              </div>
            </div>
          </div>
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
