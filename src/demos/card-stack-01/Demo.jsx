/* src/demos/card-stack-01/Demo.jsx */

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const games = [
  {
    number: "01",
    title: "RDR 2",
    image: "demos/card-stack-01/01.jpg",
    alt: "Red Dead Redemption 2 artwork",
    description: "Red Dead Redemption 2 is a celebrated open-world adventure set in the American frontier, following Arthur Morgan and the Van der Linde gang through a gripping tale of loyalty, survival, and breathtaking landscapes.",
  },
  {
    number: "02",
    title: "GOW : RAGNAROCK",
    image: "demos/card-stack-01/02.jpg",
    alt: "God of War Ragnarök artwork",
    description: "God of War: Ragnarök is an acclaimed action-adventure game set in Norse mythology, following Kratos and his son Atreus through a thrilling story full of epic battles and stunning visuals.",
  },
  {
    number: "03",
    title: "THE LAST OF US",
    image: "demos/card-stack-01/03.jpg",
    alt: "The Last of Us artwork",
    description: "The Last of Us is a powerful story-driven action game set in a post-apocalyptic world, following Joel and Ellie on an emotional journey through danger and hope in a beautifully haunting landscape.",
  },
  {
    number: "04",
    title: "SEKIRO",
    image: "demos/card-stack-01/04.jpg",
    alt: "Sekiro Shadows Die Twice artwork",
    description: "Sekiro: Shadows Die Twice is an intense action game set in feudal Japan, where you play as a shinobi on a quest for vengeance featuring brutal combat, stealth mechanics, and stunning visuals.",
  },
  {
    number: "05",
    title: "ELDEN RING",
    image: "demos/card-stack-01/05.jpg",
    alt: "Elden Ring artwork",
    description: "Elden Ring is an expansive open-world action RPG crafted by FromSoftware and George R.R. Martin, offering a vast dark fantasy realm filled with challenging combat and deep lore to uncover.",
  },
];

function IntroIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M22 12H18L15 21L9 3L6 12H2'
        stroke='currentColor'
        strokeWidth='0.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function OutroIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
        stroke='currentColor'
        strokeWidth='0.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function CardStack01() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const pinCards = Array.from(root.querySelectorAll(`.${styles.card}`));

      if (!pinCards.length) return;

      // Lenis smooth scrolling
      const lenis = new Lenis();

      const updateScroll = () => {
        ScrollTrigger.update();
      };

      const tick = (time) => {
        lenis.raf(time * 1000);
      };

      lenis.on("scroll", updateScroll);
      gsap.ticker.add(tick);

      // Pin each card and animate it as the next card arrives
      pinCards.forEach((card, index) => {
        if (index < pinCards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: pinCards[pinCards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: pinCards[index + 1],
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;

              gsap.set(card, {
                scale: 1 - progress * 0.25,
                rotation: index % 2 === 0 ? progress * 5 : -progress * 5,
                rotationX: index % 2 === 0 ? progress * 40 : -progress * 40,
              });

              const overlay = card.querySelector("[data-card-overlay]");

              if (overlay) {
                gsap.set(overlay, {
                  opacity: progress * 0.4,
                });
              }
            },
          });
        }
      });

      ScrollTrigger.refresh();

      return () => {
        lenis.off("scroll", updateScroll);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    },
    { scope: rootRef },
  );

  return (
    <main
      ref={rootRef}
      className={styles.page}
    >
      <section className={styles.intro}>
        <h2>
          Best
          <span>
            Games <IntroIcon />
          </span>
          To Try.
        </h2>

        <p>Here are a few of the most memorable and entertaining games I have enjoyed over the years. Each one stands out for its unique gameplay and lasting impact.</p>
      </section>

      {games.map((game) => (
        <section
          className={styles.card}
          key={game.number}
        >
          <div
            className={styles.overlay}
            data-card-overlay
            aria-hidden='true'
          />

          <span className={styles.number}>({game.number})</span>

          <div className={styles.cardContent}>
            <h2>{game.title}</h2>

            <img
              src={game.image}
              alt={game.alt}
              loading='lazy'
            />

            <p>{game.description}</p>
          </div>
        </section>
      ))}

      <section className={styles.outro}>
        <h2>
          Happy
          <span>
            Gaming <OutroIcon />
          </span>
          Out There.
        </h2>

        <p>These games have shaped my gaming journey and left a lasting impression. Whether you're looking for epic adventures or challenging gameplay, each of these titles offers something truly special. Enjoy exploring these worlds!</p>
      </section>
    </main>
  );
}
