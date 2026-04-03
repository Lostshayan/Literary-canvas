"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ONBOARDING_PATH = "/onboarding";

export default function OnboardingGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { setChecked(true); return; }

    // Already on onboarding page — don't loop
    if (window.location.pathname === ONBOARDING_PATH) { setChecked(true); return; }

    // Check if the user has completed onboarding (has a displayName)
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        if (!data.profile?.displayName) {
          router.replace(ONBOARDING_PATH);
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [status]);

  return null; // Renders nothing — just a guard
}
