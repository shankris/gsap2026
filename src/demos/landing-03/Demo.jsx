// src/demos/landing-03/Demo.jsx

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUp } from "lucide-react";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger);

const TITLE_LINES = ["RED", "DESIRE"];

function TitleLine({ children, red }) {
  return (
    <span className={`${styles.titleLine} ${red ? styles.titleLineRed : styles.titleLineWhite}`}>
      {Array.from(children).map((character, index) => (
        <span
          className={styles.titleChar}
          key={`${character}-${index}`}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

export default function Landing03() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const $ = (name) => root.querySelector(`.${styles[name]}`);
    const $$ = (name) => Array.from(root.querySelectorAll(`.${styles[name]}`));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const header = $("header");
    const hero = $("hero");
    const preloader = $("preloader");
    const preloaderLine = $("preloaderLine");
    const preloaderCounter = $("preloaderCounter");
    const portraitPanel = $("portraitPanel");
    const portrait = $("portrait");
    const contentPanel = $("contentPanel");
    const backgroundImage = $("backgroundImage");
    const cursorGlow = $("cursorGlow");
    const titleChars = $$(".titleChar");
    const story = $("story");
    const storyElements = [$("storyEyebrow"), $("storyTitle"), $("storyText"), $("storyBack")];

    const cleanups = [];

    const ctx = gsap.context(() => {
      const updateHeader = () => {
        header.classList.toggle(styles.isScrolled, window.scrollY > 40);
      };

      const handlePortraitError = () => {
        portrait.style.display = "none";
        $("portraitImage").style.background = "radial-gradient(ellipse at center, #333, #080808 75%)";
      };

      portrait.addEventListener("error", handlePortraitError);
      window.addEventListener("scroll", updateHeader, { passive: true });
      updateHeader();

      if (prefersReducedMotion) {
        root.classList.add(styles.pageReady);
        gsap.set(preloader, { display: "none" });
        gsap.set([header, portraitPanel, contentPanel, $("footer"), $("eyebrow"), $("contentDivider"), $("explore"), ...$$("socialLink"), $("contentPanelBottom")], { clearProps: "all" });
        gsap.set(storyElements, { clearProps: "all" });
        return;
      }

      const startIntro = () => {
        root.classList.add(styles.pageReady);

        gsap.set(titleChars, {
          display: "inline-block",
          yPercent: 120,
          rotateX: -80,
          opacity: 0,
          transformOrigin: "50% 100%",
        });

        gsap.set($("description"), { opacity: 0, y: 20 });

        gsap.set([header, portraitPanel, contentPanel, $("footer"), $("eyebrow"), $("contentDivider"), $("explore"), ...$$("socialLink"), $("contentPanelBottom")], { opacity: 0 });

        gsap.set(portraitPanel, {
          x: -80,
          rotateY: 12,
          scale: 0.94,
        });
        gsap.set(contentPanel, {
          x: 80,
          rotateY: -20,
          transformPerspective: 1400,
          transformOrigin: "left center",
        });
        gsap.set(portrait, { scale: 1.3 });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        intro
          .to(header, { opacity: 1, duration: 0.7 }, 0)
          .to(
            portraitPanel,
            {
              opacity: 1,
              x: 0,
              rotateY: 0,
              scale: 1,
              duration: 1.4,
              ease: "power4.out",
            },
            0.1,
          )
          .to(
            contentPanel,
            {
              opacity: 1,
              x: 0,
              rotateY: 0,
              duration: 1.25,
              ease: "power4.out",
            },
            0.35,
          )
          .to(portrait, { scale: 1.08, duration: 2, ease: "power2.out" }, 0.2)
          .to($("eyebrow"), { opacity: 1, duration: 0.6 }, 0.85)
          .to(
            titleChars,
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.035,
              ease: "power4.out",
            },
            0.9,
          )
          .to(
            $("contentDivider"),
            {
              opacity: 1,
              scaleX: 1,
              transformOrigin: "left center",
              duration: 0.6,
            },
            ">-0.2",
          )
          .to($("description"), { y: 0, opacity: 1, duration: 0.65, ease: "power2.out" }, "<")
          .to($("explore"), { opacity: 1, duration: 0.5 }, ">-0.2")
          .to($$("socialLink"), { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "<")
          .to([$("contentPanelBottom"), $("footer")], { opacity: 1, duration: 0.6 }, "-=0.2")
          .set(preloader, { display: "none" });
      };

      const startPreloader = () => {
        const counter = { value: 0 };
        const timeline = gsap.timeline({ onComplete: startIntro });

        timeline
          .to(counter, {
            value: 100,
            duration: 1.5,
            ease: "power1.inOut",
            onUpdate: () => {
              preloaderCounter.textContent = String(Math.round(counter.value)).padStart(3, "0");
            },
          })
          .to(
            preloaderLine,
            {
              width: "140px",
              duration: 1.5,
              ease: "power2.inOut",
            },
            0,
          )
          .to([$("preloaderText"), preloaderCounter], { opacity: 0, duration: 0.3 }, 1.2)
          .to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
          });
      };

      if (canHover) {
        const portraitImage = $("portraitImage");
        const title = $("title");
        const frame = $("portraitFrame");
        let hoverActive = false;

        const onPointerEnter = () => {
          hoverActive = true;
          gsap.to(hero, { y: -4, duration: 0.6, ease: "power3.out" });
          gsap.to(title, {
            textShadow: "0 0 35px rgba(242, 13, 34, 0.12)",
            duration: 0.5,
          });
          gsap.to(frame, {
            x: -14,
            y: 5,
            duration: 0.6,
            ease: "power3.out",
          });
        };

        const onPointerMove = (event) => {
          if (!hoverActive) return;
          const bounds = hero.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;

          gsap.to(portraitPanel, {
            rotateY: x * 8,
            rotateX: -y * 6,
            transformPerspective: 1400,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(contentPanel, {
            rotateY: -x * 7,
            rotateX: y * 4,
            z: 12,
            transformPerspective: 1400,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(portraitImage, {
            x: x * -8,
            y: y * -6,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(cursorGlow, {
            x: event.clientX,
            y: event.clientY,
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(backgroundImage, {
            x: x * -18,
            y: y * -12,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const onPointerLeave = () => {
          hoverActive = false;
          gsap.to([portraitPanel, contentPanel], {
            rotateX: 0,
            rotateY: 0,
            z: 0,
            duration: 0.9,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to([hero, portraitImage], {
            y: 0,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(frame, {
            x: -10,
            y: 8,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to(title, {
            textShadow: "0 0 0px rgba(242, 13, 34, 0)",
            duration: 0.5,
          });
          gsap.to(cursorGlow, { opacity: 0, duration: 0.4 });
          gsap.to(backgroundImage, {
            x: 0,
            y: 0,
            duration: 1,
            ease: "power3.out",
          });
        };

        hero.addEventListener("pointerenter", onPointerEnter);
        hero.addEventListener("pointermove", onPointerMove);
        hero.addEventListener("pointerleave", onPointerLeave);

        cleanups.push(() => {
          hero.removeEventListener("pointerenter", onPointerEnter);
          hero.removeEventListener("pointermove", onPointerMove);
          hero.removeEventListener("pointerleave", onPointerLeave);
        });
      }

      gsap.set(storyElements, { opacity: 0, y: 35 });
      ScrollTrigger.create({
        trigger: story,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(storyElements, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
          });
        },
      });

      const beginWhenReady = async () => {
        try {
          if (document.fonts?.ready) await document.fonts.ready;
          if (portrait.complete) {
            if (portrait.decode) await portrait.decode().catch(() => {});
          } else {
            await new Promise((resolve) => {
              portrait.addEventListener("load", resolve, { once: true });
              portrait.addEventListener("error", resolve, { once: true });
            });
          }
        } catch {
          // Continue the intro if a font or image cannot be decoded.
        }
        if (root.isConnected) startPreloader();
      };

      beginWhenReady();

      cleanups.push(() => {
        portrait.removeEventListener("error", handlePortraitError);
        window.removeEventListener("scroll", updateHeader);
      });
    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      <div className={styles.preloader}>
        <div className={styles.preloaderLine} />
        <span className={styles.preloaderText}>WELCOME TO THE DARK SIDE</span>
        <span className={styles.preloaderCounter}>000</span>
      </div>

      <div className={styles.background}>
        <div className={styles.backgroundImage} />
        <div className={styles.backgroundVignette} />
        <div className={styles.backgroundGlow} />
        <video
          className={styles.backgroundVideo}
          src='/demos/landing-03/bg.mp4'
          autoPlay
          loop
          muted
          playsInline
          aria-hidden='true'
        />
      </div>

      <div className={styles.grain} />
      <div className={styles.rain} />
      <div className={styles.cursorGlow} />

      <main className={styles.scene}>
        <header className={styles.header}>
          <a
            href='#top'
            className={styles.logo}
            aria-label='Sin City home'
          >
            SIN<span> CITY</span>
          </a>
          <div className={styles.headerStatus}>
            <span className={styles.statusDot} />
            NOIR ARCHIVE / #466
          </div>
          <div className={styles.headerCoordinates}>
            36°10&apos;12.0&quot;N
            <br />
            115°08&apos;37.0&quot;W
          </div>
        </header>

        <section
          className={styles.hero}
          id='top'
        >
          <div className={styles.portraitPanel}>
            <div className={styles.portraitFrame} />
            <div className={styles.portraitImage}>
              <img
                className={styles.portrait}
                src='/demos/landing-03/item.png'
                alt='A mysterious femme fatale in a noir city'
              />
              <div className={styles.portraitShade} />
            </div>
            <div className={styles.portraitLabel}>
              <span>FIG. 001</span>
              <span>THE FEMME FATALE</span>
            </div>
            <div className={styles.portraitVertical}>CLASSIFIED / SIN CITY</div>
          </div>

          <div className={styles.contentPanel}>
            <div className={styles.contentPanelTop}>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                EVERY CITY HAS A SECRET
              </span>
              <span className={styles.contentPanelNumber}>01 — 01</span>
            </div>

            <div className={styles.content}>
              <h1 className={styles.title}>
                <TitleLine red>{TITLE_LINES[0]}</TitleLine>
                <TitleLine>{TITLE_LINES[1]}</TitleLine>
              </h1>
              <div className={styles.contentDivider} />
              <p className={styles.description}>
                In a world drained of color,
                <span> desire leaves a mark.</span>
                <br />
                Dangerous. Beautiful. Unforgettable.
              </p>

              <a
                href='#story'
                className={styles.explore}
              >
                <span className={styles.exploreText}>ENTER THE CITY</span>
                <span className={styles.exploreIcon}>
                  <ArrowRight
                    size={15}
                    strokeWidth={1.5}
                  />
                </span>
              </a>

              <div className={styles.socials}>
                <a
                  href='#story'
                  aria-label='Instagram'
                  className={styles.socialLink}
                >
                  <a
                    href='#'
                    className={styles.socialLink}
                    aria-label='Instagram'
                  >
                    <span className={styles.socialPlaceholder}>IG</span>
                  </a>
                </a>
                <a
                  href='#story'
                  aria-label='X'
                  className={styles.socialLink}
                >
                  <a
                    href='#'
                    className={styles.socialLink}
                    aria-label='YouTube'
                  >
                    <span className={styles.socialPlaceholder}>Tw</span>
                  </a>
                </a>
                <a
                  href='#story'
                  aria-label='YouTube'
                  className={styles.socialLink}
                >
                  <a
                    href='#'
                    className={styles.socialLink}
                    aria-label='YouTube'
                  >
                    <span className={styles.socialPlaceholder}>YT</span>
                  </a>
                </a>
              </div>
            </div>

            <div className={styles.contentPanelBottom}>
              <span>LOVE IS A DANGEROUS GAME</span>
              <span className={styles.bottomMark}>SC / 001</span>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.footerDot} />
            THE NIGHT IS YOUNG
          </div>
          <a
            href='#story'
            className={styles.scrollIndicator}
          >
            <span>SCROLL TO DISCOVER</span>
            <span className={styles.scrollIndicatorLine} />
          </a>
          <div className={styles.footerRight}>LAS VEGAS / AFTER DARK</div>
        </footer>
      </main>

      <section
        className={styles.story}
        id='story'
      >
        <div className={styles.storyInner}>
          <span className={styles.storyEyebrow}>THE CITY NEVER FORGETS</span>
          <h2 className={styles.storyTitle}>
            Some stories
            <br />
            <span>are written in red.</span>
          </h2>
          <p className={styles.storyText}>Behind every shadow, there is a secret. Behind every kiss, a price. And somewhere in the darkness, the city is waiting for you.</p>
          <a
            href='#top'
            className={styles.storyBack}
          >
            <ArrowUp
              size={14}
              strokeWidth={1.5}
            />
            BACK TO THE NIGHT
          </a>
        </div>
      </section>
    </div>
  );
}
