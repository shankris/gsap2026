// src/demos/accordion-11-faq/Demo.jsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

import faqs from "./data.json";
import styles from "./Demo.module.css";

function AccordionItem({ faq, active, onToggle }) {
  const contentRef = useRef(null);
  const innerRef = useRef(null);
  const iconRef = useRef(null);

  const isOpen = active === faq.id;

  useLayoutEffect(() => {
    const content = contentRef.current;
    const inner = innerRef.current;
    const icon = iconRef.current;

    if (!content || !inner || !icon) return;

    gsap.killTweensOf([content, icon]);

    if (isOpen) {
      gsap.to(content, {
        height: inner.scrollHeight,
        duration: 0.5,
        ease: "power2.inOut",
      });

      gsap.to(icon, {
        rotation: 180,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(content, {
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });

      gsap.to(icon, {
        rotation: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    return () => {
      gsap.killTweensOf([content, icon]);
    };
  }, [isOpen]);

  return (
    <div className={styles.card}>
      <button
        type='button'
        className={`${styles.header} ${isOpen ? styles.active : ""}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-content-${faq.id}`}
      >
        <span className={styles.title}>{faq.header}</span>

        <ChevronDown
          ref={iconRef}
          className={styles.icon}
          aria-hidden='true'
        />
      </button>

      <div
        ref={contentRef}
        id={`faq-content-${faq.id}`}
        className={styles.collapse}
        aria-hidden={!isOpen}
      >
        <div
          ref={innerRef}
          className={styles.contentInner}
        >
          <p>{faq.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  const [active, setActive] = useState(null);

  const handleToggle = (id) => {
    setActive((current) => (current === id ? null : id));
  };

  return (
    <section className={styles.section}>
      <article className={styles.wrapper}>
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            faq={faq}
            active={active}
            onToggle={() => handleToggle(faq.id)}
          />
        ))}
      </article>
    </section>
  );
}
