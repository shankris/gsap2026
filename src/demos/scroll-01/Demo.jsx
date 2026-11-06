"use client";

// src/demos/scroll-01/Demo.jsx

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function DetailColumns({ items }) {
  return (
    <div className={styles.cols}>
      {items.map((item) => (
        <div key={item.label}>
          <p className={styles.label}>{item.label}</p>
          <p className={styles.detail}>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export default function Scroll01() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray("[data-scroll-section]", rootRef.current);

      // Lenis smooth scrolling
      const lenis = new Lenis();

      const onScroll = () => ScrollTrigger.update();
      const raf = (time) => lenis.raf(time * 1000);

      lenis.on("scroll", onScroll);

      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Section animations
      sections.forEach((section, index) => {
        const container = section.querySelector("[data-scroll-container]");

        // Rotate each incoming section into place
        if (index > 0) {
          gsap.set(container, {
            rotation: 30,
          });

          gsap.to(container, {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
            },
          });
        }

        // Pin every section except the last one
        if (index < sections.length - 1) {
          ScrollTrigger.create({
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            pin: true,
            pinSpacing: false,
          });
        }
      });

      ScrollTrigger.refresh();

      return () => {
        lenis.off("scroll", onScroll);
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
      {/* SECTION 01 — WHO WE ARE */}
      <section
        className={`${styles.section} ${styles.s1}`}
        data-scroll-section
      >
        <div
          className={styles.container}
          data-scroll-container
        >
          <p className={styles.tag}>01 — Who we are</p>

          <hr className={styles.rule} />

          <div>
            <h1 className={styles.big}>
              Create
              <br />
              Without
              <br />
              Limits
            </h1>
          </div>

          <hr className={styles.rule} />

          <p className={`${styles.sub} ${styles.bottom}`}>We believe every artist deserves a platform that puts creativity first. No algorithms, no noise — just pure art and the people who make it.</p>
        </div>
      </section>

      {/* SECTION 02 — THE MISSION */}
      <section
        className={`${styles.section} ${styles.s2}`}
        data-scroll-section
      >
        <div
          className={styles.container}
          data-scroll-container
        >
          <p className={styles.tag}>02 — The mission</p>

          <hr className={styles.rule} />

          <div>
            <h2 className={styles.big}>
              Art
              <br />
              First
              <br />
              Always
            </h2>
          </div>

          <hr className={styles.rule} />

          <div>
            <p className={styles.sub}>A global community built for artists, by artists. We're rewriting the rules of how creative work gets seen, shared, and valued.</p>
          </div>

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "Discovery",
                detail: "Human-curated collections that put real eyes on real art. No algorithms deciding your fate. We believe the best work rises when real people champion it.",
              },
              {
                label: "Community",
                detail: "Find collaborators, mentors, and fellow creatives who push your work forward. Build lasting relationships that fuel your practice for years to come.",
              },
              {
                label: "Value",
                detail: "Fair pricing. Transparent commissions. Artists keep what they earn. Always. No hidden platform fees, no surprise deductions, no middlemen.",
              },
            ]}
          />

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "Exhibitions",
                detail: "Virtual and physical showcases curated from our global network. Get your work in front of the right audiences without gallery gatekeeping.",
              },
              {
                label: "Mentorship",
                detail: "Paired guidance from established artists who've walked the path. Learn the business of art from people who actually live it.",
              },
              {
                label: "Residencies",
                detail: "Access funded creative retreats around the world. Dedicated time and space to experiment, create, and grow without distraction.",
              },
            ]}
          />

          <hr className={styles.rule} />

          <p className={`${styles.sub} ${styles.bottom} ${styles.right}`}>Every feature we build starts with one question — does this serve the artist?</p>
        </div>
      </section>

      {/* SECTION 03 — HOW IT WORKS */}
      <section
        className={`${styles.section} ${styles.s3}`}
        data-scroll-section
      >
        <div
          className={styles.container}
          data-scroll-container
        >
          <p className={styles.tag}>03 — How it works</p>

          <hr className={styles.rule} />

          <div>
            <h2 className={styles.big}>
              Show
              <br />
              Up.
              <br />
              Stand
              <br />
              Out.
            </h2>
          </div>

          <hr className={styles.rule} />

          <p className={styles.sub}>Three steps. Zero complexity. Your creative career starts moving the moment you sign up.</p>

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "01 — Upload",
                detail: "Drag, drop, done. Your portfolio goes live in seconds with full creative control. Organize by series, medium, or timeline. Present your work exactly how you want it seen.",
              },
              {
                label: "02 — Connect",
                detail: "Match with collectors, galleries, and brands actively looking for your style. Our network spans 80+ countries and every creative discipline you can think of.",
              },
              {
                label: "03 — Grow",
                detail: "Track engagement, manage commissions, and scale your practice — all in one place. Real analytics that help you understand your audience and make smarter decisions.",
              },
            ]}
          />

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "04 — Sell",
                detail: "Set your prices, manage editions, handle licensing. Built-in commerce tools that let you sell directly — no third-party marketplace needed.",
              },
              {
                label: "05 — Collaborate",
                detail: "Find your people. Joint projects, split commissions, shared studios. Creative partnerships made effortless through built-in collaboration tools.",
              },
              {
                label: "06 — Evolve",
                detail: "Your practice changes. Your platform should too. Flexible tools that adapt as your work grows, shifts, and finds new directions over time.",
              },
            ]}
          />
        </div>
      </section>

      {/* SECTION 04 — THE VISION */}
      <section
        className={`${styles.section} ${styles.s4}`}
        data-scroll-section
      >
        <div
          className={styles.container}
          data-scroll-container
        >
          <p className={styles.tag}>04 — The vision</p>

          <hr className={styles.rule} />

          <div>
            <h2 className={styles.big}>
              Future
              <br />
              Of
              <br />
              Art
            </h2>
          </div>

          <hr className={styles.rule} />

          <div>
            <p className={styles.sub}>We're not just building a platform. We're building a movement — one where emerging voices are amplified and every brushstroke matters.</p>
          </div>

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "10K+",
                detail: "Artists from 80 countries already shaping the future with us. Painters, sculptors, digital creators, photographers — every medium represented.",
              },
              {
                label: "$2M+",
                detail: "Paid directly to creators in our first year. Zero hidden fees. Money flows from collectors to artists — we just make the connection happen.",
              },
              {
                label: "100%",
                detail: "Artist-owned. Every decision we make starts with the creator. Our advisory board is made entirely of working artists.",
              },
            ]}
          />

          <hr className={styles.rule} />

          <div>
            <p className={styles.sub}>The art world has been broken for decades. Galleries take 50%. Algorithms bury talent. We're here to change that — permanently.</p>
          </div>

          <hr className={styles.rule} />

          <DetailColumns
            items={[
              {
                label: "Open access",
                detail: "No invite codes. No waiting lists. If you make art, you belong here. Period. We don't gatekeep creativity.",
              },
              {
                label: "Global reach",
                detail: "Your work seen in 120+ countries from day one. Built-in translation, multi-currency support, and worldwide shipping partnerships.",
              },
              {
                label: "Artist-first economics",
                detail: "You keep 90% of every sale. The remaining 10% funds the platform, the community, and the mission. Nothing goes to shareholders.",
              },
            ]}
          />
        </div>
      </section>

      {/* SECTION 05 — JOIN US */}
      <section
        className={`${styles.section} ${styles.s5}`}
        data-scroll-section
      >
        <div
          className={styles.container}
          data-scroll-container
        >
          <p className={styles.tag}>05 — Join us</p>

          <hr className={styles.rule} />

          <div>
            <h2 className={styles.big}>
              Ready
              <br />
              To
              <br />
              Begin?
            </h2>
          </div>

          <hr className={styles.rule} />

          <p className={`${styles.sub} ${styles.bottom}`}>Take control of your creative journey. Join now and let's shape the future of the art world together.</p>
        </div>
      </section>
    </main>
  );
}
