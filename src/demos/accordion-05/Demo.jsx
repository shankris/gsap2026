/* src/demos/accordion-05/Demo.jsx */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import styles from "./Demo.module.css";

const PEOPLE = [
  {
    name: "Ingrid Halden",
    role: "Founding Partner",
    detail: "Since 2009",
    initials: "IH",
    image: "/demos/accordion-05/ritratto-ingrid.webp",
  },
  {
    name: "Tomás Roe",
    role: "Founding Partner",
    detail: "Lisbon Desk",
    initials: "TR",
    image: "/demos/accordion-05/ritratto-tomas.webp",
  },
  {
    name: "Maren Okafor",
    role: "Lead Architect",
    detail: "Since 2014",
    initials: "MO",
    image: "/demos/accordion-05/ritratto-maren.webp",
  },
  {
    name: "Jonas Vik",
    role: "Model Maker",
    detail: "Oslo Workshop",
    initials: "JV",
    image: "/demos/accordion-05/ritratto-jonas.webp",
  },
  {
    name: "Leonor Abreu",
    role: "Landscape Architect",
    detail: "Since 2019",
    initials: "LA",
    image: "/demos/accordion-05/ritratto-leonor.webp",
  },
  {
    name: "Sami Lindqvist",
    role: "Structural Designer",
    detail: "Lisbon Desk",
    initials: "SL",
    image: "/demos/accordion-05/ritratto-sami.webp",
  },
];

const OPEN = 4.2;
const NEIGHBOUR = 0.82;
const MOBILE_OPEN = 3.4;
const MOBILE_NEIGHBOUR = 0.8;

export default function Demo() {
  const rootRef = useRef(null);
  const updatePanelTargetsRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  const activeIndexRef = useRef(-1);
  const isMobileRef = useRef(false);

  activeIndexRef.current = activeIndex;
  isMobileRef.current = isMobile;

  function openPerson(index) {
    setActiveIndex((current) => (current === index ? current : index));
  }

  function togglePerson(index) {
    setActiveIndex((current) => (current === index ? -1 : index));
  }

  function closeAccordion() {
    setActiveIndex(-1);
  }

  // Set up GSAP, spring sizing, and responsive measurements.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const people = root.querySelector(".people");
    const cards = Array.from(root.querySelectorAll(".person"));
    const rows = Array.from(root.querySelectorAll(".person-row"));

    if (!people || !cards.length) return;

    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const reducedMotion = reducedMotionQuery.matches;

    isMobileRef.current = mobileQuery.matches;
    setIsMobile(mobileQuery.matches);

    const springItems = [...cards, ...rows].map((element) => ({
      element,
      value: 1,
      velocity: 0,
      target: 1,
    }));

    const cardSprings = new Map(springItems.filter((item) => item.element.classList.contains("person")).map((item) => [item.element, item]));

    const rowSprings = new Map(springItems.filter((item) => item.element.classList.contains("person-row")).map((item) => [item.element, item]));

    // Initial closed state.
    cards.forEach((card) => {
      gsap.set(card.querySelector("img"), {
        scale: 1.06,
        filter: "grayscale(1) contrast(1.1) brightness(0.94)",
      });

      gsap.set(card.querySelector(".person-line"), {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set([card.querySelector("h2"), card.querySelector(".person-role"), card.querySelector(".person-detail")], {
        opacity: 0,
        yPercent: 110,
      });

      gsap.set(card.querySelector(".person-initials"), {
        opacity: 1,
      });

      gsap.set(card.querySelector(".person-arrow"), {
        opacity: 0,
        scale: 0.6,
        rotation: -45,
      });
    });

    function updateImageWidths() {
      const mobile = isMobileRef.current;

      if (mobile && rows.length) {
        rows.forEach((row) => {
          const gap = parseFloat(getComputedStyle(row).gap) || 0;
          const width = row.clientWidth;

          const openWidth = (width - gap * 2) * (MOBILE_OPEN / (MOBILE_OPEN + MOBILE_NEIGHBOUR * 2));

          const imageWidth = Math.max(openWidth, 180);

          row.querySelectorAll(".person").forEach((card) => {
            card.style.setProperty("--image-width", `${imageWidth}px`);
            card.style.setProperty("--info-width", `${Math.max(imageWidth - 32, 140)}px`);
          });
        });

        return;
      }

      const gap = parseFloat(getComputedStyle(people).gap) || 0;
      const width = people.clientWidth;

      const openWidth = (width - gap * (cards.length - 1)) * (OPEN / (OPEN + NEIGHBOUR * 2 + cards.length - 3));

      const imageWidth = Math.max(openWidth, 220);

      cards.forEach((card) => {
        card.style.setProperty("--image-width", `${imageWidth}px`);
        card.style.setProperty("--info-width", `${Math.max(imageWidth - 32, 180)}px`);
      });
    }

    function updatePanelTargets() {
      const currentIndex = activeIndexRef.current;
      const mobile = isMobileRef.current;

      cards.forEach((card, index) => {
        const item = cardSprings.get(card);
        let target = 1;

        if (currentIndex !== -1) {
          if (mobile) {
            const sameRow = Math.floor(index / 3) === Math.floor(currentIndex / 3);

            if (sameRow) {
              if (index === currentIndex) {
                target = MOBILE_OPEN;
              } else if (Math.abs(index - currentIndex) === 1) {
                target = MOBILE_NEIGHBOUR;
              }
            }
          } else if (index === currentIndex) {
            target = OPEN;
          } else if (Math.abs(index - currentIndex) === 1) {
            target = NEIGHBOUR;
          }
        }

        item.target = target;
      });

      rows.forEach((row, index) => {
        const item = rowSprings.get(row);
        if (!item) return;

        const activeRow = Math.floor(currentIndex / 3);

        item.target = mobile && currentIndex !== -1 && index === activeRow ? 1.45 : 1;
      });

      // Apply targets immediately when reduced motion is enabled.
      if (reducedMotion) {
        springItems.forEach((item) => {
          item.value = item.target;
          item.velocity = 0;
          item.element.style.flexGrow = String(item.target);
        });
      }
    }

    updatePanelTargetsRef.current = updatePanelTargets;

    function tick() {
      const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 30);
      const stiffness = 180;
      const damping = 25;

      springItems.forEach((item) => {
        const acceleration = stiffness * (item.target - item.value) - damping * item.velocity;

        item.velocity += acceleration * dt;
        item.value += item.velocity * dt;

        if (Math.abs(item.target - item.value) < 0.001 && Math.abs(item.velocity) < 0.001) {
          item.value = item.target;
          item.velocity = 0;
        }

        item.element.style.flexGrow = item.value.toFixed(3);
      });
    }

    if (!reducedMotion) {
      gsap.ticker.add(tick);
    }

    function handleResize() {
      const nextMobile = mobileQuery.matches;

      if (nextMobile !== isMobileRef.current) {
        isMobileRef.current = nextMobile;
        activeIndexRef.current = -1;

        setIsMobile(nextMobile);
        setActiveIndex(-1);
      }

      updateImageWidths();
      updatePanelTargets();
    }

    updateImageWidths();
    updatePanelTargets();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (!reducedMotion) {
        gsap.ticker.remove(tick);
      }

      updatePanelTargetsRef.current = null;

      cards.forEach((card) => {
        gsap.killTweensOf(card);
        gsap.killTweensOf([card.querySelector("img"), card.querySelector(".person-line"), card.querySelector(".person-initials"), card.querySelector("h2"), card.querySelector(".person-role"), card.querySelector(".person-detail"), card.querySelector(".person-arrow")]);
      });
    };
  }, []);

  // Update the spring targets whenever the selected card changes.
  useLayoutEffect(() => {
    updatePanelTargetsRef.current?.();
  }, [activeIndex, isMobile]);

  // Animate card contents when the selected card changes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll(".person"));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cards.forEach((card, index) => {
      const isOpen = index === activeIndex;

      const image = card.querySelector("img");
      const line = card.querySelector(".person-line");
      const initials = card.querySelector(".person-initials");
      const heading = card.querySelector("h2");
      const role = card.querySelector(".person-role");
      const detail = card.querySelector(".person-detail");
      const arrow = card.querySelector(".person-arrow");

      if (reducedMotion) {
        gsap.set(image, {
          scale: isOpen ? 1 : 1.06,
          filter: isOpen ? "grayscale(0) contrast(1.02) brightness(1)" : "grayscale(1) contrast(1.1) brightness(0.94)",
        });

        gsap.set(line, {
          scaleX: isOpen ? 1 : 0,
          transformOrigin: "left center",
        });

        gsap.set([heading, role, detail], {
          opacity: isOpen ? 1 : 0,
          yPercent: isOpen ? 0 : 110,
        });

        gsap.set(initials, {
          opacity: isOpen ? 0 : 1,
        });

        gsap.set(arrow, {
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.6,
          rotation: isOpen ? 0 : -45,
        });

        gsap.set(card, {
          y: isOpen ? -4 : 0,
        });

        return;
      }

      gsap.to(image, {
        scale: isOpen ? 1 : 1.06,
        filter: isOpen ? "grayscale(0) contrast(1.02) brightness(1)" : "grayscale(1) contrast(1.1) brightness(0.94)",
        duration: isOpen ? 1.25 : 0.7,
        ease: isOpen ? "expo.out" : "power2.out",
        overwrite: "auto",
      });

      gsap.to(line, {
        scaleX: isOpen ? 1 : 0,
        duration: isOpen ? 0.75 : 0.3,
        delay: isOpen ? 0.2 : 0,
        ease: "power3.out",
        transformOrigin: "left center",
        overwrite: "auto",
      });

      gsap.to(initials, {
        opacity: isOpen ? 0 : 1,
        duration: isOpen ? 0.3 : 0.45,
        delay: isOpen ? 0.1 : 0,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (isOpen) {
        gsap.to([heading, role, detail], {
          opacity: 1,
          yPercent: 0,
          duration: 0.7,
          stagger: 0.09,
          delay: 0.24,
          ease: "power3.out",
          overwrite: "auto",
        });

        gsap.to(arrow, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          delay: 0.45,
          ease: "back.out(1.8)",
          overwrite: "auto",
        });
      } else {
        gsap.to([heading, role, detail], {
          opacity: 0,
          yPercent: 110,
          duration: 0.3,
          stagger: 0.035,
          ease: "power2.in",
          overwrite: "auto",
        });

        gsap.to(arrow, {
          opacity: 0,
          scale: 0.6,
          rotation: -45,
          duration: 0.25,
          ease: "power2.in",
          overwrite: "auto",
        });
      }

      gsap.to(card, {
        y: isOpen ? -4 : 0,
        duration: 0.5,
        ease: isOpen ? "back.out(1.6)" : "power2.out",
        overwrite: "auto",
      });
    });
  }, [activeIndex]);

  function handlePointerEnter(index, event) {
    if (event.pointerType === "touch" || isMobile) return;
    openPerson(index);
  }

  function handleCardClick(index) {
    if (isMobile) {
      togglePerson(index);
    } else {
      openPerson(index);
    }
  }

  function handleKeyDown(index, event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();

    if (isMobile) {
      togglePerson(index);
    } else {
      openPerson(index);
    }
  }

  function handlePeoplePointerLeave(event) {
    if (isMobile || event.pointerType === "touch") return;

    const people = rootRef.current?.querySelector(".people");

    if (!people?.contains(document.activeElement)) {
      closeAccordion();
    }
  }

  function handlePeopleFocusOut(event) {
    const people = rootRef.current?.querySelector(".people");

    if (people?.contains(event.relatedTarget)) return;

    if (!people?.matches(":hover")) {
      closeAccordion();
    }
  }

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      <main className={`${styles.studio} studio`}>
        <header className={`${styles.header} studio-header`}>
          <div className={`${styles.brand} studio-brand`}>
            <span>HALDEN &amp; ROE</span>
            <span>STUDIO</span>
          </div>

          <div className={`${styles.headingRow} heading-row`}>
            <div>
              <h1>The people behind the work.</h1>
              <p>Meet the team behind our ideas, spaces, and projects.</p>
            </div>
          </div>
        </header>

        <section
          className={`${styles.people} people`}
          aria-label='Meet the studio team'
          onPointerLeave={handlePeoplePointerLeave}
          onFocusOut={handlePeopleFocusOut}
        >
          {[PEOPLE.slice(0, 3), PEOPLE.slice(3, 6)].map((group, rowIndex) => (
            <div
              className={`${styles.personRow} person-row`}
              key={rowIndex}
            >
              {group.map((person, personIndex) => {
                const index = rowIndex * 3 + personIndex;

                return (
                  <article
                    className={`${styles.person} person`}
                    key={person.initials}
                    tabIndex={0}
                    role='button'
                    aria-label={`${person.name}, ${person.role}`}
                    aria-expanded={activeIndex === index}
                    onPointerEnter={(event) => handlePointerEnter(index, event)}
                    onClick={() => handleCardClick(index)}
                    onFocus={() => openPerson(index)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                  >
                    <div className={`${styles.personImage} person-image`}>
                      <img
                        src={person.image}
                        alt={person.name}
                        width='560'
                        height='640'
                      />
                    </div>

                    <span className={`${styles.initials} person-initials`}>{person.initials}</span>

                    <div className={`${styles.personInfo} person-info`}>
                      <span className={`${styles.personLine} person-line`} />

                      <h2>{person.name}</h2>
                      <p className='person-role'>{person.role}</p>
                      <small className='person-detail'>{person.detail}</small>
                    </div>

                    <span
                      className={`${styles.personArrow} person-arrow`}
                      aria-hidden='true'
                    >
                      ↗
                    </span>
                  </article>
                );
              })}
            </div>
          ))}
        </section>

        <footer className={`${styles.footer} studio-footer`}>
          <span>EST. 2009</span>
          <span>OSLO · LISBON</span>
        </footer>
      </main>
    </div>
  );
}
