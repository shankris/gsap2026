/* src/demos/split-screen-01/Demo.jsx */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* --------------------------------------------------
   Content
-------------------------------------------------- */

const unsplash = (id, width = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const DEFAULT_SLIDES = [
  {
    accent: "#7fe9fb",
    kicker: ["Content & Marketing", "Web & Digital", "Brand & Identity"],
    title: ["OpenAI", "Business"],
    status: "Coming soon",
    images: ["/demos/split-screen-01/01.jpg"],
  },
  {
    accent: "#d9b8ff",
    kicker: ["Feature Documentary"],
    title: ["Creative", "Docuseries"],
    status: "Coming soon",
    cta: { label: "View full project", href: "#" },
    images: ["/demos/split-screen-01/02.jpg", "/demos/split-screen-01/03.jpg"],
  },
  {
    accent: "#c8ff4d",
    kicker: ["Campaign", "Film & Photography"],
    title: ["Northbound", "Supply"],
    status: "Live now",
    cta: { label: "View full project", href: "#" },
    images: ["/demos/split-screen-01/04.jpg", "/demos/split-screen-01/05.jpg"],
  },
  {
    accent: "#ff7a5a",
    kicker: ["Identity System"],
    title: ["Signal", "Studios"],
    status: "2026",
    cta: { label: "View full project", href: "#" },
    images: ["/demos/split-screen-01/06.jpg"],
  },
  {
    accent: "#ffd166",
    kicker: ["Album Campaign"],
    title: ["Midnight", "Atlas"],
    status: "Live now",
    cta: { label: "View full project", href: "#" },
    images: ["/demos/split-screen-01/07.jpg", "/demos/split-screen-01/08.jpg"],
  },
  {
    accent: "#7dffb3",
    kicker: ["Brand Film"],
    title: ["Paper", "Tiger"],
    status: "Coming soon",
    cta: { label: "View full project", href: "#" },
    images: ["/demos/split-screen-01/09.jpg"],
  },
];

const DEFAULT_NAV = [
  { label: "Components", href: "#components" },
  { label: "About", href: "#about" },
  { label: "Get in touch", href: "#contact" },
];

const DEFAULT_WORDMARK = ["Made", "For", "Award"];

/* --------------------------------------------------
   Animation config
-------------------------------------------------- */

const CONFIG = {
  SCROLL_PER_SLIDE: 1,
  SCRUB: 0.6,
  PARALLAX_MEDIA: 10,
  PARALLAX_COPY: 4.5,
  SPLIT_SHIFT: 9,
  TEXT_SPAN: 0.8,
};

const TITLE_CAP = 0.72;

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

const createEmptyParts = () => ({
  mask: null,
  inner: null,
  photo: null,
  text: null,
  textLeft: null,
  textRight: null,
});

function useListRefs() {
  const list = useRef([]);

  const setRef = useCallback(
    (index, key) => (element) => {
      list.current[index] ??= createEmptyParts();
      list.current[index][key] = element;
    },
    [],
  );

  return [list, setRef];
}

/* --------------------------------------------------
   Smooth scrolling
-------------------------------------------------- */

function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({ anchors: true });

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

/* --------------------------------------------------
   Component
-------------------------------------------------- */

export default function SplitScreen01({ slides = DEFAULT_SLIDES, nav = DEFAULT_NAV, wordmark = DEFAULT_WORDMARK, smoothScroll = true, className = "" }) {
  const rootRef = useRef(null);
  const pinRef = useRef(null);

  const [leftRefs, setLeftRef] = useListRefs();
  const [rightRefs, setRightRef] = useListRefs();

  useSmoothScroll(smoothScroll);

  useGSAP(
    () => {
      if (slides.length < 2) return;

      const parts = slides.map((_, index) => ({
        left: leftRefs.current[index],
        right: rightRefs.current[index],
      }));

      const inBothColumns = (slide, part) => [slide.left[part], slide.right[part]];

      function buildChange(current, next) {
        const change = gsap.timeline({
          defaults: { ease: "none" },
        });

        const move = (elements, start, end, length) => {
          change.fromTo(
            elements,
            { yPercent: start },
            {
              yPercent: end,
              duration: length,
              immediateRender: start !== 0,
            },
            (1 - length) / 2,
          );
        };

        // Incoming slide masks.
        move([next.left.mask], 100, 0, 1);
        move([next.left.inner], -100, 0, 1);

        move([next.right.mask], -100, 0, 1);
        move([next.right.inner], 100, 0, 1);

        // Image movement.
        move(inBothColumns(next, "photo"), CONFIG.PARALLAX_MEDIA, 0, 1);
        move(inBothColumns(current, "photo"), 0, -CONFIG.PARALLAX_MEDIA, 1);

        // Text movement.
        const span = CONFIG.TEXT_SPAN;

        move(inBothColumns(next, "text"), CONFIG.PARALLAX_COPY, 0, span);
        move(inBothColumns(current, "text"), 0, -CONFIG.PARALLAX_COPY, span);

        // Split headline movement.
        move(inBothColumns(next, "textLeft"), CONFIG.SPLIT_SHIFT, 0, span);
        move(inBothColumns(next, "textRight"), -CONFIG.SPLIT_SHIFT, 0, span);

        move(inBothColumns(current, "textLeft"), 0, -CONFIG.SPLIT_SHIFT, span);
        move(inBothColumns(current, "textRight"), 0, CONFIG.SPLIT_SHIFT, span);

        return change;
      }

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const reelTimeline = gsap.timeline({ paused: true });

        for (let index = 0; index < parts.length - 1; index++) {
          reelTimeline.add(buildChange(parts[index], parts[index + 1]));
        }

        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * CONFIG.SCROLL_PER_SLIDE * (slides.length - 1),
          pin: pinRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: reelTimeline,
          scrub: CONFIG.SCRUB,
        });

        return () => {
          reelTimeline.kill();
        };
      });

      const onLoad = () => ScrollTrigger.refresh();

      window.addEventListener("load", onLoad, { once: true });

      return () => {
        window.removeEventListener("load", onLoad);
        media.revert();
      };
    },
    {
      scope: rootRef,
      dependencies: [slides],
    },
  );

  const longestLine = Math.max(...slides.flatMap((slide) => slide.title.map((line) => line.length)));

  const titleLines = Math.max(...slides.map((slide) => slide.title.length));

  const fit = {
    "--mfa-longest-line": longestLine,
    "--mfa-title-lines": titleLines,
    "--mfa-cap": TITLE_CAP,
  };

  return (
    <section
      ref={rootRef}
      aria-label='Selected work'
      style={fit}
      className={`${styles.reel} ${className}`}
    >
      <div
        ref={pinRef}
        className={styles.pin}
      >
        <Column side='left'>
          {slides.map((slide, index) => (
            <Slide
              key={index}
              slide={slide}
              first={index === 0}
              set={(key) => setLeftRef(index, key)}
            />
          ))}
        </Column>

        <Column side='right'>
          {slides.map((slide, index) => (
            <Slide
              key={index}
              slide={slide}
              first={index === 0}
              set={(key) => setRightRef(index, key)}
            />
          ))}
        </Column>

        <nav
          className={`${styles.chrome} ${styles.chromeTop}`}
          aria-label='Primary'
        >
          {nav.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`${styles.chromeItem} ${index === 1 ? styles.center : ""} ${index === nav.length - 1 ? styles.right : ""}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p
          className={`${styles.chrome} ${styles.chromeBottom}`}
          aria-hidden='true'
        >
          {wordmark.map((word, index) => (
            <span
              key={index}
              className={`${styles.chromeItem} ${index === 1 ? styles.center : ""} ${index === wordmark.length - 1 ? styles.right : ""}`}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------
   Column
-------------------------------------------------- */

function Column({ side, children }) {
  const isLeft = side === "left";

  return (
    <div
      inert={!isLeft}
      className={`${styles.column} ${isLeft ? styles.columnLeft : styles.columnRight}`}
    >
      <div className={`${styles.stage} ${isLeft ? styles.stageLeft : styles.stageRight}`}>{children}</div>
    </div>
  );
}

/* --------------------------------------------------
   Slide
-------------------------------------------------- */

function Slide({ slide, first, set }) {
  return (
    <article
      ref={set("mask")}
      style={{ "--mfa-accent": slide.accent }}
      className={styles.slide}
    >
      <div
        ref={set("inner")}
        className={styles.slideInner}
      >
        <div className={styles.photoViewport}>
          <div
            ref={set("photo")}
            className={styles.photoStrip}
          >
            {slide.images.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=''
                fetchPriority={first && index === 0 ? "high" : "low"}
                decoding='async'
                className={`${styles.photo} ${index === 0 ? styles.photoFirst : ""} ${index > 0 ? styles.photoSecond : ""}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.scrim} />

        <div
          ref={set("text")}
          className={styles.textBlock}
        >
          <CopyLayer
            refElement={set("textLeft")}
            slide={slide}
            side='left'
          />

          <CopyLayer
            refElement={set("textRight")}
            slide={slide}
            side='right'
          />
        </div>
      </div>
    </article>
  );
}

/* --------------------------------------------------
   Copy layer
-------------------------------------------------- */

function CopyLayer({ slide, refElement, side }) {
  return (
    <div
      ref={refElement}
      aria-hidden={side === "right" ? "true" : undefined}
      inert={side === "right"}
      className={`${styles.copyLayer} ${side === "left" ? styles.copyLeft : styles.copyRight}`}
    >
      <p className={styles.kicker}>
        {slide.kicker.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <h2 className={styles.headline}>
        {slide.title.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h2>

      <p className={styles.status}>{slide.status}</p>

      {slide.cta && (
        <a
          className={styles.slideCta}
          href={slide.cta.href}
        >
          {slide.cta.label}
        </a>
      )}
    </div>
  );
}
