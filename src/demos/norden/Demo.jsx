/* src/demos/norden/Demo.jsx */

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP);

export default function Norden() {
  const containerRef = useRef(null);
  const percentRef = useRef(null);
  const heroRef = useRef(null);
  const particleContainerRef = useRef(null);
  const formRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonIconRef = useRef(null);
  const successRuneRef = useRef(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // ==========================================
  // INTRO AND ATMOSPHERE ANIMATIONS
  // ==========================================

  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);

      const loader = q(`.${styles.loader}`)[0];
      const header = q(`.${styles.header}`)[0];
      const formWrapper = q(`.${styles["form-wrapper"]}`)[0];
      const heroFooter = q(`.${styles["hero-footer"]}`)[0];
      const ancientRune = q(`.${styles["ancient-rune"]}`)[0];
      const heroImage = q(`.${styles["hero-image"]}`)[0];
      const fogOne = q(`.${styles["fog-one"]}`)[0];
      const fogTwo = q(`.${styles["fog-two"]}`)[0];

      // LOADER ANIMATION

      const counter = { value: 0 };

      const introTimeline = gsap.timeline();

      introTimeline
        .to(counter, {
          value: 100,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            if (percentRef.current) {
              percentRef.current.textContent = Math.round(counter.value).toString().padStart(2, "0");
            }
          },
        })
        .to(
          loader,
          {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut",
          },
          "+=0.2",
        )
        .from(
          header,
          {
            y: -30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          q([`.${styles.intro} .${styles.eyebrow}`, `.${styles.intro} h1`, `.${styles["intro-description"]}`, `.${styles["intro-bottom"]}`].join(", ")),
          {
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .from(
          formWrapper,
          {
            x: 60,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.9",
        )
        .from(
          heroFooter,
          {
            opacity: 0,
            y: 15,
            duration: 0.8,
          },
          "-=0.6",
        );

      // ANCIENT RUNE

      gsap.to(ancientRune, {
        rotation: 360,
        duration: 100,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      gsap.to(ancientRune, {
        opacity: 0.65,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ATMOSPHERIC PARTICLES

      const particleContainer = particleContainerRef.current;

      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const particleCount = reduceMotion ? 0 : isMobile ? 10 : 35;
      const particles = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");

        particle.classList.add(styles.particle);
        particleContainer.appendChild(particle);
        particles.push(particle);

        gsap.set(particle, {
          left: gsap.utils.random(0, 100) + "%",
          top: gsap.utils.random(0, 100) + "%",
          scale: gsap.utils.random(0.5, 1.8),
        });

        gsap.to(particle, {
          y: gsap.utils.random(-180, -350),
          x: gsap.utils.random(-70, 70),
          opacity: gsap.utils.random(0.2, 0.8),
          duration: gsap.utils.random(7, 15),
          delay: gsap.utils.random(0, 10),
          repeat: -1,
          ease: "none",
          yoyo: true,
        });
      }

      // MOUSE PARALLAX

      const hero = heroRef.current;

      function handleMouseMove(event) {
        if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760) {
          return;
        }

        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        gsap.to(ancientRune, {
          x: x * 25,
          y: y * 25,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(heroImage, {
          x: x * -12,
          y: y * -12,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      hero.addEventListener("mousemove", handleMouseMove);

      // FOG DEPTH

      gsap.to(fogOne, {
        x: 100,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(fogTwo, {
        x: -120,
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // SUBTLE BACKGROUND PARALLAX

      gsap.to(heroImage, {
        scale: 1.14,
        duration: 15,
        ease: "none",
      });

      // CLEANUP

      return () => {
        hero.removeEventListener("mousemove", handleMouseMove);

        particles.forEach((particle) => particle.remove());
      };
    },
    { scope: containerRef },
  );

  // ==========================================
  // SUCCESS MESSAGE ANIMATION
  // ==========================================

  useGSAP(
    () => {
      if (!isSubmitted || !successRuneRef.current) return;

      gsap.fromTo(
        successRuneRef.current,
        {
          scale: 0,
          rotation: -90,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
        },
      );
    },
    {
      scope: containerRef,
      dependencies: [isSubmitted],
      revertOnUpdate: true,
    },
  );

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  function handleSubmit(event) {
    event.preventDefault();

    if (!formRef.current.reportValidity()) return;

    setIsTransmitting(true);

    gsap.to(buttonRef.current, {
      backgroundColor: "#a32d2d",
      borderColor: "#a32d2d",
      color: "#ffffff",
      duration: 0.3,
    });

    gsap.to(buttonIconRef.current, {
      rotation: 360,
      duration: 0.8,
      ease: "power2.inOut",
    });

    // CINEMATIC TRANSMISSION

    const transmission = gsap.timeline({
      onComplete: () => {
        setIsTransmitting(false);
        setIsSubmitted(true);
      },
    });

    transmission
      .to(`.${styles["form-wrapper"]}`, {
        boxShadow: "0 0 80px rgba(197, 163, 106, 0.25)",
        duration: 0.5,
      })
      .to(`.${styles["form-wrapper"]}`, {
        boxShadow: "0 25px 100px rgba(0, 0, 0, 0.45)",
        duration: 0.8,
      });
  }

  // ==========================================
  // RESET FORM
  // ==========================================

  function handleReset() {
    setIsSubmitted(false);
    setIsTransmitting(false);

    formRef.current.reset();

    gsap.set(buttonRef.current, {
      clearProps: "backgroundColor,borderColor,color",
    });

    gsap.set(buttonIconRef.current, {
      clearProps: "rotation",
    });
  }

  return (
    <div
      className={styles.page}
      ref={containerRef}
    >
      {/* LOADER */}

      <div className={styles.loader}>
        <div className={styles["loader-content"]}>
          <div className={styles["loader-rune"]}>ᚠ</div>
          <div className={styles["loader-line"]}></div>
          <div
            className={styles["loader-percent"]}
            ref={percentRef}
          >
            00
          </div>
          <p>AWAKENING THE ANCIENTS</p>
        </div>
      </div>

      {/* ATMOSPHERE */}

      <div className={styles.atmosphere}>
        <div className={styles.noise}></div>
        <div className={styles.vignette}></div>
        <div className={styles["ambient-glow"]}></div>

        <div className={styles.bg}>
          <video
            src='/demos/norden/videos/bg.mp4'
            loop
            muted
            autoPlay
            playsInline
          />
        </div>
      </div>

      {/* HEADER */}

      <header className={styles.header}>
        <a
          href='#'
          className={styles.logo}
        >
          <span className={styles["logo-symbol"]}>ᛟ</span>
          <span>NORDEN</span>
        </a>

        <div className={styles["header-center"]}>A MESSAGE BEYOND THE REALM</div>

        <div className={styles["header-right"]}>
          <span className={styles["status-dot"]}></span>
          THE GATES ARE OPEN
        </div>
      </header>

      {/* MAIN */}

      <main
        className={styles.hero}
        ref={heroRef}
      >
        <div className={styles["hero-image"]}></div>
        <div className={styles["hero-image-overlay"]}></div>

        <div
          className={styles.particles}
          ref={particleContainerRef}
        ></div>

        <div className={`${styles.fog} ${styles["fog-one"]}`}></div>
        <div className={`${styles.fog} ${styles["fog-two"]}`}></div>

        <div className={styles["hero-content"]}>
          {/* INTRO */}

          <div className={styles.intro}>
            <div className={styles["ancient-rune"]}>ᛟ</div>

            <div className={styles.eyebrow}>
              <span className={styles["eyebrow-line"]}></span>
              <span>THE REALM OF CONNECTION</span>
            </div>

            <h1>
              YOUR WORDS<span>HAVE POWER.</span>
            </h1>

            <p className={styles["intro-description"]}>Every journey begins with a single step. Every legend begins with a story. Tell us yours.</p>

            <div className={styles["intro-bottom"]}>
              <div className={styles["rune-decoration"]}>ᛉ</div>

              <div>
                <span>ANCIENT WISDOM</span>
                <p>ENDLESS POSSIBILITIES</p>
              </div>
            </div>
          </div>

          {/* FORM */}

          <div className={styles["form-wrapper"]}>
            <div className={styles["form-top"]}>
              <div>
                <span className={styles["form-index"]}>01 / 01</span>
                <h2>Send a Message</h2>
              </div>

              <div className={styles["form-rune"]}>ᚦ</div>
            </div>

            <p className={styles["form-description"]}>Speak, and your message shall be heard.</p>

            <form
              id='contactForm'
              ref={formRef}
              onSubmit={handleSubmit}
              hidden={isSubmitted}
            >
              <div className={styles["form-grid"]}>
                <div className={styles["input-box"]}>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    placeholder=' '
                    required
                  />
                  <label htmlFor='firstName'>FIRST NAME</label>
                  <span className={styles["input-symbol"]}>ᚠ</span>
                </div>

                <div className={styles["input-box"]}>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    placeholder=' '
                    required
                  />
                  <label htmlFor='lastName'>LAST NAME</label>
                  <span className={styles["input-symbol"]}>ᚢ</span>
                </div>

                <div className={styles["input-box"]}>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    placeholder=' '
                    required
                  />
                  <label htmlFor='email'>EMAIL ADDRESS</label>
                  <span className={styles["input-symbol"]}>ᚨ</span>
                </div>

                <div className={styles["input-box"]}>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    placeholder=' '
                  />
                  <label htmlFor='phone'>PHONE NUMBER</label>
                  <span className={styles["input-symbol"]}>ᚱ</span>
                </div>
              </div>

              <div className={`${styles["input-box"]} ${styles["message-box"]}`}>
                <textarea
                  id='message'
                  name='message'
                  placeholder=' '
                  required
                />
                <label htmlFor='message'>YOUR MESSAGE</label>
                <span className={styles["input-symbol"]}>ᛟ</span>
              </div>

              <button
                type='submit'
                className={styles["submit-button"]}
                ref={buttonRef}
                disabled={isTransmitting}
              >
                <span className={styles["button-text"]}>{isTransmitting ? "TRANSMITTING..." : "SEND YOUR MESSAGE"}</span>

                <span
                  className={styles["button-icon"]}
                  ref={buttonIconRef}
                >
                  ᛉ
                </span>
              </button>

              <div className={styles["form-footer"]}>
                <span>ᛞ</span>
                YOUR MESSAGE WILL BE KEPT SACRED
              </div>
            </form>

            {/* SUCCESS MESSAGE */}

            <div
              className={`${styles["success-message"]} ${isSubmitted ? styles.active : ""}`}
              id='successMessage'
              hidden={!isSubmitted}
            >
              <div
                className={styles["success-rune"]}
                ref={successRuneRef}
              >
                ᛟ
              </div>

              <h3>MESSAGE RECEIVED</h3>
              <p>Your words have reached the realm.</p>

              <button
                type='button'
                id='resetForm'
                onClick={handleReset}
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          </div>
        </div>

        {/* DECORATIONS */}

        <div className={styles["side-mark"]}>N O R D E N</div>

        <div className={styles["hero-footer"]}>
          <span>EST. BEYOND TIME</span>
          <span className={styles["footer-center"]}>ᛟ</span>
          <span>THE JOURNEY BEGINS HERE</span>
        </div>

        <div className={styles["vertical-line"]}></div>
      </main>
    </div>
  );
}
