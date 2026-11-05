/* src/demos/atsu/Demo.jsx */

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, SplitText);

export default function Atsu() {
  const containerRef = useRef(null);
  const characterRef = useRef(null);
  const preloaderRef = useRef(null);
  const loaderNumberRef = useRef(null);
  const leavesRef = useRef(null);
  const heroBackgroundRef = useRef(null);
  const heroRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ========================================
  // GSAP EXPERIENCE
  // ========================================

  useGSAP(
    () => {
      const container = containerRef.current;
      const character = characterRef.current;
      const preloader = preloaderRef.current;
      const loaderNumber = loaderNumberRef.current;
      const leavesContainer = leavesRef.current;
      const heroBackground = heroBackgroundRef.current;

      if (!container || !character || !preloader) return;

      const q = gsap.utils.selector(container);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let experienceStarted = false;
      let splitTitle = null;

      const header = q(`.${styles.header}`);
      const heroEyebrow = q(`.${styles["hero-eyebrow"]}`);
      const titleTop = q(`.${styles["title-top"]}`);
      const titleMain = q(`.${styles["title-main"]}`);
      const heroDescription = q(`.${styles["hero-description"]}`);
      const discoverLink = q(`.${styles["discover-link"]}`);
      const heroSideNote = q(`.${styles["hero-side-note"]}`);
      const heroVerticalText = q(`.${styles["hero-vertical-text"]}`);
      const heroBottom = q(`.${styles["hero-bottom"]}`);
      const sun = q(`.${styles.sun}`);
      const mountains = q(`.${styles.mountains}`);
      const fog = q(`.${styles.fog}`);
      const fogOne = q(`.${styles["fog-one"]}`);
      const fogTwo = q(`.${styles["fog-two"]}`);

      // ========================================
      // INITIAL STATES
      // ========================================

      gsap.set(header, {
        autoAlpha: 0,
        y: -25,
      });

      gsap.set([...heroEyebrow, ...heroDescription, ...discoverLink, ...heroSideNote, ...heroVerticalText, ...heroBottom], {
        autoAlpha: 0,
        y: 25,
      });

      gsap.set(titleTop, {
        autoAlpha: 0,
        y: 35,
      });

      gsap.set(titleMain, {
        autoAlpha: 0,
      });

      gsap.set(character, {
        autoAlpha: 0,
        y: 120,
        scale: 1.08,
      });

      gsap.set(heroBackground, {
        scale: 1.2,
      });

      gsap.set(sun, {
        autoAlpha: 0,
        scale: 0.5,
      });

      gsap.set(mountains, {
        autoAlpha: 0,
        y: 100,
      });

      gsap.set(fog, {
        autoAlpha: 0,
        x: -100,
      });

      gsap.set(q(`.${styles["preloader-symbol"]}`), {
        autoAlpha: 0,
        scale: 0.7,
      });

      gsap.set(q(`.${styles["preloader-line"]} span`), {
        scaleX: 0,
        transformOrigin: "left center",
      });

      // ========================================
      // MAPLE LEAVES
      // ========================================

      const leaves = [];

      function createLeaves() {
        if (!leavesContainer) return;

        leavesContainer.replaceChildren();

        for (let i = 0; i < 22; i++) {
          const leaf = document.createElement("div");

          leaf.classList.add(styles.leaf);

          leaf.style.left = `${Math.random() * 100}%`;
          leaf.style.width = `${8 + Math.random() * 13}px`;
          leaf.style.height = `${12 + Math.random() * 15}px`;

          leavesContainer.appendChild(leaf);
          leaves.push(leaf);
        }
      }

      createLeaves();

      // ========================================
      // PRELOADER
      // ========================================

      function startExperience() {
        if (experienceStarted) return;

        experienceStarted = true;

        if (reduceMotion) {
          gsap.set(preloader, {
            display: "none",
          });

          showHeroImmediately();
          return;
        }

        const counter = { value: 0 };

        const loadingTimeline = gsap.timeline({
          onComplete: () => {
            gsap.set(preloader, {
              display: "none",
            });

            revealHero();
          },
        });

        loadingTimeline
          .to(q(`.${styles["preloader-symbol"]}`), {
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
          })

          .to(
            q(`.${styles["preloader-line"]} span`),
            {
              scaleX: 1,
              duration: 1.5,
              ease: "power2.inOut",
            },
            0.2,
          )

          .to(
            counter,
            {
              value: 100,
              duration: 1.7,
              ease: "power1.inOut",

              onUpdate: () => {
                if (loaderNumber) {
                  loaderNumber.textContent = String(Math.round(counter.value)).padStart(2, "0");
                }
              },
            },
            0.2,
          )

          .to(q(`.${styles["preloader-inner"]}`), {
            autoAlpha: 0,
            y: -30,
            duration: 0.5,
            delay: 0.2,
          })

          .to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut",
          });
      }

      // ========================================
      // HERO REVEAL
      // ========================================

      function revealHero() {
        const intro = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        // 01 — Background

        intro.to(
          heroBackground,
          {
            scale: 1,
            duration: 2.8,
            ease: "power2.out",
          },
          0,
        );

        // 02 — Sun

        intro.to(
          sun,
          {
            autoAlpha: 0.65,
            scale: 1,
            duration: 2.2,
            ease: "power2.out",
          },
          0.2,
        );

        // 03 — Mountains

        intro.to(
          mountains,
          {
            y: 0,
            autoAlpha: 1,
            opacity: (index) => [0.35, 0.65, 0.95][index],
            duration: 2,
            stagger: 0.2,
            ease: "power3.out",
          },
          0.3,
        );

        // 04 — Fog

        intro.to(
          fog,
          {
            x: 0,
            autoAlpha: 1,
            opacity: (index) => (index === 0 ? 1 : 0.5),
            duration: 2.5,
            stagger: 0.35,
            ease: "power2.out",
          },
          0.5,
        );

        // 05 — Header

        intro.to(
          header,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
          },
          0.5,
        );

        // 06 — Eyebrow

        intro.to(
          heroEyebrow,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
          },
          0.85,
        );

        // 07 — Main title

        const title = titleMain[0];

        if (title) {
          if (SplitText && title) {
            gsap.set(title, {
              autoAlpha: 1,
            });

            splitTitle = SplitText.create(title, {
              type: "chars",
              charsClass: styles["title-char"],
            });

            gsap.set(splitTitle.chars, {
              transformOrigin: "50% 100%",
            });

            intro.fromTo(
              splitTitle.chars,
              {
                yPercent: 120,
                opacity: 0,
                rotateX: -75,
              },
              {
                yPercent: 0,
                opacity: 1,
                rotateX: 0,
                stagger: 0.075,
                duration: 1.35,
                ease: "power4.out",
              },
              0.95,
            );
          } else {
            intro.fromTo(
              title,
              {
                y: 70,
                autoAlpha: 0,
              },
              {
                y: 0,
                autoAlpha: 1,
                duration: 1.3,
              },
              0.95,
            );
          }
        }

        // 08 — Small title

        intro.to(
          titleTop,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
          },
          1.15,
        );

        // 09 — Atsu

        intro.to(
          character,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 2.2,
            ease: "power3.out",
          },
          1.1,
        );

        // 10 — Description

        intro.to(
          heroDescription,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
          },
          1.7,
        );

        // 11 — Discover button

        intro.to(
          discoverLink,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
          },
          2,
        );

        // 12 — Side details

        intro.to(
          [...heroSideNote, ...heroVerticalText, ...heroBottom],
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
          },
          2,
        );

        // 13 — Ambient animations

        intro.call(startAmbientAnimations);
      }

      // ========================================
      // REDUCED MOTION
      // ========================================

      function showHeroImmediately() {
        gsap.set([...header, ...heroEyebrow, ...titleTop, ...heroDescription, ...discoverLink, ...heroSideNote, ...heroVerticalText, ...heroBottom, character], {
          clearProps: "all",
        });

        gsap.set(titleMain, {
          autoAlpha: 1,
        });

        gsap.set(heroBackground, {
          scale: 1,
        });

        gsap.set(sun, {
          autoAlpha: 0.65,
          scale: 1,
        });

        gsap.set(mountains, {
          autoAlpha: 1,
          y: 0,
        });

        gsap.set(fog, {
          autoAlpha: 1,
          x: 0,
        });

        gsap.set(leaves, {
          autoAlpha: 0,
        });
      }

      // ========================================
      // AMBIENT ANIMATIONS
      // ========================================

      function startAmbientAnimations() {
        if (reduceMotion) return;

        // Character floating

        gsap.to(character, {
          y: -12,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Sun breathing

        gsap.to(sun, {
          scale: 1.06,
          autoAlpha: 0.8,
          duration: 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Fog movement

        gsap.to(fogOne, {
          x: 100,
          duration: 18,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(fogTwo, {
          x: -100,
          duration: 24,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        // Falling leaves

        leaves.forEach((leaf) => {
          gsap.set(leaf, {
            y: -50 - Math.random() * 300,
            x: Math.random() * 100,
            rotation: Math.random() * 180,
          });

          gsap.to(leaf, {
            y: window.innerHeight + 100,
            x: `+=${Math.random() * 300 - 150}`,
            rotation: `+=${360 + Math.random() * 500}`,
            autoAlpha: 0.2 + Math.random() * 0.55,
            duration: 8 + Math.random() * 12,
            ease: "none",
            repeat: -1,
            delay: Math.random() * 12,
          });
        });
      }

      // ========================================
      // DESKTOP PARALLAX
      // ========================================

      let moveBackgroundX;
      let moveBackgroundY;

      function handleMouseMove(event) {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        moveBackgroundX(x * 12);
        moveBackgroundY(y * 8);
      }

      if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        moveBackgroundX = gsap.quickTo(heroBackground, "x", {
          duration: 1.5,
          ease: "power3.out",
        });

        moveBackgroundY = gsap.quickTo(heroBackground, "y", {
          duration: 1.5,
          ease: "power3.out",
        });

        window.addEventListener("mousemove", handleMouseMove);
      }

      // ========================================
      // START EXPERIENCE AFTER IMAGE LOADS
      // ========================================

      function handleImageLoad() {
        startExperience();
      }

      if (reduceMotion) {
        startExperience();
      } else if (character.complete && character.naturalWidth > 0) {
        startExperience();
      } else {
        character.addEventListener("load", handleImageLoad, {
          once: true,
        });

        character.addEventListener("error", handleImageLoad, { once: true });
      }

      // ========================================
      // CLEANUP
      // ========================================

      return () => {
        character.removeEventListener("load", handleImageLoad);
        character.removeEventListener("error", handleImageLoad);
        window.removeEventListener("mousemove", handleMouseMove);

        splitTitle?.revert();

        leaves.forEach((leaf) => leaf.remove());
      };
    },
    { scope: containerRef },
  );

  // ========================================
  // MOBILE NAVIGATION
  // ========================================

  function handleMenuToggle() {
    setIsMenuOpen((previous) => !previous);
  }

  function handleNavClick() {
    setIsMenuOpen(false);
  }

  return (
    <div
      className={styles.page}
      ref={containerRef}
    >
      {/* PRELOADER */}

      <div
        className={styles.preloader}
        ref={preloaderRef}
      >
        <div className={styles["preloader-inner"]}>
          <div className={styles["preloader-symbol"]}>武</div>

          <div className={styles["preloader-line"]}>
            <span></span>
          </div>

          <div className={styles["preloader-bottom"]}>
            <span>THE PATH OF A WARRIOR</span>
            <span
              className={styles["loader-number"]}
              ref={loaderNumberRef}
            >
              00
            </span>
          </div>
        </div>
      </div>

      {/* ATMOSPHERE */}

      <div className={styles.noise}></div>
      <div className={styles.vignette}></div>
      <div className={styles["ambient-light"]}></div>

      <div className={styles.bg}>
        <video
          src='/demos/atsu/bg.mp4'
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* NAVIGATION */}

      <header className={styles.header}>
        <a
          href='#home'
          className={styles.logo}
        >
          <span className={styles["logo-symbol"]}>武</span>
          <span>
            YŌTEI <small>LEGENDS</small>
          </span>
        </a>

        <nav className={`${styles.navigation} ${isMenuOpen ? styles.open : ""}`}>
          <a
            href='#'
            className={`${styles["nav-link"]} ${styles.active}`}
            onClick={handleNavClick}
          >
            BEGINNING
          </a>

          <a
            href='#'
            className={styles["nav-link"]}
            onClick={handleNavClick}
          >
            LEGEND
          </a>

          <a
            href='#'
            className={styles["nav-link"]}
            onClick={handleNavClick}
          >
            EZO
          </a>
        </nav>

        <div className={styles["header-right"]}>
          <span className={styles["header-location"]}>JAPAN · 1600s</span>

          <button
            className={styles["menu-toggle"]}
            type='button'
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={handleMenuToggle}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* HERO */}

      <main id='home'>
        <section
          className={styles.hero}
          ref={heroRef}
        >
          {/* BACKGROUND */}

          <div
            className={styles["hero-background"]}
            ref={heroBackgroundRef}
          />

          <div className={styles.sun}></div>

          {/* MOUNTAINS */}

          <div className={`${styles.mountains} ${styles["mountain-back"]}`}></div>
          <div className={`${styles.mountains} ${styles["mountain-middle"]}`}></div>
          <div className={`${styles.mountains} ${styles["mountain-front"]}`}></div>

          {/* FOG */}

          <div className={`${styles.fog} ${styles["fog-one"]}`}></div>
          <div className={`${styles.fog} ${styles["fog-two"]}`}></div>

          {/* MAPLE LEAVES */}

          <div
            className={styles["leaves-container"]}
            ref={leavesRef}
          ></div>

          {/* HERO CONTENT */}

          <div className={styles["hero-content"]}>
            <div className={styles["hero-eyebrow"]}>
              <span className={styles["eyebrow-line"]}></span>
              <span>THE GHOST OF YŌTEI</span>
              <span className={styles["eyebrow-line"]}></span>
            </div>

            <h1 className={styles["hero-title"]}>
              <span className={styles["title-top"]}>THE PATH OF</span>

              <span className={styles["title-main"]}>ATSŪ</span>
            </h1>

            <div className={styles["hero-description"]}>
              <span className={styles["description-index"]}>01 / 04</span>

              <p>A warrior forged by loss. A legend written in blood. A journey beyond revenge.</p>
            </div>

            <a
              href='#'
              className={styles["discover-link"]}
            >
              <span className={styles["discover-icon"]}>↗</span>
              <span>DISCOVER THE LEGEND</span>
            </a>
          </div>

          {/* CHARACTER */}

          <div className={styles["character-wrap"]}>
            <div className={styles["character-glow"]}></div>

            <img
              src='/demos/atsu/item.png'
              alt='Atsu, the warrior'
              className={styles.character}
              ref={characterRef}
            />

            <div className={styles["character-shadow"]}></div>
          </div>

          {/* SIDE DETAILS */}

          <div className={styles["hero-side-note"]}>
            <span>蝦夷</span>
            <span className={styles["side-line"]}></span>
            <span>THE LAND OF THE NORTH</span>
          </div>

          <div className={styles["hero-vertical-text"]}>
            <span>NO HONOR WITHOUT SACRIFICE</span>
          </div>

          {/* BOTTOM */}

          <div className={styles["hero-bottom"]}>
            <div className={styles["hero-coordinate"]}>
              <span>43° 12' N</span>
              <span>142° 45' E</span>
            </div>

            <div className={styles["scroll-indicator"]}>
              <span>SCROLL TO EXPLORE</span>

              <div className={styles["scroll-line"]}>
                <span></span>
              </div>
            </div>

            <div className={styles["hero-edition"]}>
              <span>AN UNFORGETTABLE JOURNEY</span>
              <span>VOL. 001 — EZO</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
