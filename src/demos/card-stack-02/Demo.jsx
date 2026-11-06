/* src/demos/card-stack-02/Demo.jsx */

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const services = [
  {
    number: "01",
    tone: "1",
    title: "Organic content",
    lede: "Let's build an engaged audience for your brand.",
    body: "A strong organic presence brings you closer to your customers at scale. We'll help you build one that's visually polished and feels authentic to you.",
    image: "demos/card-stack-02/01.jpg",
    alt: "Editorial fashion portrait for organic content",
  },
  {
    number: "02",
    tone: "2",
    title: "Ads for social",
    lede: "(and why your ad creatives benefit more from clarity than novelty)",
    body: "Paid social works best when the idea is sharp and the craft is clean. We plan, design, and ship campaigns that feel native — not noisy.",
    image: "demos/card-stack-02/02.jpg",
    alt: "Athletic lifestyle still for social ads",
  },
  {
    number: "03",
    tone: "3",
    title: "Brand systems",
    lede: "Identity that holds up across every surface.",
    body: "From type to tone to motion, we build flexible systems so your brand stays recognizable — whether it's a reel, a site, or a campaign.",
    image: "demos/card-stack-02/03.jpg",
    alt: "Minimal interior for brand systems",
  },
  {
    number: "04",
    tone: "4",
    title: "Campaign craft",
    lede: "Big ideas, made to travel.",
    body: "We shape narratives that cut through — then adapt them for every channel without losing the spark that made them work in the first place.",
    image: "demos/card-stack-02/04.jpg",
    alt: "Campaign fashion photography",
  },
  {
    number: "05",
    tone: "5",
    title: "Growth partners",
    lede: "Ongoing creative that compounds.",
    body: "Think of us as an extension of your team — testing, shipping, and refining so every month leaves your brand stronger than the last.",
    image: "demos/card-stack-02/05.jpg",
    alt: "Portrait for growth partnership",
  },
];

export default function CardStack02() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const stack = root.querySelector("[data-stack]");
      const cards = gsap.utils.toArray(root.querySelectorAll("[data-stack-card]"));

      if (!stack || !cards.length) return;

      const PEEK = 42;
      const SCALE_STEP = 0.045;

      function stackPose(index) {
        return {
          y: index * PEEK,
          scale: 1 - index * SCALE_STEP,
        };
      }

      // Lenis smooth scrolling
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const updateScroll = () => ScrollTrigger.update();
      const tick = (time) => lenis.raf(time * 1000);
      const handleResize = () => ScrollTrigger.refresh();

      lenis.on("scroll", updateScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      window.addEventListener("resize", handleResize);

      // Set the initial position of each card
      cards.forEach((card, index) => {
        gsap.set(card, {
          zIndex: cards.length - index,
          y: window.innerHeight * 0.72 + index * PEEK,
          scale: stackPose(index).scale * 0.9,
          rotate: 0,
          transformOrigin: "50% 0%",
        });
      });

      // Build the scroll-driven card stack
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stack,
          start: "top top",
          end: () => `+=${cards.length * window.innerHeight}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Bring all cards into their stacked positions
      cards.forEach((card, index) => {
        timeline.to(
          card,
          {
            ...stackPose(index),
            ease: "power3.out",
            duration: 1.35,
          },
          index * 0.06,
        );
      });

      // Pause briefly before the cards begin to fly out
      timeline.to({}, { duration: 0.35 });

      const flyAt = timeline.duration();
      const flyingCards = cards.slice(0, -1);

      // Move each front card away and bring the cards behind it forward
      flyingCards.forEach((card, index) => {
        const time = flyAt + index;
        const cardsBehind = cards.slice(index + 1);

        timeline.to(
          card,
          {
            y: () => -window.innerHeight * 1.15,
            rotate: -25,
            scale: 0.94,
            ease: "none",
            duration: 1,
          },
          time,
        );

        timeline.to(
          cardsBehind,
          {
            y: (cardIndex) => stackPose(cardIndex).y,
            scale: (cardIndex) => stackPose(cardIndex).scale,
            ease: "none",
            duration: 1,
          },
          time,
        );
      });

      timeline.to({}, { duration: 0.4 });

      ScrollTrigger.refresh();

      return () => {
        window.removeEventListener("resize", handleResize);
        lenis.off("scroll", updateScroll);
        gsap.ticker.remove(tick);
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
      <section
        className={`${styles.plain} ${styles.intro}`}
        aria-label='Intro'
      >
        <div className={styles.plainInner}>
          <p className={styles.plainLabel}>Studio</p>
          <h1 className={styles.plainTitle}>What we make</h1>
          <p className={styles.plainCopy}>A short look at how we grow brands — then scroll into the work.</p>
        </div>
      </section>

      <section
        className={styles.stack}
        data-stack
        aria-label='Services'
      >
        <div className={styles.stackHeader}>
          <h2>Our services</h2>
        </div>

        <div className={styles.stackStage}>
          <div className={styles.stackDeck}>
            {services.map((service) => (
              <article
                className={styles.card}
                data-stack-card
                data-tone={service.tone}
                key={service.number}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <span className={styles.cardIndex}>{service.number}</span>
                  </div>

                  <p className={styles.cardLede}>{service.lede}</p>

                  <p className={styles.cardBody}>{service.body}</p>

                  <a
                    className={styles.cardCta}
                    href='#outro'
                  >
                    Discover our approach
                    <span
                      className={styles.cardCtaArrow}
                      aria-hidden='true'
                    >
                      →
                    </span>
                  </a>
                </div>

                <div className={styles.cardMedia}>
                  <div className={styles.cardFrame}>
                    <img
                      src={service.image}
                      alt={service.alt}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.plain} ${styles.outro}`}
        id='outro'
        aria-label='Outro'
      >
        <div className={styles.plainInner}>
          <p className={styles.plainLabel}>Next</p>
          <h2 className={styles.plainTitle}>Let's talk</h2>
          <p className={styles.plainCopy}>That's the stack. Ready when you are.</p>
        </div>
      </section>
    </main>
  );
}
