/* src/demos/card-03/Demo.jsx */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* --------------------------------------------------
Default Cards
-------------------------------------------------- */

const CARDS = [
  {
    title: "Motion",
    tag: "Easing & timing",
    color: "#ff5b2e",
    ink: "#1f0a03",
  },
  {
    title: "Type",
    tag: "Variable fonts",
    color: "#f4efe6",
    ink: "#151515",
  },
  {
    title: "Shaders",
    tag: "GPU",
    note: "Now exploring",
    color: "#111111",
    ink: "#c6ff3d",
  },
  {
    title: "3D",
    tag: "Blender & R3F",
    color: "#6c5cff",
    ink: "#ffffff",
  },
  {
    title: "Sound",
    tag: "Web Audio",
    note: "Now exploring",
    color: "#0d2b24",
    ink: "#4fffb0",
  },
  {
    title: "Brand",
    tag: "Identity systems",
    color: "#ffcf3f",
    ink: "#241a00",
  },
  {
    title: "Copy",
    tag: "Tone of voice",
    color: "#ff8fc8",
    ink: "#2b0719",
  },
  {
    title: "Craft",
    tag: "Details, always",
    color: "#2f6bff",
    ink: "#ffffff",
  },
];

const DEFAULT_HEADING = (
  <>
    <h2 className={styles.headingTitle}>The Kit</h2>
    <p className={styles.headingSubtitle}>What we bring to every project</p>
  </>
);

/* --------------------------------------------------
Animation Settings
-------------------------------------------------- */

const DEAL = 0.6;
const FOLD_FROM = 0.8;
const FOLD_TO = 0.95;
const POP = "elastic.out(0.6, 0.3)";

/* --------------------------------------------------
Card Bounce
-------------------------------------------------- */

function bounce(element, amount) {
  return gsap
    .timeline()
    .to(element, {
      y: 6 * amount,
      scale: 1 - 0.03 * amount,
      duration: 0.08,
      ease: "power2.in",
    })
    .to(element, {
      y: -24 * amount,
      scale: 1 + 0.07 * amount,
      duration: 0.18,
      ease: "power3.out",
    })
    .to(element, {
      y: 0,
      scale: 1,
      duration: 0.42,
      ease: "elastic.out(0.8, 0.35)",
    });
}

/* --------------------------------------------------
Card Fan Scroll
-------------------------------------------------- */

export default function CardFanScroll({ cards = CARDS, heading = DEFAULT_HEADING, spread = 3.5, length = 4, fold = true, background = "#1c1b1d", color = "#f6efe6", scroller = null, className = "" }) {
  const rootRef = useRef(null);
  const wheelRef = useRef(null);
  const slotRefs = useRef([]);
  const motionRefs = useRef([]);

  const [stageH, setStageH] = useState(0);

  /* --------------------------------------------------
  Measure Stage
  -------------------------------------------------- */

  useEffect(() => {
    const measure = () => {
      setStageH(scroller ? scroller.clientHeight : window.innerHeight);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    if (scroller) {
      resizeObserver.observe(scroller);
    }

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scroller]);

  /* --------------------------------------------------
  GSAP Animation
  -------------------------------------------------- */

  useGSAP(
    (_, contextSafe) => {
      const wheel = wheelRef.current;

      const slots = slotRefs.current.slice(0, cards.length);
      const motions = motionRefs.current.slice(0, cards.length);

      const count = slots.length;
      const front = count + 10;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      slots.forEach((slot, index) => {
        gsap.set(slot, {
          rotation: index * spread,
          zIndex: index + 1,
          visibility: index ? "hidden" : "visible",
        });
      });

      gsap.set(wheel, {
        rotation: 0,
        "--fold": 0,
      });

      let shown = 0;
      let aimed = 0;
      let folded = 0;
      let wave = null;
      let held = -1;

      /* --------------------------------------------------
      Wave Cleanup
      -------------------------------------------------- */

      const release = () => {
        if (held < 0) return;

        const slot = slots[held];

        gsap.set(slot, {
          zIndex: slot.matches(":hover") ? front : held + 1,
        });

        held = -1;
      };

      const stopWave = () => {
        if (!wave) return;

        wave.kill();
        wave = null;

        release();

        gsap.killTweensOf(motions, "y,scale");

        gsap.set(motions, {
          y: 0,
          scale: 1,
        });
      };

      /* --------------------------------------------------
      Scroll Progress
      -------------------------------------------------- */

      const update = (progress) => {
        stopWave();

        const current = Math.min(Math.floor(Math.min(progress / DEAL, 1) * count), count - 1);

        // Deal cards into the fan.
        if (current > shown) {
          for (let i = shown + 1; i <= current; i++) {
            gsap.set(slots[i], {
              visibility: "visible",
            });

            if (!reducedMotion) {
              gsap.fromTo(
                slots[i],
                { scale: 0.94 },
                {
                  scale: 1,
                  ease: POP,
                  duration: 0.5,
                },
              );
            }
          }
        } else {
          for (let i = shown; i > current; i--) {
            gsap.set(slots[i], {
              visibility: "hidden",
            });
          }
        }

        shown = current;

        // Fold the cards back into a stack.
        const foldProgress = fold ? gsap.utils.clamp(0, 1, (progress - FOLD_FROM) / (FOLD_TO - FOLD_FROM)) : 0;

        if (foldProgress !== folded) {
          slots.forEach((slot, index) => {
            gsap.set(slot, {
              rotation: index * spread * (1 - foldProgress),
            });
          });

          folded = foldProgress;
        }

        if (foldProgress > 0) {
          gsap.killTweensOf(wheel);

          gsap.set(wheel, {
            rotation: (-((count - 1) * spread) / 2) * (1 - foldProgress),
            "--fold": foldProgress,
          });

          aimed = -1;
        } else if (current !== aimed) {
          gsap.to(wheel, {
            rotation: -(current * spread) / 2,
            "--fold": 0,
            ease: POP,
            duration: reducedMotion ? 0 : 0.5,
            overwrite: true,
          });

          aimed = current;
        }
      };

      /* --------------------------------------------------
      ScrollTrigger
      -------------------------------------------------- */

      ScrollTrigger.create({
        trigger: rootRef.current,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      });

      /* --------------------------------------------------
      Hover Interactions
      -------------------------------------------------- */

      const lift = contextSafe((index, event) => {
        if (event.pointerType !== "touch") {
          gsap.set(slots[index], {
            zIndex: front,
          });
        }
      });

      const drop = contextSafe((index, event) => {
        if (event.pointerType !== "touch" && index !== held) {
          gsap.set(slots[index], {
            zIndex: index + 1,
          });
        }
      });

      /* --------------------------------------------------
      Click Bounce Wave
      -------------------------------------------------- */

      const poke = contextSafe((index) => {
        stopWave();

        if (reducedMotion) return;

        const timeline = gsap.timeline();

        slots.forEach((slot, cardIndex) => {
          if (cardIndex > shown) return;

          const distance = Math.abs(cardIndex - index);

          timeline.add(bounce(motions[cardIndex], Math.max(0.25, 1 - distance * 0.18)), distance * 0.045);
        });

        wave = timeline;
        held = index;

        gsap.set(slots[index], {
          zIndex: front,
        });

        timeline.eventCallback("onComplete", () => {
          if (wave !== timeline) return;

          release();
          wave = null;
        });
      });

      /* --------------------------------------------------
      Event Listeners
      -------------------------------------------------- */

      const removeListeners = slots.map((slot, index) => {
        const card = slot.firstElementChild;

        const onEnter = (event) => lift(index, event);
        const onLeave = (event) => drop(index, event);
        const onClick = () => poke(index);

        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", onLeave);
        card.addEventListener("click", onClick);

        return () => {
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", onLeave);
          card.removeEventListener("click", onClick);
        };
      });

      return () => {
        removeListeners.forEach((remove) => remove());
      };
    },
    {
      scope: rootRef,
      dependencies: [cards, spread, fold, scroller, stageH, length],
      revertOnUpdate: true,
    },
  );

  /* --------------------------------------------------
  Render
  -------------------------------------------------- */

  return (
    <section
      ref={rootRef}
      className={`${styles.root} ${className}`}
      style={{
        height: stageH ? stageH * length : `${length * 100}svh`,
        background,
        color,
      }}
    >
      <div
        className={styles.stage}
        style={{
          height: stageH || "100svh",
        }}
      >
        <div className={styles.heading}>{heading}</div>

        <div
          ref={wheelRef}
          className={styles.wheel}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              ref={(element) => {
                if (element) {
                  slotRefs.current[index] = element;
                }
              }}
              className={styles.slot}
            >
              <div className={styles.card}>
                <div
                  ref={(element) => {
                    if (element) {
                      motionRefs.current[index] = element;
                    }
                  }}
                  className={styles.cardContent}
                  style={{
                    background: card.color,
                    color: card.ink,
                    boxShadow: index === cards.length - 1 ? "0 18px 36px -22px rgba(0,0,0,0.45)" : "0 18px 36px -22px rgba(0,0,0,calc(0.45 * (1 - var(--fold, 0))))",
                  }}
                >
                  {card.note && <span className={styles.note}>{card.note}</span>}

                  <span className={styles.cardTitle}>{card.title}</span>

                  <span
                    className={styles.tag}
                    style={{
                      background: card.ink,
                      color: card.color,
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
