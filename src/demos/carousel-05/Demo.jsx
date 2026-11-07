/* src/demos/carousel-05/Demo.jsx */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* --------------------------------------------------
Default Images
-------------------------------------------------- */

const unsplash = (id) => `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;

const IMAGES = ["photo-1469474968028-56623f02e42e", "photo-1534528741775-53994a69daeb", "photo-1500530855697-b586d89ba3ee", "photo-1476820865390-c52aeebb9891", "photo-1517841905240-472988babdf9", "photo-1509316785289-025f5b846b35", "photo-1495616811223-4d98c6e9c869", "photo-1524504388940-b1c1722653e1", "photo-1473580044384-7ba9967e16a0", "photo-1508739773434-c26b3d09e071", "photo-1531123897727-8f129e1688ce", "photo-1470071459604-3b5ec3a7fe05", "photo-1482192596544-9eb780fc7f66", "photo-1506794778202-cad84cf45f1d", "photo-1506905925346-21bda4d32df4", "photo-1518495973542-4542c06a5843"].map(unsplash);

/* --------------------------------------------------
Scroll Image Fly-Through
-------------------------------------------------- */

export default function ScrollImageFly({ images = IMAGES, length = 4, tilt = 20, overlap = 0.1, pop = true, scroller = null, className = "" }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const imageRefs = useRef([]);

  const [stageH, setStageH] = useState(0);

  /* --------------------------------------------------
  Measure Stage
  -------------------------------------------------- */

  useEffect(() => {
    const measure = () => {
      setStageH(scroller ? scroller.clientHeight : window.innerHeight);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    if (scroller) {
      resizeObserver.observe(scroller);
    }

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scroller]);

  /* --------------------------------------------------
  GSAP Animation
  -------------------------------------------------- */

  useGSAP(
    () => {
      const stage = stageRef.current;
      const media = imageRefs.current.slice(0, images.length);

      if (!stage || !media.length) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(media, {
        autoAlpha: 0,
      });

      // Show only the final image when reduced motion is preferred.
      if (reducedMotion) {
        gsap.set(media[media.length - 1], {
          autoAlpha: 1,
        });

        return;
      }

      /* --------------------------------------------------
      Image Pop Timelines
      -------------------------------------------------- */

      const pops = media.map((element) =>
        gsap.timeline({ paused: true }).fromTo(
          element,
          {
            scale: 0.9,
          },
          {
            scale: 1,
            immediateRender: false,
            ease: "elastic.out(2, 0.6)",
            duration: 0.5,
          },
        ),
      );

      /* --------------------------------------------------
      Main Scroll Timeline
      -------------------------------------------------- */

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          scroller: scroller ?? undefined,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      media.forEach((element, index) => {
        const rotation = 2 * tilt * (Math.random() - 0.5);

        const flight = gsap.timeline({
          onStart: () => {
            if (pop) {
              pops[index].play(0);
            }
          },

          onReverseComplete: () => {
            pops[index].progress(0).pause();
          },
        });

        // Make the image visible.
        flight.set(
          element,
          {
            autoAlpha: 1,
          },
          0.001,
        );

        // Move backward into the perspective.
        flight.to(element, {
          z: () => -stage.clientWidth,
          rotation,
          duration: 1,
          ease: "power1.inOut",
        });

        // Sweep upward and out of the frame.
        flight.to(
          element,
          {
            x: () => 0.01 * rotation * stage.clientWidth,
            y: () => -2 * stage.clientHeight,
            duration: 0.6,
            ease: "power1.in",
          },
          "<+=0.4",
        );

        timeline.add(flight, overlap * index);
      });

      return () => {
        pops.forEach((popTimeline) => popTimeline.kill());
      };
    },
    {
      scope: rootRef,
      dependencies: [images.join("|"), tilt, overlap, pop, scroller, stageH, length],
      revertOnUpdate: true,
    },
  );

  /* --------------------------------------------------
  Render
  -------------------------------------------------- */

  return (
    <section
      ref={rootRef}
      className={`${styles.root} ${className}`}
      style={{
        height: stageH ? stageH * length : `${length * 100}svh`,
      }}
    >
      <div
        ref={stageRef}
        className={styles.stage}
        style={{
          height: stageH || "100svh",
        }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            ref={(element) => {
              if (element) {
                imageRefs.current[index] = element;
              }
            }}
            src={src}
            alt=''
            draggable={false}
            className={styles.image}
          />
        ))}
      </div>
    </section>
  );
}
