/* src/demos/paper-craft/Demo.jsx */

"use client";

import { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function PaperPlane({ loader = false }) {
  if (loader) {
    return (
      <svg
        className={styles.loaderPlane}
        viewBox='0 0 180 130'
        role='img'
        aria-label='Paper airplane'
      >
        <path
          d='M12 57 167 8 101 119 82 76Z'
          fill='#fff9ec'
          stroke='#d6e7e8'
          strokeWidth='2'
          strokeLinejoin='round'
        />
        <path
          d='M12 57 82 76 167 8Z'
          fill='#ffffff'
        />
        <path
          d='M82 76 101 119 111 62 167 8Z'
          fill='#e8ddc9'
        />
        <path
          d='M82 76 111 62'
          stroke='#c8dce0'
          strokeWidth='2'
        />
      </svg>
    );
  }

  return (
    <svg
      className={styles.plane}
      viewBox='0 0 620 400'
    >
      <path
        d='M25 167 590 20 357 374 292 224Z'
        fill='#fff9ec'
        stroke='#e6e0d4'
        strokeWidth='3'
        strokeLinejoin='round'
      />
      <path
        d='M25 167 292 224 590 20Z'
        fill='#ffffff'
      />
      <path
        d='M292 224 357 374 390 174 590 20Z'
        fill='#e9decb'
      />
      <path
        d='M292 224 390 174'
        fill='none'
        stroke='#c9dfe4'
        strokeWidth='3'
      />
      <path
        d='M25 167 292 224 357 374'
        fill='none'
        stroke='#f5ead8'
        strokeWidth='2'
      />
      <path
        d='M292 224 590 20 390 174'
        fill='none'
        stroke='#d4e4e5'
        strokeWidth='2'
      />
    </svg>
  );
}

function Balloon({ variant = "a" }) {
  return (
    <svg
      className={`${styles.balloonSvg} ${variant === "a" ? styles.balloonSvgA : styles.balloonSvgB}`}
      viewBox='0 0 140 220'
    >
      <path
        d='M70 8C28 8 7 43 13 82c5 33 28 58 43 81h28c15-23 38-48 43-81C133 43 112 8 70 8Z'
        fill='#fff4df'
        stroke='#d9e7e4'
        strokeWidth='2'
      />
      {variant === "a" ? (
        <>
          <path
            d='M70 8C48 8 37 33 42 64l14 99h14V8Z'
            fill='#ffc65e'
          />
          <path
            d='M70 8c25 0 37 26 32 56l-13 99H70Z'
            fill='#f6e2bd'
          />
          <path
            d='M13 82c5 33 28 58 43 81h28c15-23 38-48 43-81'
            fill='none'
            stroke='#d4e3e0'
            strokeWidth='2'
          />
        </>
      ) : (
        <>
          <path
            d='M70 8C48 8 37 33 42 64l14 99h14V8Z'
            fill='#5bb8d7'
          />
          <path
            d='M70 8c25 0 37 26 32 56l-13 99H70Z'
            fill='#ffc65e'
          />
        </>
      )}
      <path
        d='M57 163h26l-3 18H60Z'
        fill='#b87945'
      />
      <path
        d='M60 181h20l-4 12H64Z'
        fill='#8c5b3d'
      />
      {variant === "a" && (
        <path
          d='M56 163 61 181M84 163 79 181'
          stroke='#8c5b3d'
          strokeWidth='1.5'
        />
      )}
    </svg>
  );
}

function MountainLandscape() {
  return (
    <div
      className={`${styles.paperLandscape} ${styles.landscapeBack}`}
      aria-hidden='true'
    >
      <svg
        className={styles.mountainScene}
        viewBox='0 0 1440 520'
        preserveAspectRatio='none'
      >
        <defs>
          <filter
            id='paper-shadow'
            x='-20%'
            y='-20%'
            width='140%'
            height='150%'
          >
            <feDropShadow
              dx='0'
              dy='9'
              stdDeviation='7'
              floodColor='#174c62'
              floodOpacity='.16'
            />
          </filter>
        </defs>

        <g
          className={styles.mountainFar}
          filter='url(#paper-shadow)'
        >
          <path
            d='M0 365 170 155 275 275 420 100 590 340 760 165 900 300 1080 110 1260 300 1370 185 1440 265 V520 H0Z'
            fill='#c7e1c4'
          />
          <path
            d='M170 155 205 260 275 275Z'
            fill='#e5f1d9'
          />
          <path
            d='M420 100 455 245 590 340Z'
            fill='#dcebd1'
          />
          <path
            d='M760 165 800 285 900 300Z'
            fill='#b0d6b7'
          />
          <path
            d='M1080 110 1120 240 1260 300Z'
            fill='#e3efd8'
          />
          <path
            d='M1370 185 1390 260 1440 265Z'
            fill='#d7e9cd'
          />
        </g>

        <g
          className={styles.mountainMid}
          filter='url(#paper-shadow)'
        >
          <path
            d='M0 420 155 275 280 375 470 205 650 405 815 270 1000 425 1180 255 1360 385 1440 320 V520 H0Z'
            fill='#80b58a'
          />
          <path
            d='M155 275 190 350 280 375Z'
            fill='#a8cfa1'
          />
          <path
            d='M470 205 510 330 650 405Z'
            fill='#9bc69a'
          />
          <path
            d='M815 270 860 375 1000 425Z'
            fill='#639d78'
          />
          <path
            d='M1180 255 1225 350 1360 385Z'
            fill='#a3ca9c'
          />
        </g>

        <g className={styles.paperHills}>
          <path
            d='M0 410 Q200 340 390 405 T790 400 T1160 385 T1440 370 V520 H0Z'
            fill='#a6d99a'
          />
          <path
            d='M0 455 Q220 365 450 435 T890 425 T1250 415 T1440 430 V520 H0Z'
            fill='#69b875'
          />
          <path
            d='M0 485 Q250 420 480 465 T930 460 T1440 450 V520 H0Z'
            fill='#39865b'
          />
        </g>
      </svg>
    </div>
  );
}

function ForestLandscape() {
  return (
    <div
      className={`${styles.paperLandscape} ${styles.landscapeFront}`}
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 1440 300'
        preserveAspectRatio='none'
      >
        <defs>
          <filter
            id='grass-shadow'
            x='-20%'
            y='-20%'
            width='140%'
            height='160%'
          >
            <feDropShadow
              dx='0'
              dy='-5'
              stdDeviation='5'
              floodColor='#174c36'
              floodOpacity='.2'
            />
          </filter>
        </defs>

        <g
          className={styles.treeRowBack}
          filter='url(#grass-shadow)'
          fill='#327d53'
        >
          <path d='M110 175 135 125 160 175Z' />
          <path d='M115 150 135 105 155 150Z' />
          <path
            d='M130 174V195H140V174Z'
            fill='#a17c50'
          />
          <path d='M330 185 360 120 390 185Z' />
          <path d='M337 150 360 90 383 150Z' />
          <path
            d='M355 184V207H365V184Z'
            fill='#a17c50'
          />
          <path d='M1080 180 1110 115 1140 180Z' />
          <path d='M1088 148 1110 85 1132 148Z' />
          <path
            d='M1105 179V205H1115V179Z'
            fill='#a17c50'
          />
          <path d='M1290 190 1315 135 1340 190Z' />
          <path d='M1297 160 1315 110 1333 160Z' />
          <path
            d='M1311 189V210H1319V189Z'
            fill='#a17c50'
          />
        </g>

        <g
          className={styles.grassLayer}
          filter='url(#grass-shadow)'
        >
          <path
            d='M0 200 Q200 135 420 195 T840 185 T1200 175 T1440 165 V300 H0Z'
            fill='#39865b'
          />
          <path
            d='M0 245 Q180 180 400 230 T820 225 T1200 205 T1440 220 V300 H0Z'
            fill='#286c49'
          />
          <path
            d='M0 252 22 214 18 255 44 226 36 265 60 235 55 270 78 245 72 278 100 248 90 282 118 257 110 290 0 300Z'
            fill='#20583f'
          />
          <path
            d='M1440 230 1410 190 1418 242 1385 210 1398 257 1365 225 1378 269 1345 240 1358 280 1318 250 1330 290 1440 300Z'
            fill='#20583f'
          />
        </g>

        <g
          className={styles.treeRowFront}
          filter='url(#grass-shadow)'
        >
          <g transform='translate(190 95)'>
            <path
              d='M0 110 45 20 90 110Z'
              fill='#174e37'
            />
            <path
              d='M0 110 45 20 45 110Z'
              fill='#368b58'
            />
            <path
              d='M14 80 45 38 45 80Z'
              fill='#62ae70'
            />
            <path
              d='M45 20 70 80 45 80Z'
              fill='#256b46'
            />
            <path
              d='M37 110V145H53V110Z'
              fill='#9a714a'
            />
          </g>
          <g transform='translate(1160 120) scale(.8)'>
            <path
              d='M0 110 45 20 90 110Z'
              fill='#174e37'
            />
            <path
              d='M0 110 45 20 45 110Z'
              fill='#368b58'
            />
            <path
              d='M14 80 45 38 45 80Z'
              fill='#62ae70'
            />
            <path
              d='M45 20 70 80 45 80Z'
              fill='#256b46'
            />
            <path
              d='M37 110V145H53V110Z'
              fill='#9a714a'
            />
          </g>
        </g>

        <g
          className={styles.grassDetails}
          fill='#9bd58a'
        >
          <path d='M100 286 110 258 108 286Z' />
          <path d='M130 294 146 265 138 294Z' />
          <path d='M270 292 280 265 278 294Z' />
          <path d='M1010 290 1025 260 1018 294Z' />
          <path d='M1050 294 1065 272 1060 294Z' />
          <path d='M1270 291 1280 260 1280 294Z' />
        </g>
      </svg>
    </div>
  );
}

export default function PaperCraft() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const root = document.querySelector(`.${styles.page}`);
      if (!root) return;

      const loader = root.querySelector(`.${styles.loader}`);
      const site = root.querySelector(`.${styles.site}`);
      const progress = root.querySelector(`.${styles.loaderProgress}`);
      const count = root.querySelector(`.${styles.loaderCount} span`);
      const hero = root.querySelector(`.${styles.hero}`);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(site, { opacity: 0 });

      const startFloatingAnimations = () => {
        gsap.to(root.querySelector(`.${styles.planeFloat}`), {
          y: -12,
          x: 25,
          rotation: 1,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.balloonFloatA}`), {
          y: -12,
          x: 3,
          rotation: 1,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.balloonFloatB}`), {
          y: -9,
          x: -3,
          rotation: -1,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.sunWrap}`), {
          rotation: 40,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.cloudA}`), {
          x: 60,
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.cloudB}`), {
          x: -85,
          duration: 14,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(root.querySelector(`.${styles.cloudC}`), {
          y: -15,
          x: 10,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      };

      if (reducedMotion) {
        gsap.set(site, { opacity: 1 });
        loader?.remove();
        return;
      }

      const loadState = { value: 0 };

      gsap.to(loadState, {
        value: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          const value = Math.round(loadState.value);
          if (progress) progress.style.width = `${value}%`;
          if (count) count.textContent = String(value).padStart(2, "0");
        },
        onComplete: () => {
          const intro = gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => {
              loader?.remove();
              startFloatingAnimations();
              ScrollTrigger.refresh();
            },
          });

          intro
            .to(root.querySelector(`.${styles.loaderInner}`), {
              y: -18,
              opacity: 0,
              duration: 0.35,
            })
            .to(
              root.querySelector(`.${styles.loaderBefore}`),
              {
                yPercent: -120,
                duration: 0.01,
              },
              0,
            )
            .to(
              loader,
              {
                clipPath: "inset(0 0 100% 0 round 0 0 45% 45%)",
                duration: 0.85,
                ease: "power4.inOut",
              },
              "-=.05",
            )
            .to(site, { opacity: 1, duration: 0.1 }, "<")
            .from(
              root.querySelector(`.${styles.nav}`),
              {
                y: -22,
                opacity: 0,
                duration: 0.7,
              },
              "-=.25",
            )
            .from(
              root.querySelector(`.${styles.eyebrow}`),
              {
                y: 18,
                opacity: 0,
                duration: 0.6,
              },
              "-=.35",
            )
            .from(
              root.querySelectorAll(`.${styles.titleLine}`),
              {
                yPercent: 115,
                stagger: 0.13,
                duration: 0.9,
              },
              "-=.35",
            )
            .from(
              root.querySelector(`.${styles.heroDescription}`),
              {
                y: 18,
                opacity: 0,
                duration: 0.65,
              },
              "-=.5",
            )
            .from(
              root.querySelector(`.${styles.heroActions}`),
              {
                y: 15,
                opacity: 0,
                duration: 0.6,
              },
              "-=.45",
            )
            .from(
              root.querySelector(`.${styles.planeWrap}`),
              {
                x: 130,
                y: 70,
                rotation: -18,
                scale: 0.65,
                opacity: 0,
                duration: 1.4,
              },
              "-=1.1",
            )
            .from(
              root.querySelector(`.${styles.sun}`),
              {
                scale: 0.4,
                rotation: -35,
                opacity: 0,
                duration: 1,
              },
              "-=1.2",
            )
            .from(
              root.querySelectorAll(`.${styles.balloon}`),
              {
                y: 70,
                opacity: 0,
                stagger: 0.16,
                duration: 1.1,
              },
              "-=1",
            )
            .from(
              root.querySelectorAll(`.${styles.cloud}`),
              {
                x: (i) => (i % 2 ? 65 : -65),
                opacity: 0,
                stagger: 0.12,
                duration: 1,
              },
              "-=1",
            )
            .from(
              root.querySelectorAll(`.${styles.scrollCue}, .${styles.bottomLabel}`),
              {
                opacity: 0,
                y: 10,
                stagger: 0.1,
                duration: 0.6,
              },
              "-=.5",
            );
        },
      });

      const parallaxLayers = [
        { selector: `.${styles.mountainFar}`, x: 5, y: 2 },
        { selector: `.${styles.mountainMid}`, x: 10, y: 4 },
        { selector: `.${styles.paperHills}`, x: 15, y: 5 },
        { selector: `.${styles.treeRowBack}`, x: 20, y: 4 },
        { selector: `.${styles.treeRowFront}`, x: 26, y: 6 },
        { selector: `.${styles.grassDetails}`, x: 12, y: 3 },
      ];

      let removeParallaxListeners = null;

      if (hero && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const moveFunctions = [];

        parallaxLayers.forEach(({ selector, x, y }) => {
          hero.querySelectorAll(selector).forEach((element) => {
            const moveX = gsap.quickTo(element, "x", { duration: 1.2, ease: "power3.out" });
            const moveY = gsap.quickTo(element, "y", { duration: 1.2, ease: "power3.out" });
            moveFunctions.push({ element, moveX, moveY, x, y });
          });
        });

        const handlePointerMove = (event) => {
          const bounds = hero.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;

          moveFunctions.forEach(({ moveX, moveY, x: depthX, y: depthY }) => {
            moveX(-x * depthX);
            moveY(-y * depthY);
          });
        };

        const resetParallax = () => {
          moveFunctions.forEach(({ moveX, moveY }) => {
            moveX(0);
            moveY(0);
          });
        };

        hero.addEventListener("pointermove", handlePointerMove);
        hero.addEventListener("pointerleave", resetParallax);

        removeParallaxListeners = () => {
          hero.removeEventListener("pointermove", handlePointerMove);
          hero.removeEventListener("pointerleave", resetParallax);
        };
      }

      gsap.to(root.querySelector(`.${styles.mountainFar}`), {
        y: 12,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
      });

      gsap.to(root.querySelector(`.${styles.mountainMid}`), {
        y: 24,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
      });

      gsap.to(root.querySelector(`.${styles.paperHills}`), {
        y: 34,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
      });

      return () => {
        removeParallaxListeners?.();
      };
    },
    { scope: null },
  );

  const handleMenuToggle = contextSafe(() => {
    setMenuOpen((current) => !current);
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.page}>
      <div
        className={styles.loader}
        aria-label='Loading Papertrip'
      >
        <div className={styles.loaderBefore} />
        <div className={styles.loaderInner}>
          <PaperPlane loader />
          <div className={styles.loaderBrand}>Papertrip</div>
          <div className={styles.loaderTrack}>
            <div className={styles.loaderProgress} />
          </div>
          <div className={styles.loaderCount}>
            PREPARING YOUR JOURNEY <span>00</span>%
          </div>
        </div>
      </div>

      <main className={styles.site}>
        <section
          className={styles.hero}
          id='home'
        >
          <header className={styles.nav}>
            <a
              className={styles.brand}
              href='#home'
              aria-label='Papertrip home'
            >
              <svg
                viewBox='0 0 40 40'
                fill='none'
                aria-hidden='true'
              >
                <path
                  d='M4 18 35 5 22 35 17 22Z'
                  stroke='currentColor'
                  strokeWidth='2.2'
                  strokeLinejoin='round'
                />
                <path
                  d='M4 18 17 22 35 5 17 22 22 35'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinejoin='round'
                />
              </svg>
              PAPERTRIP
            </a>

            <button
              className={styles.menuToggle}
              onClick={handleMenuToggle}
              aria-label='Toggle navigation'
              aria-expanded={menuOpen}
            >
              <span>{menuOpen ? "×" : "☰"}</span>
            </button>

            <nav className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
              <a
                href='#home'
                onClick={closeMenu}
              >
                Home
              </a>
              <a
                href='#about'
                onClick={closeMenu}
              >
                About
              </a>
              <a
                href='#destinations'
                onClick={closeMenu}
              >
                Destinations
              </a>
              <a
                href='#contact'
                onClick={closeMenu}
              >
                Contact
              </a>
            </nav>
          </header>

          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span>Discover</span>
              <span className={styles.dot} />
              <span>Explore</span>
              <span className={styles.dot} />
              <span>Travel</span>
            </div>

            <h1>
              <span className={styles.titleLine}>Big dreams</span>
              <span className={styles.titleLine}>
                need a <em>direction.</em>
              </span>
            </h1>

            <p className={styles.heroDescription}>Pack your curiosity. The world is waiting. Let's go somewhere wonderful.</p>

            <div className={styles.heroActions}>
              <a
                className={styles.cta}
                href='#destinations'
              >
                Explore
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <path
                    d='M4 12h15m-6-6 6 6-6 6'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </a>
              <span className={styles.smallNote}>
                Your next chapter
                <br />
                starts here
              </span>
            </div>
          </div>

          <MountainLandscape />

          <div
            className={styles.artboard}
            aria-hidden='true'
          >
            <div className={styles.sunWrap}>
              <svg
                className={styles.sun}
                viewBox='0 0 220 220'
              >
                <g
                  stroke='#ffc65e'
                  strokeWidth='9'
                  strokeLinecap='square'
                >
                  <path d='M110 8v22M110 190v22M8 110h22M190 110h22M38 38l16 16M166 166l16 16M182 38l-16 16M54 166l-16 16' />
                </g>
                <circle
                  cx='110'
                  cy='110'
                  r='70'
                  fill='#ffc65e'
                  stroke='#f4b84c'
                  strokeWidth='2'
                />
                <path
                  d='M63 91c18-22 40-29 66-25'
                  fill='none'
                  stroke='#ffe4a0'
                  strokeWidth='3'
                  strokeLinecap='round'
                  opacity='.8'
                />
              </svg>
            </div>

            <div className={`${styles.cloud} ${styles.cloudA}`} />
            <div className={`${styles.cloud} ${styles.cloudB}`} />
            <div className={`${styles.cloud} ${styles.cloudC}`} />

            <svg
              className={styles.flightPath}
              viewBox='0 0 700 450'
            >
              <path d='M12 425C170 360 220 265 360 225S550 110 680 20' />
            </svg>

            <div className={styles.planeWrap}>
              <div className={styles.planeFloat}>
                <PaperPlane />
              </div>
            </div>

            <div className={`${styles.balloon} ${styles.balloonA}`}>
              <div className={styles.balloonFloatA}>
                <Balloon variant='a' />
              </div>
            </div>

            <div className={`${styles.balloon} ${styles.balloonB}`}>
              <div className={styles.balloonFloatB}>
                <Balloon variant='b' />
              </div>
            </div>

            <svg
              className={`${styles.bird} ${styles.birdA}`}
              viewBox='0 0 80 45'
            >
              <path
                d='M4 26Q21 6 39 27Q55 7 76 10'
                fill='none'
                stroke='#fff8e9'
                strokeWidth='4'
                strokeLinecap='round'
              />
            </svg>
            <svg
              className={`${styles.bird} ${styles.birdB}`}
              viewBox='0 0 80 45'
            >
              <path
                d='M4 26Q21 6 39 27Q55 7 76 10'
                fill='none'
                stroke='#fff8e9'
                strokeWidth='4'
                strokeLinecap='round'
              />
            </svg>
          </div>

          <ForestLandscape />

          <div className={styles.bottomLabel}>A little paper. A lot of world.</div>

          <a
            className={styles.scrollCue}
            href='#about'
          >
            <span className={styles.mouse} />
            <span>Scroll to wander</span>
          </a>
        </section>
      </main>
    </div>
  );
}
