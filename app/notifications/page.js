"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LiteraryLoader from "@/components/LiteraryLoader";
import { Check, X, Bell } from "lucide-react";
import Link from "next/link";

export default function Notifications() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ notifications: [], pendingRequests: [] });

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Mark all as read silently
        fetch("/api/notifications", { method: "PATCH" });
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleRequest = async (followerId, action) => {
    try {
      const res = await fetch(`/api/users/${followerId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }) // "ACCEPT" or "DECLINE"
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          pendingRequests: prev.pendingRequests.filter(req => req.followerId !== followerId)
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "unauthenticated") {
    return <div style={{textAlign: "center", padding: "4rem 0"}}>Please sign in to view notifications.</div>;
  }

  return (
    <div className="container" style={{ maxWidth: "600px", marginTop: "2rem" }}>
      <h1 className="literary-text" style={{ fontSize: "2rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Bell size={28} /> Activity
      </h1>

      {loading ? (
        <LiteraryLoader />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Follow Requests */}
          {data.pendingRequests.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>Follow Requests</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {data.pendingRequests.map(req => (
                  <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <img src={req.follower.image || "/placeholder.jpg"} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                      <Link href={`/users/${req.follower.id}`} style={{ fontWeight: "500" }}>{req.follower.displayName || req.follower.name}</Link>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleRequest(req.followerId, "ACCEPT")} className="btn btn-primary" style={{ padding: "0.5rem" }}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleRequest(req.followerId, "DECLINE")} className="btn btn-outline" style={{ padding: "0.5rem", color: "var(--error)", borderColor: "var(--border)" }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Notifications */}
          <div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>Recent Notifications</h2>
            {data.notifications.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No recent activity.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {data.notifications.map(notif => (
                  <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", borderBottom: "1px solid var(--border)" }}>
                    <img src={notif.actor.image || "/placeholder.jpg"} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    <p>
                      <Link href={`/users/${notif.actor.id}`} style={{ fontWeight: "600" }}>{notif.actor.displayName || notif.actor.name}</Link>
                      {" "}
                      {notif.type === "LIKE" ? "liked your post." : 
                       notif.type === "FOLLOW_REQUEST" ? "sent you a follow request." :
                       notif.type === "FOLLOW_ACCEPTED" ? "accepted your follow request!" : "interacted with you."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
