/* src/demos/card-stack-04/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger);

function Card({ className, title, description, tags, children }) {
  return (
    <>
      <span
        className={styles.ancora}
        data-anchor
        aria-hidden='true'
      />

      <article
        className={`${styles.carta} ${className}`}
        data-card
      >
        <div className={styles.carta__testo}>
          <h2 className={styles.carta__titolo}>{title}</h2>
          <p>{description}</p>

          <ul className={styles.etichette}>
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        {children}

        <span
          className={styles.carta__velo}
          data-overlay
          aria-hidden='true'
        />
      </article>
    </>
  );
}

export default function Demo() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) return;

      const cards = [...root.querySelectorAll("[data-card]")];
      const anchors = [...root.querySelectorAll("[data-anchor]")];

      const PICCOLA = 0.93;
      const STORTA = 1.4;
      const BUIO = 0.38;

      cards.forEach((card, index) => {
        const nextAnchor = anchors[index + 1];

        if (!nextAnchor) return;

        const top = parseFloat(getComputedStyle(card).top) || 0;
        const overlay = card.querySelector("[data-overlay]");

        gsap
          .timeline({
            scrollTrigger: {
              trigger: nextAnchor,
              start: "top bottom",
              end: () => `top ${top + 16}px`,
              scrub: true,
            },
          })
          .to(
            card,
            {
              scale: PICCOLA,
              rotation: index % 2 ? STORTA : -STORTA,
              ease: "none",
            },
            0,
          )
          .to(
            overlay,
            {
              opacity: BUIO,
              ease: "none",
            },
            0,
          );
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main
      className={styles.demo}
      ref={rootRef}
    >
      <section className={styles.pila}>
        <div className={styles.pila__carte}>
          <Card
            className={styles.c1}
            title='The sketch'
            description='It starts on paper: what has to happen, in what order, for whoever is watching.'
            tags={["the story", "the moments", "the gesture"]}
          >
            <svg
              className={styles.disegno}
              viewBox='0 0 244 180'
              aria-hidden='true'
            >
              <path
                className={styles.tratto}
                d='M22 132 C 60 60, 100 150, 140 90 S 200 40, 222 70'
              />
              <path
                className={styles.tratto}
                d='M168 28 l30 30 -86 86 -34 6 6 -34 z'
              />
              <path
                className={styles.tratto}
                d='M144 52 l30 30'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M60 40 l12 16 -12 16 -12 -16 z'
              />
            </svg>
          </Card>

          <Card
            className={styles.c2}
            title='The timing'
            description='Every gesture has a length and a place on the timeline: nothing happens all at once.'
            tags={["durations", "staggers", "pauses"]}
          >
            <svg
              className={styles.disegno}
              viewBox='0 0 244 180'
              aria-hidden='true'
            >
              <path
                className={styles.tratto}
                d='M20 110 H224'
              />
              <path
                className={styles.tratto}
                d='M20 100 v20 M71 104 v12 M122 100 v20 M173 104 v12 M224 100 v20'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M46 66 l12 16 -12 16 -12 -16 z'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M122 50 l14 18 -14 18 -14 -18 z'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M198 66 l12 16 -12 16 -12 -16 z'
              />
              <path
                className={styles.tratto}
                d='M46 150 H198'
              />
            </svg>
          </Card>

          <Card
            className={styles.c3}
            title='The curve'
            description='Real motion never goes straight: it starts slow, speeds up, brakes. The curve decides the character.'
            tags={["easing", "springs", "bounces"]}
          >
            <svg
              className={styles.disegno}
              viewBox='0 0 244 180'
              aria-hidden='true'
            >
              <path
                className={styles.tratto}
                d='M24 150 C 120 150, 110 36, 220 34'
              />
              <path
                className={styles.tratto}
                d='M24 150 L96 150 M220 34 L150 34'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M90 144 h12 v12 h-12 z'
              />
              <path
                className={`${styles.tratto} ${styles.compare}`}
                d='M144 28 h12 v12 h-12 z'
              />
              <path
                className={styles.tratto}
                d='M24 20 V150 H230'
              />
            </svg>
          </Card>

          <Card
            className={styles.c4}
            title='The launch'
            description='Try it on a phone, try it with reduced motion, then publish it and watch who comes by.'
            tags={["tests", "the phone", "the release"]}
          >
            <svg
              className={styles.disegno}
              viewBox='0 0 244 180'
              aria-hidden='true'
            >
              <path
                className={styles.tratto}
                d='M20 30 h204 v126 h-204 z'
              />
              <path
                className={styles.tratto}
                d='M20 54 H224'
              />
              <path
                className={styles.tratto}
                d='M36 42 h40'
              />
              <path
                className={`${styles.tratto} ${styles.compare} ${styles.riempi}`}
                d='M104 78 l48 28 -48 28 z'
              />
            </svg>
          </Card>
        </div>

        <div
          className={styles.pila__coda}
          aria-hidden='true'
        />
      </section>
    </main>
  );
}
