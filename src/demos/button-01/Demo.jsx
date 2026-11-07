/* src/demos/button-01/Demo.jsx */

"use client";

import styles from "./Demo.module.css";

const SCRIBBLE = "M0 22C0 22 7 3.5 15.8 5 26 6.8 6.4 21 13 29 23.4 40.6 29.8-7.4 42.8 1.6 53.6 9 27.8 26.4 38.2 34.4 51.2 44 58.4-7.4 67.4 6 72.4 13.6 58.4 30 67.4 30 71 30 75 20 75 20";

function ScribbleFillButton({ children, href, color = "#ff5400", plate = "#fdf8f5", ink = "#000", duration = 0.5 }) {
  return (
    <a
      href={href}
      className={styles.button}
      style={{
        "--scribble-color": color,
        "--plate-color": plate,
        "--ink-color": ink,
        "--in": `${duration}s`,
        "--out": `${duration / 1.4}s`,
      }}
    >
      <svg
        aria-hidden='true'
        viewBox='0 0 75 36'
        preserveAspectRatio='xMidYMid slice'
        className={styles.scribble}
      >
        <path
          d={SCRIBBLE}
          pathLength='1'
          stroke={color}
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
          className={styles.scribblePath}
        />
      </svg>

      <span className={styles.label}>{children}</span>
    </a>
  );
}

export default function Demo() {
  return (
    <main className={styles.demo}>
      <nav
        className={styles.nav}
        aria-label='Main navigation'
      >
        <ScribbleFillButton href='/work'>Work</ScribbleFillButton>

        <ScribbleFillButton href='/about'>About us</ScribbleFillButton>

        <ScribbleFillButton href='/services'>Services</ScribbleFillButton>

        <ScribbleFillButton href='/contact'>Contact</ScribbleFillButton>
      </nav>
    </main>
  );
}
