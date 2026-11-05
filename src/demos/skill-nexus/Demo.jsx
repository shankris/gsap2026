/* src/demos/skill-nexus/Demo.jsx */

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP);

const skills = [
  {
    name: "HTML5",
    value: 90,
    category: "MARKUP ENGINE",
    description: "Structure & semantics",
    level: "ADVANCED",
  },
  {
    name: "CSS3",
    value: 80,
    category: "VISUAL ENGINE",
    description: "Styling & composition",
    level: "ADVANCED",
  },
  {
    name: "JAVASCRIPT",
    value: 75,
    category: "LOGIC ENGINE",
    description: "Interaction & behavior",
    level: "PROFICIENT",
  },
  {
    name: "GSAP",
    value: 50,
    category: "MOTION ENGINE",
    description: "Animation & transitions",
    level: "INTERMEDIATE",
  },
  {
    name: "PHP",
    value: 70,
    category: "SERVER ENGINE",
    description: "Backend development",
    level: "PROFICIENT",
  },
  {
    name: "PHOTOSHOP",
    value: 40,
    category: "CREATIVE ENGINE",
    description: "Image & visual editing",
    level: "DEVELOPING",
  },
];

const leftSignals = ["PYTHON", "THREE.JS", "WEBGL", "GLSL", "REACT", "AI / ML", "TYPESCRIPT", "NODE.JS"];

const rightSignals = ["CREATIVE CODE", "SHADERS", "BLENDER", "R3F", "GSAP", "PYTORCH", "AI TOOLS", "UNREAL"];

function LearningStream({ items, side, trackRef, trackIndex }) {
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className={`${styles.learningStream} ${side === "left" ? styles.learningStreamLeft : styles.learningStreamRight}`}
      aria-hidden='true'
    >
      <div
        className={styles.streamTrack}
        ref={trackRef}
        data-track-index={trackIndex}
      >
        {duplicatedItems.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function SkillCard({ skill, index, boost, cardRef, onCardPointerMove }) {
  const displayValue = skill.value + boost;

  return (
    <article
      className={styles.skillCard}
      ref={cardRef}
      onPointerMove={onCardPointerMove}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardIndex}>MODULE / {String(index + 1).padStart(2, "0")}</span>

        <span className={styles.cardStatus}>● {skill.level}</span>
      </div>

      <div className={styles.cardMain}>
        <div
          className={styles.skillRing}
          data-value={skill.value}
        >
          <div className={styles.ringInner}>
            <span className={styles.ringValue}>{displayValue}</span>
            <span className={styles.ringUnit}>PERCENT</span>
          </div>
        </div>

        <div className={styles.cardInfo}>
          <h3>{skill.name}</h3>
          <p>{skill.category}</p>
          <p>{skill.description}</p>
        </div>
      </div>

      <div className={styles.cardBottom}>
        <span>CAPABILITY INDEX</span>
        <span className={styles.cardArrow}>↗</span>
      </div>
    </article>
  );
}

export default function SkillNexus() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const ambientRef = useRef(null);
  const flashRef = useRef(null);

  const boostTitleRef = useRef(null);
  const streamTracksRef = useRef([]);

  const boostTimeoutRef = useRef(null);
  const isBoostingRef = useRef(false);

  const [isOverdrive, setIsOverdrive] = useState(false);
  const [boostValue, setBoostValue] = useState(0);
  const [displayBoost, setDisplayBoost] = useState("0.00");

  const { contextSafe } = useGSAP(
    () => {
      const container = containerRef.current;

      if (!container) return;

      const cardElements = cardsRef.current.filter(Boolean);
      const rings = cardElements.map((card) => card.querySelector(`.${styles.skillRing}`));
      const counters = cardElements.map((card) => card.querySelector(`.${styles.ringValue}`));

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const animateSkills = (boost = 0) => {
        rings.forEach((ring, index) => {
          const counterElement = counters[index];
          const value = Number(ring.dataset.value);

          const progress = { value: 0 };
          const counter = { value: 0 };
          const delay = 0.25 + index * 0.12;

          gsap.to(progress, {
            value,
            duration: 1.8,
            delay,
            ease: "power3.out",
            onUpdate: () => {
              ring.style.setProperty("--progress", `${progress.value}%`);
            },
          });

          gsap.to(counter, {
            value,
            duration: 1.8,
            delay,
            ease: "power3.out",
            onUpdate: () => {
              counterElement.textContent = Math.round(counter.value + boost);
            },
          });
        });
      };

      gsap.fromTo(
        container.querySelector(`.${styles.sectionHeading}`),
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        },
      );

      if (!reducedMotion) {
        gsap.fromTo(
          cardElements,
          {
            y: 60,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.15,
          },
        );
      } else {
        gsap.set(cardElements, {
          y: 0,
          opacity: 1,
          scale: 1,
        });
      }

      animateSkills();

      const handlePointerMove = (event) => {
        const ambient = ambientRef.current;

        if (!ambient || reducedMotion) return;

        const x = (event.clientX / window.innerWidth - 0.5) * 35;
        const y = (event.clientY / window.innerHeight - 0.5) * 35;

        gsap.to(ambient, {
          x,
          y,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      window.addEventListener("pointermove", handlePointerMove);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);

        if (boostTimeoutRef.current) {
          boostTimeoutRef.current.kill();
        }
      };
    },
    { scope: containerRef },
  );

  const handleCardPointerMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  const handleBoost = contextSafe(() => {
    if (isBoostingRef.current) return;

    isBoostingRef.current = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const boost = Number((Math.random() * 7.9 + 0.1).toFixed(2));

    setIsOverdrive(true);
    setBoostValue(boost);

    if (boostTitleRef.current) {
      boostTitleRef.current.textContent = "ACTIVE";
    }

    const cards = cardsRef.current.filter(Boolean);
    const tracks = streamTracksRef.current.filter(Boolean);

    cards.forEach((card, index) => {
      const ring = card.querySelector(`.${styles.skillRing}`);
      const valueElement = card.querySelector(`.${styles.ringValue}`);
      const baseValue = Number(ring.dataset.value);

      const progress = { value: 0 };
      const counter = { value: 0 };
      const delay = 0.25 + index * 0.12;

      gsap.to(progress, {
        value: baseValue,
        duration: 1.8,
        delay,
        ease: "power3.out",
        onUpdate: () => {
          ring.style.setProperty("--progress", `${progress.value}%`);
        },
      });

      gsap.to(ring, {
        "--progress": `${baseValue}%`,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(counter, {
        value: baseValue,
        duration: 1.8,
        delay,
        ease: "power3.out",
        onUpdate: () => {
          valueElement.textContent = Math.round(counter.value + boost);
        },
      });
    });

    const boostCounter = { value: 0 };

    gsap.to(boostCounter, {
      value: boost,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayBoost(boostCounter.value.toFixed(2));
      },
    });

    if (!reducedMotion) {
      gsap
        .timeline()
        .to(flashRef.current, {
          opacity: 1,
          duration: 0.25,
        })
        .to(flashRef.current, {
          opacity: 0,
          duration: 0.9,
        });

      gsap.fromTo(
        cards,
        {
          scale: 1,
          y: 0,
        },
        {
          scale: 1.025,
          y: -5,
          duration: 0.35,
          stagger: 0.04,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        },
      );

      tracks.forEach((track) => {
        const index = Number(track.dataset.trackIndex);
        const baseSpeed = index === 0 ? 38 : 48;

        track.style.setProperty("--stream-speed", `${Math.max(8, baseSpeed / (1 + boost * 3))}s`);
      });
    }

    boostTimeoutRef.current = gsap.delayedCall(5, () => {
      setIsOverdrive(false);
      setBoostValue(0);
      setDisplayBoost("0.00");

      if (boostTitleRef.current) {
        boostTitleRef.current.textContent = "BOOST";
      }

      cards.forEach((card) => {
        const ring = card.querySelector(`.${styles.skillRing}`);
        const valueElement = card.querySelector(`.${styles.ringValue}`);

        const baseValue = Number(ring.dataset.value);

        gsap.to(valueElement, {
          innerText: baseValue,
          duration: 0.5,
          snap: { innerText: 1 },
          ease: "power2.out",
        });
      });

      tracks.forEach((track, index) => {
        track.style.setProperty("--stream-speed", index === 0 ? "38s" : "48s");
      });

      isBoostingRef.current = false;
    });
  });

  return (
    <main
      className={`${styles.page} ${isOverdrive ? styles.overdrive : ""}`}
      ref={containerRef}
    >
      <div className={styles.bg}>
        <video
          src='/demos/skill-nexus/bg.mp4'
          loop
          muted
          autoPlay
          playsInline
        />
      </div>

      <div
        className={`${styles.ambient} ${styles.ambientOne}`}
        ref={ambientRef}
      />
      <div className={`${styles.ambient} ${styles.ambientTwo}`} />

      <LearningStream
        items={leftSignals}
        side='left'
        trackIndex={0}
        trackRef={(element) => {
          streamTracksRef.current[0] = element;
        }}
      />

      <LearningStream
        items={rightSignals}
        side='right'
        trackIndex={1}
        trackRef={(element) => {
          streamTracksRef.current[1] = element;
        }}
      />

      <div className={styles.dashboard}>
        <section className={styles.skillsSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                01 — CORE ARCHITECTURE
              </span>

              <h2>
                Capability <span>modules.</span>
              </h2>
            </div>

            <div className={styles.sectionMeta}>
              <span>INTERACTIVE DATA FIELD</span>
              <span className={styles.liveIndicator}>● LIVE</span>
            </div>
          </div>

          <div className={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                index={index}
                boost={boostValue}
                cardRef={(element) => {
                  cardsRef.current[index] = element;
                }}
                onCardPointerMove={handleCardPointerMove}
              />
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            SKILL<span>//</span>NEXUS
          </div>

          <p>
            BUILT TO EVOLVE.
            <span> DESIGNED TO EXPLORE.</span>
          </p>

          <span className={styles.footerCopy}>© 2026 / ALL SYSTEMS ACTIVE</span>
        </footer>
      </div>

      <button
        className={styles.boostButton}
        type='button'
        onClick={handleBoost}
        disabled={isOverdrive}
      >
        <span className={styles.boostRing} />

        <span className={styles.boostIcon}>↗</span>

        <span className={styles.boostContent}>
          <span className={styles.boostLabel}>NEXUS</span>
          <span
            className={styles.boostTitle}
            ref={boostTitleRef}
          >
            BOOST
          </span>
        </span>

        <span className={styles.boostIndicator} />

        <span className={styles.boostValue}>{displayBoost}×</span>
      </button>

      <div
        className={styles.boostFlash}
        ref={flashRef}
      />
    </main>
  );
}
