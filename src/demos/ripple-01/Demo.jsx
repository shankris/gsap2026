"use client";

// src/demos/ripple-01/Demo.jsx

import { useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const rippleButtons = [
  { id: "circle", label: "Circle Ripple" },
  { id: "radial", label: "Radial Gradient" },
  { id: "polygon", label: "Polygon Ripple" },
  { id: "linear", label: "Linear Gradient" },
];

function RippleButton({ id, label }) {
  const buttonRef = useRef(null);
  const rippleRef = useRef(null);
  const animationRef = useRef(null);
  const svgRef = useRef(null);

  const positionRef = useRef(null);

  const handleClick = (event) => {
    const button = buttonRef.current;
    const ripple = rippleRef.current;

    if (!button || !ripple) return;

    const rect = button.getBoundingClientRect();
    svgRef.current?.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

    animationRef.current?.kill();

    gsap.set(positionRef.current, {
      attr: {
        transform: `translate(${x} ${y})`,
      },
    });

    gsap.set(ripple, {
      attr: {
        transform: "scale(0)",
      },
      opacity: 1,
    });

    animationRef.current = gsap.to(ripple, {
      attr: {
        transform: `scale(${radius})`,
      },
      opacity: 0,
      duration: 0.75,
      ease: "power1.out",
      onComplete: () => {
        gsap.set(positionRef.current, {
          clearProps: "all",
          attr: { transform: "" },
        });
        gsap.set(ripple, {
          clearProps: "all",
          attr: { transform: "" },
        });
      },
    });
  };

  return (
    <button
      ref={buttonRef}
      className={`${styles.button} ${styles[id]}`}
      type='button'
      onClick={handleClick}
    >
      <span className={styles.buttonLabel}>{label}</span>

      <svg
        ref={svgRef}
        className={styles.rippleSvg}
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        aria-hidden='true'
      >
        <defs>
          <radialGradient id={`radial-${id}`}>
            <stop
              offset='0%'
              stopColor='#ffffff'
              stopOpacity='0.9'
            />
            <stop
              offset='100%'
              stopColor='#ffffff'
              stopOpacity='0'
            />
          </radialGradient>

          <linearGradient
            id={`linear-${id}`}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop
              offset='0%'
              stopColor='#ffdf76'
            />
            <stop
              offset='50%'
              stopColor='#ff7b54'
            />
            <stop
              offset='100%'
              stopColor='#e73f73'
            />
          </linearGradient>
        </defs>
        <g ref={positionRef}>
          <g
            ref={rippleRef}
            className={styles.rippleShape}
          >
            {id === "circle" && (
              <circle
                cx='0'
                cy='0'
                r='1'
                fill='#0c7cd5'
              />
            )}

            {id === "radial" && (
              <circle
                cx='0'
                cy='0'
                r='1'
                fill={`url(#radial-${id})`}
              />
            )}

            {id === "polygon" && (
              <polygon
                points='0,-1 1,0 0,1 -1,0'
                fill='#e85b45'
              />
            )}

            {id === "linear" && (
              <rect
                x='-1'
                y='-1'
                width='2'
                height='2'
                fill={`url(#linear-${id})`}
              />
            )}
          </g>
        </g>
      </svg>
    </button>
  );
}

export default function Demo() {
  return (
    <main className={styles.stage}>
      <section className={styles.demo}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>SVG interaction</p>
          <h1 className={styles.title}>Ripple effects</h1>
          <p className={styles.description}>Click a button to see its ripple.</p>
        </header>

        <div className={styles.buttonGrid}>
          {rippleButtons.map((button) => (
            <RippleButton
              key={button.id}
              id={button.id}
              label={button.label}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
