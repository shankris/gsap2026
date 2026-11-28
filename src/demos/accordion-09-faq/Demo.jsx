// src/demos/accordion-09-faq/Demo.jsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import gsap from "gsap";

import data from "./data.json";
import styles from "./Demo.module.css";

function Question({ question, answer }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef(null);
  const iconRef = useRef(null);
  const isInitial = useRef(true);

  useLayoutEffect(() => {
    const answerElement = answerRef.current;
    const iconElement = iconRef.current;

    if (!answerElement || !iconElement) return;

    if (isInitial.current) {
      gsap.set(answerElement, {
        height: 0,
        opacity: 0,
        marginTop: 0,
      });

      gsap.set(iconElement, { rotation: 0 });
      isInitial.current = false;
      return;
    }

    gsap.to(answerElement, {
      height: open ? "auto" : 0,
      opacity: open ? 1 : 0,
      marginTop: open ? 16 : 0,
      duration: 0.35,
      ease: "power2.out",
    });

    gsap.to(iconElement, {
      rotation: open ? 45 : 0,
      duration: 0.3,
      ease: "power2.out",
    });

    return () => {
      gsap.killTweensOf([answerElement, iconElement]);
    };
  }, [open]);

  return (
    <article className={`${styles.questionCard} ${open ? styles.questionOpen : ""}`}>
      <button
        type='button'
        className={styles.questionButton}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className={styles.questionText}>{question}</span>

        <span
          ref={iconRef}
          className={styles.questionIcon}
          aria-hidden='true'
        >
          <Plus size={22} />
        </span>
      </button>

      <div
        ref={answerRef}
        className={styles.answerWrapper}
      >
        <div className={styles.answer}>{answer}</div>
      </div>
    </article>
  );
}

export default function Demo() {
  const [selected, setSelected] = useState(data.tabs[0]);
  const questionsRef = useRef(null);
  const isInitial = useRef(true);

  useLayoutEffect(() => {
    const questionsElement = questionsRef.current;

    if (!questionsElement) return;

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    gsap.fromTo(
      questionsElement,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
    );

    return () => {
      gsap.killTweensOf(questionsElement);
    };
  }, [selected]);

  return (
    <section className={styles.section}>
      <div className={styles.headingWrapper}>
        <span className={styles.subheading}>Let&apos;s answer some questions</span>

        <h2 className={styles.heading}>FAQs</h2>
      </div>

      <div
        className={styles.tabs}
        role='tablist'
        aria-label='FAQ topics'
      >
        {data.tabs.map((tab) => (
          <button
            key={tab}
            type='button'
            role='tab'
            aria-selected={selected === tab}
            className={`${styles.tabButton} ${selected === tab ? styles.activeTab : ""}`}
            onClick={() => setSelected(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.questionsWrapper}>
        <div
          ref={questionsRef}
          role='tabpanel'
          className={styles.questionsPanel}
        >
          {data.questions[selected].map((item) => (
            <Question
              key={item.question}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>

      <div
        className={styles.glow}
        aria-hidden='true'
      />
    </section>
  );
}
