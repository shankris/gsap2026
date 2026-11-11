/* src/demos/card-05/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import styles from "./Demo.module.css";

export default function Card05() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const card = root.querySelector(`.${styles.spartanCard}`);
    const status = root.querySelector(`.${styles.hudStatus}`);
    const button = root.querySelector(`.${styles.actionBtn}`);

    if (!card) return;

    let bounds;
    let glitchTimeout;
    let glitchInterval;

    const updateBounds = () => {
      bounds = card.getBoundingClientRect();
    };

    updateBounds();

    const handleResize = () => {
      updateBounds();
    };

    const handleMouseEnter = () => {
      updateBounds();
      card.style.transition = "transform 0.15s ease-out";
    };

    const handleMouseMove = (event) => {
      if (!bounds) return;

      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      const px = x / bounds.width;
      const py = y / bounds.height;

      const rotateY = (px - 0.5) * 7;
      const rotateX = (0.5 - py) * 7;

      const mx = (px - 0.5) * 20;
      const my = (py - 0.5) * 20;

      card.style.setProperty("--mx", mx);
      card.style.setProperty("--my", my);

      card.style.transform = `
                perspective(1200px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
                scale(1.01)
            `;
    };

    const handleMouseLeave = () => {
      card.style.transition = "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)";

      card.style.transform = `
                perspective(1200px)
                rotateX(0deg)
                rotateY(0deg)
                translateY(0)
                scale(1)
            `;

      card.style.setProperty("--mx", 0);
      card.style.setProperty("--my", 0);
    };

    const handleButtonMove = (event) => {
      const rect = button.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const moveX = (x - rect.width / 2) * 0.15;
      const moveY = (y - rect.height / 2) * 0.15;

      button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    const handleButtonLeave = () => {
      button.style.transform = "";
    };

    const glitch = () => {
      if (!status) return;

      status.classList.add(styles.glitch);

      window.clearTimeout(glitchTimeout);

      glitchTimeout = window.setTimeout(() => {
        status.classList.remove(styles.glitch);
      }, 120);
    };

    const handleGlitchInterval = () => {
      if (Math.random() > 0.45) {
        glitch();
      }
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    window.addEventListener("resize", handleResize);

    if (button) {
      button.addEventListener("mousemove", handleButtonMove);
      button.addEventListener("mouseleave", handleButtonLeave);
    }

    if (status) {
      glitchInterval = window.setInterval(handleGlitchInterval, 4500);
    }

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);

      window.removeEventListener("resize", handleResize);

      if (button) {
        button.removeEventListener("mousemove", handleButtonMove);
        button.removeEventListener("mouseleave", handleButtonLeave);
      }

      window.clearInterval(glitchInterval);
      window.clearTimeout(glitchTimeout);
    };
  }, []);

  return (
    <div
      className={styles.page}
      ref={rootRef}
    >
      <div className={styles.ambient} />
      <div className={styles.bg} />

      <main className={styles.main}>
        <article className={styles.spartanCard}>
          <div className={styles.cardNoise} />
          <div className={styles.energyLine} />
          <div className={styles.cornerGlow} />

          <div className={styles.particles}>
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} />
            ))}
          </div>

          <div className={styles.hudTop}>
            <span>COLLECTION / #07</span>

            <div className={styles.hudStatus}>
              <i />
              <span>ACTIVE</span>
            </div>
          </div>

          <div className={styles.characterLayer}>
            <div className={styles.imageGlow} />

            <img
              className={styles.character}
              src='/demos/cards-05/card.png'
              alt='Female Spartan warrior'
            />

            <div className={styles.redLight} />
          </div>

          <div className={styles.frame} />

          <div className={`${styles.corner} ${styles.cornerTl}`} />
          <div className={`${styles.corner} ${styles.cornerTr}`} />
          <div className={`${styles.corner} ${styles.cornerBl}`} />
          <div className={`${styles.corner} ${styles.cornerBr}`} />

          <div className={styles.verticalLabel}>
            <span>WARRIOR</span>
            <span>SPARTA</span>
          </div>

          <div className={styles.cover}>
            <div className={styles.coverContent}>
              <div className={styles.helmetMark}>
                <span />
              </div>

              <span className={styles.eyebrow}>LEGENDARY WARRIOR</span>

              <h1>
                SPECIAL
                <strong>CARD</strong>
              </h1>

              <div className={styles.coverLine} />

              <div className={styles.enter}>
                <span>INSPECT STATS</span>
                <b>↗</b>
              </div>
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detailsInner}>
              <div className={styles.detailsHeader}>
                <div>
                  <span className={styles.smallLabel}>SPARTAN // 01</span>

                  <h2>
                    SPECIAL
                    <em>CARD</em>
                  </h2>
                </div>

                <div className={styles.helmetSymbol}>♞</div>
              </div>

              <div className={styles.divider}>
                <span />
                <i />
                <span />
              </div>

              <p className={styles.description}>Born beneath the crimson banner of Sparta. Trained for war. Forged through discipline. A warrior whose presence turns the battlefield into legend.</p>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span>STRENGTH</span>
                  <div className={styles.bar}>
                    <i className={styles.strengthBar} />
                  </div>
                  <b>94</b>
                </div>

                <div className={styles.stat}>
                  <span>HONOR</span>
                  <div className={styles.bar}>
                    <i className={styles.honorBar} />
                  </div>
                  <b>87</b>
                </div>

                <div className={styles.stat}>
                  <span>DISCIPLINE</span>
                  <div className={styles.bar}>
                    <i className={styles.disciplineBar} />
                  </div>
                  <b>98</b>
                </div>
              </div>

              <div className={styles.spartanAction}>
                <button
                  className={styles.actionBtn}
                  type='button'
                >
                  <span>OPEN PROFILE</span>
                  <i>↗</i>
                </button>
              </div>

              <div className={styles.detailsFooter}>
                <span>EST. 480 BC</span>

                <div className={styles.coordinates}>
                  <span>37° 04′ N</span>
                  <span>22° 25′ E</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.scan} />

          <div className={`${styles.crosshair} ${styles.crosshair1}`} />
          <div className={`${styles.crosshair} ${styles.crosshair2}`} />

          <div className={`${styles.redDot} ${styles.dot1}`} />
          <div className={`${styles.redDot} ${styles.dot2}`} />
          <div className={`${styles.redDot} ${styles.dot3}`} />

          <div className={styles.cardNumber}>001</div>
        </article>
      </main>
    </div>
  );
}
