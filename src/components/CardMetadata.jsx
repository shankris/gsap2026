"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import styles from "./CardMetadata.module.css";

function getRelativeTime(dateString) {
  if (!dateString) return "—";

  const difference = Date.now() - new Date(dateString).getTime();

  if (!Number.isFinite(difference) || difference < 0) {
    return "—";
  }

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;

  return `${years}y ago`;
}

export default function CardMetadata({ slug, rating = 0 }) {
  const [lastViewed, setLastViewed] = useState(null);

  useEffect(() => {
    const storageKey = "gsap-last-viewed";

    function readLastViewed() {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");

      setLastViewed(stored[slug] || null);
    }

    readLastViewed();

    window.addEventListener("storage", readLastViewed);

    return () => {
      window.removeEventListener("storage", readLastViewed);
    };
  }, [slug]);

  return (
    <div className={styles.metadata}>
      <div>
        <span>Rating</span>

        <div className={styles.rating}>
          {Array.from({ length: Math.min(5, Math.max(0, Number(rating) || 0)) }).map((_, index) => (
            <Star
              key={index}
              size={15}
              fill='currentColor'
              strokeWidth={1.5}
            />
          ))}
          {(!rating || rating <= 0) && <span>—</span>}
        </div>
      </div>

      <div>
        <span>Last view</span>
        <strong>{getRelativeTime(lastViewed)}</strong>
      </div>
    </div>
  );
}
