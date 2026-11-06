/* src/demos/slider-01/Demo.jsx */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const ASSETS = "/demos/slider-01";

export const DEFAULT_SLIDES = [
  {
    title: "Stratégie & Conseil",
    navLabel: "Stratégie & Conseil",
    background: "#BFCCD8",
    imageUrl: `${ASSETS}/slide-1.jpg`,
    tagRows: [
      ["AUDIT & BENCHMARK", "POSITIONING"],
      ["BRAND IMAGE", "DIGITAL STRATEGY"],
      ["EDITORIAL STRATEGY", "ACCOMPANIMENT"],
    ],
  },
  {
    title: "Art Direction",
    navLabel: "Direction Artistique",
    background: "#B692A1",
    imageUrl: `${ASSETS}/slide-2.jpg`,
    tagRows: [
      ["VISUAL IDENTITY", "SOON"],
      ["GRAPHIC CHARTER", "GRAPHIC DESIGN"],
      ["MODELS AND PROTOTYPES", "UI & UX DESIGN"],
    ],
  },
  {
    title: "E-commerce website",
    navLabel: "Site E-commerce",
    background: "#798E7B",
    imageUrl: `${ASSETS}/slide-3.jpg`,
    tagRows: [["USER JOURNEY", "TREE STRUCTURE"], ["ART DIRECTION", "CUSTOM SHOPIFY"], ["HEADLESS", "CUSTOM LANDING"], ["CUSTOM FRONT-END"]],
  },
  {
    title: "Showcase Website",
    navLabel: "Site Vitrine",
    background: "#FFFFFF",
    imageUrl: `${ASSETS}/slide-4.jpg`,
    tagRows: [
      ["FRONT-END", "BACK-END (CMS)"],
      ["CSS ANIMATIONS", "INTERACTIONS"],
      ["DIGITAL EXPERIENCE", "WEBGL (3D)"],
    ],
  },
  {
    title: "Digital Experience",
    navLabel: "Expérience Digitale",
    background: "#E49366",
    imageUrl: `${ASSETS}/slide-5.jpg`,
    tagRows: [["LANDING PAGE", "COMPETITIONS"], ["GAMING", "STORYBOARD"], ["ART DIRECTION", "UX/UI"], ["WEBGL / 3D DEVELOPMENT"]],
  },
];

const DEPTH_CONFIGS = [
  {
    outer: { from: { x: "0%" }, to: { x: "-100%" } },
    inner: { from: { x: "0%" }, to: { x: "100%" } },
    imgWrap: {
      from: { x: "-60%", scale: 1 },
      to: { x: "-150%", scale: 0.92 },
    },
    img: { from: { scale: 1 }, to: { scale: 0.96 } },
  },
  {
    outer: { from: { x: "80%" }, to: { x: "0%" } },
    inner: { from: { x: "-80%" }, to: { x: "0%" } },
    imgWrap: {
      from: { x: "-15%", scale: 0.45 },
      to: { x: "-60%", scale: 1 },
    },
    img: { from: { scale: 1.32 }, to: { scale: 1 } },
  },
  {
    outer: { from: { x: "95%" }, to: { x: "80%" } },
    inner: { from: { x: "-95%" }, to: { x: "-80%" } },
    imgWrap: {
      from: { x: "0%", scale: 0.15 },
      to: { x: "-15%", scale: 0.45 },
    },
    img: { from: { scale: 1.64 }, to: { scale: 1.32 } },
  },
  {
    outer: { from: { x: "100%" }, to: { x: "95%" } },
    inner: { from: { x: "-100%" }, to: { x: "-95%" } },
    imgWrap: { from: { scale: 0 }, to: { scale: 0.15 } },
    img: { from: { scale: 1.96 }, to: { scale: 1.64 } },
  },
];

const DESKTOP = "(min-width: 1024px)";
const MOBILE = "(max-width: 1023px)";

const pad = (number) => String(number).padStart(2, "0");

const compact = (items) => items.filter((item) => item != null);

const emptySlide = () => ({
  outer: null,
  inner: null,
  imgWrap: null,
  img: null,
});

const emptyCard = () => ({
  card: null,
  inner: null,
  overlay: null,
});

function useListRefs(empty) {
  const list = useRef([]);

  const set = useCallback(
    (index, key) => (element) => {
      list.current[index] ??= empty();
      list.current[index][key] = element;
    },
    [empty],
  );

  return [list, set];
}

function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis();

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [enabled]);
}

export default function Slider01({ heading = "Expertises", slides = DEFAULT_SLIDES, buttonLabel = "See the expertise", smoothScroll = true, className = "" }) {
  const rootRef = useRef(null);
  const sliderRef = useRef(null);
  const headingRef = useRef(null);
  const lineFillRef = useRef(null);
  const navLabelRefs = useRef([]);
  const stackRef = useRef(null);
  const stackHeadingRef = useRef(null);

  const [slideRefs, setSlideRef] = useListRefs(emptySlide);
  const [cardRefs, setCardRef] = useListRefs(emptyCard);

  useSmoothScroll(smoothScroll);

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      const total = slides.length;
      const steps = total - 1;
      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal slider
      mm.add(DESKTOP, () => {
        const slider = sliderRef.current;
        const lineFill = lineFillRef.current;
        const refs = slideRefs.current;

        if (!slider || !lineFill) return;

        const labelSplits = compact(navLabelRefs.current).map(
          (element) =>
            new SplitText(element, {
              type: "lines",
              mask: "lines",
            }),
        );

        labelSplits.forEach((split, index) => {
          gsap.set(split.lines, {
            yPercent: index === 0 ? 0 : 100,
          });
        });

        const labelTweens = labelSplits.map((split, index) =>
          index === 0
            ? null
            : gsap.to(split.lines, {
                yPercent: 0,
                duration: 0.6,
                ease: "expo.inOut",
                paused: true,
              }),
        );

        const headingSplit = headingRef.current
          ? new SplitText(headingRef.current, {
              type: "chars",
              mask: "chars",
            })
          : null;

        if (headingSplit) {
          gsap.from(headingSplit.chars, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: {
              trigger: slider,
              start: "top 65%",
              once: true,
            },
          });
        }

        gsap.set(lineFill, {
          scaleX: 1 / total,
          transformOrigin: "left center",
        });

        gsap.set(
          refs.flatMap((reference) => compact([reference.outer, reference.inner, reference.imgWrap, reference.img])),
          {
            force3D: true,
            backfaceVisibility: "hidden",
          },
        );

        const stepTimeline = (step) => {
          const timeline = gsap.timeline({
            defaults: {
              force3D: true,
              duration: 1,
              ease: "power1.inOut",
            },
          });

          const visible = Math.min(DEPTH_CONFIGS.length, total - step);

          for (let depth = 0; depth < visible; depth++) {
            const config = DEPTH_CONFIGS[depth];
            const reference = refs[step + depth];

            if (!reference) continue;

            timeline.fromTo(reference.outer, config.outer.from, config.outer.to, "same").fromTo(reference.inner, config.inner.from, config.inner.to, "same").fromTo(reference.imgWrap, config.imgWrap.from, config.imgWrap.to, "same").fromTo(reference.img, config.img.from, config.img.to, "same");
          }

          return timeline.to(
            lineFill,
            {
              scaleX: (step + 2) / total,
              duration: 0.7,
            },
            "same",
          );
        };

        const master = gsap.timeline({
          scrollTrigger: {
            trigger: slider,
            pin: true,
            start: "top top",
            end: `+=${steps * 100}%`,
            scrub: 1,
            invalidateOnRefresh: true,

            onUpdate: ({ progress }) => {
              labelTweens.forEach((tween, index) => {
                if (!tween) return;

                if (progress > (index - 1) / steps) {
                  tween.play();
                } else {
                  tween.reverse();
                }
              });
            },
          },
        });

        for (let step = 0; step < steps; step++) {
          master.add(stepTimeline(step));
        }

        return () => {
          labelSplits.forEach((split) => split.revert());
          headingSplit?.revert();
        };
      });

      // Mobile and tablet: sticky stacking cards
      mm.add(MOBILE, () => {
        const stack = stackRef.current;
        const cards = cardRefs.current;

        if (!stack) return;

        if (stackHeadingRef.current) {
          gsap.from(stackHeadingRef.current, {
            y: 40,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stack,
              start: "top 80%",
              once: true,
            },
          });
        }

        for (let index = 0; index < steps; index++) {
          const current = cards[index];
          const next = cards[index + 1];

          if (!current?.inner || !next?.card) continue;

          const cover = {
            trigger: next.card,
            start: "top bottom",
            end: "top top",
            scrub: true,
          };

          gsap.to(current.inner, {
            scale: 0.95,
            borderRadius: 28,
            ease: "none",
            scrollTrigger: cover,
          });

          if (current.overlay) {
            gsap.to(current.overlay, {
              opacity: 0.28,
              ease: "none",
              scrollTrigger: cover,
            });
          }
        }
      });

      return () => mm.revert();
    },
    {
      scope: rootRef,
      dependencies: [slides],
    },
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`}
    >
      {/* Desktop slider */}
      <section
        ref={sliderRef}
        className={styles.desktopSlider}
      >
        <div className={styles.desktopHeading}>
          <h2 ref={headingRef}>{heading}</h2>
        </div>

        {slides.map((slide, index) => (
          <div
            key={slide.title}
            ref={setSlideRef(index, "outer")}
            className={styles.slideOuter}
          >
            <div
              ref={setSlideRef(index, "inner")}
              className={styles.slideInner}
            >
              <div
                className={styles.slideBackground}
                style={{ backgroundColor: slide.background }}
              />

              <div
                ref={setSlideRef(index, "imgWrap")}
                className={styles.slideImageWrap}
              >
                <img
                  ref={setSlideRef(index, "img")}
                  src={slide.imageUrl}
                  alt={slide.title}
                  className={styles.slideImage}
                />
              </div>

              <div className={styles.slideContent}>
                <h3>{slide.title}</h3>

                <ul className={styles.desktopTags}>
                  {slide.tagRows.map((row) => (
                    <li key={row.join()}>
                      {row.map((tag) => (
                        <span
                          key={tag}
                          className={styles.tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>

                <PillButton label={buttonLabel} />
              </div>
            </div>
          </div>
        ))}

        <nav className={styles.desktopNav}>
          <div className={styles.navGrid}>
            {slides.map((slide, index) => (
              <div
                key={slide.navLabel}
                className={styles.navItem}
              >
                <span className={styles.navNumber}>{pad(index + 1)}</span>

                <span
                  ref={(element) => {
                    navLabelRefs.current[index] = element;
                  }}
                  className={styles.navLabel}
                >
                  {slide.navLabel}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressBackground} />
            <div
              ref={lineFillRef}
              className={styles.progressFill}
            />
          </div>
        </nav>
      </section>

      {/* Mobile and tablet cards */}
      <section
        ref={stackRef}
        className={styles.mobileStack}
      >
        <div className={styles.mobileHeading}>
          <h2 ref={stackHeadingRef}>{heading}</h2>
        </div>

        <div className={styles.cards}>
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              ref={setCardRef(index, "card")}
              className={styles.card}
            >
              <div
                ref={setCardRef(index, "inner")}
                className={styles.cardInner}
                style={{ backgroundColor: slide.background }}
              >
                <div
                  ref={setCardRef(index, "overlay")}
                  className={styles.cardOverlay}
                />

                <div className={styles.cardImageWrap}>
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                  />
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>
                    <span>{pad(index + 1)}</span>
                    <h3>{slide.title}</h3>
                  </div>

                  <ul className={styles.mobileTags}>
                    {slide.tagRows.flat().map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>

                  <a
                    href='#'
                    className={styles.mobileButton}
                  >
                    {buttonLabel}
                    <span />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PillButton({ label }) {
  return (
    <a
      href='#'
      className={styles.pillButton}
    >
      <span className={styles.pillFill} />
      <span className={styles.pillLabel}>{label}</span>

      <span className={styles.pillIcon}>
        <span className={styles.pillIconFill} />
        <span className={styles.pillArrow}>
          <ArrowIcon />
        </span>
      </span>
    </a>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox='0 0 19 19'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={styles.arrowIcon}
    >
      <path
        d='M0.292893 17.2929C-0.0976311 17.6834 -0.0976311 18.3166 0.292893 18.7071C0.683418 19.0976 1.31658 19.0976 1.70711 18.7071L0.292893 17.2929ZM18.9706 1.02944C18.9706 0.477153 18.5228 0.0294373 17.9706 0.029437L8.97056 0.0294378C8.41828 0.0294375 7.97056 0.477153 7.97056 1.02944C7.97056 1.58172 8.41828 2.02944 8.97056 2.02944L16.9706 2.02944L16.9706 10.0294C16.9706 10.5817 17.4183 11.0294 17.9706 11.0294C18.5228 11.0294 18.9706 10.5817 18.9706 10.0294L18.9706 1.02944ZM1.70711 18.7071L18.6777 1.73654L17.2635 0.322331L0.292893 17.2929L1.70711 18.7071Z'
        fill='currentColor'
      />
    </svg>
  );
}
