"use client";

// src/demos/landing-01/Demo.jsx

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const titleText = "A WALK";
const randomLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function Demo() {
  const invitationRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const paintingRef = useRef(null);
  const ringRefs = useRef([]);
  const statusRef = useRef(null);
  const charRefs = useRef([]);

  useEffect(() => {
    const invitation = invitationRef.current;
    const container = containerRef.current;
    const title = titleRef.current;
    const painting = paintingRef.current;
    const rings = ringRefs.current;
    const status = statusRef.current;
    const chars = charRefs.current;

    if (!invitation || !container || !title || !status) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let active = false;
    let hoverTimeline = null;
    let decryptTween = null;
    let floatingTween = null;
    let introTimeline = null;

    const originalChars = chars.map((char) => char.textContent);

    const elementsToReveal = [`.${styles.topbar}`, `.${styles.bottombar}`, `.${styles.eyebrow}`, `.${styles.preTitle}`, `.${styles.titleOrnament}`, `.${styles.invitationCopy}`, `.${styles.destination}`];

    const ctx = gsap.context(() => {
      gsap.set(elementsToReveal, {
        autoAlpha: 0,
        y: 12,
      });

      gsap.set(title, {
        autoAlpha: 0,
      });

      gsap.set(rings, {
        scale: 0.75,
        rotation: -25,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
      });

      if (chars.length) {
        gsap.set(chars, {
          transformOrigin: "50% 100%",
        });
      }

      introTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      introTimeline
        .to(`.${styles.topbar}, .${styles.bottombar}`, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        })
        .to(
          `.${styles.eyebrow}`,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.45",
        )
        .to(
          `.${styles.preTitle}`,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
          },
          "-=0.5",
        )
        .to(
          title,
          {
            autoAlpha: 1,
            duration: 0.9,
          },
          "-=0.4",
        );

      if (chars.length && !reducedMotion) {
        introTimeline.from(
          chars,
          {
            y: 35,
            rotationX: -45,
            opacity: 0,
            stagger: 0.055,
            duration: 0.9,
            ease: "back.out(1.5)",
          },
          "-=0.75",
        );
      }

      introTimeline
        .to(
          `.${styles.titleOrnament}`,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.4",
        )
        .to(
          `.${styles.invitationCopy}`,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.35",
        )
        .to(
          `.${styles.destination}`,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.4",
        );

      if (!reducedMotion) {
        gsap.to(painting, {
          scale: 1.08,
          duration: 18,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, invitation);

    function decryptText() {
      if (!chars.length || reducedMotion) return;

      decryptTween?.kill();

      chars.forEach((char) => {
        char.textContent = randomLetters[Math.floor(Math.random() * randomLetters.length)];
      });

      const progress = { value: 0 };

      decryptTween = gsap.to(progress, {
        value: chars.length,
        duration: 0.85,
        ease: "none",
        onUpdate() {
          const revealed = Math.floor(progress.value);

          chars.forEach((char, index) => {
            if (index < revealed) {
              char.textContent = originalChars[index];
            } else {
              char.textContent = randomLetters[Math.floor(Math.random() * randomLetters.length)];
            }
          });
        },
        onComplete() {
          chars.forEach((char, index) => {
            char.textContent = originalChars[index];
          });
        },
      });
    }

    function activate() {
      if (active) return;

      active = true;
      invitation.classList.add(styles.isActive);

      if (reducedMotion) {
        gsap.to(status, {
          autoAlpha: 1,
          duration: 0.3,
        });

        gsap.to(rings, {
          autoAlpha: 0.65,
          duration: 0.3,
        });

        return;
      }

      decryptText();

      hoverTimeline?.kill();
      floatingTween?.kill();

      gsap.killTweensOf(rings);
      gsap.killTweensOf(chars);
      gsap.killTweensOf(status);

      hoverTimeline = gsap.timeline();

      hoverTimeline
        .to(
          rings[0],
          {
            scale: 1.35,
            rotation: 35,
            autoAlpha: 0.8,
            duration: 1.2,
            ease: "power3.out",
          },
          0,
        )
        .to(
          rings[1],
          {
            scale: 1.15,
            rotation: -20,
            autoAlpha: 0.65,
            duration: 1,
            ease: "power3.out",
          },
          0.08,
        );

      if (chars.length) {
        hoverTimeline.fromTo(
          chars,
          {
            z: -60,
            rotationX: -45,
            opacity: 0.25,
          },
          {
            z: 0,
            rotationX: 0,
            opacity: 1,
            stagger: 0.045,
            duration: 0.8,
            ease: "expo.out",
          },
          0,
        );

        floatingTween = gsap.to(chars, {
          y: (index) => Math.sin(index * 1.2) * 4 + gsap.utils.random(-1, 1),
          duration: 1.8,
          stagger: 0.035,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      hoverTimeline.to(
        status,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0.35,
      );
    }

    function deactivate() {
      if (!active) return;

      active = false;
      invitation.classList.remove(styles.isActive);

      hoverTimeline?.kill();
      hoverTimeline = null;

      floatingTween?.kill();
      floatingTween = null;

      decryptTween?.kill();
      decryptTween = null;

      gsap.killTweensOf(rings);
      gsap.killTweensOf(chars);
      gsap.killTweensOf(status);

      chars.forEach((char, index) => {
        char.textContent = originalChars[index];
      });

      gsap.to(chars, {
        y: 0,
        z: 0,
        rotationX: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
      });

      gsap.to(rings, {
        scale: 0.75,
        rotation: -25,
        autoAlpha: 0,
        duration: 0.65,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(status, {
        autoAlpha: 0,
        y: 10,
        duration: 0.3,
        overwrite: true,
      });
    }

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const handleMouseEnter = () => {
      if (supportsHover) activate();
    };

    const handleMouseLeave = () => {
      if (supportsHover) deactivate();
    };

    const handleClick = (event) => {
      if (supportsHover) return;

      event.preventDefault();

      if (active) {
        deactivate();
      } else {
        activate();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        if (active) {
          deactivate();
        } else {
          activate();
        }
      }

      if (event.key === "Escape") {
        deactivate();
      }
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);
    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("keydown", handleKeyDown);

      hoverTimeline?.kill();
      floatingTween?.kill();
      decryptTween?.kill();
      introTimeline?.kill();

      ctx.revert();
    };
  }, []);

  return (
    <main
      className={styles.invitation}
      ref={invitationRef}
    >
      <img
        ref={paintingRef}
        className={styles.painting}
        src='/demos/landing-01/bg.jpg'
        alt=''
        aria-hidden='true'
      />

      <div className={styles.paintingOverlay} />
      <div className={styles.filmGrain} />

      <div
        className={styles.frame}
        aria-hidden='true'
      >
        <span className={`${styles.frameCorner} ${styles.topLeft}`} />
        <span className={`${styles.frameCorner} ${styles.topRight}`} />
        <span className={`${styles.frameCorner} ${styles.bottomLeft}`} />
        <span className={`${styles.frameCorner} ${styles.bottomRight}`} />
      </div>

      <header className={styles.topbar}>
        <span className={styles.topbarLabel}>THE MEDITERRANEAN JOURNAL</span>
        <span className={styles.topbarEdition}>VOL. I — SUMMER</span>
      </header>

      <section className={styles.invitationContent}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          <span>A LITTLE ESCAPE FROM ORDINARY DAYS</span>
          <span className={styles.eyebrowLine} />
        </div>

        <div
          className={styles.aiContainer}
          ref={containerRef}
          role='button'
          tabIndex={0}
          aria-label='Reveal the invitation to take a stroll'
        >
          <div
            className={styles.scanRing}
            ref={(element) => {
              ringRefs.current[0] = element;
            }}
            aria-hidden='true'
          />

          <div
            className={`${styles.scanRing} ${styles.scanRingInner}`}
            ref={(element) => {
              ringRefs.current[1] = element;
            }}
            aria-hidden='true'
          />

          <span className={styles.preTitle}>SHALL WE TAKE</span>

          <h1
            className={styles.aiTitle}
            ref={titleRef}
          >
            {titleText.split("").map((char, index) => (
              <span
                className={styles.char}
                key={`${char}-${index}`}
                ref={(element) => {
                  charRefs.current[index] = element;
                }}
                aria-hidden='true'
              >
                {char === " " ? "\u00a0" : char}
              </span>
            ))}
            <span className={styles.srOnly}>A WALK</span>
          </h1>

          <div className={styles.titleOrnament}>
            <span />
            <span className={styles.ornamentStar}>✳</span>
            <span />
          </div>

          <p className={styles.invitationCopy}>
            Where the old streets meet the endless sea,
            <br />
            and time forgets to hurry.
          </p>

          <div
            className={styles.unlockStatus}
            ref={statusRef}
          >
            <span className={styles.statusDot} />
            THE AFTERNOON IS OURS
          </div>
        </div>

        <div className={styles.destination}>
          <span className={styles.destinationNumber}>01</span>
          <span className={styles.destinationDivider} />
          <span className={styles.destinationName}>SOMEWHERE IN ITALY</span>
          <span className={styles.destinationDivider} />
          <span className={styles.destinationCoordinates}>40° 42' N</span>
        </div>
      </section>

      <footer className={styles.bottombar}>
        <span className={styles.footerNote}>A SLOWER KIND OF BEAUTY</span>

        <div className={styles.scrollIndicator}>
          <span>HOVER OR TAP TO EXPLORE</span>
          <span className={styles.scrollArrow}>↗</span>
        </div>

        <span className={styles.footerYear}>EST. 1897</span>
      </footer>
    </main>
  );
}
