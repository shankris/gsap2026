"use client";

// src/demos/carousel-06/Demo.jsx

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Keyboard, Navigation, Pagination } from "swiper/modules";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import styles from "./Demo.module.css";

const slides = [
  {
    number: "01",
    category: "CONTEMPORARY ART — PAINTING",
    eyebrow: "THE ART COLLECTION / 001",
    title: (
      <>
        Beyond
        <br />
        <em>the canvas.</em>
      </>
    ),
    description: "An exploration of color, emotion and the beautiful imperfections of the human imagination.",
    artist: "Unknown Artist",
    year: "2026",
    image: "/demos/carousel-06/img-1.jpg",
    alt: "Abstract contemporary painting",
  },
  {
    number: "02",
    category: "FINE ART — LANDSCAPE",
    eyebrow: "THE ART COLLECTION / 002",
    title: (
      <>
        Silent
        <br />
        <em>landscapes.</em>
      </>
    ),
    description: "Nature becomes a visual poem, where every shadow tells a different story.",
    artist: "Elena Morris",
    year: "2025",
    image: "/demos/carousel-06/img-2.jpg",
    alt: "Fine art landscape",
  },
  {
    number: "03",
    category: "EXPERIMENTAL — VISUAL ART",
    eyebrow: "THE ART COLLECTION / 003",
    title: (
      <>
        A different
        <br />
        <em>perspective.</em>
      </>
    ),
    description: "Discover the unexpected beauty hidden in shapes, textures and abstract forms.",
    artist: "Alex Turner",
    year: "2026",
    image: "/demos/carousel-06/img-3.jpg",
    alt: "Experimental abstract art composition",
  },
];

const navigationLinks = ["EXHIBITION", "COLLECTION", "ARTISTS", "ABOUT"];

export default function Demo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const swiperRef = useRef(null);
  const animationRef = useRef(null);
  const rootRef = useRef(null);

  const animateSlide = useCallback((slide) => {
    if (!slide) return;

    const image = slide.querySelector(`.${styles.artworkImage}`);
    const top = slide.querySelector(`.${styles.slideTop}`);
    const eyebrow = slide.querySelector(`.${styles.slideEyebrow}`);
    const title = slide.querySelector(`.${styles.slideTitle}`);
    const details = slide.querySelector(`.${styles.slideDetails}`);

    const elements = [top, eyebrow, title, details].filter(Boolean);

    if (animationRef.current) {
      animationRef.current.kill();
    }

    gsap.killTweensOf([image, ...elements]);

    gsap.set(elements, {
      autoAlpha: 0,
      y: 35,
    });

    gsap.fromTo(
      image,
      { scale: 1.2 },
      {
        scale: 1,
        duration: 2,
        ease: "power3.out",
        overwrite: true,
      },
    );

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline
      .to(top, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
      })
      .to(
        eyebrow,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
        },
        "-=0.4",
      )
      .to(
        title,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
        },
        "-=0.45",
      )
      .to(
        details,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.55",
      );

    animationRef.current = timeline;
  }, []);

  const handleSwiper = useCallback(
    (swiper) => {
      swiperRef.current = swiper;

      requestAnimationFrame(() => {
        animateSlide(swiper.slides[swiper.activeIndex]);
      });
    },
    [animateSlide],
  );

  const handleSlideChange = useCallback(
    (swiper) => {
      animateSlide(swiper.slides[swiper.activeIndex]);
    },
    [animateSlide],
  );

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      animationRef.current?.kill();
      gsap.killTweensOf(rootRef.current);
    };
  }, []);

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      <header className={styles.header}>
        <nav className={`${styles.nav} ${styles.container}`}>
          <a
            href='#'
            className={styles.logo}
            aria-label='Atelier home'
            onClick={closeMenu}
          >
            <span className={styles.logoMark}>A.</span>
            <span>ATELIER</span>
          </a>

          <div className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}>
            <ul className={styles.navList}>
              {navigationLinks.map((link) => (
                <li key={link}>
                  <a
                    href='#'
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type='button'
              className={styles.closeButton}
              onClick={closeMenu}
              aria-label='Close navigation menu'
            >
              <X />
            </button>
          </div>

          <div className={styles.navRight}>
            <span className={styles.edition}>INDEPENDENT ART SPACE / 2026</span>

            <button
              type='button'
              className={styles.toggleButton}
              onClick={() => setMenuOpen(true)}
              aria-label='Open navigation menu'
              aria-expanded={menuOpen}
            >
              <Menu />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className={styles.gallery}>
          <Swiper
            className={styles.swiper}
            modules={[Autoplay, EffectFade, Keyboard, Navigation, Pagination]}
            loop
            effect='fade'
            fadeEffect={{ crossFade: true }}
            speed={1300}
            grabCursor
            keyboard={{ enabled: true }}
            autoplay={{
              delay: 6500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              el: `.${styles.pagination}`,
              bulletClass: styles.paginationBullet,
              bulletActiveClass: styles.paginationBulletActive,
            }}
            navigation={{
              nextEl: `.${styles.next}`,
              prevEl: `.${styles.prev}`,
            }}
            onSwiper={handleSwiper}
            onSlideChangeTransitionStart={handleSlideChange}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.number}>
                <article className={styles.slide}>
                  <div className={styles.artwork}>
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className={styles.artworkImage}
                    />
                    <div className={styles.artworkOverlay} />
                  </div>

                  <div className={`${styles.slideContent} ${styles.container}`}>
                    <div className={styles.slideTop}>
                      <span className={styles.slideNumber}>{slide.number} / 03</span>

                      <span className={styles.slideCategory}>{slide.category}</span>
                    </div>

                    <div className={styles.slideBottom}>
                      <div className={styles.slideHeading}>
                        <span className={styles.slideEyebrow}>{slide.eyebrow}</span>

                        <h1 className={styles.slideTitle}>{slide.title}</h1>
                      </div>

                      <div className={styles.slideDetails}>
                        <p className={styles.slideDescription}>{slide.description}</p>

                        <div className={styles.slideMeta}>
                          <span>ARTIST</span>
                          <strong>{slide.artist}</strong>
                        </div>

                        <div className={styles.slideMeta}>
                          <span>YEAR</span>
                          <strong>{slide.year}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.galleryNavigation}>
            <div className={styles.pagination} />

            <div className={styles.controls}>
              <button
                type='button'
                className={`${styles.arrow} ${styles.prev}`}
                aria-label='Previous artwork'
              >
                <ArrowLeft />
              </button>

              <button
                type='button'
                className={`${styles.arrow} ${styles.next}`}
                aria-label='Next artwork'
              >
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className={styles.sideLabel}>CURATED VISUAL EXPERIENCES</div>
        </section>
      </main>
    </div>
  );
}
