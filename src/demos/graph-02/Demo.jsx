"use client";

// src/demos/graph-02/Demo.jsx

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const SLIDE_TIME = 0.42;
const ROLL_TIME = 0.9;
const BAR_STAGGER = 0.03;

const PERIODS = [
  {
    label: "Visitors today",
    value: 1284,
    delta: "12.4%",
    note: "vs. yesterday",
    from: "00:00",
    to: "Now",
    bars: [18, 12, 9, 7, 10, 22, 41, 58, 64, 52, 70, 84, 77, 62],
  },
  {
    label: "Visitors this week",
    value: 8912,
    delta: "6.8%",
    note: "vs. last week",
    from: "Mon",
    to: "Sun",
    bars: [52, 61, 58, 73, 80, 46, 39, 55, 64, 70, 76, 88, 49, 66],
  },
  {
    label: "Visitors this month",
    value: 36450,
    delta: "18.2%",
    note: "vs. September",
    from: "Oct 1",
    to: "Oct 25",
    bars: [30, 38, 35, 44, 51, 47, 56, 61, 58, 66, 72, 69, 81, 90],
  },
  {
    label: "Visitors this year",
    value: 412880,
    delta: "41.0%",
    note: "vs. 2025",
    from: "Jan",
    to: "Oct",
    bars: [22, 26, 31, 29, 38, 44, 49, 47, 58, 63, 71, 78, 86, 95],
  },
];

const formatNumber = (value) => value.toLocaleString("en-US");

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const $ = (selector) => root.querySelector(selector);

    const seg = $(`.${styles.seg}`);
    const pill = $(`.${styles.segPill}`);
    const hover = $(`.${styles.segHover}`);

    const opts = [...root.querySelectorAll("[data-opt]")];

    const num = $(`.${styles.statNum}`);
    const label = $("[data-label]");
    const delta = $("[data-delta]");
    const badge = $(`.${styles.badge}`);
    const note = $("[data-note]");

    const barsBox = $(`.${styles.chartBars}`);
    const from = $("[data-from]");
    const to = $("[data-to]");

    if (!seg || !pill || !hover || !opts.length || !num || !label || !delta || !badge || !note || !barsBox || !from || !to) {
      console.error("Graph 02: required elements are missing.");
      return;
    }

    const ctx = gsap.context(() => {
      /* ---------------------------------------------------------
         Chart bars
      --------------------------------------------------------- */

      // Clear any bars left by a previous effect execution.
      // React Strict Mode runs effects twice in development.
      barsBox.replaceChildren();

      const barElements = [];

      PERIODS[0].bars.forEach((_, index) => {
        const bar = document.createElement("div");

        bar.className = styles.bar;

        if (index === PERIODS[0].bars.length - 1) {
          bar.classList.add(styles.isNow);
        }

        const fill = document.createElement("div");
        fill.className = styles.barFill;

        bar.appendChild(fill);
        barsBox.appendChild(bar);

        barElements.push(fill);
      });

      /* ---------------------------------------------------------
         Rolling number
      --------------------------------------------------------- */

      let slots = [];

      function buildNumber(str, animate, previousStr = "") {
        const previousDigits = previousStr.replace(/\D/g, "").split("").reverse();

        num.textContent = "";
        slots = [];

        let digitIndex = str.replace(/\D/g, "").length;

        for (const character of str) {
          if (/\d/.test(character)) {
            digitIndex--;

            const slot = document.createElement("span");
            slot.className = styles.slot;

            const column = document.createElement("span");
            column.className = styles.slotColumn;

            for (let k = 0; k < 20; k++) {
              const digit = document.createElement("span");
              digit.textContent = k % 10;
              column.appendChild(digit);
            }

            slot.appendChild(column);
            num.appendChild(slot);

            const target = Number(character);

            const old = previousDigits[digitIndex] !== undefined ? Number(previousDigits[digitIndex]) : null;

            slots.push({
              slot,
              column,
              target,
              old,
            });
          } else {
            const separator = document.createElement("span");

            separator.className = styles.sep;
            separator.textContent = character;

            num.appendChild(separator);
          }
        }

        const getDigitHeight = () => {
          return slots[0] ? slots[0].slot.getBoundingClientRect().height : 0;
        };

        slots.forEach((item, index) => {
          if (!animate || reducedMotion) {
            gsap.set(item.column, {
              y: -item.target * getDigitHeight(),
            });

            return;
          }

          const start = item.old === null ? 0 : item.old;

          let end = item.target + (item.target <= start ? 10 : 0);

          if (item.old === item.target) {
            end = item.target + 10;
          }

          const fromRight = slots.length - 1 - index;

          gsap.fromTo(
            item.column,
            {
              y: () => -start * getDigitHeight(),
            },
            {
              y: () => -end * getDigitHeight(),
              duration: ROLL_TIME + fromRight * 0.06,
              ease: "power3.out",
              onComplete: () => {
                gsap.set(item.column, {
                  y: -item.target * getDigitHeight(),
                });
              },
            },
          );

          if (item.old === null) {
            gsap.from(item.slot, {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
            });
          }
        });
      }

      function crossNumber(str) {
        gsap.to(num, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            buildNumber(str, false);

            gsap.to(num, {
              opacity: 1,
              duration: 0.25,
            });
          },
        });
      }

      /* ---------------------------------------------------------
         Segmented control pill
      --------------------------------------------------------- */

      const edge = {
        left: 0,
        right: 0,
      };

      const hoverEdge = {
        left: 0,
        right: 0,
      };

      function getOptionGeometry(index) {
        const option = opts[index];

        return {
          left: option.offsetLeft,
          right: option.offsetLeft + option.offsetWidth,
        };
      }

      function drawPill() {
        gsap.set(pill, {
          x: edge.left,
          width: Math.max(8, edge.right - edge.left),
        });
      }

      function drawHover() {
        gsap.set(hover, {
          x: hoverEdge.left,
          width: Math.max(8, hoverEdge.right - hoverEdge.left),
        });
      }

      let current = 0;
      let pillTimeline;

      function movePill(index) {
        const geometry = getOptionGeometry(index);

        if (pillTimeline) {
          pillTimeline.kill();
        }

        if (reducedMotion) {
          edge.left = geometry.left;
          edge.right = geometry.right;

          drawPill();
          return;
        }

        const movingRight = geometry.left > edge.left;

        const leadingEdge = movingRight ? "right" : "left";
        const trailingEdge = movingRight ? "left" : "right";

        const overshoot = movingRight ? 1 : -1;

        pillTimeline = gsap.timeline({
          onUpdate: drawPill,
        });

        pillTimeline
          .to(
            edge,
            {
              [leadingEdge]: geometry[leadingEdge] + overshoot,
              duration: SLIDE_TIME * 0.62,
              ease: "power3.out",
            },
            0,
          )
          .to(
            edge,
            {
              [trailingEdge]: geometry[trailingEdge] + overshoot,
              duration: SLIDE_TIME * 0.62,
              ease: "power3.out",
            },
            SLIDE_TIME * 0.22,
          )
          .to(
            edge,
            {
              left: geometry.left,
              right: geometry.right,
              duration: SLIDE_TIME * 0.45,
              ease: "sine.inOut",
            },
            ">-0.02",
          );

        gsap.fromTo(
          pill,
          {
            scaleY: 1,
          },
          {
            scaleY: 0.94,
            duration: SLIDE_TIME * 0.3,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            overwrite: "auto",
          },
        );
      }

      /* ---------------------------------------------------------
         Option font weights
      --------------------------------------------------------- */

      function setWeights(index, instant = false) {
        opts.forEach((option, optionIndex) => {
          const weight = optionIndex === index ? 640 : 500;

          if (instant || reducedMotion) {
            option.style.setProperty("--weight", weight);
          } else {
            gsap.to(option, {
              "--weight": weight,
              duration: 0.35,
              ease: "power2.out",
            });
          }
        });
      }

      /* ---------------------------------------------------------
         Chart bar animation
      --------------------------------------------------------- */

      function setBars(index, animate = true) {
        const values = PERIODS[index].bars;

        if (!animate || reducedMotion) {
          barElements.forEach((bar, i) => {
            gsap.set(bar, {
              scaleY: values[i] / 100,
            });
          });

          return;
        }

        gsap.killTweensOf(barElements);

        const timeline = gsap.timeline();

        timeline
          .to(
            barElements,
            {
              scaleY: (i) => Math.max(0.04, gsap.getProperty(barElements[i], "scaleY") * 0.25),
              duration: 0.18,
              ease: "power2.in",
              stagger: BAR_STAGGER * 0.5,
            },
            0,
          )
          .to(
            barElements,
            {
              scaleY: (i) => values[i] / 100,
              duration: 0.6,
              ease: "back.out(1.6)",
              stagger: BAR_STAGGER,
            },
            0.16,
          );
      }

      /* ---------------------------------------------------------
         Text transitions
      --------------------------------------------------------- */

      function swapText(element, value) {
        if (element.textContent === value) {
          return;
        }

        if (reducedMotion) {
          element.textContent = value;
          return;
        }

        gsap
          .timeline()
          .to(element, {
            opacity: 0,
            y: -4,
            duration: 0.14,
            ease: "power2.in",
          })
          .add(() => {
            element.textContent = value;
          })
          .fromTo(
            element,
            {
              y: 5,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: "power3.out",
            },
          );
      }

      /* ---------------------------------------------------------
         Select reporting period
      --------------------------------------------------------- */

      function select(index, focus = false) {
        if (index === current) {
          return;
        }

        const previousNumber = formatNumber(PERIODS[current].value);

        current = index;

        opts.forEach((option, optionIndex) => {
          const selected = optionIndex === index;

          option.setAttribute("aria-checked", selected ? "true" : "false");

          option.tabIndex = selected ? 0 : -1;
        });

        if (focus) {
          opts[index].focus();
        }

        movePill(index);
        setWeights(index);

        const period = PERIODS[index];
        const newNumber = formatNumber(period.value);

        if (reducedMotion) {
          crossNumber(newNumber);
        } else {
          buildNumber(newNumber, true, previousNumber);
        }

        setBars(index, true);

        swapText(label, period.label);
        swapText(note, period.note);
        swapText(delta, period.delta);
        swapText(from, period.from);
        swapText(to, period.to);

        if (!reducedMotion) {
          gsap.fromTo(
            badge,
            {
              scale: 0.92,
            },
            {
              scale: 1,
              duration: 0.5,
              ease: "back.out(2.2)",
            },
          );
        }
      }

      /* ---------------------------------------------------------
         Mouse and touch interaction
      --------------------------------------------------------- */

      opts.forEach((option, index) => {
        option.addEventListener("click", () => {
          select(index);

          gsap.to(hover, {
            opacity: 0,
            duration: 0.15,
            overwrite: "auto",
          });
        });

        option.addEventListener("pointerdown", () => {
          if (index === current || reducedMotion) {
            return;
          }

          gsap.fromTo(
            pill,
            {
              scale: 1,
            },
            {
              scale: 0.96,
              duration: 0.12,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            },
          );
        });

        option.addEventListener("pointerenter", (event) => {
          if (event.pointerType !== "mouse" || index === current) {
            return;
          }

          const geometry = getOptionGeometry(index);

          if (gsap.getProperty(hover, "opacity") < 0.05) {
            hoverEdge.left = geometry.left;
            hoverEdge.right = geometry.right;

            drawHover();
          }

          gsap.to(hoverEdge, {
            left: geometry.left,
            right: geometry.right,
            duration: 0.3,
            ease: "power3.out",
            onUpdate: drawHover,
            overwrite: "auto",
          });

          gsap.to(hover, {
            opacity: 1,
            duration: 0.2,
            overwrite: "auto",
          });
        });

        option.addEventListener("pointerleave", () => {
          gsap.to(hover, {
            opacity: 0,
            duration: 0.25,
            overwrite: "auto",
          });
        });
      });

      /* ---------------------------------------------------------
         Keyboard navigation
      --------------------------------------------------------- */

      function handleKeyDown(event) {
        const key = event.key;

        let next = null;

        if (key === "ArrowRight" || key === "ArrowDown") {
          next = (current + 1) % opts.length;
        }

        if (key === "ArrowLeft" || key === "ArrowUp") {
          next = (current + opts.length - 1) % opts.length;
        }

        if (key === "Home") {
          next = 0;
        }

        if (key === "End") {
          next = opts.length - 1;
        }

        if (next === null) {
          return;
        }

        event.preventDefault();
        select(next, true);
      }

      seg.addEventListener("keydown", handleKeyDown);

      /* ---------------------------------------------------------
         Initialization
      --------------------------------------------------------- */

      function init() {
        const geometry = getOptionGeometry(current);

        edge.left = geometry.left;
        edge.right = geometry.right;

        drawPill();

        setWeights(current, true);

        buildNumber(formatNumber(PERIODS[current].value), false);

        setBars(current, false);
      }

      init();

      /* Recalculate after the web font has loaded */

      let active = true;

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!active) return;

          const geometry = getOptionGeometry(current);

          edge.left = geometry.left;
          edge.right = geometry.right;

          drawPill();

          buildNumber(formatNumber(PERIODS[current].value), false);
        });
      }

      /* ---------------------------------------------------------
         Resize handling
      --------------------------------------------------------- */

      function handleResize() {
        if (pillTimeline) {
          pillTimeline.progress(1);
        }

        const geometry = getOptionGeometry(current);

        edge.left = geometry.left;
        edge.right = geometry.right;

        drawPill();

        slots.forEach((item) => {
          gsap.set(item.column, {
            y: -item.target * item.slot.getBoundingClientRect().height,
          });
        });
      }

      window.addEventListener("resize", handleResize);

      /* ---------------------------------------------------------
         Initial entrance
      --------------------------------------------------------- */

      if (!reducedMotion) {
        gsap.from(root.querySelector(`.${styles.card}`), {
          y: 14,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });

        gsap.from(barElements, {
          scaleY: 0,
          duration: 0.8,
          ease: "back.out(1.5)",
          stagger: BAR_STAGGER,
          delay: 0.25,
        });
      }

      /* ---------------------------------------------------------
         Cleanup
      --------------------------------------------------------- */

      return () => {
        active = false;

        window.removeEventListener("resize", handleResize);
        seg.removeEventListener("keydown", handleKeyDown);

        pillTimeline?.kill();
      };
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main
      className={styles.stage}
      ref={rootRef}
    >
      <section
        className={styles.card}
        aria-label='Plotwise visitors analytics'
      >
        <header className={styles.cardHead}>
          <span className={styles.brand}>
            <svg
              className={styles.brandMark}
              viewBox='0 0 20 20'
              aria-hidden='true'
            >
              <path d='M3.5 15.5 8 9.5l3.2 3 5.3-7' />
              <path d='M3.5 4.5v11h13' />
            </svg>

            <span className={styles.brandName}>Plotwise</span>
          </span>

          <span className={styles.cardSite}>C-Sharp.studio</span>
        </header>

        <div
          className={styles.seg}
          role='radiogroup'
          aria-label='Select reporting period'
        >
          <span
            className={styles.segHover}
            aria-hidden='true'
          />

          <span
            className={styles.segPill}
            aria-hidden='true'
          >
            <span className={styles.segShine} />
          </span>

          <button
            className={styles.segOpt}
            type='button'
            role='radio'
            aria-checked='true'
            tabIndex={0}
            data-opt='0'
          >
            Day
          </button>

          <button
            className={styles.segOpt}
            type='button'
            role='radio'
            aria-checked='false'
            tabIndex={-1}
            data-opt='1'
          >
            Week
          </button>

          <button
            className={styles.segOpt}
            type='button'
            role='radio'
            aria-checked='false'
            tabIndex={-1}
            data-opt='2'
          >
            Month
          </button>

          <button
            className={styles.segOpt}
            type='button'
            role='radio'
            aria-checked='false'
            tabIndex={-1}
            data-opt='3'
          >
            Year
          </button>
        </div>

        <div className={styles.stat}>
          <p className={styles.statLabel}>
            <span data-label>Visitors today</span>
          </p>

          <div className={styles.statRow}>
            <p
              className={styles.statNum}
              data-num
              aria-live='polite'
            />

            <span
              className={styles.badge}
              data-badge
            >
              <svg
                className={styles.badgeArrow}
                viewBox='0 0 12 12'
                aria-hidden='true'
              >
                <path d='M6 9.5v-7M2.8 5.6 6 2.4l3.2 3.2' />
              </svg>

              <span data-delta>12.4%</span>
            </span>
          </div>

          <p
            className={styles.statNote}
            data-note
          >
            vs. yesterday
          </p>
        </div>

        <div
          className={styles.chart}
          aria-label='Visitor activity chart'
        >
          <div
            className={styles.chartGrid}
            aria-hidden='true'
          >
            <span />
            <span />
            <span />
          </div>

          <div
            className={styles.chartBars}
            data-bars
          />
        </div>

        <div
          className={styles.chartAxis}
          aria-hidden='true'
        >
          <span data-from>00:00</span>
          <span data-to>Now</span>
        </div>
      </section>
    </main>
  );
}
