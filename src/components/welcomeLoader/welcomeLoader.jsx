/* src/components/welcomeLoader/welcomeLoader.jsx */

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./welcomeLoader.module.css";

gsap.registerPlugin(useGSAP);

export default function WelcomeLoader({ greetings, title, emphasizedText, finalText, onComplete }) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const container = containerRef.current;

      if (!container) return;

      const welcomeTexts = container.querySelectorAll(`.${styles.welcomeText}`);

      const textWrapper = container.querySelector(`.${styles.textWrapper}`);

      const loading = container.querySelector(`.${styles.loading}`);

      const loadingRound = container.querySelector(`.${styles.loadingRound}`);

      const content = container.querySelector(`.${styles.content}`);

      const heading = container.querySelector(`.${styles.heading}`);

      if (!welcomeTexts.length) return;

      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.inOut",
        },
        onComplete: () => {
          onComplete?.();
        },
      });

      welcomeTexts.forEach((text, index) => {
        const isFirst = index === 0;
        const isLast = index === welcomeTexts.length - 1;

        const holdTime = isFirst || isLast ? 0.8 : 0.3;

        if (isFirst) {
          timeline.to(text, {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.6,
          });
        } else {
          timeline.set(text, { opacity: 1 });
        }

        if (!isLast) {
          timeline.set(text, { opacity: 0 }, `+=${holdTime}`);
        }
      });

      timeline.to(
        textWrapper,
        {
          y: -50,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut",
        },
        "+=0.3",
      );

      timeline
        .to(
          loading,
          {
            y: "-100%",
            duration: 0.8,
            ease: "expo.out",
          },
          "-=0.1",
        )
        .to(
          loadingRound,
          {
            height: 0,
            duration: 0.5,
            ease: "expo.out",
          },
          "-=0.5",
        )
        .to(
          content,
          {
            y: 0,
            duration: 0.8,
            ease: "expo.out",
          },
          "-=0.78",
        )
        .to(
          heading,
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.3",
        );
    },
    {
      scope: containerRef,
      dependencies: [greetings, title, emphasizedText, finalText, onComplete],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <div className={styles.loading}>
        <div
          className={styles.textWrapper}
          aria-hidden='true'
        >
          {greetings.map((greeting, index) => (
            <div
              className={styles.welcomeText}
              key={`${greeting}-${index}`}
            >
              {/* <div className={styles.dot} /> */}
              <h2>{greeting}</h2>
            </div>
          ))}
        </div>

        <div className={styles.loadingRound}>
          <div className={styles.curve} />
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.heading}>
          {title} <em>{emphasizedText}</em>
          <br />
          {finalText}
        </h1>
      </div>
    </div>
  );
}
