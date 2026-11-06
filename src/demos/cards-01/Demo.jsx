/* src/demos/cards-01/Demo.jsx */

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const teamMembers = [
  {
    number: "01 / 08",
    name: "Marcus Chen",
    role: "Lead Frontend Engineer",
    quote: '"Clean code is not written by following rules. It\'s written by caring."',
    image: "demos/cards-01/01.jpg",
  },
  {
    number: "02 / 08",
    name: "Elena Voss",
    role: "UX Design Lead",
    quote: '"Design is intelligence made visible."',
    image: "demos/cards-01/02.jpg",
  },
  {
    number: "03 / 08",
    name: "James Okonkwo",
    role: "Backend Architect",
    quote: '"Simplicity is the ultimate sophistication."',
    image: "demos/cards-01/03.jpg",
  },
  {
    number: "04 / 08",
    name: "Sofia Reyes",
    role: "DevOps Engineer",
    quote: '"Automate everything. Question nothing."',
    image: "demos/cards-01/04.jpg",
  },
  {
    number: "05 / 08",
    name: "Ava Mitchell",
    role: "Product Manager",
    quote: '"Ship fast. Learn faster."',
    image: "demos/cards-01/05.jpg",
  },
  {
    number: "06 / 08",
    name: "Kai Tanaka",
    role: "Mobile Developer",
    quote: '"Every pixel tells a story."',
    image: "demos/cards-01/06.jpg",
  },
  {
    number: "07 / 08",
    name: "Liam Foster",
    role: "Security Engineer",
    quote: '"Trust no one. Verify everything."',
    image: "demos/cards-01/07.jpg",
  },
  {
    number: "08 / 08",
    name: "Nina Patel",
    role: "Data Scientist",
    quote: '"In data we trust. In models we verify."',
    image: "demos/cards-01/08.jpg",
  },
];

export default function Cards01() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const lenis = new Lenis();

      lenis.on("scroll", ScrollTrigger.update);

      const updateLenis = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);

      const sections = gsap.utils.toArray(`.${styles.section}`, rootRef.current);

      sections.forEach((section, index) => {
        const content = section.querySelector(`.${styles.content}`);

        if (index < sections.length - 1) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            endTrigger: sections[sections.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: sections[index + 1],
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;

              gsap.set(content, {
                opacity: 1 - progress,
                y: `-${25 * progress}%`,
                z: -800 * progress,
                rotationX: 80 * progress,
              });
            },
          });
        }
      });

      return () => {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
        gsap.ticker.lagSmoothing(1000, 33);
      };
    },
    { scope: rootRef },
  );

  return (
    <main
      className={styles.page}
      ref={rootRef}
    >
      <div className={styles.container}>
        <section className={styles.introSection}>
          <div className={styles.introContent}>
            <h2>Our Team</h2>
            <p>The creative minds behind the magic. Meet the talented individuals who turn ideas into reality.</p>
            <div className={styles.line} />
          </div>
        </section>

        <div className={styles.sectionContainer}>
          {teamMembers.map((member) => (
            <section
              className={styles.section}
              key={member.number}
            >
              <div className={styles.content}>
                <img
                  src={member.image}
                  alt={member.name}
                />

                <div className={styles.cardOverlay}>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardNumber}>{member.number}</span>

                    <h2 className={styles.cardName}>{member.name}</h2>

                    <p className={styles.cardRole}>{member.role}</p>

                    <div className={styles.cardDivider} />

                    <p className={styles.cardQuote}>{member.quote}</p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
