// src/demos/landing-02/Demo.jsx

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import styles from "./Demo.module.css";

gsap.registerPlugin(Draggable);

const menuItems = [
  { number: "01", label: "HOME", href: "#home" },
  { number: "02", label: "PLAYGROUND", href: "#play" },
  { number: "03", label: "ABOUT", href: "#about" },
  { number: "04", label: "CONTACT", href: "#contact" },
];

const leafEmojis = ["🍂", "🍁", "🍂", "🍁", "🍂"];

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const $ = (className) => root.querySelector(`.${styles[className]}`);
      const $$ = (className) => gsap.utils.toArray(`.${styles[className]}`, root);

      const loader = $(".loader");
      const loaderValue = $(".loaderValue");
      const loaderProgress = $(".loaderProgress");
      const loaderBall = $(".loaderBall");
      const loaderStatus = $(".loaderStatus");

      const page = $(".page");
      const heroImage = $(".heroImage");
      const orb = $(".elasticOrb");
      const heroCta = $(".heroCta");
      const menuButton = $(".menuButton");
      const menuOverlay = $(".menuOverlay");
      const menuLinks = $$(".menuLink");
      const menuLinkTexts = $$(".menuLinkText");
      const menuDecoration = $(".menuDecoration");
      const leaves = $$(".autumnLeaf");
      const paths = $$(".elasticLine");

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let menuOpen = false;
      let menuAnimating = false;
      let leavesStarted = false;
      let draggableInstance = null;

      const randomBetween = (min, max) => Math.random() * (max - min) + min;

      gsap.set(page, { autoAlpha: 0 });

      gsap.set($$(".titleLine span"), {
        yPercent: 130,
        rotate: 5,
      });

      gsap.set([$(".header"), $(".heroLabel"), $(".heroBottom"), ...$$(".artLabel"), $(".artStar"), $(".heroSideNote"), $(".footer")], {
        autoAlpha: 0,
        y: 25,
      });

      gsap.set(heroImage, {
        autoAlpha: 0,
        scale: 0.55,
        rotation: -20,
        transformOrigin: "50% 50%",
      });

      gsap.set(orb, {
        scale: 0,
        rotation: -90,
      });

      gsap.set(menuLinks, {
        y: 65,
        scaleY: 0.65,
        autoAlpha: 0,
        transformOrigin: "left bottom",
      });

      gsap.set(menuLinkTexts, {
        x: -35,
        skewX: 8,
      });

      gsap.set(menuDecoration, {
        scale: 0.3,
        rotation: -45,
      });

      // Preloader
      const loading = { value: 0 };

      const loaderTimeline = gsap.timeline({
        defaults: { ease: "none" },
        onComplete: startIntro,
      });

      loaderTimeline.to(loading, {
        value: 100,
        duration: reducedMotion ? 0.25 : 2.1,
        onUpdate: () => {
          const progress = Math.round(loading.value);

          loaderValue.textContent = String(progress).padStart(3, "0");

          gsap.set(loaderProgress, {
            width: `${progress}%`,
          });

          if (progress < 35) {
            loaderStatus.textContent = "INITIALIZING";
          } else if (progress < 75) {
            loaderStatus.textContent = "BENDING REALITY";
          } else {
            loaderStatus.textContent = "READY TO PLAY";
          }
        },
      });

      if (!reducedMotion) {
        gsap.to(loaderBall, {
          keyframes: [
            { scaleX: 1.35, scaleY: 0.72, duration: 0.25 },
            { scaleX: 0.8, scaleY: 1.3, duration: 0.25 },
            { scaleX: 1, scaleY: 1, duration: 0.35 },
          ],
          repeat: -1,
          repeatDelay: 0.15,
          ease: "power2.inOut",
        });
      }

      // Menu animation
      const menuTimeline = gsap.timeline({
        paused: true,
        onStart: () => {
          menuAnimating = true;
          menuOverlay.style.pointerEvents = "auto";
        },
        onComplete: () => {
          menuAnimating = false;
        },
        onReverseComplete: () => {
          menuAnimating = false;
          menuOverlay.style.pointerEvents = "none";
          menuOverlay.setAttribute("aria-hidden", "true");

          gsap.set(menuLinks, {
            y: 65,
            scaleY: 0.65,
            autoAlpha: 0,
          });

          gsap.set(menuLinkTexts, {
            x: -35,
            skewX: 8,
          });
        },
      });

      menuTimeline
        .set(menuOverlay, { visibility: "visible" })
        .to(menuOverlay, {
          clipPath: "circle(150% at calc(100% - 65px) 55px)",
          duration: reducedMotion ? 0.2 : 0.9,
          ease: reducedMotion ? "none" : "elastic.out(1, 0.72)",
        })
        .to(
          menuDecoration,
          {
            scale: 1,
            rotation: 0,
            duration: reducedMotion ? 0.2 : 1.1,
            ease: "elastic.out(1, 0.45)",
          },
          "-=0.65",
        )
        .to(
          menuLinks,
          {
            y: 0,
            scaleY: 1,
            autoAlpha: 1,
            duration: reducedMotion ? 0.2 : 0.9,
            stagger: reducedMotion ? 0 : 0.09,
            ease: "elastic.out(1, 0.55)",
          },
          "-=0.7",
        )
        .to(
          menuLinkTexts,
          {
            x: 0,
            skewX: 0,
            duration: reducedMotion ? 0.2 : 0.8,
            stagger: reducedMotion ? 0 : 0.09,
            ease: "back.out(1.8)",
          },
          "<",
        );

      function toggleMenu(forceClose = false) {
        if (menuAnimating) return;

        const shouldOpen = forceClose ? false : !menuOpen;
        if (shouldOpen === menuOpen) return;

        menuOpen = shouldOpen;

        menuButton.classList.toggle(styles.isActive, menuOpen);
        menuButton.setAttribute("aria-expanded", String(menuOpen));

        if (menuOpen) {
          menuOverlay.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";
          menuTimeline.play();
        } else {
          document.body.style.overflow = "";
          menuTimeline.reverse();
        }
      }

      menuButton.addEventListener("click", () => toggleMenu());

      menuLinks.forEach((link) => {
        link.addEventListener("click", () => toggleMenu(true));
      });

      const handleKeyDown = (event) => {
        if (event.key === "Escape" && menuOpen) {
          toggleMenu(true);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      // Elastic background lines
      function startElasticLines() {
        const alternatePaths = ["M -100 250 C 180 120, 350 20, 520 180 S 920 480, 1100 240 S 1350 0, 1540 220", "M -100 320 C 180 460, 350 580, 520 400 S 900 100, 1080 330 S 1350 640, 1540 350", "M -100 680 C 180 520, 370 730, 600 520 S 950 350, 1130 650 S 1380 610, 1540 500"];

        paths.forEach((path, index) => {
          const length = path.getTotalLength();

          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 0,
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: [0.25, 0.16, 0.11][index],
            duration: reducedMotion ? 0.2 : 1.6 + index * 0.35,
            delay: reducedMotion ? 0 : index * 0.16,
            ease: "power3.out",
            onComplete: () => {
              if (reducedMotion) return;

              gsap.set(path, {
                strokeDasharray: "none",
                strokeDashoffset: 0,
              });

              gsap.to(path, {
                attr: { d: alternatePaths[index] },
                duration: 3.5 + index * 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            },
          });
        });

        if (!reducedMotion) {
          gsap.to($(".elasticLinesGroup"), {
            x: 12,
            y: -8,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      }

      // Floating leaves
      function startAutumnAnimation() {
        if (leavesStarted || reducedMotion) return;
        leavesStarted = true;

        const container = $(".autumnParticles");
        const mobile = window.matchMedia("(max-width: 600px)").matches;

        leaves.forEach((leaf) => {
          const duration = randomBetween(mobile ? 7 : 8, mobile ? 13 : 17);
          const wind = randomBetween(mobile ? -65 : -110, mobile ? 65 : 110);

          gsap.set(leaf, {
            x: randomBetween(0, container.clientWidth),
            y: randomBetween(-container.clientHeight, 0),
            fontSize: randomBetween(mobile ? 12 : 16, mobile ? 22 : 30),
            opacity: randomBetween(0.35, 0.85),
            rotation: randomBetween(0, 360),
            scale: randomBetween(0.8, 1.2),
          });

          gsap.to(leaf, {
            y: () => container.clientHeight + 60,
            x: `+=${wind}`,
            rotation: `+=${randomBetween(240, 600)}`,
            duration,
            ease: "none",
            repeat: -1,
            repeatRefresh: true,
            delay: randomBetween(0, 8),
            modifiers: {
              x: (value) => {
                const width = container.clientWidth;
                return `${gsap.utils.wrap(-60, width + 60, parseFloat(value))}px`;
              },
            },
          });

          gsap.to(leaf, {
            x: `+=${randomBetween(-35, 35)}`,
            duration: randomBetween(1.5, 3),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      }

      // Idle animation
      function startIdleAnimation() {
        if (reducedMotion) return;

        const mobile = window.matchMedia("(max-width: 600px)").matches;

        gsap.to(heroImage, {
          y: mobile ? -140 : -20,
          rotation: mobile ? -6 : -5,
          duration: mobile ? 6 : 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to($(".artStar"), {
          scale: 1.12,
          rotation: 4,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Intro sequence
      function startIntro() {
        gsap.killTweensOf(loaderBall);

        const intro = gsap.timeline();

        intro.set(page, { autoAlpha: 1 });

        intro.to(loader, {
          scaleY: 0,
          transformOrigin: "50% 0%",
          duration: reducedMotion ? 0.2 : 0.85,
          ease: reducedMotion ? "none" : "elastic.inOut(1, 0.55)",
        });

        intro.set(loader, { display: "none" });

        intro.call(startElasticLines);

        intro.to(
          $(".header"),
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.25",
        );

        intro.to(
          $(".heroLabel"),
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        );

        intro.to(
          $$(".titleLine span"),
          {
            yPercent: 0,
            rotate: 0,
            duration: reducedMotion ? 0.2 : 1.25,
            stagger: reducedMotion ? 0 : 0.12,
            ease: "elastic.out(1, 0.65)",
          },
          "-=0.2",
        );

        intro.to(
          heroImage,
          {
            autoAlpha: 1,
            scale: 1,
            rotation: -8,
            duration: reducedMotion ? 0.2 : 1.5,
            ease: "elastic.out(1, 0.48)",
          },
          "-=0.95",
        );

        intro
          .to(
            [$(".artLabel"), $(".artStar"), $(".heroSideNote")],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
            },
            "-=0.8",
          )
          .to(
            $(".heroBottom"),
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "back.out(1.5)",
            },
            "-=0.65",
          )
          .to(
            orb,
            {
              scale: 1,
              rotation: 0,
              duration: reducedMotion ? 0.2 : 1.2,
              ease: "elastic.out(1, 0.35)",
            },
            "-=0.7",
          )
          .to(
            $(".footer"),
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.55",
          );

        intro.call(startIdleAnimation);
        intro.call(startAutumnAnimation);
      }

      // Draggable orb
      if (!reducedMotion) {
        let previousX = 0;
        let previousY = 0;

        draggableInstance = Draggable.create(orb, {
          type: "x,y",

          onPress() {
            previousX = this.x;
            previousY = this.y;

            gsap.killTweensOf(orb);

            gsap.to(orb, {
              scale: 0.92,
              duration: 0.2,
              ease: "power2.out",
            });
          },

          onDrag() {
            const deltaX = this.x - previousX;
            const deltaY = this.y - previousY;

            previousX = this.x;
            previousY = this.y;

            const stretch = Math.min(Math.hypot(deltaX, deltaY) * 0.012, 0.3);

            const direction = deltaX >= 0 ? 1 : -1;

            gsap.to(orb, {
              scaleX: 1 + stretch,
              scaleY: 1 - stretch * 0.7,
              rotation: this.x * 0.04,
              duration: 0.18,
              overwrite: "auto",
              ease: "power2.out",
            });

            gsap.to(orb, {
              skewX: direction * Math.min(Math.abs(deltaX) * 0.5, 12),
              duration: 0.15,
              overwrite: "auto",
            });
          },

          onRelease() {
            gsap.to(orb, {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              skewX: 0,
              duration: 1.5,
              overwrite: "auto",
              ease: "elastic.out(1, 0.35)",
            });
          },
        })[0];
      }

      // CTA hover
      const handleCtaEnter = () => {
        if (reducedMotion) return;

        gsap.to(heroCta, {
          scaleX: 1.06,
          scaleY: 0.94,
          duration: 0.25,
          ease: "power2.out",
        });
      };

      const handleCtaLeave = () => {
        if (reducedMotion) return;

        gsap.to(heroCta, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.35)",
        });
      };

      heroCta.addEventListener("mouseenter", handleCtaEnter);
      heroCta.addEventListener("mouseleave", handleCtaLeave);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";

        menuButton.removeEventListener("click", toggleMenu);
        menuLinks.forEach((link) => {
          link.removeEventListener("click", toggleMenu);
        });

        heroCta.removeEventListener("mouseenter", handleCtaEnter);
        heroCta.removeEventListener("mouseleave", handleCtaLeave);

        if (draggableInstance) draggableInstance.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      <div className={styles.autumnParticles}>
        {Array.from({ length: 18 }, (_, index) => (
          <span
            className={styles.autumnLeaf}
            key={index}
          >
            {leafEmojis[index % leafEmojis.length]}
          </span>
        ))}
      </div>

      <div className={styles.loader}>
        <div className={styles.loaderTop}>
          <span>ELASTIC®</span>
          <span>CREATIVE EXPERIMENT / #469</span>
        </div>

        <div className={styles.loaderCenter}>
          <div className={styles.loaderBall} />
          <div className={styles.loaderNumber}>
            <span className={styles.loaderValue}>000</span>
            <span className={styles.loaderPercent}>%</span>
          </div>
          <p className={styles.loaderLabel}>LOADING YOUR EXPERIENCE</p>
        </div>

        <div className={styles.loaderBottom}>
          <span>STRETCH YOUR IMAGINATION</span>
          <div className={styles.loaderTrack}>
            <div className={styles.loaderProgress} />
          </div>
          <span className={styles.loaderStatus}>INITIALIZING</span>
        </div>
      </div>

      <main className={styles.page}>
        <header className={styles.header}>
          <a
            href='#home'
            className={styles.logo}
          >
            ELASTIC<span>®</span>
          </a>

          <div className={styles.headerNote}>
            A LITTLE BIT OF
            <span>PLAYFUL CHAOS.</span>
          </div>

          <button
            className={styles.menuButton}
            type='button'
            aria-label='Toggle navigation menu'
            aria-controls='elastic-menu'
            aria-expanded='false'
          >
            <span />
            <span />
          </button>
        </header>

        <nav
          className={styles.menuOverlay}
          id='elastic-menu'
          aria-hidden='true'
        >
          <div className={styles.menuOverlayTop}>
            <span>ELASTIC® — MENU</span>
            <span>CHOOSE YOUR DIRECTION</span>
          </div>

          <div className={styles.menuLinks}>
            {menuItems.map((item) => (
              <a
                href={item.href}
                className={styles.menuLink}
                key={item.number}
              >
                <span className={styles.menuLinkNumber}>{item.number}</span>
                <span className={styles.menuLinkText}>{item.label}</span>
                <span className={styles.menuLinkArrow}>↗</span>
              </a>
            ))}
          </div>

          <div className={styles.menuOverlayBottom}>
            <span>STAY CURIOUS.</span>
            <span>BREAK THE RULES. © 2026</span>
          </div>

          <div className={styles.menuDecoration}>✳</div>
        </nav>

        <section
          className={styles.hero}
          id='home'
        >
          <svg
            className={styles.elasticLines}
            viewBox='0 0 1440 760'
            preserveAspectRatio='none'
            aria-hidden='true'
          >
            <defs>
              <filter
                id='elastic-glow'
                x='-30%'
                y='-30%'
                width='160%'
                height='160%'
              >
                <feGaussianBlur
                  stdDeviation='5'
                  result='blur'
                />
                <feMerge>
                  <feMergeNode in='blur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>

            <g className={styles.elasticLinesGroup}>
              <path
                className={`${styles.elasticLine} ${styles.elasticLineOne}`}
                d='M -100 180 C 180 40, 330 80, 500 220 S 900 400, 1100 190 S 1350 60, 1540 160'
              />
              <path
                className={`${styles.elasticLine} ${styles.elasticLineTwo}`}
                d='M -100 390 C 180 550, 350 500, 520 340 S 900 180, 1080 390 S 1350 580, 1540 410'
              />
              <path
                className={`${styles.elasticLine} ${styles.elasticLineThree}`}
                d='M -100 610 C 180 460, 370 680, 600 590 S 950 430, 1130 590 S 1380 700, 1540 570'
              />
            </g>
          </svg>

          <div className={styles.heroLabel}>
            <span className={styles.statusDot} />
            INDEPENDENT MOTION STUDIO
          </div>

          <div className={styles.heroTitle}>
            <h1 className={`${styles.titleLine} ${styles.titleLineOne}`}>
              <span>STRETCH</span>
            </h1>
            <h1 className={`${styles.titleLine} ${styles.titleLineTwo}`}>
              <span>YOUR</span>
              <span className={styles.titleOutline}>MIND.</span>
            </h1>
          </div>

          <div className={styles.heroArt}>
            <img
              src='/demos/landing-02/card.png'
              alt=''
              className={styles.heroImage}
            />

            <div className={styles.artLabel}>
              <span>FIG. 001</span>
              <span>THE SHAPE SHIFTER</span>
            </div>

            <div className={styles.artStar}>✳</div>
          </div>

          <div className={styles.heroBottom}>
            <div className={styles.heroDescription}>
              <span className={styles.descriptionIndex}>[ 001 — 026 ]</span>
              <p>
                Rules are meant to bend.
                <br />
                Ideas are meant to bounce.
              </p>
            </div>

            <a
              href='#play'
              className={styles.heroCta}
            >
              <span>LET&apos;S PLAY</span>
              <span className={styles.ctaArrow}>↗</span>
            </a>
          </div>

          <div className={styles.heroSideNote}>BUILT TO BEND — NEVER BREAK</div>

          <div className={styles.elasticOrb}>
            <span>DRAG</span>
            <span className={styles.orbArrow}>↗</span>
          </div>
        </section>

        <footer
          className={styles.footer}
          id='play'
        >
          <span>© ELASTIC STUDIO 2026</span>
          <span>MADE TO MOVE.</span>
          <span>MOVE YOUR CURSOR. MOVE YOUR MIND.</span>
        </footer>
      </main>
    </div>
  );
}
