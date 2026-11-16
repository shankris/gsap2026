/* src/demos/clock-01-world/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const CITIES = [
  { name: "New York", code: "NYC", zone: "America/New_York" },
  { name: "London", code: "LDN", zone: "Europe/London" },
  { name: "Bangalore", code: "BLR", zone: "Asia/Kolkata" },
  { name: "Singapore", code: "SIN", zone: "Asia/Singapore" },
];

function OdometerDigit({ initial = 0, target }) {
  return (
    <span className={styles.digit}>
      <span
        className={styles.digit__reel}
        data-digit
        data-value={initial}
        data-target={target}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i}>{i % 10}</span>
        ))}
      </span>
    </span>
  );
}

export default function Demo() {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const reelRef = useRef(null);
  const pillRef = useRef(null);
  const subNameRef = useRef(null);
  const subStateRef = useRef(null);
  const srTimeRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const reel = reelRef.current;
    const pill = pillRef.current;

    if (!root || !card || !reel || !pill) return;

    let teardown = () => {};

    const ctx = gsap.context(() => {
      const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const ease = "expo.out";

      let current = 0;
      let secondTimer;
      let resizeHandler;
      let destroyed = false;

      const cityClickHandlers = [];

      const cityButtons = [...root.querySelectorAll("[data-city]")];
      const clockLines = [...reel.querySelectorAll("[data-clock-line]")];

      const subName = subNameRef.current;
      const subState = subStateRef.current;
      const srTime = srTimeRef.current;

      const formatters = CITIES.map((city) => ({
        time: new Intl.DateTimeFormat("en-US", {
          timeZone: city.zone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        parts: new Intl.DateTimeFormat("en-US", {
          timeZone: city.zone,
          hour: "numeric",
          minute: "numeric",
          hourCycle: "h23",
          weekday: "short",
        }),
        offset: new Intl.DateTimeFormat("en-US", {
          timeZone: city.zone,
          timeZoneName: "shortOffset",
        }),
      }));

      function getTime(index, date = new Date()) {
        const parts = formatters[index].time.formatToParts(date);

        const hour = parts.find((p) => p.type === "hour")?.value || "12";
        const minute = parts.find((p) => p.type === "minute")?.value || "00";
        const period = parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() || "";

        return {
          digits: `${hour.padStart(2, "0")}${minute}`,
          period,
        };
      }

      function officeStatus(index, date = new Date()) {
        const parts = formatters[index].parts.formatToParts(date);

        const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);

        const day = parts.find((p) => p.type === "weekday")?.value || "";

        const open = hour >= 9 && hour < 18 && day !== "Sat" && day !== "Sun";

        const offset = formatters[index].offset.formatToParts(date).find((p) => p.type === "timeZoneName")?.value || "";

        return { open, offset };
      }

      function getDigits(line) {
        return [...line.querySelectorAll("[data-digit]")].map((column) => ({
          column,
          value: Number(column.dataset.value || 0),
        }));
      }

      function rollDigit(item, next, duration = 0.65, delay = 0, force = false) {
        const from = item.value % 10;

        if (from === next && !force) return;

        if (REDUCED) {
          item.value = next;
          gsap.set(item.column, { yPercent: -next * 5 });
          return;
        }

        let destination = next;

        if (destination <= from || force) {
          destination += 10;
        }

        item.value = next;
        item.column.dataset.value = String(next);

        gsap.killTweensOf(item.column);

        gsap.to(item.column, {
          yPercent: -destination * 5,
          duration,
          delay,
          ease,
          onComplete: () => {
            gsap.set(item.column, { yPercent: -next * 5 });
          },
        });
      }

      function paintClock(index, animate = true, initialRoll = false) {
        const line = clockLines[index];
        if (!line) return;

        const value = getTime(index);
        const period = line.querySelector("[data-period]");
        const digits = getDigits(line);

        period.textContent = value.period;

        digits.forEach((digit, i) => {
          const next = Number(value.digits[i]);

          if (animate) {
            rollDigit(digit, next, initialRoll ? 1.15 : 0.65, i * 0.04, initialRoll);
          } else {
            digit.value = next;
            digit.column.dataset.value = String(next);
            gsap.set(digit.column, { yPercent: -next * 5 });
          }
        });

        srTime.textContent = `${value.digits.slice(0, 2)}:${value.digits.slice(2)} ` + `${value.period} in ${CITIES[index].name}`;

        srTime.dateTime = new Date().toISOString();
      }

      function updateSubline(index) {
        const status = officeStatus(index);

        const name = document.createElement("span");
        name.textContent = CITIES[index].name;

        const state = document.createElement("span");
        state.className = status.open ? styles["is-open"] : "";
        state.textContent = `${status.offset}  ${status.open ? "Office open" : "After hours"}`;

        [subName, subState].forEach((slot, i) => {
          const next = i === 0 ? name : state;
          const old = slot.firstElementChild;

          slot.appendChild(next);

          if (old) {
            if (REDUCED) {
              old.remove();
            } else {
              gsap.to(old, {
                yPercent: -100,
                opacity: 0,
                duration: 0.3,
                onComplete: () => old.remove(),
              });
            }
          }

          if (!REDUCED) {
            gsap.fromTo(
              next,
              { yPercent: 100, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.55,
                delay: 0.08 + i * 0.04,
                ease,
              },
            );
          }
        });
      }

      function clockHeight() {
        return reel.parentElement.clientHeight;
      }

      function positionPill(index, animate = true) {
        const button = cityButtons[index];
        if (!button) return;

        const x = button.offsetLeft;
        const width = button.offsetWidth;

        if (!animate || REDUCED) {
          gsap.set(pill, { x, width });
        } else {
          gsap.to(pill, {
            x,
            width,
            duration: 0.65,
            ease,
            overwrite: "auto",
          });
        }
      }

      function updateDial() {
        const date = new Date();
        const parts = formatters[current].parts.formatToParts(date);

        const hour = Number(parts.find((p) => p.type === "hour")?.value || 0) % 24;

        const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);

        const second = date.getSeconds() + date.getMilliseconds() / 1000;

        const hourAngle = ((hour % 12) + minute / 60 + second / 3600) * 30;

        const minuteAngle = (minute + second / 60) * 6;
        const secondAngle = second * 6;

        root.querySelector(`.${styles["dial__hour"]}`)?.setAttribute("transform", `rotate(${hourAngle} 50 50)`);

        root.querySelector(`.${styles["dial__min"]}`)?.setAttribute("transform", `rotate(${minuteAngle} 50 50)`);

        root.querySelector(`.${styles["dial__sec"]}`)?.setAttribute("transform", `rotate(${secondAngle} 50 50)`);
      }

      function selectCity(index, animate = true, initialRoll = false) {
        current = (index + CITIES.length) % CITIES.length;

        cityButtons.forEach((button, i) => {
          const selected = i === current;

          button.classList.toggle(styles["is-on"], selected);
          button.setAttribute("aria-pressed", String(selected));
        });

        positionPill(current, animate);
        paintClock(current, animate, initialRoll);
        updateSubline(current);

        if (animate && !REDUCED) {
          gsap.to(reel, {
            y: -current * clockHeight(),
            duration: 0.65,
            ease,
            overwrite: "auto",
          });
        } else {
          gsap.set(reel, { y: -current * clockHeight() });
        }

        updateDial();
      }

      // Build the analog dial tick marks.
      const ticks = root.querySelector("[data-dial-ticks]");

      for (let i = 0; i < 60; i += 5) {
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");

        const major = i % 15 === 0;

        tick.setAttribute("x1", "50");
        tick.setAttribute("x2", "50");
        tick.setAttribute("y1", "7");
        tick.setAttribute("y2", major ? "14" : "11");
        tick.setAttribute("transform", `rotate(${i * 6} 50 50)`);

        if (major) tick.setAttribute("class", styles.major);

        ticks.appendChild(tick);
      }

      // Refresh the selected clock every second.
      function tick() {
        paintClock(current, true);
        updateDial();
      }

      // Pointer-driven edge lighting.
      const light = { x: 22, y: 0, amount: 0.55 };

      function paintLight() {
        card.style.setProperty("--lx", `${light.x}%`);
        card.style.setProperty("--ly", `${light.y}%`);
        card.style.setProperty("--lit", light.amount);
      }

      function handlePointerMove(event) {
        const rect = card.getBoundingClientRect();

        gsap.to(light, {
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
          amount: 1,
          duration: REDUCED ? 0 : 0.45,
          ease,
          onUpdate: paintLight,
          overwrite: "auto",
        });
      }

      function handlePointerLeave() {
        gsap.to(light, {
          x: 22,
          y: 0,
          amount: 0.55,
          duration: REDUCED ? 0 : 0.9,
          ease,
          onUpdate: paintLight,
          overwrite: "auto",
        });
      }

      card.addEventListener("pointermove", handlePointerMove);
      card.addEventListener("pointerleave", handlePointerLeave);

      // Initialize all clocks before animating the selected one.
      clockLines.forEach((line, index) => {
        paintClock(index, false);
      });

      selectCity(0, true, true);
      paintLight();

      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: REDUCED ? 0 : 0.9,
        ease,
      });

      secondTimer = window.setInterval(tick, 1000);

      resizeHandler = () => {
        positionPill(current, false);
        gsap.set(reel, { y: -current * clockHeight() });
      };

      window.addEventListener("resize", resizeHandler);

      cityButtons.forEach((button, index) => {
        const handler = () => selectCity(index);

        button.addEventListener("click", handler);
        cityClickHandlers.push({ button, handler });
      });

      // Wait for fonts before positioning the city selector.
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!destroyed) positionPill(current, false);
        });
      }

      teardown = () => {
        destroyed = true;

        window.clearInterval(secondTimer);
        window.removeEventListener("resize", resizeHandler);

        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerleave", handlePointerLeave);

        cityClickHandlers.forEach(({ button, handler }) => {
          button.removeEventListener("click", handler);
        });
      };
    }, root);

    return () => {
      teardown();
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
        ref={cardRef}
        aria-label='Halden Row offices'
      >
        <span
          className={styles["card__rim"]}
          aria-hidden='true'
        />
        <span
          className={styles["card__shine"]}
          aria-hidden='true'
        />

        <header className={styles["card__head"]}>
          <span className={styles.brand}>
            <svg
              className={styles["brand__mark"]}
              viewBox='0 0 22 22'
              aria-hidden='true'
            >
              <rect
                x='.75'
                y='.75'
                width='20.5'
                height='20.5'
                rx='6'
              />
              <path d='M7.4 6.2v9.6M14.6 6.2v9.6M7.4 11h7.2' />
            </svg>
            <span>Halden Row</span>
          </span>

          <span className={styles.tag}>Executive search</span>
        </header>

        <section
          className={styles.clock}
          aria-label='Local time in our offices'
        >
          <p className={styles["clock__label"]}>Local time in our offices</p>

          <div className={styles["clock__row"]}>
            <div
              className={styles["clock__window"]}
              aria-hidden='true'
            >
              <div
                className={styles["clock__reel"]}
                ref={reelRef}
              >
                {CITIES.map((city, index) => (
                  <div
                    className={styles["clock__line"]}
                    data-clock-line
                    key={city.code}
                  >
                    <span className={styles["line__time"]}>
                      {["0", "0", "0", "0"].map((_, digitIndex) => (
                        <span key={digitIndex}>
                          {digitIndex === 2 && <span className={styles.colon}>:</span>}
                          <OdometerDigit initial={0} />
                        </span>
                      ))}
                    </span>

                    <span className={styles["line__side"]}>
                      <span
                        className={styles["line__ampm"]}
                        data-period
                      />
                      <span>{city.code}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <svg
              className={styles.dial}
              viewBox='0 0 100 100'
              aria-hidden='true'
            >
              <circle
                className={styles["dial__face"]}
                cx='50'
                cy='50'
                r='47'
              />
              <g
                data-dial-ticks
                className={styles["dial__ticks"]}
              />
              <line
                className={styles["dial__hour"]}
                x1='50'
                y1='54'
                x2='50'
                y2='29'
              />
              <line
                className={styles["dial__min"]}
                x1='50'
                y1='56'
                x2='50'
                y2='15'
              />
              <line
                className={styles["dial__sec"]}
                x1='50'
                y1='60'
                x2='50'
                y2='11'
              />
              <circle
                className={styles["dial__hub"]}
                cx='50'
                cy='50'
                r='2.4'
              />
            </svg>
          </div>

          <div className={styles["clock__sub"]}>
            <span
              className={styles["sub__name"]}
              ref={subNameRef}
            />
            <span
              className={styles["sub__state"]}
              ref={subStateRef}
            />
          </div>

          <time
            className={styles.sr}
            aria-live='polite'
            ref={srTimeRef}
          />
        </section>

        <nav
          className={styles.cities}
          aria-label='Choose an office'
        >
          <span
            className={styles["cities__pill"]}
            ref={pillRef}
            aria-hidden='true'
          />

          {CITIES.map((city, index) => (
            <button
              className={styles.city}
              data-city
              type='button'
              aria-pressed={index === 0}
              key={city.code}
            >
              {city.name}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
