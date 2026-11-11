/* src/demos/landing-04/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import styles from "./Demo.module.css";

gsap.registerPlugin(SplitText);

export default function Landing04() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (name) => root.querySelector(`.${styles[name]}`);
    const qa = (name) => [...root.querySelectorAll(`.${styles[name]}`)];

    const visual = q("visual");
    const frontPortrait = q("portraitFront");
    const portrait3D = q("portrait3d");
    const glassPanel = q("glassPanel");
    const lightBeam = q("lightBeam");
    const exploreButton = q("explore");
    const exploreIcon = q("exploreIcon");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let titleSplit;
    let introTimeline;
    let revealPosition = 50;
    let cancelled = false;
    const cleanupHandlers = [];

    const addListener = (element, event, handler) => {
      if (!element) return;

      element.addEventListener(event, handler);
      cleanupHandlers.push(() => {
        element.removeEventListener(event, handler);
      });
    };

    const ctx = gsap.context(() => {
      const startAnimations = () => {
        if (cancelled) return;

        titleSplit = SplitText.create(qa("titleWord"), {
          type: "chars",
          charsClass: "title-char",
        });

        if (reduceMotion) {
          gsap.set(titleSplit.chars, {
            yPercent: 0,
            opacity: 1,
          });

          gsap.set([q("eyebrow"), q("description"), q("explore"), q("header"), q("footer")], {
            opacity: 1,
            y: 0,
          });

          gsap.set(qa("portrait"), {
            opacity: 1,
            scale: 1,
          });

          gsap.set(qa("glassPanel"), {
            scaleY: 1,
          });

          return;
        }

        // Initial positions
        gsap.set(titleSplit.chars, {
          yPercent: 110,
          opacity: 0,
        });

        gsap.set([q("eyebrow"), q("description"), q("explore"), q("header"), q("footer")], {
          opacity: 0,
          y: 20,
        });

        // Intro sequence
        introTimeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        introTimeline
          .to(q("header"), {
            opacity: 1,
            y: 0,
            duration: 0.8,
          })
          .to(
            titleSplit.chars,
            {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.025,
            },
            "-=0.35",
          )
          .to(
            [q("eyebrow"), q("description"), q("explore")],
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
            },
            "-=0.55",
          )
          .from(
            qa("portrait"),
            {
              opacity: 0,
              scale: 0.92,
              duration: 1.2,
              stagger: 0.15,
            },
            "-=1",
          )
          .from(
            qa("glassPanel"),
            {
              scaleY: 0,
              transformOrigin: "top",
              duration: 1,
            },
            "-=0.8",
          )
          .to(
            q("footer"),
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
            },
            "-=0.5",
          );

        // Image reveal and glass divider
        function updateReveal(position) {
          revealPosition = gsap.utils.clamp(5, 95, position);

          gsap.to(frontPortrait, {
            clipPath: `inset(0 0 0 ${revealPosition}%)`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
          });

          gsap.to([glassPanel, lightBeam], {
            left: `${revealPosition}%`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
          });
        }

        // Pointer interaction
        const onPointerMove = (event) => {
          if (reduceMotion || !visual) return;

          const bounds = visual.getBoundingClientRect();

          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

          updateReveal((x + 1) * 50);

          gsap.to(portrait3D, {
            rotationY: x * 14,
            rotationX: -y * 8,
            x: x * 10,
            y: y * 6,
            duration: 0.65,
            ease: "power3.out",
            transformPerspective: 1100,
            transformOrigin: "center center",
            overwrite: true,
          });

          gsap.to(q("portraitFrontImage"), {
            scale: 1.04,
            duration: 0.65,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const onPointerLeave = () => {
          updateReveal(50);

          gsap.to(portrait3D, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            overwrite: true,
          });

          gsap.to(q("portraitFrontImage"), {
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            overwrite: true,
          });
        };

        addListener(visual, "pointermove", onPointerMove);
        addListener(visual, "pointerleave", onPointerLeave);

        // CTA moves the reveal across the portrait
        const onExplore = () => {
          const destination = revealPosition > 70 ? 15 : 85;

          gsap.to(
            { position: revealPosition },
            {
              position: destination,
              duration: 1.2,
              ease: "power3.inOut",
              onUpdate() {
                updateReveal(this.targets()[0].position);
              },
            },
          );

          gsap.fromTo(
            exploreIcon,
            {
              scale: 0.85,
              rotation: -25,
            },
            {
              scale: 1,
              rotation: 0,
              duration: 0.6,
              ease: "back.out(2)",
            },
          );
        };

        addListener(exploreButton, "click", onExplore);

        // Set the initial divider position
        gsap.set(frontPortrait, {
          clipPath: "inset(0 0 0 50%)",
        });

        gsap.set([glassPanel, lightBeam], {
          left: "50%",
        });
      };

      // Wait for the page fonts before splitting the headline
      document.fonts.ready.then(() => {
        if (!cancelled) {
          ctx.add(startAnimations);
        }
      });
    }, root);

    return () => {
      cancelled = true;

      cleanupHandlers.forEach((cleanup) => cleanup());

      titleSplit?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <main
      className={styles.hero}
      ref={rootRef}
    >
      <div
        className={styles.noise}
        aria-hidden='true'
      />
      <div className={`${styles.ambient} ${styles.ambientOne}`} />
      <div className={`${styles.ambient} ${styles.ambientTwo}`} />

      <header className={styles.header}>
        <a
          href='#home'
          className={styles.logo}
        >
          <span className={styles.logoMark} />
          HOVER LAB
        </a>

        <nav className={styles.navigation}>
          <a
            href='#home'
            className={`${styles.navLink} ${styles.active}`}
          >
            Home
          </a>
          <a
            href='#experience'
            className={styles.navLink}
          >
            Experience
          </a>
          <a
            href='#about'
            className={styles.navLink}
          >
            About
          </a>
        </nav>

        <span className={styles.headerIndex}>INDEPENDENT CREATIVE STUDIO</span>
      </header>

      <section
        className={styles.heroContent}
        id='experience'
      >
        <div className={styles.intro}>
          <div className={styles.eyebrow}>
            <span />
            INTERACTIVE EXPERIMENT / #465
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>
              <span className={styles.titleWord}>MOVE</span>
            </span>

            <span className={`${styles.titleLine} ${styles.titleLineAccent}`}>
              <span className={styles.titleWord}>BEYOND</span>
            </span>

            <span className={styles.titleLine}>
              <span className={styles.titleWord}>THE</span>
              <span className={styles.titleWord}>ORDINARY.</span>
            </span>
          </h1>

          <p className={styles.description}>An experiment in light, perception and interaction. Move your cursor. Discover another dimension.</p>

          <button
            className={styles.explore}
            type='button'
          >
            <span className={styles.exploreIcon}>↗</span>
            <span>ENTER THE EXPERIENCE</span>
          </button>
        </div>

        <div className={styles.visual}>
          <div className={styles.visualGrid} />

          <div className={`${styles.visualOrbit} ${styles.orbitOne}`} />
          <div className={`${styles.visualOrbit} ${styles.orbitTwo}`} />

          <div className={styles.imageShadow} />

          <div className={`${styles.portrait} ${styles.portraitBack}`}>
            <img
              src='/demos/landing-04/portrait.png'
              alt=''
            />
          </div>

          <div className={styles.portrait3d}>
            <div className={`${styles.portrait} ${styles.portraitFront}`}>
              <img
                className={styles.portraitFrontImage}
                src='/demos/landing-04/portrait.png'
                alt=''
              />
            </div>

            <div className={styles.glassPanel}>
              <div className={styles.glassTop}>
                <span>FIG. 001</span>
                <span>LIGHT / FORM</span>
              </div>

              <div className={styles.glassBottom}>
                <span>CHANGE YOUR PERSPECTIVE</span>
                <span className={styles.glassCross}>✳</span>
              </div>
            </div>
          </div>

          <div className={styles.lightBeam} />

          <div className={`${styles.glassPanel} ${styles.glassPanelOuter}`}>
            <div className={styles.glassTop}>
              <span>FIG. 001</span>
              <span>LIGHT / FORM</span>
            </div>

            <div className={styles.glassBottom}>
              <span>CHANGE YOUR PERSPECTIVE</span>
              <span className={styles.glassCross}>✳</span>
            </div>
          </div>

          <div className={styles.visualCaption}>
            <span className={styles.captionDot} />
            <span>MOVE TO INTERACT</span>
          </div>

          <span className={styles.visualNumber}>01 — 03</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerLine} />
          <span>DESIGNED TO BE DISCOVERED</span>
        </div>

        <div className={styles.scrollIndicator}>
          <span>SCROLL TO EXPLORE</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>

        <span className={styles.footerRight}>EST. 2026</span>
      </footer>
    </main>
  );
}
