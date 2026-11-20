"use client";

// src/demos/text-01-scramble/Demo.jsx

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrambleTextPlugin);

export default function Demo() {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const animation = gsap.to(element, {
      duration: 2.5,
      scrambleText: {
        text: "This is a hero section",
        chars: "lowerCase",
        revealDelay: 0.5,
        tweenLength: false,
      },
      ease: "none",
    });

    return () => {
      animation.kill();
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <h1 className={styles.title}>
        <span ref={textRef}> </span>
      </h1>
    </section>
  );
}
