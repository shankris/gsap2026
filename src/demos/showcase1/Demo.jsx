// src/demos/showcase1/Demo.jsx

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const stands = [
  {
    title: "Websites & Landing pages",
    description: "Creating high-end and beautiful websites built to perform and convert.",
    images: ["demos/showcase1/01.jpg", "demos/showcase1/02.jpg", "demos/showcase1/03.jpg", "demos/showcase1/04.jpg", "demos/showcase1/05.jpg"],
  },
  {
    title: "Brand & Identity",
    description: "Visual systems that feel intentional, memorable, and unmistakably yours.",
    images: ["demos/showcase1/06.jpg", "demos/showcase1/07.jpg", "demos/showcase1/08.jpg", "demos/showcase1/09.jpg", "demos/showcase1/10.jpg"],
  },
  {
    title: "Product & UI",
    description: "Interfaces crafted with clarity — every screen considered, every interaction refined.",
    images: ["demos/showcase1/11.jpg", "demos/showcase1/12.jpg", "demos/showcase1/13.jpg", "demos/showcase1/01.jpg", "demos/showcase1/02.jpg"],
  },
];

const cardStart = [
  { rotateX: 58, rotateY: 18, y: 48 },
  { rotateX: 74, rotateY: 5, y: 32 },
  { rotateX: 90, rotateY: 0, y: 18 },
  { rotateX: 74, rotateY: -5, y: 32 },
  { rotateX: 58, rotateY: -18, y: 48 },
];

function TextBlock({ label, title, description, showScroll = false }) {
  return (
    <div className={styles.textBlock}>
      <p className={styles.textLabel}>{label}</p>
      <h1 className={styles.textTitle}>{title}</h1>
      <p className={styles.textBody}>{description}</p>

      {showScroll && (
        <>
          <p className={styles.introHint}>Scroll</p>
          <span
            className={styles.scrollLine}
            aria-hidden='true'
          />
        </>
      )}
    </div>
  );
}

export default function Showcase1() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
      });

      const updateScroll = () => ScrollTrigger.update();
      const raf = (time) => lenis.raf(time * 1000);

      lenis.on("scroll", updateScroll);
      gsap.ticker.add(raf);

      const splitInstances = [];

      gsap.utils.toArray("[data-stand]", rootRef.current).forEach((section) => {
        const cards = section.querySelectorAll("[data-card]");
        const cardsWrap = section.querySelector("[data-cards-wrap]");
        const copy = section.querySelector("[data-stand-copy]");
        const heading = section.querySelector("[data-stand-heading]");

        const split = SplitText.create(heading, {
          type: "words",
          wordsClass: styles.word,
        });

        splitInstances.push(split);

        cards.forEach((card, index) => {
          gsap.set(card, {
            ...cardStart[index],
            transformOrigin: "50% 100%",
            transformPerspective: 1560,
          });
        });

        gsap.set(copy, { y: -10 });
        gsap.set(cardsWrap, { marginTop: "2.5rem" });
        gsap.set(split.words, { color: "#F22A72" });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 40%",
              end: "top 0%",
              scrub: 1,
            },
          })
          .to(
            cards,
            {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              ease: "power1.inOut",
              duration: 1,
            },
            0,
          )
          .to(copy, { y: 0 }, 0)
          .to(
            split.words,
            {
              color: "#57524f",
              stagger: 0.2,
            },
            0.1,
          );
      });

      ScrollTrigger.refresh();

      return () => {
        splitInstances.forEach((split) => split.revert());

        lenis.off("scroll", updateScroll);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    { scope: rootRef },
  );

  return (
    <main
      className={styles.page}
      ref={rootRef}
    >
      <section className={styles.intro}>
        <TextBlock
          label='Studio'
          title='Scroll to see the work stand up.'
          description='A quiet intro — then each section reveals itself as you move through the page.'
          showScroll
        />
      </section>

      <div className={styles.stands}>
        {stands.map((stand) => (
          <section
            className={styles.stand}
            data-stand
            key={stand.title}
          >
            <div className={styles.standInner}>
              <div
                className={styles.standCopy}
                data-stand-copy
              >
                <h2
                  className={styles.standHeading}
                  data-stand-heading
                >
                  {stand.title}
                </h2>

                <p className={styles.standSub}>{stand.description}</p>
              </div>

              <div
                className={styles.cardsWrap}
                data-cards-wrap
              >
                <div className={styles.cardsStage}>
                  {stand.images.map((image, index) => (
                    <article
                      className={styles.card}
                      data-card
                      key={`${stand.title}-${index}`}
                    >
                      <img
                        src={image}
                        alt=''
                      />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <footer className={styles.outro}>
        <TextBlock
          label='End'
          title="That's all for now."
          description='Swap images and copy for your own work.'
        />
      </footer>
    </main>
  );
}
