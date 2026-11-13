/* src/demos/background-02/AuroraBackground.jsx */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./AuroraBackground.module.css";

gsap.registerPlugin(useGSAP);

/* --------------------------------------------------
Palettes
-------------------------------------------------- */

const palettes = {
  dimaac: {
    light: ["#0f766e", "#99f6e4", "#7c3aed", "#f9a8d4"],
    dark: ["#14b8a6", "#99f6e4", "#7c3aed", "#f9a8d4"],
  },
  sunset: {
    light: ["#f97316", "#fde68a", "#e11d48", "#a855f7"],
    dark: ["#fb923c", "#fde68a", "#e11d48", "#a855f7"],
  },
  ocean: {
    light: ["#0284c7", "#a5f3fc", "#4f46e5", "#67e8f9"],
    dark: ["#38bdf8", "#a5f3fc", "#4f46e5", "#67e8f9"],
  },
  ember: {
    light: ["#dc2626", "#fdba74", "#9f1239", "#fb7185"],
    dark: ["#ef4444", "#fdba74", "#be123c", "#fb7185"],
  },
  mono: {
    light: ["#525252", "#d4d4d4", "#262626", "#a3a3a3"],
    dark: ["#d4d4d4", "#737373", "#a3a3a3", "#525252"],
  },
};

const strength = {
  light: [0.55, 0.9, 0.45, 0.55],
  dark: [0.8, 0.38, 0.62, 0.34],
};

const wordmarkInk = {
  light: ["rgba(10,10,10,0.24)", "rgba(10,10,10,0.12)", "rgba(10,10,10,0.20)"],
  dark: ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.28)"],
};

/* --------------------------------------------------
Blob Configuration
-------------------------------------------------- */

const blobs = [
  {
    x: 18,
    width: 80,
    height: 120,
    driftX: 10,
    driftY: 9,
    scale: 1.12,
    seconds: 9,
    start: 0,
  },
  {
    x: 42,
    width: 84,
    height: 140,
    driftX: -8,
    driftY: 12,
    scale: 1.08,
    seconds: 12,
    start: 0.35,
  },
  {
    x: 66,
    width: 80,
    height: 130,
    driftX: 9,
    driftY: 8,
    scale: 1.14,
    seconds: 10,
    start: 0.7,
  },
  {
    x: 88,
    width: 60,
    height: 100,
    driftX: -11,
    driftY: 11,
    scale: 1.1,
    seconds: 14,
    start: 0.15,
  },
];

/* --------------------------------------------------
Noise Texture
-------------------------------------------------- */

const noise = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.6 -0.3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* --------------------------------------------------
Theme Detection
-------------------------------------------------- */

function pageIsDark() {
  if (typeof document === "undefined") return false;

  const root = document.documentElement;
  const picked = root.getAttribute("data-theme");

  if (picked === "dark") return true;
  if (picked === "light") return false;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function watchPageTheme(onChange) {
  if (typeof document === "undefined") return () => {};

  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const query = window.matchMedia("(prefers-color-scheme: dark)");

  query.addEventListener("change", onChange);

  return () => {
    observer.disconnect();
    query.removeEventListener("change", onChange);
  };
}

/* --------------------------------------------------
Aurora Background
-------------------------------------------------- */

export default function AuroraBackground({ colors, palette = "dimaac", intensity = 0.85, blur = 48, speed = 1, position = "bottom", wordmark = null, grain = 0, theme = "auto", className = "", children }) {
  const boxRef = useRef(null);
  const blobRefs = useRef([]);
  const swings = useRef([]);
  const speedRef = useRef(speed);

  speedRef.current = speed;

  const [compact, setCompact] = useState(false);

  /* --------------------------------------------------
    Responsive Width
    -------------------------------------------------- */

  useEffect(() => {
    const box = boxRef.current;

    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setCompact((entry?.contentRect.width ?? 1000) < 640);
    });

    observer.observe(box);

    return () => observer.disconnect();
  }, []);

  /* --------------------------------------------------
    Page Theme
    -------------------------------------------------- */

  const pageDark = useSyncExternalStore(watchPageTheme, pageIsDark, () => false);

  const mode = theme === "auto" ? (pageDark ? "dark" : "light") : theme;

  /* --------------------------------------------------
    Blob Animation
    -------------------------------------------------- */

  useGSAP(
    () => {
      const box = boxRef.current;

      const elements = blobRefs.current.filter(Boolean);

      if (!box || elements.length === 0) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        swings.current = elements.map((element, index) => {
          const blob = blobs[index];

          return gsap.to(element, {
            xPercent: blob.driftX,
            yPercent: -blob.driftY,
            scale: blob.scale,
            duration: blob.seconds,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true,
          });
        });

        swings.current.forEach((swing, index) => {
          swing.progress(blobs[index].start);
          swing.timeScale(speedRef.current);
        });

        const visibility = new IntersectionObserver(([entry]) => {
          const visible = entry?.isIntersecting ?? true;

          swings.current.forEach((swing) => {
            visible ? swing.resume() : swing.pause();
          });
        });

        visibility.observe(box);

        return () => {
          visibility.disconnect();
          swings.current = [];
        };
      });

      return () => media.revert();
    },
    {
      scope: boxRef,
      dependencies: [position],
      revertOnUpdate: true,
    },
  );

  /* --------------------------------------------------
    Animation Speed
    -------------------------------------------------- */

  useEffect(() => {
    swings.current.forEach((swing) => {
      swing.timeScale(Math.max(0, speed));
    });
  }, [speed]);

  /* --------------------------------------------------
    Visual Configuration
    -------------------------------------------------- */

  const picked = colors?.length > 0 ? colors : palettes[palette][mode];

  const colourFor = (index) => picked[index % picked.length];

  const alphas = strength[mode];

  const centreY = position === "bottom" ? 100 : position === "top" ? 0 : 50;

  const layer = position === "bottom" ? styles.layerBottom : position === "top" ? styles.layerTop : styles.layerCenter;

  const ink = wordmarkInk[mode];

  const wordPlace =
    position === "bottom"
      ? {
          bottom: "-0.2em",
          backgroundImage: `linear-gradient(180deg, ${ink[0]} 0%, ${ink[1]} 55%, ${ink[2]} 100%)`,
        }
      : position === "top"
        ? {
            top: "-0.2em",
            backgroundImage: `linear-gradient(0deg, ${ink[0]} 0%, ${ink[1]} 55%, ${ink[2]} 100%)`,
          }
        : {
            top: "50%",
            transform: "translateY(-50%)",
            backgroundImage: `linear-gradient(180deg, ${ink[1]} 0%, ${ink[0]} 50%, ${ink[1]} 100%)`,
          };

  const widen = compact ? 1.7 : 1;
  const safeBlur = Math.max(0, blur);

  /* --------------------------------------------------
    Render
    -------------------------------------------------- */

  return (
    <div
      ref={boxRef}
      className={`${styles.aurora} ${className}`}
    >
      <div
        aria-hidden='true'
        className={`${styles.glowLayer} ${layer}`}
        style={{
          opacity: Math.min(1, Math.max(0, intensity)),
        }}
      >
        {blobs.map((blob, index) => (
          <div
            key={index}
            ref={(element) => {
              blobRefs.current[index] = element;
            }}
            className={styles.blob}
            style={{
              left: `${blob.x - (blob.width * widen) / 2}%`,
              top: `${centreY - blob.height / 2}%`,
              width: `${blob.width * widen}%`,
              height: `${blob.height}%`,
              backgroundImage: `radial-gradient(closest-side, color-mix(in srgb, ${colourFor(index)} ${alphas[index] * 100}%, transparent), transparent 70%)`,
              filter: safeBlur > 0 ? `blur(${safeBlur}px)` : undefined,
            }}
          />
        ))}
      </div>

      {wordmark && (
        <div
          aria-hidden='true'
          className={styles.wordmark}
          style={wordPlace}
        >
          {wordmark}
        </div>
      )}

      {grain > 0 && (
        <div
          aria-hidden='true'
          className={styles.grain}
          style={{
            backgroundImage: noise,
            opacity: Math.min(1, grain * 5),
          }}
        />
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
}
