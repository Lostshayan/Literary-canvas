"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { PenSquare, User, LogOut, LogIn, Compass, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "./Providers";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
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
            <Link href="/notifications" onClick={() => setHasUnread(false)} className="btn btn-ghost" title="Notifications" style={{ position: "relative" }}>
              <Bell size={18} />
              {hasUnread && <span style={{ position: "absolute", top: "4px", right: "6px", width: "8px", height: "8px", backgroundColor: "var(--error)", borderRadius: "50%" }}></span>}
            </Link>

            <Link href="/add" className="btn btn-primary">
              <PenSquare size={18} />
              <span className="hide-mobile">Write</span>
            </Link>

            <Link href="/profile" className="btn btn-outline" style={{ borderRadius: "50%", padding: "0.5rem" }} title="Profile">
              {session.user.image ? (
                <img src={session.user.image} alt="Profile" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <User size={20} />
              )}
            </Link>
            
            <button onClick={() => signOut()} className="btn btn-ghost" title="Logout">
              <LogOut size={20} />
            </button>
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
