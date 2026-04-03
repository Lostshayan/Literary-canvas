"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { PenSquare, LogIn, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "./Providers";
import { useAvatar } from "./Providers";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { avatar } = useAvatar();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/notifications").then(res => res.json()).then(data => {
        if (data.pendingRequests?.length > 0 || data.notifications?.some(n => !n.read)) {
          setHasUnread(true);
        }
      }).catch(e => console.error(e));
    }
  }, [session]);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Verso
      </Link>

      <div className="navbar-actions">
        <button onClick={toggleTheme} className="btn btn-ghost" title="Toggle Dark Mode">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {session ? (
          <>
            <Link
              href="/notifications"
              onClick={() => setHasUnread(false)}
              className="btn btn-ghost"
              title="Notifications"
              style={{ position: "relative" }}
            >
              <Bell size={18} />
              {hasUnread && (
                <span style={{
                  position: "absolute", top: "4px", right: "6px",
                  width: "8px", height: "8px",
                  backgroundColor: "var(--error)", borderRadius: "50%"
                }} />
              )}
            </Link>

            <Link href="/add" className="btn btn-primary" title="Write">
              <PenSquare size={18} />
              <span className="hide-mobile">Write</span>
            </Link>

            <Link href="/profile" className="navbar-avatar" title="Profile">
              {(avatar || session?.user?.image) ? (
                <img src={avatar || session.user.image} alt="Profile" />
              ) : (
                <div className="navbar-avatar-fallback" />
              )}
            </Link>
          </>
        ) : (
          <button onClick={() => signIn("google")} className="btn btn-primary">
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
