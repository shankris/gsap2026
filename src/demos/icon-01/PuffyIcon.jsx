/* src/demos/icon-01/PuffyIcon.jsx */

"use client";

import { useEffect, useRef } from "react";
import { acquireStage, releaseStage } from "./stage";
import styles from "./Demo.module.css";

// A 4-point sparkle with softened tips.
const SPARKLE = '<svg viewBox="0 0 24 24"><path d="M11.4 3.2C11.6 2.6 12.4 2.6 12.6 3.2C13.6 8.4 15.6 10.4 20.8 11.4C21.4 11.6 21.4 12.4 20.8 12.6C15.6 13.6 13.6 15.6 12.6 20.8C12.4 21.4 11.6 21.4 11.4 20.8C10.4 15.6 8.4 13.6 3.2 12.6C2.6 12.4 2.6 11.6 3.2 11.4C8.4 10.4 10.4 8.4 11.4 3.2Z"/></svg>';

export default function PuffyIcon({ svg = SPARKLE, color = "#ffffff", iconColor = "#111111", roundness = 0.3, puff = 0.33, iconScale = 0.58, iconDepth = 0.14, rest = [-8, -18], tilt = 14, className = "" }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  const [restX, restY] = rest;

  useEffect(() => {
    const root = rootRef.current;
    const target = canvasRef.current?.getContext("2d");

    if (!root || !target) return;

    const stage = acquireStage();

    const icon = stage.add(
      {
        svg,
        color,
        iconColor,
        roundness,
        puff,
        iconScale,
        iconDepth,
      },
      target,
    );

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const angle = {
      x: restX,
      y: restY,
    };

    const goal = {
      x: restX,
      y: restY,
    };

    let raf = 0;
    let visible = false;

    // Ease toward the goal, rendering only while the tile is moving.
    const tick = () => {
      raf = 0;

      angle.x += (goal.x - angle.x) * 0.12;
      angle.y += (goal.y - angle.y) * 0.12;

      stage.draw(icon, angle.x, angle.y);

      if (Math.abs(goal.x - angle.x) + Math.abs(goal.y - angle.y) > 0.01) {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (!raf && visible) {
        raf = requestAnimationFrame(tick);
      }
    };

    // Update rendering resolution when the icon changes size.
    const resizeObserver = new ResizeObserver(() => {
      icon.pixels = Math.round(root.clientWidth * Math.min(window.devicePixelRatio || 1, 2));

      stage.draw(icon, angle.x, angle.y);
    });

    resizeObserver.observe(root);

    // Skip rendering while the icon is outside the viewport.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });

    intersectionObserver.observe(root);

    // Lean toward the pointer, measured from the tile's centre.
    const onMove = (event) => {
      const rect = root.getBoundingClientRect();

      const dx = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (window.innerWidth / 2)));

      const dy = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (window.innerHeight / 2)));

      goal.x = restX + dy * tilt;
      goal.y = restY + dx * tilt;

      wake();
    };

    if (tilt && !still) {
      window.addEventListener("pointermove", onMove);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);

      intersectionObserver.disconnect();
      resizeObserver.disconnect();

      stage.remove(icon);
      releaseStage();
    };
  }, [svg, color, iconColor, roundness, puff, iconScale, iconDepth, restX, restY, tilt]);

  return (
    <div
      ref={rootRef}
      className={`${styles.iconCanvas} ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden='true'
        className={styles.canvas}
      />
    </div>
  );
}
