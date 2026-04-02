"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { PenSquare, User, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Literary Canvas
      </Link>

      <div className="navbar-actions">
        {session ? (
          <>
            <Link href="/add" className="btn btn-primary">
              <PenSquare size={18} />
              <span>Write</span>
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
