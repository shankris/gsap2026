/* src/demos/cards-02/Demo.jsx */

"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

const DEFAULT_PROJECTS = [
  {
    title: "Northwind Outdoor",
    category: "Brand identity",
    image: img("1448375240586-882707db888b"),
    hoverImage: img("1476610182048-b716b8518aae"),
    color: "#c9f2d4",
  },
  {
    title: "Pulse Live",
    category: "Campaign",
    image: img("1501386761578-eac5c94b800a"),
    hoverImage: img("1483347756197-71ef80e95f73"),
    color: "#ffe066",
  },
  {
    title: "Atelier Haus",
    category: "Website",
    image: img("1600585154340-be6161a56a0c"),
    hoverImage: img("1473580044384-7ba9967e16a0"),
    color: "#ffd3c2",
  },
];

const SCRIBBLE = "M24 158C24 158 148-26 232 42 346 135-84 532 64 614 174 676 462-66 640 42 882 190-72 856 150 978 334 1078 522 450 658 548 796 646 410 920 494 978 578 1034 692 790 692 790";

const BRUSH = "M26 724C26 724 138 1058 288 964 502 828-160 178 92 48 314-66 460 556 612 512 762 468 612 28 612 28";

const W = 709;
const H = 1012;
const WIDTH = 1200;

export default function Demo({ projects = DEFAULT_PROJECTS, duration = 1.4, className = "" }) {
  const rootRef = useRef(null);
  const parts = useRef([]);

  const uid = useId().replace(/[^\w-]/g, "");

  const part = (i) => {
    if (!parts.current[i]) {
      parts.current[i] = {};
    }

    return parts.current[i];
  };

  useGSAP(
    () => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const duration = 1.4;
      const k = duration / 1.4;

      const off = parts.current.slice(0, projects.length).map(({ card, scribble, brush, arrow }) => {
        if (!card || !scribble || !brush || !arrow) {
          return () => {};
        }

        gsap.set([scribble, brush], {
          drawSVG: "100% 100%",
          strokeWidth: 0,
        });

        const tl = gsap
          .timeline({
            paused: true,
            defaults: {
              ease: "power1.inOut",
            },
          })
          .to(
            scribble,
            {
              drawSVG: "0% 100%",
              strokeWidth: WIDTH,
              duration: 0.95 * k,
            },
            0,
          )
          .to(
            brush,
            {
              drawSVG: "0% 100%",
              strokeWidth: WIDTH,
              duration: 1.05 * k,
            },
            0.35 * k,
          )
          .to(
            arrow,
            {
              rotation: -45,
              duration: 0.28,
              ease: "power2.out",
            },
            0,
          )
          .to(
            arrow,
            {
              rotation: 0,
              duration: 0.65,
              ease: "elastic.out(1.15, 0.35)",
            },
            0.28,
          );

        const enter = () => (still ? tl.progress(1) : tl.timeScale(1).play());

        const leave = () => (still ? tl.progress(0) : tl.timeScale(1.3).reverse());

        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        card.addEventListener("focus", enter);
        card.addEventListener("blur", leave);

        return () => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
          card.removeEventListener("focus", enter);
          card.removeEventListener("blur", leave);
        };
      });

      return () => off.forEach((cleanup) => cleanup());
    },
    {
      scope: rootRef,
      dependencies: [projects, duration],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
    >
      <div className={`${styles.grid} ${className}`}>
        {projects.map((project, i) => (
          <a
            key={project.title}
            ref={(el) => {
              if (el) part(i).card = el;
            }}
            href={project.href ?? "#"}
            className={styles.card}
          >
            <img
              src={project.image}
              alt=''
              className={styles.baseImage}
            />

            <svg
              aria-hidden='true'
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio='xMidYMid slice'
              className={styles.svg}
            >
              <path
                ref={(el) => {
                  if (el) part(i).scribble = el;
                }}
                d={SCRIBBLE}
                stroke={project.color}
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
            </svg>

            <svg
              aria-hidden='true'
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio='xMidYMid slice'
              className={styles.svg}
            >
              <mask
                id={`${uid}-${i}`}
                maskUnits='userSpaceOnUse'
                x={-200}
                y={-200}
                width={W + 400}
                height={H + 400}
              >
                <path
                  ref={(el) => {
                    if (el) part(i).brush = el;
                  }}
                  d={BRUSH}
                  stroke='#fff'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              </mask>

              <image
                href={project.hoverImage}
                width={W}
                height={H}
                preserveAspectRatio='xMidYMid slice'
                mask={`url(#${uid}-${i})`}
              />
            </svg>

            <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>

            <div className={styles.info}>
              <div className={styles.text}>
                <p className={styles.projectTitle}>{project.title}</p>

                <p className={styles.category}>{project.category}</p>
              </div>

              <span className={styles.arrowCircle}>
                <svg
                  ref={(el) => {
                    if (el) part(i).arrow = el;
                  }}
                  viewBox='0 0 20 20'
                  fill='none'
                  className={styles.arrow}
                >
                  <path
                    d='M4 16 16 4M7 4h9v9'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
