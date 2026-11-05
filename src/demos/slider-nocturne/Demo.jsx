/* src/demos/slider-nocturne/Demo.jsx */

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Demo.module.css";

const config = {
  totalSlides: 16,
  lerp: 0.055,
  scrollSpeed: 3.5,
  minSize: 0.1,
  growth: 0.25,
  aspect: 1 / 1.25,
  baseline: 0.015,
};

const locations = ["THE QUIET EARTH", "WHERE LIGHT FALLS", "BEYOND THE HORIZON", "A MOMENT IN TIME", "INTO THE UNKNOWN", "THE LAST LIGHT", "WILD & UNTAMED", "SOMEWHERE ELSE", "AFTER THE RAIN", "THE ART OF STILLNESS"];

const growthRatio = Math.exp(config.growth);

const slideCount = Math.ceil(Math.log(1 + (growthRatio - 1) / config.minSize) / config.growth) + 4;

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function edgeX(position, width) {
  const isMobile = width <= 560;
  const minSize = isMobile ? 0.16 : config.minSize;
  const growth = isMobile ? 0.18 : config.growth;
  const ratio = Math.exp(growth);

  return (width * minSize * (Math.pow(ratio, position) - 1)) / (ratio - 1);
}

export default function SliderNocturne() {
  const sliderRef = useRef(null);
  const slidesRef = useRef([]);
  const slideStreamIndexRef = useRef(Array.from({ length: slideCount }, (_, index) => index));

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const slides = slidesRef.current.filter(Boolean);
    const images = slides.map((slide) => slide.querySelector("img"));

    let scroll = 0;
    let scrollTarget = 0;
    let wheelTarget = 0;

    let pointerX = null;
    let activePointerId = null;

    let frameId = 0;
    let previousActiveIndex = -1;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateInterface() {
      const index = wrap(Math.floor(scroll), config.totalSlides);

      if (index === previousActiveIndex) return;

      previousActiveIndex = index;
      setActiveIndex(index);
    }

    function handleWheel(event) {
      event.preventDefault();

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      wheelTarget += delta * config.scrollSpeed * 0.0014;
    }

    function handlePointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      activePointerId = event.pointerId;
      pointerX = event.clientX;

      slider.classList.add(styles.isDragging);
      slider.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event) {
      if (pointerX === null || event.pointerId !== activePointerId) {
        return;
      }

      const delta = event.clientX - pointerX;

      scrollTarget -= delta * config.scrollSpeed * 0.005;
      pointerX = event.clientX;
    }

    function releasePointer(event) {
      if (activePointerId !== null && event.pointerId !== activePointerId) {
        return;
      }

      pointerX = null;
      activePointerId = null;

      slider.classList.remove(styles.isDragging);
    }

    function handleKeyDown(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollTarget += 1;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollTarget -= 1;
      }
    }

    function render() {
      const sliderWidth = slider.clientWidth;
      const sliderHeight = slider.clientHeight;

      if (!sliderWidth || !sliderHeight) {
        frameId = requestAnimationFrame(render);
        return;
      }

      const easing = reducedMotion.matches ? 1 : config.lerp;

      scrollTarget += wheelTarget;
      wheelTarget = 0;

      scroll += (scrollTarget - scroll) * easing;

      if (Math.abs(scrollTarget - scroll) < 0.00001) {
        scroll = scrollTarget;
      }

      const isMobile = sliderWidth <= 560;

      const baselineOffset = isMobile ? sliderHeight * 0.12 : sliderHeight * config.baseline;

      const streamIndexes = slideStreamIndexRef.current;

      for (let i = 0; i < slideCount; i++) {
        const slide = slides[i];

        let streamIndex = streamIndexes[i];

        while (edgeX(streamIndex + scroll, sliderWidth) > sliderWidth) {
          streamIndex -= slideCount;
        }

        while (edgeX(streamIndex + scroll + 1, sliderWidth) < 0) {
          streamIndex += slideCount;
        }

        streamIndexes[i] = streamIndex;

        const left = edgeX(streamIndex + scroll, sliderWidth);
        const right = edgeX(streamIndex + scroll + 1, sliderWidth);

        const width = right - left;

        const height = width / (isMobile ? 0.48 : config.aspect);

        if (width <= 0) continue;

        const imageNumber = wrap(streamIndex, config.totalSlides) + 1;

        const image = images[i];

        if (slide.dataset.image !== String(imageNumber)) {
          slide.dataset.image = String(imageNumber);

          image.src = `/demos/slider-nocturne/slide-img-${imageNumber}.jpg`;
        }

        slide.style.width = `${width}px`;
        slide.style.height = `${height}px`;
        slide.style.transform = `translate3d(${left}px, ${-baselineOffset}px, 0)`;
      }

      updateInterface();

      frameId = requestAnimationFrame(render);
    }

    function handleVisibilityChange() {
      cancelAnimationFrame(frameId);

      if (!document.hidden) {
        frameId = requestAnimationFrame(render);
      }
    }

    slider.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    slider.addEventListener("pointerdown", handlePointerDown);
    slider.addEventListener("pointermove", handlePointerMove);
    slider.addEventListener("pointerup", releasePointer);
    slider.addEventListener("pointercancel", releasePointer);
    slider.addEventListener("lostpointercapture", releasePointer);
    slider.addEventListener("keydown", handleKeyDown);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    render();

    return () => {
      cancelAnimationFrame(frameId);

      slider.removeEventListener("wheel", handleWheel);
      slider.removeEventListener("pointerdown", handlePointerDown);
      slider.removeEventListener("pointermove", handlePointerMove);
      slider.removeEventListener("pointerup", releasePointer);
      slider.removeEventListener("pointercancel", releasePointer);
      slider.removeEventListener("lostpointercapture", releasePointer);
      slider.removeEventListener("keydown", handleKeyDown);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const currentNumber = String(activeIndex + 1).padStart(2, "0");
  const totalNumber = String(config.totalSlides).padStart(2, "0");
  const progress = ((activeIndex + 1) / config.totalSlides) * 100;

  return (
    <main className={styles.experience}>
      <section
        className={styles.slider}
        ref={sliderRef}
        aria-label='Cinematic image gallery'
        tabIndex={0}
      >
        <div
          className={styles.atmosphere}
          aria-hidden='true'
        />
        <div
          className={styles.grain}
          aria-hidden='true'
        />
        <div
          className={styles.vignette}
          aria-hidden='true'
        />

        {Array.from({ length: slideCount }, (_, index) => (
          <div
            className={styles.slide}
            key={index}
            ref={(element) => {
              slidesRef.current[index] = element;
            }}
            aria-hidden='true'
          >
            <img
              alt=''
              draggable='false'
            />
          </div>
        ))}

        <header className={styles.topbar}>
          <a
            className={styles.brand}
            href='#top'
            aria-label='Nocturne home'
          >
            <span className={styles.brandMark} />
            NOCTURNE<span className={styles.brandDot}>.</span>
          </a>

          <span className={styles.topbarCaption}>AN ATLAS OF FEELING</span>

          <div className={styles.topbarRight}>
            <span className={styles.statusDot} />
            <span>INDEPENDENT VISUAL JOURNAL</span>
          </div>
        </header>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span>01</span>
            <span className={styles.eyebrowLine} />
            THE ART OF GETTING LOST
          </p>

          <h1>
            Beyond
            <br />
            the <span>ordinary.</span>
          </h1>

          <p className={styles.heroDescription}>Places that stay with you. Moments that never really leave.</p>
        </div>

        <div
          className={styles.sliderHint}
          aria-hidden='true'
        >
          <span className={styles.hintIcon}>↔</span>
          <span>DRAG TO EXPLORE</span>
        </div>

        <div
          className={styles.verticalNote}
          aria-hidden='true'
        >
          COLLECT MOMENTS, NOT MILES
        </div>

        <footer className={styles.bottomBar}>
          <div className={styles.location}>
            <span className={styles.locationLabel}>CURRENTLY EXPLORING</span>
            <span className={styles.locationName}>{locations[activeIndex % locations.length]}</span>
          </div>

          <div className={styles.galleryProgress}>
            <span className={styles.progressCurrent}>{currentNumber}</span>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className={styles.progressTotal}>{totalNumber}</span>
          </div>

          <div className={styles.bottomCredit}>
            <span>AN EXERCISE IN WONDER</span>
            <span className={styles.creditYear}>MMXXVI</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
