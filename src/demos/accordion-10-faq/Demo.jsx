// src/demos/accordion-10-faq/Demo.jsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

import solutions from "./data.json";
import styles from "./Demo.module.css";

function Solution({ item, isOpen, onSelect }) {
  const cardRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);
  const isInitial = useRef(true);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const description = descriptionRef.current;
    const button = buttonRef.current;

    if (!card || !description || !button) return;

    if (isInitial.current) {
      gsap.set(card, { height: isOpen ? 240 : 80 });
      gsap.set(description, {
        opacity: isOpen ? 1 : 0,
        display: isOpen ? "block" : "none",
      });
      gsap.set(button, {
        opacity: isOpen ? 1 : 0,
        display: isOpen ? "flex" : "none",
      });

      isInitial.current = false;
      return;
    }

    if (isOpen) {
      gsap.set([description, button], { display: "block" });
      gsap.set(button, { display: "flex" });

      gsap.to(card, {
        height: 240,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(description, {
        opacity: 1,
        duration: 0.2,
        delay: 0.08,
      });

      gsap.to(button, {
        opacity: 1,
        duration: 0.2,
        delay: 0.1,
      });
    } else {
      gsap.to([description, button], {
        opacity: 0,
        duration: 0.12,
        onComplete: () => {
          gsap.set([description, button], { display: "none" });
        },
      });

      gsap.to(card, {
        height: 60,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    return () => {
      gsap.killTweensOf([card, description, button]);
    };
  }, [isOpen]);

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isOpen ? styles.cardOpen : ""}`}
      onClick={onSelect}
      role='button'
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className={styles.title}>{item.title}</div>

      <p
        ref={descriptionRef}
        className={styles.description}
      >
        {item.description}
      </p>

      <button
        ref={buttonRef}
        type='button'
        className={styles.learnMoreButton}
        tabIndex={isOpen ? 0 : -1}
        onClick={(event) => event.stopPropagation()}
      >
        Learn More
        <ArrowRight
          size={18}
          aria-hidden='true'
        />
      </button>
    </div>
  );
}

export default function Demo() {
  const [open, setOpen] = useState(solutions[0].id);
  const imageRef = useRef(null);
  const active = solutions.find((item) => item.id === open) ?? solutions[0];

  useLayoutEffect(() => {
    const image = imageRef.current;

    if (!image) return;

    gsap.fromTo(
      image,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out",
      },
    );

    return () => {
      gsap.killTweensOf(image);
    };
  }, [active.imgSrc]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.heading}>Solutions</h2>

          <div className={styles.accordion}>
            {solutions.map((item) => (
              <Solution
                key={item.id}
                item={item}
                isOpen={item.id === open}
                onSelect={() => setOpen(item.id)}
              />
            ))}
          </div>
        </div>

        <div className={styles.imagePanel}>
          <img
            ref={imageRef}
            key={active.imgSrc}
            src={active.imgSrc}
            alt={`${active.title} solution`}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
