"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Preset colors for the pastel/beige aesthetic
const colors = [
  "#F5F5DC", // Default Beige
  "#FDF5E6", // Old Lace
  "#FFF5EE", // Seashell
  "#FAF0E6", // Linen
  "#E8E4C9", // Soft olive beige
  "#E6DED5", // Warm gray beige
  "#DCD0C0", // Earthy beige
  "#F8E1E7", // Soft warm pink
];

export default function AddPostPage() {
  const { data: session, status } = useSession({
    required: true,
  });
  const router = useRouter();

  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > 120;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverLimit || wordCount === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, color: selectedColor }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create post.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return null; // or a loader
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem 0 2rem" }}>
      <button
        onClick={() => router.back()}
        className="btn btn-outline"
        style={{ marginBottom: "1rem", gap: "0.4rem" }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="literary-text" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
        Write something beautiful
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="post-card" style={{ padding: "0", marginBottom: "1rem" }}>
          <div className="post-card-background" style={{ backgroundColor: selectedColor }} />

          <div style={{ padding: "2rem", transition: "background-color 0.3s ease", position: "relative", zIndex: 1 }}>
            <textarea
              className="literary-text"
              placeholder="A poem, a quote, a fleeting thought..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ 
                backgroundColor: "transparent", 
                border: "none", 
                fontSize: "1.25rem", 
                minHeight: "200px",
                resize: "none",
                color: "#38302A",
              }}
            />
          </div>

          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500" }}>
              Choose a background color
            </label>
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${selectedColor === color ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action row lives OUTSIDE post-card so dark mode vars aren't overridden */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className={`word-count ${isOverLimit ? "limit" : ""}`}>
            {wordCount} / 100 words
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || isOverLimit || wordCount === 0}
          >
            {loading ? "Publishing..." : "Publish to Verso"}
          </button>
        </div>

        {error && <p style={{ color: "var(--error)", marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>}
      </form>
    </div>
  );
}
