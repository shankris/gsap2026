"use client";

// src/demos/mis-04-heart/Demo.jsx

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

export default function Demo() {
  const [isOriginalActive, setIsOriginalActive] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const numberRef = useRef(null);

  const count = isLiked ? 11 : 10;

  useEffect(() => {
    if (!numberRef.current) return;

    gsap.fromTo(
      numberRef.current,
      {
        yPercent: isLiked ? 100 : -100,
        opacity: 0,
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      },
    );
  }, [isLiked]);

  return (
    <main className={styles.stage}>
      {/* Original heart animation */}
      <section className={styles.original}>
        <button
          type='button'
          className={`${styles.originalHeart} ${isOriginalActive ? styles.isActive : ""}`}
          onClick={() => setIsOriginalActive((previous) => !previous)}
          aria-label={isOriginalActive ? "Reset heart" : "Animate heart"}
          aria-pressed={isOriginalActive}
        />
      </section>

      {/* Example content card */}
      <section className={styles.cardSection}>
        <article className={styles.card}>
          <div className={styles.cardImage}>
            <img
              src='/demos/mis-04-heart/lake.jpg'
              alt='Warm morning sunlight over a peaceful landscape'
            />
          </div>

          <div className={styles.cardContent}>
            <span className={styles.cardCategory}>JOURNAL · INSPIRATION</span>
            <h2>A moment worth remembering</h2>
            <p>Sometimes the simplest moments leave the strongest impressions. Take a little time to slow down, look around, and appreciate what's right in front of you.</p>
            <div className={styles.cardFooter}>
              <span className={styles.cardDate}>20 Nov 2026</span>
              <button
                type='button'
                className={styles.likeButton}
                onClick={() => setIsLiked((previous) => !previous)}
                aria-label={isLiked ? "Unlike" : "Like"}
                aria-pressed={isLiked}
              >
                <span
                  className={`${styles.smallHeart} ${isLiked ? styles.isActive : ""}`}
                  aria-hidden='true'
                />

                <span className={styles.countWindow}>
                  <span ref={numberRef}>{count}</span>
                </span>
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
