/* src/demos/filter-01/Demo.jsx */

"use client";

import { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import styles from "./Demo.module.css";
import projects from "./projects.json";

const filters = ["all", "brand", "product", "motion"];

const MOVE = 0.75;
const STAGGER = 0.035;
const BOUNCE = 1.25;

export default function Demo() {
  const filtersRef = useRef(null);
  const pillRef = useRef(null);
  const buttonsRef = useRef([]);
  const gridRef = useRef(null);
  const animationRef = useRef(null);
  const countColumnsRef = useRef([]);
  const previousCountRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProjects = activeFilter === "all" ? projects : projects.filter((project) => project.category === activeFilter);

  // Change filter and animate the gallery
  function changeFilter(filter) {
    if (filter === activeFilter) return;

    const grid = gridRef.current;
    if (!grid) return;

    // Finish any previous transition before starting another.
    if (animationRef.current) {
      animationRef.current.progress(1).kill();
      animationRef.current = null;
    }

    const cards = Array.from(grid.children);
    const gridRect = grid.getBoundingClientRect();

    const isVisible = (card) => card.style.display !== "none";

    const matchesFilter = (card) => filter === "all" || card.dataset.category === filter;

    // Capture the current positions of visible cards.
    const visibleCards = cards.filter(isVisible);

    const previousPositions = new Map(
      visibleCards.map((card) => {
        const rect = card.getBoundingClientRect();

        return [
          card,
          {
            x: rect.left - gridRect.left,
            y: rect.top - gridRect.top,
            width: rect.width,
            height: rect.height,
          },
        ];
      }),
    );

    const previousHeight = grid.offsetHeight;

    const leavingCards = visibleCards.filter((card) => !matchesFilter(card));

    const stayingCards = visibleCards.filter(matchesFilter);

    const enteringCards = cards.filter((card) => !isVisible(card) && matchesFilter(card));

    // Take leaving cards out of the grid layout.
    leavingCards.forEach((card) => {
      const position = previousPositions.get(card);

      gsap.set(card, {
        position: "absolute",
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        margin: 0,
        zIndex: 0,
      });
    });

    // Add entering cards to the new grid layout.
    gsap.set(enteringCards, { display: "block" });

    // Measure the new layout.
    grid.style.height = "";

    const nextHeight = grid.offsetHeight;
    const nextGridRect = grid.getBoundingClientRect();

    // Animate the gallery height from its previous value.
    grid.style.height = `${previousHeight}px`;

    const timeline = gsap.timeline({
      onComplete: () => {
        // Hide leaving cards and restore their styles.
        gsap.set(leavingCards, {
          display: "none",
          clearProps: "position,left,top,width,height,margin,zIndex,opacity,visibility,transform",
        });

        // Clear temporary animation styles from visible cards.
        gsap.set([...stayingCards, ...enteringCards], {
          clearProps: "transform,opacity,visibility,zIndex",
        });

        grid.style.height = "";

        animationRef.current = null;
      },
    });

    const movementEase = `back.out(${BOUNCE})`;

    // 1. Leaving cards shrink and fade out.
    if (leavingCards.length) {
      timeline.to(
        leavingCards,
        {
          scale: 0.86,
          autoAlpha: 0,
          duration: 0.32,
          ease: "power2.in",
          stagger: STAGGER * 0.5,
        },
        0,
      );
    }

    // 2. Staying cards move to their new positions.
    stayingCards.forEach((card, index) => {
      const previous = previousPositions.get(card);
      const current = card.getBoundingClientRect();

      const deltaX = previous.x - (current.left - nextGridRect.left);

      const deltaY = previous.y - (current.top - nextGridRect.top);

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return;
      }

      timeline.fromTo(
        card,
        {
          x: deltaX,
          y: deltaY,
          zIndex: 2,
        },
        {
          x: 0,
          y: 0,
          duration: MOVE,
          ease: movementEase,
          clearProps: "zIndex",
        },
        0.08 + index * STAGGER,
      );
    });

    // 3. Entering cards grow and fade in.
    if (enteringCards.length) {
      timeline.fromTo(
        enteringCards,
        {
          scale: 0.82,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: MOVE * 0.85,
          ease: movementEase,
          stagger: STAGGER,
        },
        0.2,
      );
    }

    // 4. Animate the gallery height.
    timeline.fromTo(
      grid,
      { height: previousHeight },
      {
        height: nextHeight,
        duration: MOVE,
        ease: movementEase,
      },
      0.04,
    );

    animationRef.current = timeline;

    setActiveFilter(filter);
  }

  // Move the active filter pill.
  useLayoutEffect(() => {
    const activeIndex = filters.indexOf(activeFilter);
    const activeButton = buttonsRef.current[activeIndex];
    const pill = pillRef.current;

    if (!activeButton || !pill) return;

    gsap.to(pill, {
      x: activeButton.offsetLeft - 4,
      width: activeButton.offsetWidth,
      duration: 0.55,
      ease: `back.out(${1 + BOUNCE * 0.5})`,
    });
  }, [activeFilter]);

  // Animate the rolling project count.
  useLayoutEffect(() => {
    const number = filteredProjects.length;
    const value = String(number).padStart(2, " ");

    countColumnsRef.current.forEach((column, index) => {
      if (!column) return;

      const character = value[index];

      // Make the column visible before measuring it.
      column.parentElement.style.display = character === " " ? "none" : "";

      if (character === " ") return;

      const digitIndex = Number(character) + 1;

      const digitHeight = column.firstElementChild.getBoundingClientRect().height || 16;

      const animate = previousCountRef.current !== null;

      gsap.to(column, {
        y: -digitIndex * digitHeight,
        duration: animate ? 0.6 : 0,
        ease: "back.out(1.6)",
        delay: animate ? index * 0.05 : 0,
      });
    });

    previousCountRef.current = number;
  }, [filteredProjects.length]);

  return (
    <main
      className={styles.stage}
      data-stage
    >
      <section
        className={styles.work}
        data-work
      >
        <header className={styles.top}>
          <div className={styles.top__head}>
            <div
              className={styles.top__brand}
              data-brand
            >
              Kettleby
            </div>

            <h1 className={styles.top__title}>Selected work</h1>
          </div>
        </header>

        <nav
          ref={filtersRef}
          className={styles.filters}
          aria-label='Filter projects'
        >
          <span
            ref={pillRef}
            className={styles.filters__pill}
          />

          {filters.map((filter, index) => (
            <button
              key={filter}
              ref={(element) => (buttonsRef.current[index] = element)}
              className={`${styles.filter} ${activeFilter === filter ? styles["is-on"] : ""}`}
              onClick={() => changeFilter(filter)}
              aria-pressed={activeFilter === filter}
              type='button'
            >
              <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
            </button>
          ))}

          <div className={styles.count}>
            <span
              className={styles.count__num}
              aria-label={String(filteredProjects.length)}
              aria-live='polite'
            >
              {[0, 1].map((columnIndex) => (
                <span
                  className={styles.count__colWrap}
                  key={columnIndex}
                >
                  <span
                    className={styles.count__col}
                    ref={(element) => {
                      countColumnsRef.current[columnIndex] = element;
                    }}
                  >
                    {[" ", ..."0123456789"].map((digit, index) => (
                      <span
                        className={styles.count__digit}
                        key={index}
                      >
                        {digit === " " ? "\u00A0" : digit}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>

            <span>{filteredProjects.length === 1 ? "project" : "projects"}</span>
          </div>
        </nav>

        <div
          ref={gridRef}
          className={styles.grid}
        >
          {projects.map((project) => (
            <article
              key={project.id}
              className={styles.tile}
              data-category={project.category}
              style={{ backgroundColor: project.color }}
            >
              <div className={styles.card}>
                <div className={styles.card__info}>
                  <h2>{project.title}</h2>
                  <span>{project.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
