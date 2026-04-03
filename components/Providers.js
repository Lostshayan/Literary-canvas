"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useContext, useState, useEffect } from "react";

// ─── Theme Context ─────────────────────────────────────────────────────────
const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

// ─── Avatar Context ────────────────────────────────────────────────────────
const AvatarContext = createContext({ avatar: null, setAvatar: () => {} });
export const useAvatar = () => useContext(AvatarContext);

// Inner component so we can use useSession (must be inside SessionProvider)
function AvatarProvider({ children }) {
  const { data: session, status } = useSession();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch the DB image (may differ from Google OAuth image)
      fetch("/api/profile")
        .then(r => r.json())
        .then(data => {
          const img = data.profile?.image || session?.user?.image || null;
          setAvatar(img);
        })
        .catch(() => setAvatar(session?.user?.image || null));
    }
  }, [status]);

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

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
