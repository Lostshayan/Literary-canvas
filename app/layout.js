import "./globals.css";
import Providers from "@/components/Providers";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const metadata = {
  title: "Verso",
  description: "A private social network for short poetic texts and literary pieces.",
  manifest: "/manifest.json",
  themeColor: "#38302A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verso",
  },
  icons: {
    apple: "/icon-192.png",
  },
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
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
