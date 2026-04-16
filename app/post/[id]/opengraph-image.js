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
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true }
  });

  if (!post) {
      return new Response('Not Found', { status: 404 });
  }

  // Fetch Playfair Display font from Google Fonts
  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvPreSCwDcUEytqnElXbd88OC-sc6_937FbnB-Wf7X.ttf')
  ).then((res) => res.arrayBuffer());

  const displayName = post.author?.displayName || post.author?.name || "Anonymous";
  const origin = 'https://literary-canvas.vercel.app';
  const avatarUrl = post.author?.image 
    ? (post.author.image.startsWith('http') ? post.author.image : `${origin}${post.author.image}`)
    : null;

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
          position: 'relative',
        }}
      >
        {/* Background Texture Overlay (Simulated) */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.02)',
          }}
        />

        {/* Verso Branding */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '28px', fontFamily: 'Playfair Display', color: '#7A6F65', fontWeight: 600 }}>
            Verso
          </div>
        </div>

        {/* Post Card Mimic */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(56, 48, 42, 0.15)',
            border: '1px solid #E8DDCE',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Post Content */}
          <div
            style={{
              fontSize: post.content.length > 100 ? '42px' : '54px',
              fontFamily: 'Playfair Display',
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: '3px solid #E8DDCE',
                }}
              />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#E8DDCE' }} />
            )}
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
      fonts: [
        {
          name: 'Playfair Display',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}
