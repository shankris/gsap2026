// src/demos/gallery-01/Demo.jsx

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const panels = [
  {
    number: "01",
    category: "Residence",
    title: "Pool Villa",
    description: "Where dusk meets the horizon, luxury finds its home. A sanctuary of modern architecture surrounded by stillness.",
    image: "demos/gallery-01/01.jpg",
  },
  {
    number: "02",
    category: "Interior",
    title: "Wellness",
    description: "Spaces designed for quiet reflection. Wood, stone, and soft light where comfort takes over.",
    image: "demos/gallery-01/02.jpg",
  },
  {
    number: "03",
    category: "Location",
    title: "Nightfall",
    description: "The city at twilight, seen from above. Glass facades catch the last light while streets begin to glow.",
    image: "demos/gallery-01/03.jpg",
  },
  {
    number: "04",
    category: "Design",
    title: "Interiors",
    description: "Every surface chosen for touch, every corner designed for rest. Living without compromise.",
    image: "demos/gallery-01/04.jpg",
  },
  {
    number: "05",
    category: "Architecture",
    title: "Estate",
    description: "A silhouette against the sky. Modern lines and soft shadows where the house meets the land.",
    image: "demos/gallery-01/05.jpg",
  },
];

export default function Gallery01() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const panelElements = gsap.utils.toArray("[data-panel]", root);
      const progressBar = root.querySelector("[data-progress-bar]");
      const dots = gsap.utils.toArray("[data-nav-dot]", root);

      const lenis = new Lenis();

      const updateScroll = () => ScrollTrigger.update();
      const raf = (time) => lenis.raf(time * 1000);

      lenis.on("scroll", updateScroll);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      const timeline = gsap.timeline();

      panelElements.forEach((panel, index) => {
        if (index > 0) {
          const incomingContent = panel.querySelectorAll("[data-panel-header], [data-panel-body], [data-panel-title]");

          timeline.fromTo(
            incomingContent,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.6,
              ease: "power1.inOut",
            },
          );
        }

        if (index < panelElements.length - 1) {
          const currentImage = panel.querySelector("[data-panel-image]");
          const nextImage = panelElements[index + 1].querySelector("img");

          timeline
            .fromTo(
              currentImage,
              { clipPath: "inset(0 0 0% 0)" },
              {
                clipPath: "inset(0 0 100% 0)",
                ease: "none",
                duration: 1,
              },
            )
            .fromTo(
              nextImage,
              { scale: 1.2 },
              {
                scale: 1,
                duration: 1.3,
                ease: "power2.out",
              },
              "<",
            );
        }
      });

      ScrollTrigger.create({
        animation: timeline,
        trigger: root.querySelector("[data-panels]"),
        start: "top top",
        end: () => `+=${timeline.totalDuration() * window.innerHeight}`,
        scrub: 0.6,
        pin: true,
        onUpdate: ({ progress }) => {
          if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
          }

          const activeIndex = Math.min(panelElements.length - 1, Math.floor(progress * panelElements.length));

          dots.forEach((dot, index) => {
            dot.classList.toggle(styles.active, index === activeIndex);
          });
        },
      });

      ScrollTrigger.refresh();

      return () => {
        lenis.off("scroll", updateScroll);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      className={styles.page}
      ref={rootRef}
    >
      <div
        className={styles.overlay}
        aria-hidden='true'
      />

      <div
        className={styles.progress}
        aria-hidden='true'
      >
        <div
          className={styles.progressBar}
          data-progress-bar
        />
      </div>

      <nav
        className={styles.nav}
        aria-label='Gallery progress'
      >
        {panels.map((panel, index) => (
          <span
            className={`${styles.navDot} ${index === 0 ? styles.active : ""}`}
            data-nav-dot
            key={panel.number}
            aria-label={`Panel ${panel.number}: ${panel.title}`}
          />
        ))}
      </nav>

      <main
        className={styles.panels}
        data-panels
      >
        {panels.map((panel) => (
          <section
            className={styles.panel}
            data-panel
            key={panel.number}
          >
            <div
              className={styles.panelImage}
              data-panel-image
            >
              <img
                src={panel.image}
                alt={panel.title}
              />

              <div className={styles.panelContent}>
                <header
                  className={styles.panelHeader}
                  data-panel-header
                >
                  <span className={styles.panelNumber}>{panel.number}</span>

                  <span className={styles.panelDivider} />

                  <span className={styles.panelCategory}>{panel.category}</span>
                </header>

                <div className={styles.panelFooter}>
                  <p
                    className={styles.panelBody}
                    data-panel-body
                  >
                    {panel.description}
                  </p>

                  <div className={styles.panelHeading}>
                    <h2
                      className={styles.panelTitle}
                      data-panel-title
                    >
                      {panel.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
