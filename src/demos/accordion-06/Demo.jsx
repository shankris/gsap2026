/* src/demos/accordion-06/Demo.jsx */

"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP);
gsap.defaults({ autoRound: false });

const NOTCH_DEPTH = 20;
const NOTCH_SIZE = 0.3;
const NOTCH_MARGIN = 0.12;
const NOTCH_RADIUS = 20;
const NOTCH_SLOPE = 0.7;
const FOLLOW = 6;
const RISE = 30;
const STAGGER = 0.12;

export default function Accordion06() {
  const root = useRef(null);
  const instanceId = useId().replace(/:/g, "");

  useGSAP(
    () => {
      const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const container = root.current;
      if (!container) return;

      const q = (selector, scope = container) => scope.querySelector(selector);

      const qa = (selector, scope = container) => Array.from(scope.querySelectorAll(selector));

      const yos = q("[data-yos]");
      const track = q("[data-track]");
      const probeC = q("[data-probe-c]");
      const probeE = q("[data-probe-e]");

      const cards = qa("[data-card]").map((el, i) => ({
        el,
        i,
        surface: q("[data-surface]", el),
        rim: q("[data-rim] path", el),
        rimSvg: q("[data-rim]", el),
        mark: q("[data-mark]", el),
        face: q("[data-face-expanded]", el),
        rises: qa("[data-rise]", el),
        notch: {
          off: 0,
          pos: 0.5,
          goal: 0.5,
          hover: false,
        },
        last: "",
      }));

      const N = cards.length;

      const lerp = (a, b, t) => a + (b - a) * t;
      const clamp = (a, b, v) => Math.max(a, Math.min(b, v));

      container.style.setProperty("--open-time", "0.6s");

      /* ------------------------------------------------------------
         Rim gradients
      ------------------------------------------------------------ */

      cards.forEach((card, i) => {
        const ns = "http://www.w3.org/2000/svg";
        const defs = document.createElementNS(ns, "defs");
        const gradient = document.createElementNS(ns, "linearGradient");

        gradient.id = `${instanceId}-rim-${i}`;
        gradient.setAttribute("x1", "0");
        gradient.setAttribute("y1", "0");
        gradient.setAttribute("x2", "0.35");
        gradient.setAttribute("y2", "1");

        [
          ["0", "var(--rim-a)"],
          ["0.45", "var(--rim-b)"],
          ["1", "var(--rim-b)"],
        ].forEach(([offset, color]) => {
          const stop = document.createElementNS(ns, "stop");
          stop.setAttribute("offset", offset);
          stop.style.stopColor = color;
          gradient.appendChild(stop);
        });

        defs.appendChild(gradient);
        card.rimSvg.insertBefore(defs, card.rim);
        card.rim.setAttribute("stroke", `url(#${instanceId}-rim-${i})`);
      });

      /* ------------------------------------------------------------
         Rounded notch shape
      ------------------------------------------------------------ */

      function rounded(points) {
        const count = points.length;
        const corners = [];

        for (let k = 0; k < count; k++) {
          const point = points[k];
          const previous = points[(k + count - 1) % count];
          const next = points[(k + 1) % count];

          let ax = previous.x - point.x;
          let ay = previous.y - point.y;
          let bx = next.x - point.x;
          let by = next.y - point.y;

          const la = Math.hypot(ax, ay);
          const lb = Math.hypot(bx, by);

          ax /= la;
          ay /= la;
          bx /= lb;
          by /= lb;

          const angle = Math.acos(clamp(-1, 1, ax * bx + ay * by));

          if (angle > 3.13) {
            corners.push({
              a: point,
              b: point,
              r: 0,
              s: 0,
            });
            continue;
          }

          let distance = point.r / Math.tan(angle / 2);
          distance = Math.min(distance, la / 2, lb / 2);

          const radius = distance * Math.tan(angle / 2);
          const cross = -(ax * by - ay * bx);

          corners.push({
            a: {
              x: point.x + ax * distance,
              y: point.y + ay * distance,
            },
            b: {
              x: point.x + bx * distance,
              y: point.y + by * distance,
            },
            r: radius,
            s: cross > 0 ? 1 : 0,
          });
        }

        const format = (value) => value.toFixed(2);

        let path = "M" + format(corners[0].b.x) + " " + format(corners[0].b.y);

        for (let k = 1; k <= count; k++) {
          const corner = corners[k % count];

          path += "L" + format(corner.a.x) + " " + format(corner.a.y);

          if (corner.r > 0.01) {
            path += "A" + format(corner.r) + " " + format(corner.r) + " 0 0 " + corner.s + " " + format(corner.b.x) + " " + format(corner.b.y);
          }
        }

        return path + "Z";
      }

      function shape(width, height, radius, offset, position) {
        const points = [
          { x: 0, y: 0, r: radius },
          { x: width, y: 0, r: radius },
        ];

        if (offset > 0.3) {
          const size = clamp(0.05, 0.9, NOTCH_SIZE);
          const a = height * (position - size / 2);
          const b = height * (position + size / 2);
          const slope = offset * Math.max(0, NOTCH_SLOPE);
          const notchRadius = Math.max(0, NOTCH_RADIUS) * Math.min(1, offset / 6);

          points.push(
            {
              x: width,
              y: a - slope,
              r: notchRadius,
            },
            {
              x: width - offset,
              y: a + slope,
              r: notchRadius,
            },
            {
              x: width - offset,
              y: b - slope,
              r: notchRadius,
            },
            {
              x: width,
              y: b + slope,
              r: notchRadius,
            },
          );
        }

        points.push({ x: width, y: height, r: radius }, { x: 0, y: height, r: radius });

        return rounded(points);
      }

      /* ------------------------------------------------------------
         Rolling numbers
      ------------------------------------------------------------ */

      qa("[data-roll]").forEach((element) => {
        const value = element.getAttribute("data-roll");
        element.textContent = "";

        for (const character of value) {
          if (/[0-9]/.test(character)) {
            const wrapper = document.createElement("span");
            wrapper.className = styles.roll;

            const column = document.createElement("span");
            column.className = styles.rollCol;

            for (let digit = 0; digit < 10; digit++) {
              const span = document.createElement("span");
              span.textContent = digit;
              column.appendChild(span);
            }

            column.dataset.d = character;
            wrapper.appendChild(column);
            element.appendChild(wrapper);
          } else {
            const span = document.createElement("span");
            span.textContent = character;
            element.appendChild(span);
          }
        }
      });

      function roll(card, delay) {
        const columns = qa(`.${styles.rollCol}`, card.el);

        columns.forEach((column, index) => {
          const digit = Number(column.dataset.d);

          gsap.killTweensOf(column);

          if (REDUCED) {
            gsap.set(column, { yPercent: -10 * digit });
          } else {
            gsap.fromTo(
              column,
              { yPercent: 0 },
              {
                yPercent: -10 * digit,
                duration: 1 + index * 0.12,
                ease: "expo.out",
                delay: delay + index * 0.05,
              },
            );
          }
        });
      }

      /* ------------------------------------------------------------
         Yard map
      ------------------------------------------------------------ */

      const slotsGroup = q("[data-slots]");
      const route = q("[data-route]");
      const pin = q("[data-pin]");
      const tag = q("[data-tag]");

      let goalSlot = null;

      (() => {
        const ns = "http://www.w3.org/2000/svg";
        const full = ["111011101111", "110111111011", "101111011110", "011101110111"];

        ["A", "B", "C", "D"].forEach((letter, row) => {
          const laneY = [6, 32, 70, 96][row];

          const label = document.createElementNS(ns, "text");
          label.setAttribute("x", "-2");
          label.setAttribute("y", String(laneY + 11));
          label.setAttribute("class", styles.laneLabel);
          label.setAttribute("text-anchor", "end");
          label.textContent = letter;
          slotsGroup.appendChild(label);

          for (let k = 0; k < 12; k++) {
            const rect = document.createElementNS(ns, "rect");

            rect.setAttribute("x", String(6 + k * 19.2));
            rect.setAttribute("y", String(laneY));
            rect.setAttribute("width", "15.5");
            rect.setAttribute("height", "20");
            rect.setAttribute("rx", "3");

            let className = styles.slot;

            if (row === 2 && k === 6) {
              className += ` ${styles.goal}`;
              goalSlot = rect;
            } else if (full[row][k] === "1") {
              className += ` ${styles.full}`;
            }

            rect.setAttribute("class", className);
            slotsGroup.appendChild(rect);
          }
        });
      })();

      const gx = 6 + 6 * 19.2 + 7.75;

      route.setAttribute("d", `M-4 61H${(gx - 6).toFixed(1)}Q${gx.toFixed(1)} 61 ${gx.toFixed(1)} 67V72`);

      const routeLength = route.getTotalLength();

      const pinAt = (progress) => {
        const length = routeLength * progress;
        const point = route.getPointAtLength(length);
        const nextPoint = route.getPointAtLength(Math.min(routeLength, length + 0.5));

        const angle = (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180) / Math.PI;

        pin.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(1)})`);
      };

      gsap.set(tag, {
        attr: {
          transform: `translate(${gx.toFixed(1)} 60)`,
        },
      });

      /* ------------------------------------------------------------
         Widget animations
      ------------------------------------------------------------ */

      const scan = q("[data-scan]");
      const scanCheck = q("[data-scan-check]");
      const status = q("[data-status]");
      const statusCheck = q("[data-status-check]");
      const fill = q("[data-fill]");
      const stops = qa("[data-stop]");
      const now = q("[data-now]");
      const blocks = qa(`.${styles.dockLane} i`);

      let liveTimeline = null;

      function swapChip(chip, check, done, at, timeline) {
        const first = q("[data-chip-first]", chip);
        const second = q("[data-chip-second]", chip);

        timeline.add(() => {
          chip.classList.toggle(styles.isDone, done);
        }, at);

        if (REDUCED) {
          timeline
            .to(
              first,
              {
                opacity: done ? 0 : 1,
                duration: 0.25,
              },
              at,
            )
            .to(
              second,
              {
                opacity: done ? 1 : 0,
                duration: 0.25,
              },
              at,
            )
            .set(
              check,
              {
                strokeDashoffset: done ? 0 : 1,
              },
              at,
            );

          return;
        }

        timeline
          .to(
            first,
            {
              opacity: done ? 0 : 1,
              y: done ? -8 : 0,
              duration: 0.3,
              ease: "power2.in",
            },
            at,
          )
          .fromTo(
            second,
            {
              opacity: done ? 0 : 1,
              y: done ? 8 : 0,
            },
            {
              opacity: done ? 1 : 0,
              y: done ? 0 : 8,
              duration: 0.5,
              ease: "back.out(2)",
            },
            at + 0.16,
          )
          .fromTo(
            check,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: done ? 0 : 1,
              duration: 0.4,
              ease: "power2.out",
            },
            at + 0.26,
          )
          .fromTo(
            chip,
            { scale: 1 },
            {
              scale: 1.06,
              duration: 0.12,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            },
            at + 0.2,
          );
      }

      function resetWidgets() {
        if (liveTimeline) liveTimeline.kill();

        gsap.set(q("[data-chip-first]", scan), {
          opacity: 1,
          y: 0,
        });
        gsap.set(q("[data-chip-second]", scan), {
          opacity: 0,
          y: 0,
        });
        gsap.set(scanCheck, { strokeDashoffset: 1 });

        scan.classList.remove(styles.isDone);
        scan.classList.add(styles.isScan);

        gsap.set(q("[data-chip-first]", status), {
          opacity: 1,
          y: 0,
        });
        gsap.set(q("[data-chip-second]", status), {
          opacity: 0,
          y: 0,
        });
        gsap.set(statusCheck, { strokeDashoffset: 1 });

        status.classList.remove(styles.isDone);

        gsap.set(route, { strokeDashoffset: 1 });
        gsap.set(pin, { opacity: 0 });

        pinAt(0);
        goalSlot.classList.remove(styles.isIn);

        gsap.set(tag, {
          opacity: 0,
          scale: 0.8,
          transformOrigin: "50% 50%",
        });

        gsap.set(fill, { scaleX: 0 });

        stops.forEach((stop) => {
          stop.classList.remove(styles.isPast);
        });

        gsap.set(blocks, {
          scaleX: REDUCED ? 1 : 0,
        });

        gsap.set(now, {
          scaleY: REDUCED ? 1 : 0,
        });
      }

      function playWidget(index) {
        resetWidgets();

        const timeline = gsap.timeline();
        liveTimeline = timeline;

        if (index === 0) {
          swapChip(scan, scanCheck, true, 1.5, timeline);

          timeline.add(() => {
            scan.classList.remove(styles.isScan);
          }, 1.5);
        } else if (index === 1) {
          const progress = { value: 0 };

          timeline
            .set(pin, { opacity: 1 }, 0.5)
            .to(
              route,
              {
                strokeDashoffset: 0,
                duration: REDUCED ? 0.01 : 1.3,
                ease: "power2.inOut",
              },
              0.5,
            )
            .to(
              progress,
              {
                value: 1,
                duration: REDUCED ? 0.01 : 1.3,
                ease: "power2.inOut",
                onUpdate: () => pinAt(progress.value),
              },
              0.5,
            )
            .add(() => {
              goalSlot.classList.add(styles.isIn);
            }, 1.8)
            .to(pin, { opacity: 0, duration: 0.2 }, 1.8)
            .to(
              tag,
              REDUCED
                ? {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    duration: 0.55,
                    ease: "back.out(2.4)",
                  },
              1.85,
            );
        } else if (index === 2) {
          if (!REDUCED) {
            timeline
              .to(
                blocks,
                {
                  scaleX: 1,
                  duration: 0.9,
                  ease: "expo.out",
                  stagger: 0.04,
                },
                0.35,
              )
              .to(
                now,
                {
                  scaleY: 1,
                  duration: 0.8,
                  ease: "expo.out",
                },
                0.75,
              );
          }
        } else if (index === 3) {
          const marks = [0, 0.46, 1];

          timeline.to(
            fill,
            {
              scaleX: 1,
              duration: REDUCED ? 0.01 : 1.6,
              ease: "power2.inOut",
              onUpdate() {
                const value = gsap.getProperty(fill, "scaleX");

                stops.forEach((stop, k) => {
                  stop.classList.toggle(styles.isPast, value >= marks[k] - 0.01);
                });
              },
            },
            0.45,
          );

          swapChip(status, statusCheck, true, 2, timeline);
        }
      }

      /* ------------------------------------------------------------
         Opening and centering cards
      ------------------------------------------------------------ */

      let open = -1;
      let scrollTween = null;

      function centreOn(index, instant) {
        const cw = probeC.offsetWidth;
        const ew = probeE.offsetWidth;

        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

        const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;

        const left = padding + index * (cw + gap);
        const total = padding * 2 + (N - 1) * (cw + gap) + ew;

        const max = Math.max(0, total - track.clientWidth);

        const x = clamp(0, max, left + ew / 2 - track.clientWidth / 2);

        if (scrollTween) scrollTween.kill();

        if (instant || REDUCED) {
          track.scrollLeft = x;
          return;
        }

        scrollTween = gsap.to(track, {
          scrollLeft: x,
          duration: 1.1,
          ease: "expo.out",
          delay: 0.08,
        });
      }

      function choose(index, instant = false) {
        index = (index + N) % N;

        if (index === open) return;

        const previous = open;
        open = index;

        const apply = () => {
          cards.forEach((card, k) => {
            const active = k === index;

            card.el.classList.toggle(styles.isOpen, active);
            card.el.setAttribute("aria-expanded", String(active));
            card.face.setAttribute("aria-hidden", String(!active));

            if (active) {
              card.notch.hover = false;

              gsap.to(card.notch, {
                off: 0,
                duration: 0.25,
                overwrite: true,
              });
            }
          });

          const card = cards[index];

          gsap.killTweensOf(card.rises);

          if (REDUCED) {
            gsap.fromTo(
              card.rises,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                stagger: 0.06,
              },
            );
          } else {
            gsap.fromTo(
              card.rises,
              {
                opacity: 0,
                y: RISE,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: STAGGER,
                ease: "expo.out",
                delay: 0.15,
              },
            );
          }

          roll(card, 0.35);
          playWidget(index);
          centreOn(index, instant);
        };

        if (REDUCED && previous >= 0 && !instant) {
          gsap.timeline().to(track, { opacity: 0, duration: 0.2 }).add(apply).to(track, { opacity: 1, duration: 0.35 });
        } else {
          apply();
        }
      }

      /* ------------------------------------------------------------
         Pointer and card interaction
      ------------------------------------------------------------ */

      function press(card) {
        if (REDUCED) return;

        gsap
          .timeline()
          .to(card.el, {
            scale: 0.975,
            duration: 0.1,
            ease: "power2.out",
            overwrite: true,
          })
          .to(card.el, {
            scale: 1,
            duration: 0.7,
            ease: "elastic.out(1.1, 0.45)",
          });
      }

      const pointer = {
        x: -999,
        y: -999,
        on: false,
      };

      let pointerUpCall = null;

      const onPointerMove = (event) => {
        if (event.pointerType !== "mouse" && !event.buttons) {
          return;
        }

        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.on = true;
      };

      const onPointerDown = (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.on = true;

        if (pointerUpCall) pointerUpCall.kill();

        const card = cards.find((item) => item.el.contains(event.target));

        if (card && card.i !== open) {
          press(card);
        }
      };

      const onPointerUp = (event) => {
        if (event.pointerType === "mouse") return;

        if (pointerUpCall) pointerUpCall.kill();

        pointerUpCall = gsap.delayedCall(0.5, () => {
          pointer.on = false;
        });
      };

      const onPointerCancel = (event) => {
        if (event.pointerType !== "mouse") {
          pointer.on = false;
        }
      };

      const onPointerLeave = () => {
        pointer.on = false;
      };

      const onCardClick = (event) => {
        const card = cards.find((item) => item.el === event.currentTarget);

        if (card) choose(card.i);
      };

      const onCardKeyDown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();

        const card = cards.find((item) => item.el === event.currentTarget);

        if (!card) return;

        press(card);
        choose(card.i);
      };

      cards.forEach((card) => {
        card.el.addEventListener("click", onCardClick);
        card.el.addEventListener("keydown", onCardKeyDown);
      });

      const previousButton = q("[data-prev]");
      const nextButton = q("[data-next]");

      const onPrevious = () => choose(open - 1);
      const onNext = () => choose(open + 1);

      previousButton.addEventListener("click", onPrevious);
      nextButton.addEventListener("click", onNext);

      /* ------------------------------------------------------------
         Pointer-following notch
      ------------------------------------------------------------ */

      let lastTime = performance.now();

      const ticker = () => {
        const currentTime = performance.now();
        const dt = Math.min(0.05, (currentTime - lastTime) / 1000);

        lastTime = currentTime;

        const small = window.innerWidth < 641;
        const scrollLeft = track.scrollLeft;
        const scrollMax = track.scrollWidth - track.clientWidth;

        track.classList.toggle(styles.isL, scrollLeft > 6);

        track.classList.toggle(styles.isR, scrollLeft < scrollMax - 6);

        const radius = small ? 12 : 16;

        cards.forEach((card) => {
          const width = card.el.offsetWidth;
          const height = card.el.offsetHeight;
          const notch = card.notch;

          let over = false;

          if (pointer.on && card.i !== open && !REDUCED) {
            const rect = card.el.getBoundingClientRect();

            over = pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;

            if (over) {
              const size = clamp(0.05, 0.9, NOTCH_SIZE);
              const low = clamp(0, 0.5, size / 2 + NOTCH_MARGIN);
              const high = 1 - low;

              notch.goal = lerp(low, high, clamp(0, 1, (pointer.y - rect.top) / rect.height));

              card.surface.style.setProperty("--mx", `${(pointer.x - rect.left).toFixed(1)}px`);

              card.surface.style.setProperty("--my", `${(pointer.y - rect.top).toFixed(1)}px`);
            }
          }

          if (over !== notch.hover) {
            if (over && notch.off < 0.3) {
              notch.pos = notch.goal;
            }

            notch.hover = over;
            card.el.classList.toggle(styles.isHover, over);

            gsap.to(notch, {
              off: over ? NOTCH_DEPTH : 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: true,
            });
          }

          notch.pos = lerp(notch.pos, notch.goal, 1 - Math.exp(-FOLLOW * dt));

          const key = [width, height, notch.off.toFixed(2), notch.pos.toFixed(4), radius].join("|");

          if (key === card.last) return;

          card.last = key;

          const path = shape(width, height, radius, notch.off, notch.pos);

          card.surface.style.clipPath = `path('${path}')`;
          card.rim.setAttribute("d", path);

          card.rimSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

          const markHeight = height * clamp(0.05, 0.9, NOTCH_SIZE) * 0.42;

          card.mark.style.height = `${markHeight.toFixed(1)}px`;

          card.mark.style.transform = `translate3d(${(width - notch.off * 0.5 - 1).toFixed(2)}px, ${(height * notch.pos - markHeight / 2).toFixed(2)}px, 0)`;

          card.mark.style.opacity = NOTCH_DEPTH > 0 ? clamp(0, 1, notch.off / Math.max(1, NOTCH_DEPTH)).toFixed(3) : "0";
        });
      };

      gsap.ticker.add(ticker);

      /* ------------------------------------------------------------
         Resize and initial state
      ------------------------------------------------------------ */

      const onResize = () => {
        if (open >= 0) centreOn(open, true);
      };

      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("blur", onPointerLeave);
      container.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("resize", onResize);

      choose(0, true);

      if (REDUCED) {
        gsap.to(yos, {
          opacity: 1,
          duration: 0.6,
        });
      } else {
        gsap.fromTo(
          yos,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          },
        );
      }

      return () => {
        gsap.ticker.remove(ticker);

        if (scrollTween) scrollTween.kill();
        if (liveTimeline) liveTimeline.kill();
        if (pointerUpCall) pointerUpCall.kill();

        cards.forEach((card) => {
          card.el.removeEventListener("click", onCardClick);
          card.el.removeEventListener("keydown", onCardKeyDown);
        });

        previousButton.removeEventListener("click", onPrevious);
        nextButton.removeEventListener("click", onNext);

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("blur", onPointerLeave);
        container.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root },
  );

  return (
    <main
      className={styles.stage}
      ref={root}
    >
      <svg
        className={styles.lanes}
        viewBox='0 0 1200 800'
        preserveAspectRatio='xMidYMid slice'
        aria-hidden='true'
      >
        <path d='M-20 170H520q40 0 40 40v160q0 40 40 40H1220' />
        <path d='M-20 650H300q40 0 40-40V520q0-40 40-40H1220' />
        <path d='M860-20V250q0 40 40 40h320' />
      </svg>

      <span
        className={styles.grain}
        aria-hidden='true'
      />

      <section
        className={styles.yos}
        data-yos
        aria-label='Yardline Yard Operating System'
      >
        <header className={styles.yosHead}>
          <div className={styles.yosWords}>
            <p className={styles.yosEyebrow}>Yardline YOS</p>
            <h1 className={styles.yosTitle}>One system, gate to dock.</h1>
          </div>

          <div className={styles.yosNav}>
            <button
              className={styles.navBtn}
              type='button'
              data-prev
              aria-label='Previous module'
            >
              <svg
                viewBox='0 0 16 16'
                aria-hidden='true'
              >
                <path d='M10 3.5 5.5 8l4.5 4.5' />
              </svg>
            </button>

            <button
              className={styles.navBtn}
              type='button'
              data-next
              aria-label='Next module'
            >
              <svg
                viewBox='0 0 16 16'
                aria-hidden='true'
              >
                <path d='M6 3.5 10.5 8 6 12.5' />
              </svg>
            </button>
          </div>
        </header>

        <div
          className={styles.track}
          data-track
        >
          <i
            className={`${styles.probe} ${styles.probeC}`}
            data-probe-c
            aria-hidden='true'
          />
          <i
            className={`${styles.probe} ${styles.probeE}`}
            data-probe-e
            aria-hidden='true'
          />

          {/* Gate check-in */}
          <article
            className={`${styles.card} ${styles.lime}`}
            data-card
            data-tone='lime'
            role='button'
            tabIndex={0}
            aria-label='Gate check-in'
            aria-expanded='false'
          >
            <span
              className={styles.cardMark}
              data-mark
              aria-hidden='true'
            />

            <div
              className={styles.cardSurface}
              data-surface
            >
              <span
                className={styles.cardLight}
                aria-hidden='true'
              />

              <div className={`${styles.face} ${styles.faceC}`}>
                <p className={styles.faceLabel}>
                  At the
                  <br />
                  gate
                </p>
                <p className={styles.faceTitle}>Gate check-in</p>
                <p className={styles.faceFoot}>
                  <span className={styles.faceStat}>38s</span>
                  <svg
                    className={styles.facePlus}
                    viewBox='0 0 16 16'
                    aria-hidden='true'
                  >
                    <path d='M8 3v10M3 8h10' />
                  </svg>
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.faceE}`}
                data-face-expanded
                aria-hidden='true'
              >
                <div
                  className={`${styles.rise} ${styles.top}`}
                  data-rise
                >
                  <span className={styles.mono}>At the gate</span>
                  <span className={styles.live}>Live</span>
                </div>

                <h2
                  className={`${styles.rise} ${styles.eTitle}`}
                  data-rise
                >
                  Gate check-in
                </h2>

                <p
                  className={`${styles.rise} ${styles.eDesc}`}
                  data-rise
                >
                  The gate camera reads every plate and seal, and the truck is cleared before the driver rolls down the window.
                </p>

                <div
                  className={`${styles.rise} ${styles.panel}`}
                  data-rise
                >
                  <ul
                    className={styles.arrivals}
                    data-arrivals
                  >
                    <li>
                      <span className={styles.mono}>TRL 4821</span>
                      <span className={styles.car}>Northbay</span>
                      <span className={`${styles.mono} ${styles.t}`}>06:42</span>
                      <span className={`${styles.chip} ${styles.ok}`}>
                        <svg
                          viewBox='0 0 12 12'
                          aria-hidden='true'
                        >
                          <path d='M2.6 6.3 5 8.6l4.4-5' />
                        </svg>
                        Cleared
                      </span>
                    </li>
                    <li>
                      <span className={styles.mono}>TRL 3307</span>
                      <span className={styles.car}>Fernway</span>
                      <span className={`${styles.mono} ${styles.t}`}>06:44</span>
                      <span className={`${styles.chip} ${styles.ok}`}>
                        <svg
                          viewBox='0 0 12 12'
                          aria-hidden='true'
                        >
                          <path d='M2.6 6.3 5 8.6l4.4-5' />
                        </svg>
                        Cleared
                      </span>
                    </li>
                    <li className={styles.isNow}>
                      <span className={styles.mono}>TRL 5190</span>
                      <span className={styles.car}>Corran</span>
                      <span className={`${styles.mono} ${styles.t}`}>06:45</span>
                      <span
                        className={`${styles.chip} ${styles.swap}`}
                        data-scan
                      >
                        <span
                          data-chip-first
                          className={styles.chipA}
                        >
                          Scanning
                        </span>
                        <span
                          data-chip-second
                          className={styles.chipB}
                        >
                          <svg
                            viewBox='0 0 12 12'
                            aria-hidden='true'
                          >
                            <path
                              data-scan-check
                              pathLength='1'
                              d='M2.6 6.3 5 8.6l4.4-5'
                            />
                          </svg>
                          Cleared
                        </span>
                      </span>
                    </li>
                    <li>
                      <span className={styles.mono}>TRL 2264</span>
                      <span className={styles.car}>Halvik</span>
                      <span className={`${styles.mono} ${styles.t}`}>06:47</span>
                      <span className={`${styles.chip} ${styles.wait}`}>Queued</span>
                    </li>
                  </ul>
                </div>

                <div
                  className={`${styles.rise} ${styles.kpis}`}
                  data-rise
                >
                  <p className={styles.kpi}>
                    <span className={styles.kpiN}>
                      <span data-roll='38' />
                      <small>s</small>
                    </span>
                    <span className={styles.kpiL}>Avg. check-in</span>
                  </p>
                  <p className={`${styles.kpi} ${styles.kpi2}`}>
                    <span className={styles.kpiN}>
                      <span data-roll='126' />
                    </span>
                    <span className={styles.kpiL}>Trucks today</span>
                  </p>
                  <span
                    className={styles.go}
                    aria-hidden='true'
                  >
                    Open
                    <svg viewBox='0 0 16 16'>
                      <path d='M3 8h9M8.5 4.2 12.3 8l-3.8 3.8' />
                    </svg>
                  </span>
                </div>
              </div>

              <svg
                className={styles.rim}
                data-rim
                aria-hidden='true'
              >
                <path />
              </svg>
            </div>
          </article>

          {/* Yard map */}
          <article
            className={`${styles.card} ${styles.paper}`}
            data-card
            data-tone='paper'
            role='button'
            tabIndex={0}
            aria-label='Yard map'
            aria-expanded='false'
          >
            <span
              className={styles.cardMark}
              data-mark
              aria-hidden='true'
            />

            <div
              className={styles.cardSurface}
              data-surface
            >
              <span
                className={styles.cardLight}
                aria-hidden='true'
              />

              <div className={`${styles.face} ${styles.faceC}`}>
                <p className={styles.faceLabel}>
                  In the
                  <br />
                  yard
                </p>
                <p className={styles.faceTitle}>Yard map</p>
                <p className={styles.faceFoot}>
                  <span className={styles.faceStat}>81%</span>
                  <svg
                    className={styles.facePlus}
                    viewBox='0 0 16 16'
                    aria-hidden='true'
                  >
                    <path d='M8 3v10M3 8h10' />
                  </svg>
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.faceE}`}
                data-face-expanded
                aria-hidden='true'
              >
                <div
                  className={`${styles.rise} ${styles.top}`}
                  data-rise
                >
                  <span className={styles.mono}>In the yard</span>
                  <span className={styles.live}>Live</span>
                </div>

                <h2
                  className={`${styles.rise} ${styles.eTitle}`}
                  data-rise
                >
                  Yard map
                </h2>

                <p
                  className={`${styles.rise} ${styles.eDesc}`}
                  data-rise
                >
                  Every slot, every trailer, updated as they move. New arrivals get a slot and a route the moment they clear.
                </p>

                <div
                  className={`${styles.rise} ${styles.panel} ${styles.panelMap}`}
                  data-rise
                >
                  <svg
                    className={styles.map}
                    viewBox='0 0 240 124'
                    data-map
                  >
                    <g
                      className={styles.mapLanes}
                      data-slots
                    />
                    <path
                      className={styles.mapRoute}
                      data-route
                      pathLength='1'
                      d='M2 60.5H118q8 0 8 8v1.5'
                    />
                    <rect
                      className={styles.mapPin}
                      data-pin
                      x='-5'
                      y='-3'
                      width='10'
                      height='6'
                      rx='2'
                    />
                    <g
                      className={styles.mapTag}
                      data-tag
                    >
                      <rect
                        x='-15'
                        y='-9'
                        width='30'
                        height='13'
                        rx='4'
                      />
                      <text
                        x='0'
                        y='0.6'
                      >
                        C-07
                      </text>
                    </g>
                  </svg>
                </div>

                <div
                  className={`${styles.rise} ${styles.kpis}`}
                  data-rise
                >
                  <p className={styles.kpi}>
                    <span className={styles.kpiN}>
                      <span data-roll='212' />
                      <small>/260</small>
                    </span>
                    <span className={styles.kpiL}>Slots in use</span>
                  </p>
                  <p className={`${styles.kpi} ${styles.kpi2}`}>
                    <span className={styles.kpiN}>
                      <span data-roll='81' />
                      <small>%</small>
                    </span>
                    <span className={styles.kpiL}>Capacity</span>
                  </p>
                  <span
                    className={styles.go}
                    aria-hidden='true'
                  >
                    Open
                    <svg viewBox='0 0 16 16'>
                      <path d='M3 8h9M8.5 4.2 12.3 8l-3.8 3.8' />
                    </svg>
                  </span>
                </div>
              </div>

              <svg
                className={styles.rim}
                data-rim
                aria-hidden='true'
              >
                <path />
              </svg>
            </div>
          </article>

          {/* Dock scheduling */}
          <article
            className={`${styles.card} ${styles.deep}`}
            data-card
            data-tone='deep'
            role='button'
            tabIndex={0}
            aria-label='Dock scheduling'
            aria-expanded='false'
          >
            <span
              className={styles.cardMark}
              data-mark
              aria-hidden='true'
            />

            <div
              className={styles.cardSurface}
              data-surface
            >
              <span
                className={styles.cardLight}
                aria-hidden='true'
              />

              <div className={`${styles.face} ${styles.faceC}`}>
                <p className={styles.faceLabel}>
                  At the
                  <br />
                  dock
                </p>
                <p className={styles.faceTitle}>Dock scheduling</p>
                <p className={styles.faceFoot}>
                  <span className={styles.faceStat}>96%</span>
                  <svg
                    className={styles.facePlus}
                    viewBox='0 0 16 16'
                    aria-hidden='true'
                  >
                    <path d='M8 3v10M3 8h10' />
                  </svg>
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.faceE}`}
                data-face-expanded
                aria-hidden='true'
              >
                <div
                  className={`${styles.rise} ${styles.top}`}
                  data-rise
                >
                  <span className={styles.mono}>At the dock</span>
                  <span className={styles.live}>Live</span>
                </div>

                <h2
                  className={`${styles.rise} ${styles.eTitle}`}
                  data-rise
                >
                  Dock scheduling
                </h2>

                <p
                  className={`${styles.rise} ${styles.eDesc}`}
                  data-rise
                >
                  Appointments move by themselves when a truck runs late, so no door waits and no driver idles.
                </p>

                <div
                  className={`${styles.rise} ${styles.panel} ${styles.panelDock}`}
                  data-rise
                >
                  <div
                    className={styles.dock}
                    data-dock
                  >
                    <div className={styles.dockAxis}>
                      <span>06</span>
                      <span>08</span>
                      <span>10</span>
                      <span>12</span>
                    </div>

                    <div className={styles.dockRow}>
                      <span className={styles.mono}>D11</span>
                      <span className={styles.dockLane}>
                        <i style={{ left: "4%", width: "22%" }} />
                        <i style={{ left: "34%", width: "18%" }} />
                        <i style={{ left: "66%", width: "26%" }} />
                      </span>
                    </div>

                    <div className={styles.dockRow}>
                      <span className={styles.mono}>D12</span>
                      <span className={styles.dockLane}>
                        <i style={{ left: "12%", width: "28%" }} />
                        <i style={{ left: "52%", width: "16%" }} />
                      </span>
                    </div>

                    <div className={`${styles.dockRow} ${styles.isHot}`}>
                      <span className={styles.mono}>D14</span>
                      <span className={styles.dockLane}>
                        <i style={{ left: "2%", width: "14%" }} />
                        <i
                          className={styles.hot}
                          style={{ left: "36%", width: "30%" }}
                        >
                          <b>
                            <span>TRL </span>7730
                          </b>
                        </i>
                        <i style={{ left: "74%", width: "18%" }} />
                      </span>
                    </div>

                    <div className={styles.dockRow}>
                      <span className={styles.mono}>D15</span>
                      <span className={styles.dockLane}>
                        <i style={{ left: "20%", width: "20%" }} />
                        <i style={{ left: "58%", width: "30%" }} />
                      </span>
                    </div>

                    <span
                      className={styles.dockNow}
                      data-now
                    >
                      <span className={styles.mono}>08:46</span>
                    </span>
                  </div>
                </div>

                <div
                  className={`${styles.rise} ${styles.kpis}`}
                  data-rise
                >
                  <p className={styles.kpi}>
                    <span className={styles.kpiN}>
                      <span data-roll='14' />
                    </span>
                    <span className={styles.kpiL}>Doors live</span>
                  </p>
                  <p className={`${styles.kpi} ${styles.kpi2}`}>
                    <span className={styles.kpiN}>
                      <span data-roll='96' />
                      <small>%</small>
                    </span>
                    <span className={styles.kpiL}>On time</span>
                  </p>
                  <span
                    className={styles.go}
                    aria-hidden='true'
                  >
                    Open
                    <svg viewBox='0 0 16 16'>
                      <path d='M3 8h9M8.5 4.2 12.3 8l-3.8 3.8' />
                    </svg>
                  </span>
                </div>
              </div>

              <svg
                className={styles.rim}
                data-rim
                aria-hidden='true'
              >
                <path />
              </svg>
            </div>
          </article>

          {/* Trailer tracking */}
          <article
            className={`${styles.card} ${styles.stone}`}
            data-card
            data-tone='stone'
            role='button'
            tabIndex={0}
            aria-label='Trailer tracking'
            aria-expanded='false'
          >
            <span
              className={styles.cardMark}
              data-mark
              aria-hidden='true'
            />

            <div
              className={styles.cardSurface}
              data-surface
            >
              <span
                className={styles.cardLight}
                aria-hidden='true'
              />

              <div className={`${styles.face} ${styles.faceC}`}>
                <p className={styles.faceLabel}>
                  Across
                  <br />
                  operations
                </p>
                <p className={styles.faceTitle}>Trailer tracking</p>
                <p className={styles.faceFoot}>
                  <span className={styles.faceStat}>418</span>
                  <svg
                    className={styles.facePlus}
                    viewBox='0 0 16 16'
                    aria-hidden='true'
                  >
                    <path d='M8 3v10M3 8h10' />
                  </svg>
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.faceE}`}
                data-face-expanded
                aria-hidden='true'
              >
                <div
                  className={`${styles.rise} ${styles.top}`}
                  data-rise
                >
                  <span className={styles.mono}>Across operations</span>
                  <span className={styles.live}>Live</span>
                </div>

                <h2
                  className={`${styles.rise} ${styles.eTitle}`}
                  data-rise
                >
                  Trailer tracking
                </h2>

                <p
                  className={`${styles.rise} ${styles.eDesc}`}
                  data-rise
                >
                  One timeline per trailer, from the gate camera to the dock door, with the dwell time counting on its own.
                </p>

                <div
                  className={`${styles.rise} ${styles.panel} ${styles.panelTrack}`}
                  data-rise
                >
                  <div className={styles.trl}>
                    <div className={styles.trlHead}>
                      <p>
                        <span className={`${styles.mono} ${styles.trlId}`}>TRL 7730</span>
                        <span className={styles.trlSub}>Reefer, 53 ft</span>
                      </p>

                      <span
                        className={`${styles.chip} ${styles.swap}`}
                        data-status
                      >
                        <span
                          data-chip-first
                          className={styles.chipA}
                        >
                          In the yard
                        </span>
                        <span
                          data-chip-second
                          className={styles.chipB}
                        >
                          <svg
                            viewBox='0 0 12 12'
                            aria-hidden='true'
                          >
                            <path
                              data-status-check
                              pathLength='1'
                              d='M2.6 6.3 5 8.6l4.4-5'
                            />
                          </svg>
                          Door 14
                        </span>
                      </span>
                    </div>

                    <div className={styles.trlLine}>
                      <span
                        className={styles.trlFill}
                        data-fill
                      />

                      <span
                        className={styles.trlStop}
                        data-stop
                        style={{ left: "0%" }}
                      >
                        <b>Gate</b>
                        <em className={styles.mono}>06:42</em>
                      </span>

                      <span
                        className={styles.trlStop}
                        data-stop
                        style={{ left: "46%" }}
                      >
                        <b>Yard</b>
                        <em className={styles.mono}>06:51</em>
                      </span>

                      <span
                        className={styles.trlStop}
                        data-stop
                        style={{ left: "100%" }}
                      >
                        <b>Dock</b>
                        <em className={styles.mono}>08:30</em>
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.rise} ${styles.kpis}`}
                  data-rise
                >
                  <p className={styles.kpi}>
                    <span className={styles.kpiN}>
                      <span data-roll='2:14' />
                      <small>h</small>
                    </span>
                    <span className={styles.kpiL}>Dwell</span>
                  </p>
                  <p className={`${styles.kpi} ${styles.kpi2}`}>
                    <span className={styles.kpiN}>
                      <span data-roll='418' />
                    </span>
                    <span className={styles.kpiL}>Trailers tracked</span>
                  </p>
                  <span
                    className={styles.go}
                    aria-hidden='true'
                  >
                    Open
                    <svg viewBox='0 0 16 16'>
                      <path d='M3 8h9M8.5 4.2 12.3 8l-3.8 3.8' />
                    </svg>
                  </span>
                </div>
              </div>

              <svg
                className={styles.rim}
                data-rim
                aria-hidden='true'
              >
                <path />
              </svg>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
