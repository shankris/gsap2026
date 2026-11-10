// src/demos/darkMode-01/Demo.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Demo.module.css";

export default function Demo() {
  const [isLight, setIsLight] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const cardRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef = useRef(null);

  // Restore the saved theme after the initial render.
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("preferred-theme");
      setIsLight(savedTheme === "light");
    } catch {
      // Keep dark mode if browser storage is unavailable.
    }

    setIsReady(true);
  }, []);

  // Save the selected theme and update the browser theme color.
  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem("preferred-theme", isLight ? "light" : "dark");
    } catch {
      // The switch still works if browser storage is unavailable.
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');

    themeMeta?.setAttribute("content", isLight ? "#e9edf5" : "#0b0d12");
  }, [isLight, isReady]);

  // Custom cursor for mouse-like devices.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!finePointer.matches) return;

    const ring = cursorRingRef.current;
    const dot = cursorDotRef.current;
    const card = cardRef.current;

    if (!ring || !dot || !card) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let cursorVisible = false;
    let animationFrame = null;

    const updateCursor = () => {
      dot.style.transform = `translate3d(${mouseX - 2.5}px, ${mouseY - 2.5}px, 0)`;

      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      ring.style.transform = `translate3d(${ringX - ring.offsetWidth / 2}px, ` + `${ringY - ring.offsetHeight / 2}px, 0)`;

      if (cursorVisible) {
        animationFrame = requestAnimationFrame(updateCursor);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse") return;

      mouseX = event.clientX;
      mouseY = event.clientY;

      const rect = card.getBoundingClientRect();

      card.style.setProperty("--mouse-x", `${mouseX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${mouseY - rect.top}px`);

      if (!cursorVisible) {
        cursorVisible = true;
        ringX = mouseX;
        ringY = mouseY;

        ring.style.opacity = "1";
        dot.style.opacity = "1";

        cancelAnimationFrame(animationFrame);
        updateCursor();
      }
    };

    const handlePointerOut = (event) => {
      if (event.relatedTarget) return;

      cursorVisible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";

      cancelAnimationFrame(animationFrame);
    };

    const handlePointerOver = (event) => {
      if (event.target.closest("label, input, button, a, [role='button']")) {
        ring.classList.add(styles.isHovering);
      }
    };

    const handlePointerLeave = (event) => {
      if (event.target.closest("label, input, button, a, [role='button']")) {
        ring.classList.remove(styles.isHovering);
      }
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === "mouse") {
        ring.classList.add(styles.isPressed);
      }
    };

    const handlePointerUp = () => {
      ring.classList.remove(styles.isPressed);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerLeave);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      cancelAnimationFrame(animationFrame);

      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerLeave);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <main className={`${styles.scene} ${isLight ? styles.lightTheme : ""}`}>
      <div className={`${styles.ambient} ${styles.ambientOne}`} />
      <div className={`${styles.ambient} ${styles.ambientTwo}`} />

      <section
        className={styles.themeCard}
        ref={cardRef}
      >
        <div className={styles.cardTop}>
          <span className={styles.eyebrow}>INTERFACE / #470</span>
          <span className={styles.liveDot} />
        </div>

        <div className={styles.preview}>
          <div className={`${styles.previewOrbit} ${styles.orbitOne}`} />
          <div className={`${styles.previewOrbit} ${styles.orbitTwo}`} />

          <div className={styles.previewIcon}>
            <svg
              className={styles.sunIcon}
              viewBox='0 0 100 100'
              aria-hidden='true'
            >
              <circle
                cx='50'
                cy='50'
                r='17'
              />
              <g strokeLinecap='round'>
                <path d='M50 8v12 M50 80v12 M8 50h12 M80 50h12' />
                <path d='m20.3 20.3 8.5 8.5 M71.2 71.2l8.5 8.5' />
                <path d='m79.7 20.3-8.5 8.5 M28.8 71.2l-8.5-8.5' />
              </g>
            </svg>

            <svg
              className={styles.moonIcon}
              viewBox='0 0 100 100'
              aria-hidden='true'
            >
              <path d='M72 65A35 35 0 0 1 35 28a35 35 0 1 0 37 37Z' />
              <path
                className={styles.moonStar}
                d='M70 20v12 M64 26h12'
              />
              <circle
                className={styles.moonStar}
                cx='80'
                cy='43'
                r='2'
              />
            </svg>
          </div>

          <div
            className={styles.stars}
            aria-hidden='true'
          >
            <span>✦</span>
            <span>·</span>
            <span>✧</span>
            <span>·</span>
          </div>
        </div>

        <div className={styles.themeInfo}>
          <span className={styles.eyebrow}>YOUR ENVIRONMENT</span>

          <h1 className={styles.themeTitle}>
            {isLight ? "Light" : "Dark"} <span>mode.</span>
          </h1>

          <p className={styles.themeDescription}>{isLight ? "A little more light. A fresh perspective." : "A little less light. A little more focus."}</p>
        </div>

        <label className={styles.toggle}>
          <input
            type='checkbox'
            checked={isLight}
            onChange={(event) => setIsLight(event.target.checked)}
            aria-label='Switch between dark and light themes'
          />

          <span className={styles.toggleTrack}>
            <span className={styles.trackGlow} />

            <span className={`${styles.trackLabel} ${styles.trackLabelDark}`}>DARK</span>

            <span className={`${styles.trackLabel} ${styles.trackLabelLight}`}>LIGHT</span>

            <span className={styles.toggleThumb}>
              <svg
                className={styles.thumbMoon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path d='M19 15.3A8 8 0 0 1 8.7 5a8 8 0 1 0 10.3 10.3Z' />
              </svg>

              <svg
                className={styles.thumbSun}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <circle
                  cx='12'
                  cy='12'
                  r='4'
                />
                <path d='M12 2v2 M12 20v2 M4.93 4.93l1.42 1.42 M17.65 17.65l1.42 1.42 M2 12h2 M20 12h2 M4.93 19.07l1.42-1.42 M17.65 6.35l1.42-1.42' />
              </svg>
            </span>
          </span>
        </label>

        <div className={styles.cardBottom}>
          <span className={styles.status}>
            <span className={styles.statusDot} />
            <span>{isLight ? "DAYLIGHT ACTIVE" : "NIGHT MODE ACTIVE"}</span>
          </span>

          <span className={styles.themeCode}>
            THM—<span>{isLight ? "02" : "01"}</span>
          </span>
        </div>
      </section>

      <div className={styles.sceneCaption}>
        <span>DESIGNED FOR YOUR EYES</span>
        <span>DAY / NIGHT</span>
      </div>

      <div
        ref={cursorRingRef}
        className={`${styles.customCursor} ${styles.cursorRing}`}
        aria-hidden='true'
      />

      <div
        ref={cursorDotRef}
        className={`${styles.customCursor} ${styles.cursorDot}`}
        aria-hidden='true'
      />
    </main>
  );
}
