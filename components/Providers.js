"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─── Theme Context ─────────────────────────────────────────────────────────
const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

// ─── Avatar Context ────────────────────────────────────────────────────────
const AvatarContext = createContext({ avatar: null, setAvatar: () => {} });
export const useAvatar = () => useContext(AvatarContext);

// Inner component — runs inside SessionProvider so useSession works
function AvatarProvider({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        // Set the avatar from DB (overrides Google auth image)
        const img = data.profile?.image || session?.user?.image || null;
        setAvatar(img);

        // Onboarding guard — if no display name and not already there
        if (!data.profile?.displayName && pathname !== "/onboarding") {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        setAvatar(session?.user?.image || null);
      });
  }, [status]);

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

// ─── Root Provider ──────────────────────────────────────────────────────────
export default function Providers({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <SessionProvider>
        <AvatarProvider>
          {children}
        </AvatarProvider>
      </SessionProvider>
    </ThemeContext.Provider>
  );
}
