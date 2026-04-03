"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Only show the floating toggle to logged in users, and usually only on feed/explore pages.
  // We can show it everywhere, or conditionally. The user said "bring it from navbar to bottom... easy to access".
  if (!session) return null;
  if (pathname === "/onboarding") return null;

  return (
    <div className="bottom-switcher-container">
      <div className="bottom-switcher">
        <Link href="/" className={`switcher-btn ${pathname === '/' ? 'active' : ''}`}>
          <BookOpen size={16} />
          <span>My Feed</span>
        </Link>
        <Link href="/explore" className={`switcher-btn ${pathname === '/explore' ? 'active' : ''}`}>
          <Compass size={16} />
          <span>Explore</span>
        </Link>
      </div>
    </div>
  );
}
