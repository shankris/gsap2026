/* src/demos/number-roll-02/Demo.jsx */

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* --------------------------------------------------
   Statistics
-------------------------------------------------- */

const stats = [
  {
    label: "Sites shipped",
    note: "Marketing sites, stores and product launches since 2017.",
    figure: "1,240",
  },
  {
    label: "Clients who came back",
    note: "For a second project within two years.",
    figure: "98.4",
    unit: "%",
  },
  {
    label: "Median load on mobile",
    note: "Largest contentful paint, measured in the field.",
    figure: "312",
    unit: "ms",
  },
  {
    label: "Awards on the shelf",
    note: "Nobody here dusts them.",
    figure: "46",
  },
];

const MAX_TURNS = 3;

const isDigit = (char) => char >= "0" && char <= "9";

/* --------------------------------------------------
   Number Figure
-------------------------------------------------- */

function NumberFigure({ value, unit }) {
  const chars = [...value];

  return (
    <>
      <span className={styles.srOnly}>
        {value}
        {unit ?? ""}
      </span>

      <span
        className={styles.figure}
        aria-hidden='true'
      >
        {chars.map((char, index) => {
          if (!isDigit(char)) {
            return <span key={index}>{char}</span>;
          }

          const turns = Math.min(MAX_TURNS, chars.slice(0, index).filter(isDigit).length + 1);

          const rowCount = turns * 10 + Number(char) + 1;

          return (
            <span
              className={styles.slot}
              key={index}
            >
              <span className={styles.slotSize}>{char}</span>

              <span className={styles.wheel}>
                {Array.from({ length: rowCount }, (_, number) => (
                  <span key={number}>{number % 10}</span>
                ))}
              </span>
            </span>
          );
        })}

        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
    </>
  );
}

/* --------------------------------------------------
   Demo
-------------------------------------------------- */

export default function Demo() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray(`.${styles.stat}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const cleanups = [];

      rows.forEach((row) => {
        const rule = row.querySelector(`.${styles.rule}`);
        const fadeElements = row.querySelectorAll(`.${styles.fade}`);
        const wheels = row.querySelectorAll(`.${styles.wheel}`);
        const unit = row.querySelector(`.${styles.unit}`);

        const wheelStart = (_, wheel) => ((wheel.children.length - 1) / wheel.children.length) * 100;

        const entrance = gsap
          .timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 90%",
              once: true,
            },
          })
          .from(rule, {
            scaleX: 0,
            duration: 1.3,
            ease: "expo.inOut",
          })
          .from(
            fadeElements,
            {
              y: 18,
              autoAlpha: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power3.out",
            },
            0.2,
          )
          .fromTo(
            wheels,
            { yPercent: wheelStart },
            {
              yPercent: 0,
              duration: 4.4,
              stagger: 0.3,
              ease: "power4.out",
            },
            0.1,
          );

        if (unit) {
          entrance.from(
            unit,
            {
              yPercent: 120,
              duration: 0.8,
              ease: "expo.out",
            },
            1,
          );
        }

        const handlePointerEnter = (event) => {
          if (event.pointerType !== "mouse" || entrance.progress() < 1 || gsap.isTweening(wheels[0])) {
            return;
          }

          gsap.fromTo(
            wheels,
            { yPercent: wheelStart },
            {
              yPercent: 0,
              duration: 1.6,
              stagger: 0.06,
              ease: "power3.out",
            },
          );
        };

        row.addEventListener("pointerenter", handlePointerEnter);

        cleanups.push(() => {
          row.removeEventListener("pointerenter", handlePointerEnter);
        });
      });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope: sectionRef },
  );

  return (
    <main className={styles.demo}>
      <section
        className={styles.stats}
        ref={sectionRef}
      >
        <header className={styles.statsHead}>
          <p className={styles.statsEyebrow}>By the numbers</p>

          <h2>Ten years of work, counted the way a car counts miles.</h2>
        </header>

        <dl className={styles.statsList}>
          {stats.map((stat) => (
            <div
              className={styles.stat}
              key={stat.label}
            >
              <span
                className={styles.rule}
                aria-hidden='true'
              />

              <dt>
                <span className={`${styles.fade} ${styles.label}`}>{stat.label}</span>

                <span className={`${styles.fade} ${styles.note}`}>{stat.note}</span>
              </dt>

              <dd>
                <NumberFigure
                  value={stat.figure}
                  unit={stat.unit}
                />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <a
        className={styles.credit}
        href='https://www.builtformotion.online/collections/odometer-stats?utm_source=codepen&utm_medium=pen&utm_campaign=odometer-stats'
        target='_blank'
        rel='noopener noreferrer'
      >
        Get the React + Next.js version ↗
      </a>
    </main>
  );
}
