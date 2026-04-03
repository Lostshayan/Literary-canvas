import "./globals.css";
import Providers from "@/components/Providers";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Verso",
  description: "A digital social network for short poetic texts and handmade literary pieces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <svg width="0" height="0" style={{ position: "absolute", display: "none" }}>
          <filter id="torn-edge" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <Providers>
          <BackgroundEffects />
          <div className="container" style={{ paddingBottom: "6rem" }}>
            <Navbar />
            <main>{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
