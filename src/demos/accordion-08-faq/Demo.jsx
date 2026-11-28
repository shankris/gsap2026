// src/demos/accordion-08-faq/Demo.jsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

import faqData from "./data.json";
import styles from "./Demo.module.css";

function Question({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const answerRef = useRef(null);
  const iconRef = useRef(null);
  const titleRef = useRef(null);
  const isInitial = useRef(true);

  useLayoutEffect(() => {
    const answer = answerRef.current;
    const icon = iconRef.current;
    const questionTitle = titleRef.current;

    if (!answer || !icon || !questionTitle) return;

    if (isInitial.current) {
      gsap.set(answer, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        marginBottom: open ? 24 : 0,
      });

      gsap.set(icon, {
        rotation: open ? 180 : 0,
        color: open ? "var(--color-accent-start)" : "var(--color-text-secondary)",
      });

      gsap.set(questionTitle, {
        opacity: open ? 0.7 : 1,
      });

      isInitial.current = false;
      return;
    }

    gsap.to(answer, {
      height: open ? "auto" : 0,
      opacity: open ? 1 : 0,
      marginBottom: open ? 24 : 0,
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(icon, {
      rotation: open ? 180 : 0,
      color: open ? "var(--color-accent-start)" : "var(--color-text-secondary)",
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(questionTitle, {
      opacity: open ? 0.7 : 1,
      duration: 0.25,
      ease: "power1.out",
    });

    return () => {
      gsap.killTweensOf([answer, icon, questionTitle]);
    };
  }, [open]);

  return (
    <article className={styles.question}>
      <button
        type='button'
        className={styles.button}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span
          ref={titleRef}
          className={styles.title}
        >
          {title}
        </span>

        <span
          ref={iconRef}
          className={styles.icon}
          aria-hidden='true'
        >
          <ChevronDown
            size={24}
            strokeWidth={2}
          />
        </span>
      </button>

      <div
        ref={answerRef}
        className={styles.answerWrapper}
      >
        <div className={styles.answer}>{children}</div>
      </div>
    </article>
  );
}

export default function Demo() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions</h2>

        {faqData.map((item) => (
          <Question
            key={item.title}
            title={item.title}
            defaultOpen={item.defaultOpen}
          >
            {item.content}
          </Question>
        ))}
      </div>
    </section>
  );
}
