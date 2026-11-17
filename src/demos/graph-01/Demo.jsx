/* src/demos/graph-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const ACCENT = "#0f766e";
const DRAW_TIME = 0.55;
const OVERSHOOT = 1.8;
const LIFT = 4.5;
const DIM = 0.24;
const THREAD_TIME = 0.6;
const ROLL_TIME = 0.7;

const DATA = [
  { name: "Housing", amt: 1450 },
  { name: "Groceries", amt: 612 },
  { name: "Shopping", amt: 442 },
  { name: "Transport", amt: 384 },
  { name: "Dining out", amt: 296 },
];

const TOTAL = DATA.reduce((sum, item) => sum + item.amt, 0);
const BUDGET = 4200;

const GAP = 2.2;
const R = 70;
const RT = 86;

const fmt = (n) => n.toLocaleString("en-US");

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a, b, t) =>
  "#" +
  a
    .map((v, i) =>
      Math.round(v + (b[i] - v) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const base = hex(ACCENT);

const TONES = [mix(base, [6, 30, 28], 0.34), ACCENT, mix(base, [255, 255, 255], 0.28), mix(base, [255, 255, 255], 0.48), mix(base, [255, 255, 255], 0.66)];

const DARK = TONES.map((tone) => mix(hex(tone), [14, 22, 24], DIM));

const rad = (a) => (a * Math.PI) / 180;

const pt = (r, a) => [100 + r * Math.sin(rad(a)), 100 - r * Math.cos(rad(a))];

const arc = (r, a0, a1) => {
  if (a1 - a0 < 0.01) {
    a1 = a0 + 0.01;
  }

  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);

  return `M${x0.toFixed(3)} ${y0.toFixed(3)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`;
};

const radial = (r0, r1, a) => {
  const [x0, y0] = pt(r0, a);
  const [x1, y1] = pt(r1, a);

  return `M${x0.toFixed(3)} ${y0.toFixed(3)}L${x1.toFixed(3)} ${y1.toFixed(3)}`;
};

let angle = 0;

const SLICES = DATA.map((item, i) => {
  const span = (item.amt / TOTAL) * 360;
  const a0 = angle + GAP / 2;
  const a1 = angle + span - GAP / 2;
  const mid = angle + span / 2;

  angle += span;

  return {
    ...item,
    i,
    a0,
    a1,
    mid,
    ux: Math.sin(rad(mid)),
    uy: -Math.cos(rad(mid)),
  };
});

const TICKS = Array.from({ length: 72 }, (_, k) => {
  const a = k * 5;
  const long = k % 6 === 0;

  return {
    a,
    long,
    rest: long ? 0.2 : 0.11,
    d: radial(long ? 89.2 : 89.8, 92.4, a),
  };
});

const ROLL_SLOTS = ["d", ",", "d", "d", "d"];

export default function Demo() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const card = root.querySelector("[data-card]");
      const svg = root.querySelector("[data-donut] svg");

      const ticks = [...root.querySelectorAll("[data-tick]")];
      const shades = [...root.querySelectorAll("[data-shade]")];
      const paints = [...root.querySelectorAll("[data-paint]")];
      const hits = [...root.querySelectorAll("[data-hit]")];
      const groups = [...root.querySelectorAll("[data-slice]")];

      const thread = root.querySelector("[data-thread]");
      const arcEl = root.querySelector("[data-arc]");
      const endA = root.querySelector("[data-end-a]");
      const endB = root.querySelector("[data-end-b]");
      const caret = root.querySelector("[data-caret]");
      const caretPath = caret.querySelector("path");

      const labelEl = root.querySelector("[data-label]");
      const noteEl = root.querySelector("[data-note]");
      const rollEl = root.querySelector("[data-roll]");
      const legendRows = [...root.querySelectorAll("[data-row]")];
      const live = root.querySelector("[data-live]");

      const rows = legendRows.map((li, i) => ({
        li,
        fill: li.querySelector("[data-fill]"),
        wash: li.querySelector("[data-wash]"),
        name: li.querySelector("[data-name]"),
        bar: li.querySelector("[data-bar]"),
        share: DATA[i].amt / DATA[0].amt,
      }));

      const rollSlots = [...rollEl.querySelectorAll("[data-roll-slot]")].map((slot) => ({
        slot,
        comma: slot.classList.contains(styles.roll__slotComma),
        strip: slot.querySelector("[data-roll-strip]"),
      }));

      let slotW = {
        d: 0.6,
        c: 0.3,
      };

      const measureSlots = () => {
        const fs = parseFloat(getComputedStyle(rollEl).fontSize) || 1;
        const sd = rollSlots[2]?.slot.getBoundingClientRect().width;

        if (sd > 0) {
          slotW.d = sd / fs;
        }
      };

      let wide = true;

      const rollTo = (n, instant = false) => {
        const s = String(Math.round(n)).padStart(4, "0");
        const big = n >= 1000;
        const digits = [s[0], s[1], s[2], s[3]];

        let k = 0;

        rollSlots.forEach((sl) => {
          if (sl.comma || !sl.strip) return;

          const v = +digits[k];
          const fromRight = 3 - k;

          k++;

          gsap.to(sl.strip, {
            yPercent: -10 * v,
            duration: instant || REDUCED ? 0 : ROLL_TIME,
            delay: instant || REDUCED ? 0 : fromRight * 0.045,
            ease: "back.out(1.25)",
            overwrite: true,
          });
        });

        if (big !== wide) {
          wide = big;

          const duration = instant || REDUCED ? 0 : 0.42;

          gsap.to(rollSlots[0].slot, {
            width: big ? `${slotW.d}em` : "0em",
            opacity: big ? 1 : 0,
            duration,
            ease: "power3.out",
            overwrite: true,
          });

          gsap.to(rollSlots[1].slot, {
            width: big ? `${slotW.c}em` : "0em",
            opacity: big ? 1 : 0,
            duration,
            ease: "power3.out",
            overwrite: true,
          });
        }
      };

      const swapText = (el, text) => {
        if (el.textContent === text) return;

        gsap.killTweensOf(el);

        if (REDUCED) {
          gsap
            .timeline()
            .to(el, {
              opacity: 0,
              duration: 0.12,
            })
            .add(() => {
              el.textContent = text;
            })
            .to(el, {
              opacity: 1,
              duration: 0.2,
            });

          return;
        }

        gsap
          .timeline()
          .to(el, {
            opacity: 0,
            y: -4,
            filter: "blur(2px)",
            duration: 0.13,
            ease: "power2.in",
          })
          .add(() => {
            el.textContent = text;
          })
          .fromTo(
            el,
            {
              y: 5,
              opacity: 0,
              filter: "blur(2px)",
            },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.34,
              ease: "power3.out",
            },
          );
      };

      const T = {
        a: 0,
        b: 0,
        o: 0,
      };

      const inSpan = (t, a, b) => {
        const w = b - a;

        if (w <= 0.05) return false;

        const d = (((t - a) % 360) + 360) % 360;

        return d <= w;
      };

      const drawThread = () => {
        arcEl.setAttribute("d", arc(RT, T.a, Math.max(T.a + 0.01, T.b)));

        endA.setAttribute("d", radial(RT - 2.4, RT + 2.4, T.a));
        endB.setAttribute("d", radial(RT - 2.4, RT + 2.4, T.b));

        caret.setAttribute("transform", `rotate(${((T.a + T.b) / 2).toFixed(3)} 100 100)`);

        thread.style.opacity = T.o;

        TICKS.forEach((tick, i) => {
          const want = T.o > 0.01 && inSpan(tick.a, T.a - 1, T.b + 1) ? 1 : 0;

          const el = ticks[i];

          if (want !== el.dataset.on * 1) {
            el.dataset.on = String(want);

            gsap.to(el, {
              opacity: want ? 0.62 : tick.rest,
              duration: want ? 0.18 : 0.5,
              ease: "power2.out",
              overwrite: true,
            });
          }
        });
      };

      ticks.forEach((tick) => {
        gsap.set(tick, { opacity: 0 });
        tick.dataset.on = "0";
      });

      let threadTl = null;

      const nod = () => {
        if (REDUCED) return;

        gsap
          .timeline()
          .to(caretPath, {
            y: 1.3,
            duration: 0.1,
            ease: "power2.in",
            overwrite: true,
          })
          .to(caretPath, {
            y: 0,
            duration: 0.55,
            ease: "elastic.out(1, 0.45)",
          });
      };

      const threadTo = (s) => {
        if (threadTl) {
          threadTl.kill();
        }

        if (!s) {
          const m = (T.a + T.b) / 2;

          threadTl = gsap.timeline({
            onUpdate: drawThread,
          });

          threadTl
            .to(
              T,
              {
                a: m,
                b: m,
                duration: REDUCED ? 0 : 0.38,
                ease: "power3.in",
              },
              0,
            )
            .to(
              T,
              {
                o: 0,
                duration: REDUCED ? 0.2 : 0.3,
                ease: "power1.in",
              },
              REDUCED ? 0 : 0.12,
            );

          return;
        }

        const tA = s.a0 + 0.4;
        const tB = s.a1 - 0.4;
        const m = (tA + tB) / 2;

        if (T.o < 0.05) {
          T.a = m;
          T.b = m;

          threadTl = gsap.timeline({
            onUpdate: drawThread,
          });

          if (REDUCED) {
            Object.assign(T, {
              a: tA,
              b: tB,
            });

            threadTl.to(T, {
              o: 1,
              duration: 0.25,
            });
          } else {
            threadTl
              .to(
                T,
                {
                  o: 1,
                  duration: 0.2,
                  ease: "power1.out",
                },
                0,
              )
              .to(
                T,
                {
                  a: tA,
                  b: tB,
                  duration: THREAD_TIME * 0.9,
                  ease: "back.out(1.5)",
                },
                0,
              )
              .add(nod, THREAD_TIME * 0.5);
          }

          return;
        }

        const c = (T.a + T.b) / 2;
        const k = Math.floor(c / 360) * 360;

        T.a -= k;
        T.b -= k;

        const cc = c - k;
        let shift = 0;

        while (m + shift - cc > 180) shift -= 360;
        while (m + shift - cc < -180) shift += 360;

        const goA = tA + shift;
        const goB = tB + shift;
        const forward = m + shift > cc;

        threadTl = gsap.timeline({
          onUpdate: drawThread,
        });

        if (REDUCED) {
          threadTl
            .to(T, {
              o: 0,
              duration: 0.12,
            })
            .add(() => {
              T.a = goA;
              T.b = goB;
            })
            .to(T, {
              o: 1,
              duration: 0.2,
            });

          return;
        }

        T.o = 1;

        const lead = forward ? "b" : "a";
        const trail = forward ? "a" : "b";

        const to = {
          a: goA,
          b: goB,
        };

        threadTl
          .to(
            T,
            {
              [lead]: to[lead],
              duration: THREAD_TIME * 0.7,
              ease: "back.out(1.15)",
            },
            0,
          )
          .to(
            T,
            {
              [trail]: to[trail],
              duration: THREAD_TIME,
              ease: "back.out(1.7)",
            },
            THREAD_TIME * 0.08,
          )
          .add(nod, THREAD_TIME * 0.62);
      };

      let cur = -2;

      const focus = (j) => {
        if (j === cur) return;

        cur = j;

        SLICES.forEach((s, i) => {
          const on = i === j;
          const dimmed = j >= 0 && !on;

          gsap.to(paints[i], {
            stroke: dimmed ? DARK[i] : TONES[i],
            opacity: dimmed ? 0.9 : 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });

          if (!REDUCED) {
            gsap.to(groups[i], {
              x: on ? s.ux * LIFT : 0,
              y: on ? s.uy * LIFT : 0,
              duration: on ? 0.6 : 0.45,
              ease: on ? "back.out(2.2)" : "power3.out",
              overwrite: "auto",
            });
          }

          gsap.to(shades[i], {
            opacity: on && !REDUCED ? 0.34 : 0,
            duration: on ? 0.5 : 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        rows.forEach((r, i) => {
          const on = i === j;

          gsap.to(r.li, {
            opacity: j >= 0 && !on ? 0.42 : 1,
            x: on && !REDUCED ? 3 : 0,
            duration: 0.4,
            ease: on ? "back.out(2)" : "power3.out",
            overwrite: "auto",
          });

          gsap.to(r.wash, {
            opacity: on ? 1 : 0,
            duration: 0.3,
            overwrite: true,
          });

          gsap.to(r.name, {
            fontVariationSettings: on ? "'wdth' 106" : "'wdth' 100",
            fontWeight: on ? 640 : 500,
            duration: 0.35,
            overwrite: true,
          });

          if (!REDUCED) {
            gsap.to(r.bar, {
              scaleY: on ? 1.65 : 1,
              duration: 0.45,
              ease: on ? "back.out(2.5)" : "power2.out",
              overwrite: "auto",
            });
          }
        });

        threadTo(j >= 0 ? SLICES[j] : null);

        if (j >= 0) {
          const d = DATA[j];
          const pct = ((d.amt / TOTAL) * 100).toFixed(1);

          swapText(labelEl, d.name);
          swapText(noteEl, `${pct}% of spent`);
          rollTo(d.amt);

          live.textContent = `${d.name}: $${fmt(d.amt)}, ${pct}% of spent`;
        } else {
          swapText(labelEl, "Spent");
          swapText(noteEl, `of $${fmt(BUDGET)}`);
          rollTo(TOTAL);

          live.textContent = `Spent $${fmt(TOTAL)} of $${fmt(BUDGET)}`;
        }
      };

      const pulse = (j) => {
        if (REDUCED || j < 0) return;

        const s = SLICES[j];

        gsap
          .timeline()
          .to(groups[j], {
            x: s.ux * (LIFT + 2.6),
            y: s.uy * (LIFT + 2.6),
            duration: 0.12,
            ease: "power2.out",
            overwrite: "auto",
          })
          .to(groups[j], {
            x: s.ux * LIFT,
            y: s.uy * LIFT,
            duration: 0.7,
            ease: "elastic.out(1, 0.4)",
          });

        gsap.fromTo(
          rollEl.parentNode,
          { scale: 0.965 },
          {
            scale: 1,
            duration: 0.55,
            ease: "back.out(3)",
            overwrite: true,
          },
        );
      };

      let clearCall = null;

      const hold = () => {
        if (clearCall) {
          clearCall.kill();
          clearCall = null;
        }
      };

      const letGo = () => {
        hold();

        clearCall = gsap.delayedCall(0.08, () => {
          focus(-1);
        });
      };

      const enter = (i) => (e) => {
        if (e.pointerType === "touch") return;

        hold();
        focus(i);
      };

      const leave = (e) => {
        if (e.pointerType === "touch") return;

        letGo();
      };

      const down = (i) => () => {
        hold();
        focus(i);
        pulse(i);
      };

      const removeListeners = [];

      const listen = (el, event, handler) => {
        el.addEventListener(event, handler);
        removeListeners.push(() => {
          el.removeEventListener(event, handler);
        });
      };

      SLICES.forEach((s, i) => {
        listen(hits[i], "pointerenter", enter(i));
        listen(hits[i], "pointerleave", leave);
        listen(hits[i], "pointerdown", down(i));
      });

      rows.forEach((r, i) => {
        listen(r.li, "pointerenter", enter(i));
        listen(r.li, "pointerleave", leave);
        listen(r.li, "pointerdown", down(i));

        listen(r.li, "focus", () => {
          hold();
          focus(i);
        });

        listen(r.li, "blur", letGo);

        listen(r.li, "keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            rows[(i + 1) % rows.length].li.focus();
          }

          if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            rows[(i + rows.length - 1) % rows.length].li.focus();
          }

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pulse(i);
          }
        });
      });

      const outsidePointerDown = (e) => {
        if (e.pointerType !== "touch") return;
        if (e.target.closest(".slice__hit, .row")) return;

        hold();
        focus(-1);
      };

      listen(document, "pointerdown", outsidePointerDown);

      const start = () => {
        measureSlots();

        rollSlots.forEach((sl) => {
          if (sl.strip) {
            gsap.set(sl.strip, { yPercent: 0 });
          }
        });

        gsap.set(rollSlots[0].slot, {
          width: `${slotW.d}em`,
        });

        live.textContent = `Spent $${fmt(TOTAL)} of $${fmt(BUDGET)}`;

        cur = -1;

        if (REDUCED) {
          SLICES.forEach((s, i) => {
            gsap.set(paints[i], {
              attr: { d: arc(R, s.a0, s.a1) },
            });
          });

          TICKS.forEach((tick, i) => {
            gsap.set(ticks[i], {
              opacity: tick.rest,
            });
          });

          rows.forEach((r) => {
            gsap.set(r.fill, {
              scaleX: r.share,
            });
          });

          rollTo(TOTAL, true);

          gsap.to(card, {
            opacity: 1,
            duration: 0.6,
          });

          return;
        }

        rows.forEach((r) => {
          gsap.set(r.fill, { scaleX: 0 });
        });

        const tl = gsap.timeline({
          delay: 0.2,
        });

        tl.fromTo(
          card,
          {
            opacity: 0,
            y: 14,
            scale: 0.985,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
          },
          0,
        );

        tl.from(
          [root.querySelector(".card__brand"), root.querySelector(".card__chip")],
          {
            opacity: 0,
            y: 6,
            duration: 0.5,
            stagger: 0.07,
            ease: "power2.out",
          },
          0.15,
        );

        tl.to(
          ticks,
          {
            opacity: (k) => TICKS[k].rest,
            duration: 0.3,
            stagger: 0.008,
            ease: "power1.out",
          },
          0.3,
        );

        tl.from(
          root.querySelector(".donut__bed"),
          {
            opacity: 0,
            duration: 0.5,
          },
          0.3,
        );

        SLICES.forEach((s, i) => {
          const t0 = 0.5 + i * DRAW_TIME * 0.62;

          tl.fromTo(
            paints[i],
            {
              attr: { d: arc(R, s.a0, s.a0 + 0.01) },
            },
            {
              attr: { d: arc(R, s.a0, s.a1 + OVERSHOOT) },
              duration: DRAW_TIME,
              ease: "power2.out",
            },
            t0,
          );

          tl.to(
            paints[i],
            {
              attr: { d: arc(R, s.a0, s.a1) },
              duration: 0.38,
              ease: "sine.inOut",
            },
            t0 + DRAW_TIME,
          );
        });

        tl.add(() => {
          rollTo(TOTAL);
        }, 0.7);

        tl.from(
          [labelEl, noteEl],
          {
            opacity: 0,
            y: 4,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          0.6,
        );

        tl.from(
          rows.map((r) => r.li),
          {
            opacity: 0,
            x: 8,
            duration: 0.5,
            stagger: 0.07,
            ease: "power3.out",
          },
          0.55,
        );

        rows.forEach((r, i) => {
          tl.to(
            r.fill,
            {
              scaleX: r.share,
              duration: 0.8,
              ease: "back.out(1.4)",
            },
            0.75 + i * 0.07,
          );
        });

        tl.from(
          root.querySelector(".card__foot"),
          {
            opacity: 0,
            y: 4,
            duration: 0.5,
            ease: "power2.out",
          },
          1.5,
        );

        const end = 0.5 + (SLICES.length - 1) * DRAW_TIME * 0.62 + DRAW_TIME + 0.3;

        tl.to(
          svg,
          {
            scale: 1.014,
            duration: 0.18,
            ease: "power2.out",
            transformOrigin: "50% 50%",
          },
          end,
        ).to(
          svg,
          {
            scale: 1,
            duration: 0.7,
            ease: "elastic.out(1, 0.5)",
          },
          end + 0.18,
        );
      };

      let cancelled = false;

      const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

      fontReady.then(() => {
        if (!cancelled) start();
      });

      const onResize = () => measureSlots();

      window.addEventListener("resize", onResize);

      removeListeners.push(() => {
        window.removeEventListener("resize", onResize);
      });

      return () => {
        cancelled = true;
        removeListeners.forEach((remove) => remove());

        if (clearCall) {
          clearCall.kill();
        }
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={styles.stage}
      ref={rootRef}
    >
      <section
        className={styles.card}
        data-card
        aria-label='Orra, October budget'
      >
        <header className={styles.card__head}>
          <div className='card__brand'>
            <span
              className={styles.card__mark}
              aria-hidden='true'
            >
              <svg viewBox='0 0 24 24'>
                <path d='M5 17.5 12 4l7 13.5' />
                <path d='M8.2 12.5h7.6' />
              </svg>
            </span>

            <span className={styles.card__identity}>
              <span className={styles.card__name}>orra</span>
              <span className={styles.card__sub}>PERSONAL FINANCE</span>
            </span>
          </div>

          <span className='card__chip'>OCTOBER · 2026</span>
        </header>

        <div className={styles.card__body}>
          <div
            className={styles.donut}
            data-donut
          >
            <svg
              className={styles.donut__svg}
              viewBox='0 0 200 200'
              role='img'
              aria-label='Donut chart showing spending by category'
            >
              <defs>
                <filter
                  id='graph01-shadow'
                  x='-30%'
                  y='-30%'
                  width='160%'
                  height='160%'
                >
                  <feGaussianBlur stdDeviation='2.5' />
                </filter>
              </defs>

              <path
                className={styles.donut__bed}
                d={arc(R, 0, 359.99)}
                fill='none'
              />

              <circle
                className={styles.donut__gloss}
                cx='100'
                cy='100'
                r='70'
                fill='none'
              />

              <g data-ticks>
                {TICKS.map((tick, i) => (
                  <path
                    key={tick.a}
                    className={styles.tick}
                    data-tick
                    data-on='0'
                    d={tick.d}
                  />
                ))}
              </g>

              <g data-shadows>
                {SLICES.map((slice) => (
                  <path
                    key={slice.name}
                    className={styles.slice__shade}
                    data-shade
                    d={arc(R, slice.a0, slice.a1)}
                    style={{
                      stroke: mix(hex(TONES[slice.i]), [10, 20, 20], 0.55),
                    }}
                  />
                ))}
              </g>

              <g data-slices>
                {SLICES.map((slice) => (
                  <g
                    key={slice.name}
                    className={styles.slice}
                    data-slice
                  >
                    <path
                      className={styles.slice__paint}
                      data-paint
                      d={arc(R, slice.a0, slice.a0 + 0.01)}
                      style={{ stroke: TONES[slice.i] }}
                    />

                    <path
                      className={styles.slice__hit}
                      data-hit
                      d={arc(R, slice.a0, slice.a1)}
                    />
                  </g>
                ))}
              </g>

              <g
                className={styles.thread}
                data-thread
              >
                <path
                  className={styles.thread__arc}
                  data-arc
                  d={arc(RT, 0, 0.01)}
                />
                <path
                  className={styles.thread__end}
                  data-end-a
                  d={radial(RT - 2.4, RT + 2.4, 0)}
                />
                <path
                  className={styles.thread__end}
                  data-end-b
                  d={radial(RT - 2.4, RT + 2.4, 0)}
                />
                <g
                  className={styles.thread__caret}
                  data-caret
                >
                  <path d='M96.5 8.5 100 4.5l3.5 4' />
                </g>
              </g>
            </svg>

            <div className={styles.donut__inner}>
              <span
                className={styles.center__label}
                data-label
              >
                Spent
              </span>

              <span className={styles.center__amount}>
                <span
                  className={styles.roll}
                  data-roll
                >
                  {ROLL_SLOTS.map((kind, i) => (
                    <span
                      key={i}
                      className={[styles.roll__slot, kind === "," ? styles.roll__slotComma : ""].join(" ")}
                    >
                      {kind === "," ? (
                        ","
                      ) : (
                        <span className={styles.roll__strip}>
                          {Array.from({ length: 10 }, (_, n) => (
                            <span key={n}>{n}</span>
                          ))}
                        </span>
                      )}
                    </span>
                  ))}
                </span>
              </span>

              <span
                className={styles.center__note}
                data-note
              >
                of $4,200
              </span>
            </div>
          </div>

          <ul
            className={styles.legend}
            data-legend
          >
            {DATA.map((item, i) => (
              <li
                key={item.name}
                className={styles.row}
                data-row
                tabIndex={0}
                aria-label={`${item.name}, $${fmt(item.amt)}, ${((item.amt / TOTAL) * 100).toFixed(1)}% of spent`}
              >
                <span className={styles.row__wash} />
                <span className={styles.row__top}>
                  <span className={styles.row__name}>{item.name}</span>
                  <span className={styles.row__amt}>${fmt(item.amt)}</span>
                </span>
                <span className={styles.row__bar}>
                  <span
                    className={styles.row__fill}
                    style={{ background: TONES[i] }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className={styles.card__foot}>
          <span>MONTHLY SPENDING</span>
          <span>
            <i />
            WITHIN BUDGET
          </span>
        </footer>
      </section>

      <span
        className={styles.srOnly}
        data-live
        aria-live='polite'
      >
        Spent $3,184 of $4,200
      </span>
    </div>
  );
}
