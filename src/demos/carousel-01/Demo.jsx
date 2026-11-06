/* src/demos/carousel-01/Demo.jsx */

"use client";

import { Children, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP);

/* --------------------------------------------------
   Configuration
-------------------------------------------------- */

const CONFIG = {
  curve: {
    edgeHeight: 0.56,
    bend: 0.19,
  },

  slide: {
    width: 0.2,
    widthMobile: 0.6,
    mobileBreakpoint: 768,
    minWidth: 220,
    maxWidth: 500,
    gap: 6,
    parallax: 60,
  },

  motion: {
    ease: 0.04,
    autoDrift: 2.3,
    dragSpeed: 3,
    wheelSpeed: 2.2,
    flingDuration: 2.4,
  },

  mobile: {
    bend: 0.11,
    autoDrift: 1.1,
    dragSpeed: 1.8,
  },
};

/* --------------------------------------------------
   Default Images
-------------------------------------------------- */

export const DEFAULT_IMAGES = ["1556228720-195a672e8a03", "1620916566398-39f1143ab7be", "1608248543803-ba4f8c70ae0b", "1571781926291-c477ebfd024b", "1598440947619-2c35fc9aa908", "1612817288484-6f916006741a", "1631729371254-42c2892f0e6e", "1526947425960-945c6e72858f", "1556228453-efd6c1ff04f6", "1571875257727-256c39da42af", "1594035910387-fea47794261f", "1617897903246-719242758050"].map((id) => `https://images.unsplash.com/photo-${id}?w=700&h=1000&fit=crop&q=80`);

/* --------------------------------------------------
   Infinite Image Slider
-------------------------------------------------- */

function InfiniteImageSlider({ children, images = DEFAULT_IMAGES, className = "" }) {
  const rootRef = useRef(null);
  const clipRef = useRef(null);
  const slideRefs = useRef([]);
  const mediaRefs = useRef([]);

  const slides = Children.count(children)
    ? Children.toArray(children)
    : images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={`Gallery image ${i + 1}`}
          draggable='false'
        />
      ));

  const count = slides.length;

  useGSAP(
    () => {
      const root = rootRef.current;
      const clip = clipRef.current;

      if (!root || !clip || count === 0) return;

      const frames = slideRefs.current.slice(0, count);
      const medias = mediaRefs.current.slice(0, count);

      const wrap = gsap.utils.wrap;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* --------------------------------------------------
         Layout
      -------------------------------------------------- */

      let vw = 0;
      let vh = 0;
      let slideW = 0;
      let totalW = 0;
      let mobile = false;

      const measure = () => {
        vw = root.clientWidth;
        vh = root.clientHeight;

        mobile = vw < CONFIG.slide.mobileBreakpoint;

        slideW = mobile ? Math.min(CONFIG.slide.maxWidth, vw * CONFIG.slide.widthMobile) : gsap.utils.clamp(CONFIG.slide.minWidth, CONFIG.slide.maxWidth, vw * CONFIG.slide.width);

        totalW = slideW * count;

        frames.forEach((element) => {
          element.style.width = `${slideW - CONFIG.slide.gap}px`;
        });

        /* Curved clipping shape */

        const edgeH = vh * CONFIG.curve.edgeHeight;

        const centerH = edgeH * (1 - (mobile ? CONFIG.mobile.bend : CONFIG.curve.bend));

        const cy = vh / 2;

        const topEdge = cy - edgeH / 2;
        const botEdge = cy + edgeH / 2;

        const topCtrl = 2 * (cy - centerH / 2) - topEdge;

        const botCtrl = 2 * (cy + centerH / 2) - botEdge;

        const cx = vw / 2;

        clip.style.clipPath = `path("M 0 ${topEdge} Q ${cx} ${topCtrl} ${vw} ${topEdge} L ${vw} ${botEdge} Q ${cx} ${botCtrl} 0 ${botEdge} Z")`;
      };

      /* --------------------------------------------------
         Scroll State
      -------------------------------------------------- */

      let target = 0;
      let current = 0;

      let dragging = false;
      let dragStartX = 0;
      let dragStartTarget = 0;
      let lastDragX = 0;
      let dragVelocity = 0;

      let fling;

      /* --------------------------------------------------
         Pointer Events
      -------------------------------------------------- */

      const onDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        dragging = true;

        root.style.cursor = "grabbing";

        root.setPointerCapture(event.pointerId);

        dragStartX = lastDragX = event.clientX;
        dragStartTarget = target;
        dragVelocity = 0;

        fling?.kill();
      };

      const onMove = (event) => {
        if (!dragging) return;

        const speed = mobile ? CONFIG.mobile.dragSpeed : CONFIG.motion.dragSpeed;

        target = dragStartTarget - (event.clientX - dragStartX) * speed;

        dragVelocity = (lastDragX - event.clientX) * speed;

        lastDragX = event.clientX;
      };

      const onUp = () => {
        if (!dragging) return;

        dragging = false;

        root.style.cursor = "";

        const velocity = {
          v: dragVelocity,
        };

        fling = gsap.to(velocity, {
          v: 0,
          duration: CONFIG.motion.flingDuration,
          ease: "power3.out",
          onUpdate: () => {
            target += velocity.v;
          },
        });
      };

      /* --------------------------------------------------
         Wheel Navigation
      -------------------------------------------------- */

      const onWheel = (event) => {
        target += (event.deltaY + event.deltaX) * CONFIG.motion.wheelSpeed;
      };

      /* --------------------------------------------------
         Render Loop
      -------------------------------------------------- */

      const tick = () => {
        if (!dragging && !reduceMotion) {
          target += mobile ? CONFIG.mobile.autoDrift : CONFIG.motion.autoDrift;
        }

        current += (target - current) * CONFIG.motion.ease;

        const half = totalW / 2;

        for (let i = 0; i < count; i++) {
          const x = vw / 2 - slideW / 2 + wrap(-half, half, i * slideW - current);

          gsap.set(frames[i], { x });

          const centerOffset = (x + slideW / 2 - vw / 2) / vw;

          gsap.set(medias[i], {
            xPercent: -50 - centerOffset * CONFIG.slide.parallax,
            yPercent: -50,
          });
        }
      };

      /* --------------------------------------------------
         Initialization
      -------------------------------------------------- */

      measure();
      tick();

      const resizeObserver = new ResizeObserver(measure);

      resizeObserver.observe(root);

      root.addEventListener("pointerdown", onDown);
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerup", onUp);
      root.addEventListener("pointercancel", onUp);

      root.addEventListener("wheel", onWheel, {
        passive: true,
      });

      gsap.ticker.add(tick);

      gsap.from(clip, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.out",
      });

      /* --------------------------------------------------
         Cleanup
      -------------------------------------------------- */

      return () => {
        gsap.ticker.remove(tick);

        fling?.kill();

        resizeObserver.disconnect();

        root.removeEventListener("pointerdown", onDown);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerup", onUp);
        root.removeEventListener("pointercancel", onUp);
        root.removeEventListener("wheel", onWheel);

        root.style.cursor = "";
      };
    },
    {
      scope: rootRef,
      dependencies: [count],
    },
  );

  return (
    <div
      ref={rootRef}
      aria-label='Product gallery slider'
      className={`${styles.slider} ${className}`}
    >
      <div
        ref={clipRef}
        className={styles.clip}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(element) => {
              if (element) {
                slideRefs.current[i] = element;
              }
            }}
            className={styles.slide}
          >
            <div
              ref={(element) => {
                if (element) {
                  mediaRefs.current[i] = element;
                }
              }}
              className={styles.media}
            >
              {slide}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Demo Page
-------------------------------------------------- */

export default function Carousel01() {
  return (
    <main className={styles.page}>
      <InfiniteImageSlider />
    </main>
  );
}
