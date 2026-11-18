/* src/demos/graph-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

const DATA = [
  { name: "Housing", amount: 1450, color: "#075e57" },
  { name: "Groceries", amount: 612, color: "#0f766e" },
  { name: "Shopping", amount: 442, color: "#4d9b91" },
  { name: "Transport", amount: 384, color: "#83b8ae" },
  { name: "Dining out", amount: 296, color: "#b5d3ca" },
];

const TOTAL = DATA.reduce((sum, item) => sum + item.amount, 0);
const BUDGET = 4200;

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.2;
const GAP_LENGTH = (GAP / 360) * CIRCUMFERENCE;

const TICKS = Array.from({ length: 72 }, (_, index) => ({
  angle: index * 5,
  long: index % 6 === 0,
}));

let currentOffset = 0;

const SLICES = DATA.map((item) => {
  const length = (item.amount / TOTAL) * CIRCUMFERENCE;
  const angle = (item.amount / TOTAL) * 360;

  const slice = {
    ...item,
    length: length - GAP_LENGTH,
    offset: currentOffset,
    midpoint: (currentOffset / CIRCUMFERENCE) * 360 + angle / 2,
  };

  currentOffset += length;

  return slice;
});

const formatAmount = (amount) => amount.toLocaleString("en-US");

const formatPercentage = (amount) => `${Math.round((amount / BUDGET) * 100)}% of $${formatAmount(BUDGET)}`;

export default function Graph01() {
  const cardRef = useRef(null);
  const amountRef = useRef(null);
  const labelRef = useRef(null);
  const percentageRef = useRef(null);
  const highlightRef = useRef(null);

  const displayValueRef = useRef({ value: 0 });

  const sliceRefs = useRef([]);
  const fillRefs = useRef([]);
  const rowRefs = useRef([]);
  const tickRefs = useRef([]);

  const reducedMotionRef = useRef(false);

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const ctx = gsap.context(() => {
      const slices = sliceRefs.current.filter(Boolean);
      const fills = fillRefs.current.filter(Boolean);
      const ticks = tickRefs.current.filter(Boolean);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      reducedMotionRef.current = reducedMotion;

      const counter = displayValueRef.current;

      if (reducedMotion) {
        slices.forEach((slice, index) => {
          gsap.set(slice, {
            attr: {
              "stroke-dasharray": `${SLICES[index].length} ${CIRCUMFERENCE}`,
            },
          });
        });

        fills.forEach((fill, index) => {
          gsap.set(fill, {
            scaleX: DATA[index].amount / DATA[0].amount,
          });
        });

        gsap.set(ticks, { opacity: 1 });
        gsap.set(highlightRef.current, { opacity: 0 });

        counter.value = TOTAL;

        if (amountRef.current) {
          amountRef.current.textContent = formatAmount(TOTAL);
        }

        return;
      }

      counter.value = 0;

      if (amountRef.current) {
        amountRef.current.textContent = "0";
      }

      gsap.set(ticks, { opacity: 0 });
      gsap.set(highlightRef.current, { opacity: 0, y: 0 });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
      });

      // Draw the donut slices sequentially.
      timeline.to(
        slices,
        {
          attr: (index) => ({
            "stroke-dasharray": `${SLICES[index].length} ${CIRCUMFERENCE}`,
          }),
          duration: 0.85,
          stagger: 0.16,
          ease: "power2.inOut",
        },
        0,
      );

      // Reveal the chart ticks.
      timeline.to(
        ticks,
        {
          opacity: 1,
          duration: 0.35,
          stagger: {
            each: 0.008,
            from: "start",
          },
        },
        0.15,
      );

      // Animate the center amount.
      timeline.to(
        counter,
        {
          value: TOTAL,
          duration: 1.45,
          ease: "power2.out",
          onUpdate: () => {
            if (amountRef.current) {
              amountRef.current.textContent = formatAmount(Math.round(counter.value));
            }
          },
        },
        0.25,
      );

      // Animate the legend bars.
      timeline.to(
        fills,
        {
          scaleX: (index) => DATA[index].amount / DATA[0].amount,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
        },
        0.55,
      );
    }, card);

    return () => {
      ctx.revert();
    };
  }, []);

  const moveHighlight = (index, instant = false) => {
    const row = rowRefs.current[index];
    const highlight = highlightRef.current;

    if (!row || !highlight) return;

    const paddingY = 5;
    const paddingX = 4;

    const y = row.offsetTop - paddingY;
    const height = row.offsetHeight + paddingY * 2;

    gsap.killTweensOf(highlight);

    if (instant || reducedMotionRef.current || gsap.getProperty(highlight, "opacity") < 0.05) {
      gsap.set(highlight, { y, height });

      gsap.to(highlight, {
        opacity: 1,
        duration: reducedMotionRef.current ? 0 : 0.16,
      });
    } else {
      gsap.to(highlight, {
        y,
        height,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.5)",
      });
    }
  };

  const hideHighlight = () => {
    const highlight = highlightRef.current;

    if (!highlight) return;

    gsap.to(highlight, {
      opacity: 0,
      duration: 0.16,
      ease: "power1.out",
    });
  };

  const activateCategory = (index) => {
    const slices = sliceRefs.current;
    const rows = rowRefs.current;

    const selectedAmount = index === null ? TOTAL : DATA[index].amount;
    const selectedLabel = index === null ? "Spent" : DATA[index].name;

    // Highlight the selected donut slice.
    slices.forEach((slice, sliceIndex) => {
      if (!slice) return;

      const isActive = index === sliceIndex;
      const radians = (SLICES[sliceIndex].midpoint * Math.PI) / 180;

      gsap.to(slice, {
        opacity: index === null || isActive ? 1 : 0.28,
        x: isActive ? Math.cos(radians) * 3 : 0,
        y: isActive ? Math.sin(radians) * 3 : 0,
        scale: isActive ? 1.025 : 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    });

    // Update the legend row states.
    rows.forEach((row, rowIndex) => {
      if (!row) return;

      row.classList.toggle(styles["row--active"], index !== null && index === rowIndex);

      row.classList.toggle(styles["row--dimmed"], index !== null && index !== rowIndex);
    });

    // Update the center label.
    if (labelRef.current) {
      labelRef.current.textContent = selectedLabel;
    }

    // Update the percentage.
    if (percentageRef.current) {
      percentageRef.current.textContent = formatPercentage(selectedAmount);
    }

    // Animate the center amount.
    gsap.to(displayValueRef.current, {
      value: selectedAmount,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        if (amountRef.current) {
          amountRef.current.textContent = formatAmount(Math.round(displayValueRef.current.value));
        }
      },
    });
  };

  return (
    <main className={styles.stage}>
      <section
        ref={cardRef}
        className={styles.card}
        aria-label='Orra, October budget'
      >
        <header className={styles.card__head}>
          <div className={styles.card__brand}>
            <svg
              className={styles.card__mark}
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <circle
                cx='12'
                cy='12'
                r='8.2'
              />
              <path d='M12 3.8a8.2 8.2 0 0 1 8.2 8.2' />
            </svg>

            <div>
              <p className={styles.card__name}>October budget</p>
              <p className={styles.card__sub}>Orra · Joint account</p>
            </div>
          </div>

          <span className={styles.card__chip}>Oct 1 – 31</span>
        </header>

        <div className={styles.card__body}>
          <div className={styles.donut}>
            <svg
              className={styles.donut__svg}
              viewBox='-6 -6 212 212'
              aria-hidden='true'
            >
              <g>
                {TICKS.map((tick, index) => (
                  <path
                    key={tick.angle}
                    ref={(element) => {
                      tickRefs.current[index] = element;
                    }}
                    className={styles.tick}
                    d={tick.long ? "M100 10.8V13.2" : "M100 10.2V10.8"}
                    transform={`rotate(${tick.angle} 100 100)`}
                  />
                ))}
              </g>

              <circle
                className={styles.donut__bed}
                cx='100'
                cy='100'
                r={RADIUS}
              />

              <g transform='rotate(-90 100 100)'>
                {SLICES.map((slice, index) => (
                  <circle
                    key={slice.name}
                    ref={(element) => {
                      sliceRefs.current[index] = element;
                    }}
                    className={styles.slice__paint}
                    cx='100'
                    cy='100'
                    r={RADIUS}
                    stroke={slice.color}
                    strokeDasharray={`0 ${CIRCUMFERENCE}`}
                    strokeDashoffset={-slice.offset}
                  />
                ))}
              </g>

              <circle
                className={styles.donut__gloss}
                cx='100'
                cy='100'
                r='79.4'
              />

              <circle
                className={styles.donut__inner}
                cx='100'
                cy='100'
                r='60.4'
              />
            </svg>

            <div className={styles.donut__center}>
              <p
                ref={labelRef}
                className={styles.donut__label}
              >
                Spent
              </p>

              <p className={styles.donut__value}>
                <span className={styles.donut__cur}>$</span>
                <span ref={amountRef}>{formatAmount(TOTAL)}</span>
              </p>

              <p
                ref={percentageRef}
                className={styles.donut__note}
              >
                {formatPercentage(TOTAL)}
              </p>
            </div>
          </div>

          <ul
            className={styles.legend}
            aria-label='Categories'
          >
            <li
              ref={highlightRef}
              className={styles.legend__highlight}
              aria-hidden='true'
            />

            {DATA.map((item, index) => (
              <li
                key={item.name}
                ref={(element) => {
                  rowRefs.current[index] = element;
                }}
                className={styles.row}
                tabIndex={0}
                onPointerEnter={() => {
                  moveHighlight(index);
                  activateCategory(index);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    hideHighlight();
                    activateCategory(null);
                  }
                }}
                onFocus={() => {
                  moveHighlight(index);
                  activateCategory(index);
                }}
                onBlur={() => {
                  hideHighlight();
                  activateCategory(null);
                }}
              >
                <div className={styles.row__top}>
                  <span className={styles.row__name}>{item.name}</span>
                  <span className={styles.row__amt}>${formatAmount(item.amount)}</span>
                </div>

                <span className={styles.row__bar}>
                  <span
                    ref={(element) => {
                      fillRefs.current[index] = element;
                    }}
                    className={styles.row__fill}
                    style={{ backgroundColor: item.color }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className={styles.card__foot}>
          <svg
            className={styles.card__trend}
            viewBox='0 0 16 16'
            aria-hidden='true'
          >
            <path d='M3 5.5 8 10.5l5-5' />
          </svg>

          <p className={styles.card__insight}>
            <b>${formatAmount(BUDGET - TOTAL)}</b> under budget, moved to Savings
          </p>
        </footer>
      </section>
    </main>
  );
}
