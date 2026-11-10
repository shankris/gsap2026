// src/demos/accordion-04/Demo.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Review faster",
    description: "Catch critical bugs and get suggested fixes pre-merge with AI-powered code analysis.",
    image: "/demos/accordion-04/01.jpg",
    imageAlt: "Abstract architectural structure",
  },
  {
    title: "Merge conflicts",
    description: "Automate rebases and resolve dependencies across stacked changes instantly.",
    image: "/demos/accordion-04/02.jpg",
    imageAlt: "Modern technology and architecture",
  },
  {
    title: "Stacked PRs",
    description: "Build on top of previous work without waiting for reviews to complete.",
    image: "/demos/accordion-04/03.jpg",
    imageAlt: "Modern glass skyscraper",
  },
  {
    title: "Modern Review",
    description: "A high-performance interface designed for technical precision and speed.",
    image: "/demos/accordion-04/04.jpg",
    imageAlt: "Contemporary architectural design",
  },
];

export default function Demo() {
  const sectionRef = useRef(null);
  const fillsRef = useRef([]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const fills = fillsRef.current;

      gsap.set(fills, {
        height: "0%",
      });

      const createScrollTimeline = (scrubValue) => {
        const master = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: scrubValue,
          },
        });

        steps.forEach((step, index) => {
          const fill = fills[index];

          master.to(fill, {
            height: "100%",
            ease: "none",

            onUpdate: function () {
              if (this.progress() > 0.05) {
                setActiveIndex((current) => (current !== index ? index : current));
              }
            },

            onComplete: () => {
              if (index === steps.length - 1) {
                gsap.set(fill, { height: "100%" });
              }
            },
          });
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 901px)", () => {
        createScrollTimeline(1.5);
      });

      mm.add("(max-width: 900px)", () => {
        createScrollTimeline(0.8);
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      className={styles.scrollGate}
      ref={sectionRef}
    >
      <div className={styles.stickyViewport}>
        <div className={styles.layoutGrid}>
          <div className={styles.visualPane}>
            <div className={styles.glassBezel}>
              <div className={styles.noiseGrain} />

              <div className={styles.screenBox}>
                {steps.map((step, index) => (
                  <img
                    key={step.title}
                    src={step.image}
                    alt={step.imageAlt}
                    className={`${styles.stepImage} ${index === activeIndex ? styles.active : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.accordionPane}>
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`${styles.glassCard} ${index === activeIndex ? "active" : ""}`}
              >
                <div className={styles.noiseGrain} />

                <div className={styles.track}>
                  <div
                    ref={(element) => {
                      fillsRef.current[index] = element;
                    }}
                    className={styles.grayFill}
                  />
                </div>

                <div className={styles.contentBody}>
                  <h3 className={styles.title}>{step.title}</h3>

                  <div className={styles.expandEngine}>
                    <div className={styles.inner}>
                      <p className={styles.description}>{step.description}</p>

                      <button
                        type='button'
                        className={styles.textAction}
                      >
                        Learn more <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
