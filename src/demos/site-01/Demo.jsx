/* src/demos/site-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

const services = [
  {
    number: "01",
    icon: "✂",
    title: "THE CUT",
    description: (
      <>
        Fresh fades. Classic shapes.
        <br />
        Your head, your rules.
      </>
    ),
    image: "/demos/site-01/card1.png",
  },
  {
    number: "02",
    icon: "♟",
    title: "BEARD CLUB",
    description: (
      <>
        Sharp lines and soft edges.
        <br />
        Beard game: upgraded.
      </>
    ),
    image: "/demos/site-01/card2.png",
  },
  {
    number: "03",
    icon: "◒",
    title: "HOT SHAVE",
    description: (
      <>
        Warm towel. Clean finish.
        <br />
        Old-school in the best way.
      </>
    ),
    image: "/demos/site-01/card3.png",
  },
  {
    number: "04",
    icon: "✦",
    title: "THE RESET",
    description: (
      <>
        Cut, beard, styling.
        <br />
        Walk out brand new.
      </>
    ),
    image: "/demos/site-01/card4.png",
  },
];

const gallery = [
  { label: "01 / THE FADE", image: "/demos/site-01/card5.png", art: "artOne" },
  { label: "02 / THE CLASSIC", image: "/demos/site-01/card6.png", art: "artTwo" },
  { label: "03 / THE REBEL", image: "/demos/site-01/card7.png", art: "artThree" },
  { label: "04 / THE CLEANUP", image: "/demos/site-01/card8.png", art: "artFour" },
];

export default function Site01() {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const q = (className) => root.querySelector(`.${styles[className]}`);
    const qa = (className) => [...root.querySelectorAll(`.${styles[className]}`)];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loader = q("loader");
    const progress = q("loaderBarProgress");
    const percent = q("loaderPercent");
    const header = q("header");
    const nav = q("nav");
    const menuToggle = q("menuToggle");
    const hero = q("hero");
    const heroArt = q("heroArt");

    let lenis = null;
    let tickerCallback = null;
    let ctx = null;
    let heroSplit = null;
    let kickerSplit = null;
    const sectionSplits = [];

    // --------------------------------------------------
    // Header scroll state
    // --------------------------------------------------

    const updateHeaderShadow = () => {
      if (!header) return;

      header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    window.addEventListener("scroll", updateHeaderShadow, {
      passive: true,
    });

    updateHeaderShadow();

    // --------------------------------------------------
    // Mobile navigation
    // --------------------------------------------------

    const closeMenu = () => {
      nav?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = () => {
      if (!nav) return;

      const isOpen = nav.classList.toggle("is-open");

      menuToggle?.setAttribute("aria-expanded", String(isOpen));
    };

    menuToggle?.addEventListener("click", toggleMenu);

    // --------------------------------------------------
    // Smooth scrolling
    // --------------------------------------------------

    const anchorLinks = [...root.querySelectorAll('a[href^="#"]')];

    const anchorHandlers = [];

    if (!reduceMotion) {
      lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    anchorLinks.forEach((link) => {
      const handler = (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = root.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        if (lenis) {
          lenis.scrollTo(target, {
            offset: -(header?.offsetHeight || 90),
            duration: 1.2,
          });
        } else {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        if (link.closest(`.${styles.nav}`)) {
          closeMenu();
        }
      };

      link.addEventListener("click", handler);
      anchorHandlers.push({ link, handler });
    });

    // --------------------------------------------------
    // Reduced motion
    // --------------------------------------------------

    if (reduceMotion) {
      setIsLoading(false);

      return () => {
        window.removeEventListener("scroll", updateHeaderShadow);
        menuToggle?.removeEventListener("click", toggleMenu);

        anchorHandlers.forEach(({ link, handler }) => {
          link.removeEventListener("click", handler);
        });

        lenis?.destroy();
      };
    }

    // --------------------------------------------------
    // GSAP animation context
    // --------------------------------------------------

    ctx = gsap.context(() => {
      const counter = { value: 0 };

      // Helper for splitting text.
      const splitElement = (element, type) => {
        if (!element) return null;

        return new SplitText(element, {
          type,
          wordsClass: "word",
          charsClass: "char",
        });
      };

      // --------------------------------------------------
      // Loader animation
      // --------------------------------------------------

      const loadingTimeline = gsap.timeline({
        onComplete: () => {
          gsap.to(loader, {
            yPercent: -105,
            duration: 1.05,
            ease: "power4.inOut",
            onComplete: () => {
              setIsLoading(false);
              revealPage();
            },
          });
        },
      });

      loadingTimeline
        .to(counter, {
          value: 100,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: () => {
            const value = Math.round(counter.value);

            if (progress) {
              progress.style.width = `${value}%`;
            }

            if (percent) {
              percent.textContent = `${String(value).padStart(2, "0")}%`;
            }
          },
        })
        .from(
          q("loaderWord"),
          {
            yPercent: 110,
            rotate: 5,
            duration: 0.8,
            ease: "back.out(1.6)",
          },
          0,
        )
        .from(
          q("loaderSticker"),
          {
            scale: 0,
            rotation: -35,
            duration: 0.55,
            ease: "back.out(2)",
          },
          0.35,
        )
        .from(
          q("loaderPole"),
          {
            y: -80,
            rotation: 35,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.4)",
          },
          0.2,
        )
        .to(
          [q("loaderMeta"), q("loaderBottom")],
          {
            opacity: 0,
            duration: 0.25,
          },
          1.55,
        );

      // --------------------------------------------------
      // Hero intro
      // --------------------------------------------------

      function revealPage() {
        heroSplit = splitElement(q("heroTitle"), "words,chars");
        kickerSplit = splitElement(q("heroKicker"), "words");

        qa("sectionTitle").forEach((element) => {
          const split = splitElement(element, "words");

          if (split) {
            sectionSplits.push(split);
          }
        });

        const intro = gsap.timeline({
          defaults: {
            ease: "power4.out",
          },
        });

        if (kickerSplit) {
          intro.from(kickerSplit.words, {
            yPercent: 110,
            opacity: 0,
            stagger: 0.06,
            duration: 0.55,
          });
        }

        if (heroSplit) {
          intro.from(
            heroSplit.chars,
            {
              yPercent: 115,
              rotation: 8,
              opacity: 0,
              stagger: {
                each: 0.018,
                from: "start",
              },
              duration: 0.9,
              ease: "power4.out",
            },
            "-=.25",
          );
        } else {
          intro.from(
            q("heroTitle"),
            {
              y: 50,
              opacity: 0,
              duration: 0.8,
            },
            "-=.25",
          );
        }

        intro
          .from(
            [q("heroDesc"), q("heroButton")],
            {
              y: 22,
              opacity: 0,
              stagger: 0.12,
              duration: 0.6,
            },
            "-=.45",
          )
          .from(
            q("barber"),
            {
              y: 100,
              scale: 0.82,
              rotation: 5,
              opacity: 0,
              duration: 1.1,
              ease: "elastic.out(1, .75)",
            },
            "-=1",
          )
          .from(
            q("sunburst"),
            {
              scale: 0,
              rotation: -40,
              duration: 0.9,
              ease: "back.out(1.4)",
            },
            "-=1",
          )
          .from(
            [q("heroSticker"), q("scribbleCrown"), q("scribbleStar")],
            {
              scale: 0,
              rotation: 25,
              stagger: 0.1,
              duration: 0.55,
              ease: "back.out(2)",
            },
            "-=.5",
          )
          .from(
            [q("heroCaption"), q("heroBottom")],
            {
              opacity: 0,
              y: 15,
              duration: 0.5,
            },
            "-=.3",
          );

        // --------------------------------------------------
        // Hero idle animations
        // --------------------------------------------------

        gsap.to(q("barber"), {
          y: 80,
          rotation: 0.7,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(q("sunburst"), {
          rotation: "+=8",
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(q("orbitOne"), {
          rotation: "+=14",
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(q("scribbleStar"), {
          rotation: 35,
          scale: 1.15,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        // --------------------------------------------------
        // Section heading reveals
        // --------------------------------------------------

        sectionSplits.forEach((split) => {
          gsap.from(split.words, {
            yPercent: 110,
            opacity: 0,
            stagger: 0.055,
            duration: 0.8,
            ease: "power4.out",
            scrollTrigger: {
              trigger: split.elements[0],
              start: "top 82%",
              once: true,
            },
          });
        });

        // --------------------------------------------------
        // Services
        // --------------------------------------------------

        gsap.from(qa("serviceCard"), {
          y: 55,
          opacity: 0,
          rotation: (i) => (i % 2 ? 3 : -3),
          stagger: 0.12,
          duration: 0.75,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: q("serviceGrid"),
            start: "top 82%",
            once: true,
          },
        });

        // --------------------------------------------------
        // Story
        // --------------------------------------------------

        gsap.from([...q("storyVisual").children, ...qa("storyText"), q("textLink")].filter(Boolean), {
          y: 35,
          opacity: 0,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q("story"),
            start: "top 75%",
            once: true,
          },
        });

        // --------------------------------------------------
        // Gallery
        // --------------------------------------------------

        gsap.from(qa("galleryCard"), {
          y: 60,
          opacity: 0,
          rotation: (i) => (i % 2 ? 2 : -2),
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q("galleryTrack"),
            start: "top 82%",
            once: true,
          },
        });

        // --------------------------------------------------
        // Booking
        // --------------------------------------------------

        const bookingElements = [q("bookingScribble"), ...q("bookingMain").children, ...q("bookingSide").children].filter(Boolean);

        gsap.from(bookingElements, {
          y: 35,
          opacity: 0,
          stagger: 0.08,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q("booking"),
            start: "top 78%",
            once: true,
          },
        });

        // --------------------------------------------------
        // Hero pointer parallax
        // --------------------------------------------------

        if (window.matchMedia("(pointer:fine)").matches && hero && heroArt) {
          const onPointerMove = (event) => {
            const rect = hero.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            gsap.to(heroArt, {
              x: x * 14,
              y: y * 10,
              duration: 0.7,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          const onPointerLeave = () => {
            gsap.to(heroArt, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: "elastic.out(1, .7)",
            });
          };

          hero.addEventListener("pointermove", onPointerMove);
          hero.addEventListener("pointerleave", onPointerLeave);

          ctx.add(() => {
            hero.removeEventListener("pointermove", onPointerMove);
            hero.removeEventListener("pointerleave", onPointerLeave);
          });
        }

        // --------------------------------------------------
        // Magnetic buttons
        // --------------------------------------------------

        const magneticElements = qa("magnetic");

        magneticElements.forEach((button) => {
          const onPointerMove = (event) => {
            if (!window.matchMedia("(pointer:fine)").matches) return;

            const rect = button.getBoundingClientRect();

            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
              x: x * 0.12,
              y: y * 0.18,
              duration: 0.35,
              ease: "power2.out",
            });
          };

          const onPointerLeave = () => {
            gsap.to(button, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "elastic.out(1, .45)",
            });
          };

          button.addEventListener("pointermove", onPointerMove);
          button.addEventListener("pointerleave", onPointerLeave);

          ctx.add(() => {
            button.removeEventListener("pointermove", onPointerMove);
            button.removeEventListener("pointerleave", onPointerLeave);
          });
        });

        // Recalculate positions after text splitting and intro.
        ScrollTrigger.refresh();
      }
    }, root);

    return () => {
      ctx?.revert();

      heroSplit?.revert();
      kickerSplit?.revert();

      sectionSplits.forEach((split) => split.revert());

      window.removeEventListener("scroll", updateHeaderShadow);
      menuToggle?.removeEventListener("click", toggleMenu);

      anchorHandlers.forEach(({ link, handler }) => {
        link.removeEventListener("click", handler);
      });

      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }

      lenis?.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isLoading ? styles.isLoading : ""}`}
    >
      <div
        className={styles.noise}
        aria-hidden='true'
      />

      <div
        className={styles.loader}
        aria-label='Loading website'
      >
        <div className={styles.loaderTop}>
          <span className={styles.brandMark}>✳</span>
          <span>
            TRANSFORM
            <br />
            <small>BARBERSHOP</small>
          </span>
          <span className={styles.loaderEdition}>EST. 2026 / NO. 471</span>
        </div>

        <div className={styles.loaderCenter}>
          <div className={`${styles.loaderSticker} loaderSticker`}>
            GOOD
            <br />
            VIBES
            <br />
            ONLY <span>↗</span>
          </div>
          <div className={`${styles.loaderPole} loaderPole`}>
            <i />
            <i />
            <i />
          </div>
          <div className={`${styles.loaderWord} loaderWord`}>
            FRESH<span>.</span>
          </div>
          <div className={styles.loaderBar}>
            <span className={`${styles.loaderBarProgress} loaderBarProgress`} />
          </div>
          <div className={styles.loaderMeta}>
            <span>PREPARING THE CHAIR</span>
            <span className={styles.loaderPercent}>00%</span>
          </div>
        </div>

        <div className={styles.loaderBottom}>
          <span>YOUR NEXT LOOK STARTS HERE</span>
          <span>PLEASE STAY SHARP ↓</span>
        </div>
      </div>

      <header className={`${styles.header} header`}>
        <a
          className={styles.brand}
          href='#home'
          aria-label='Transform home'
        >
          <span className={styles.brandIcon}>✳</span>
          <span>
            TRANSFORM<small>BARBERSHOP</small>
          </span>
        </a>

        <nav className={`${styles.nav} nav`}>
          <a
            className={styles.activeLink}
            href='#home'
          >
            HOME
          </a>
          <a href='#services'>SERVICES</a>
          <a href='#story'>OUR VIBE</a>
          <a href='#contact'>BOOK A CUT</a>
        </nav>

        <button
          ref={menuRef}
          className={`${styles.menuToggle} menuToggle`}
          aria-label='Toggle menu'
          aria-expanded='false'
          type='button'
        >
          <span />
          <span />
        </button>
      </header>

      <main>
        <section
          className={`${styles.hero} hero`}
          id='home'
        >
          <div className={styles.heroEyebrow}>
            <span className={styles.eyebrowDot} />
            YOUR NEIGHBORHOOD STYLE LAB
            <span>KYIV / EVERY DAY</span>
          </div>

          <div className={styles.heroCopy}>
            <p className={`${styles.kicker} heroKicker`}>MORE THAN A HAIRCUT</p>
            <h1 className={`${styles.heroTitle} heroTitle`}>
              <span className={styles.titleLine}>GOOD HAIR</span>
              <span className={`${styles.titleLine} ${styles.titleLineYellow}`}>
                GOOD MOOD<span className={styles.period}>.</span>
              </span>
            </h1>
            <p className={`${styles.heroDesc} heroDesc`}>
              Classic craft. Fresh attitude.
              <br />
              Walk in ordinary. Walk out iconic.
            </p>
            <a
              href='#contact'
              className={`${styles.button} ${styles.magnetic} heroButton magnetic`}
            >
              <span>GET IN THE CHAIR</span>
              <b>↗</b>
            </a>
          </div>

          <div className={`${styles.heroArt} heroArt`}>
            <div className={styles.sunburst} />
            <div className={`${styles.orbit} ${styles.orbitOne}`} />
            <div className={`${styles.orbit} ${styles.orbitTwo}`} />
            <div className={`${styles.scribble} ${styles.scribbleCrown}`}>♛</div>
            <div className={`${styles.scribble} ${styles.scribbleStar}`}>✳</div>
            <div className={`${styles.barber} barber`}>
              <img
                src='/demos/site-01/hero.png'
                alt=''
              />
            </div>
            <div className={`${styles.heroSticker} ${styles.stickerLeft}`}>
              NO BAD
              <br />
              HAIR DAYS <span>✳</span>
            </div>
            <div className={`${styles.heroSticker} ${styles.stickerRight}`}>
              STAY
              <br />
              SHARP! <span>↗</span>
            </div>
          </div>

          <div className={`${styles.heroBottom} heroBottom`}>
            <span>SCROLL TO GET FRESH</span>
            <span className={styles.scrollLine} />
            <span>EST. FOR THE BOLD</span>
            <div className={`${styles.heroCaption} heroCaption`}>
              <span>01 / THE TRANSFORMER</span>
              <span>CRAFTED WITH ATTITUDE</span>
            </div>
          </div>
        </section>

        <section
          className={`${styles.services} ${styles.sectionPad}`}
          id='services'
        >
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>01 — THE GOOD STUFF</p>
            <h2 className={`${styles.sectionTitle} sectionTitle`}>
              CUTS, SHAVES
              <br />
              <em>&amp; GOOD TIMES.</em>
            </h2>
            <p className={styles.sectionNote}>
              Good hands. Great details.
              <br />
              Zero boring haircuts.
            </p>
          </div>

          <div className={`${styles.serviceGrid} serviceGrid`}>
            {services.map((service) => (
              <a
                className={`${styles.serviceCard} serviceCard`}
                href='#'
                key={service.number}
              >
                <span className={styles.serviceNum}>{service.number}</span>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className={styles.imgWrap}>
                  <img
                    src={service.image}
                    alt=''
                  />
                </div>
                <span className={styles.serviceArrow}>↗</span>
              </a>
            ))}
          </div>
        </section>

        <section
          className={`${styles.story} ${styles.sectionPad} story`}
          id='story'
        >
          <div className={`${styles.storyVisual} storyVisual`}>
            <div className={styles.storyCircle}>
              GOOD
              <br />
              PEOPLE
              <br />
              ONLY <span>✳</span>
            </div>
            <div className={styles.storyBigNumber}>
              10<span>+</span>
            </div>
            <div className={styles.storyVisualLabel}>
              YEARS OF MAKING
              <br />
              GOOD HAIR HAPPEN
            </div>
          </div>

          <div className={styles.storyCopy}>
            <p className={styles.kicker}>02 — OUR VIBE</p>
            <h2 className={`${styles.sectionTitle} sectionTitle`}>
              WE DON'T
              <br />
              DO <em>AVERAGE.</em>
            </h2>
            <p className={`${styles.storyText} storyText`}>We're not just here to trim the edges. We're here for the big reset, the little confidence boost, and that mirror moment when you know it's right.</p>
            <p className={`${styles.storyText} storyText`}>Real barbers. Good music. No attitude at the door — just good people and great craft.</p>
            <a
              className={`${styles.textLink} textLink magnetic`}
              href='#contact'
            >
              MEET YOUR NEW BARBER <span>↗</span>
            </a>
            <div className={styles.storyScribble}>
              LOOK
              <br />
              SHARP!
            </div>
          </div>
        </section>

        <section className={`${styles.gallery} ${styles.sectionPad}`}>
          <div className={styles.galleryTop}>
            <div>
              <p className={styles.kicker}>03 — FRESH OUT THE CHAIR</p>
              <h2 className={`${styles.sectionTitle} sectionTitle`}>
                REAL PEOPLE. <em>REAL STYLE.</em>
              </h2>
            </div>
            <span className={styles.galleryHint}>A LITTLE LOOK AT THE LINEUP ↘</span>
          </div>

          <div className={`${styles.galleryTrack} galleryTrack`}>
            {gallery.map((item) => (
              <article
                className={`${styles.galleryCard} galleryCard`}
                key={item.label}
              >
                <div className={`${styles.galleryArt} ${styles[item.art]}`}>
                  <img
                    src={item.image}
                    alt=''
                  />
                </div>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.booking} ${styles.sectionPad} booking`}
          id='contact'
        >
          <div className={`${styles.bookingScribble} bookingScribble`}>
            YOUR
            <br />
            CHAIR
            <br />
            AWAITS<span>↙</span>
          </div>

          <div className={`${styles.bookingMain} bookingMain`}>
            <p className={styles.kicker}>04 — MAKE IT OFFICIAL</p>
            <h2 className={styles.bookingTitle}>
              READY FOR
              <br />A <em>FRESH START?</em>
            </h2>
            <p>
              That mirror isn't going to impress itself.
              <br />
              Book a cut. Bring your vibe. We'll handle the rest.
            </p>
            <a
              className={`${styles.button} ${styles.buttonDark} ${styles.magnetic} magnetic`}
              href='mailto:hello@transform.barber?subject=Book%20a%20barber%20appointment'
            >
              <span>BOOK YOUR CHAIR</span>
              <b>↗</b>
            </a>
          </div>

          <div className={`${styles.bookingSide} bookingSide`}>
            <div className={styles.bookingBadge}>
              FRESH
              <br />
              LOOKS
              <br />
              GOOD ON
              <br />
              <span>YOU.</span>
            </div>
            <p>
              <span>FIND THE SHOP</span>
              <br />
              123 Style Street
              <br />
              Kyiv, Ukraine
            </p>
            <p>
              <span>OPEN WHEN YOU NEED US</span>
              <br />
              Mon – Sat / 10:00 — 20:00
            </p>
            <p>
              <span>SAY HELLO</span>
              <br />
              <a href='tel:+380671234567'>+380 67 123 45 67</a>
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a
          className={styles.brand}
          href='#home'
        >
          <span className={styles.brandIcon}>✳</span>
          <span>
            TRANSFORM<small>BARBERSHOP</small>
          </span>
        </a>
        <span>GOOD HAIR. BETTER VIBES. © 2025</span>
        <a
          href='#home'
          className={styles.backTop}
        >
          BACK TO TOP ↑
        </a>
      </footer>
    </div>
  );
}
