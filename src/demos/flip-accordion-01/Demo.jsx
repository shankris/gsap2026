/* src/demos/flip-accordion-01/Demo.jsx */

"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, Flip, SplitText, CustomEase);

const DEFAULT_PANELS = [
  {
    label: "Deserts",
    title: ["Silent", "Deserts"],
    text: "Dunes that travel a metre a year under skies that never end. Four expeditions, shot one long exposure at a time.",
    image: "demos/flip-accordion-01/01.jpg",
    alt: "Sunlit sand dunes under a hazy sky",
    color: "#d6a64f",
  },
  {
    label: "Forests",
    title: ["Old", "Forests"],
    text: "Light that takes a century to reach the floor. Walked in rain, photographed in fog, printed on cotton.",
    image: "demos/flip-accordion-01/02.jpg",
    alt: "Sunbeams through a misty forest",
    color: "#9fc3ae",
  },
  {
    label: "Highlands",
    title: ["Wet", "Highlands"],
    text: "Waterfalls, moss and weather that changes four times before lunch. The north, as we found it.",
    image: "demos/flip-accordion-01/03.jpg",
    alt: "Waterfall dropping into a green valley",
    color: "#bcd0e6",
  },
  {
    label: "Night skies",
    title: ["Loud", "Night skies"],
    text: "Aurora over the treeline at minus thirty. Nothing moves, and the whole sky does.",
    image: "demos/flip-accordion-01/04.jpg",
    alt: "Green aurora over a line of pine trees",
    color: "#c3b5e8",
  },
];

const SIGNATURE = {
  ease: "fa-signature",
  duration: 1.1,
};

const EASES = {
  "fa-signature": "0.625, 0.05, 0, 1",
  "fa-reveal": "0.16, 1, 0.3, 1",
  "fa-exit": "0.7, 0, 0.84, 0",
};

const STACKED = "(max-width: 767px), (max-width: 991px) and (orientation: portrait)";

const HOVER_LOCK = 0.34;
const HOVER_INTENT = 0.05;

const PILL = 4;
const BAR = 3.5;
const GAP = 0.5;

function useListRefs() {
  const refs = useRef([]);

  const set = useCallback(
    (index) => (element) => {
      refs.current[index] = element;
    },
    [],
  );

  const list = useCallback(() => refs.current.filter((element) => element !== null && element !== undefined), []);

  return [set, list];
}

function Accordion({ panels, initial = 1, trigger = "hover", onChange }) {
  const listRef = useRef(null);

  const [setItem, items] = useListRefs();
  const [setButton, buttons] = useListRefs();
  const [setLabel, labels] = useListRefs();
  const [setContent, contents] = useListRefs();
  const [setHeading, headings] = useListRefs();
  const [setMedia, medias] = useListRefs();
  const [setVisual, visuals] = useListRefs();
  const [setText, texts] = useListRefs();

  useGSAP(
    () => {
      const element = listRef.current;

      if (!element || panels.length < 2) return;

      Object.entries(EASES).forEach(([name, curve]) => {
        CustomEase.create(name, curve);
      });

      const stacked = window.matchMedia(STACKED);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

      const count = panels.length;

      const item = items();
      const button = buttons();
      const label = labels();
      const content = contents();
      const media = medias();
      const visual = visuals();
      const text = texts();

      const lines = headings().map(
        (heading) =>
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            linesClass: "fa-line",
            aria: "none",
            autoSplit: true,
          }).lines,
      );

      const timelines = panels.map(() => null);

      let index = -1;
      let flip = null;
      let intent = null;
      let pointer = null;

      const toggle = (i, open) => {
        item[i].toggleAttribute("data-active", open);
        button[i].setAttribute("aria-expanded", String(open));
        button[i].tabIndex = open ? 0 : -1;
        content[i].inert = !open;
      };

      const reset = (i, open) => {
        timelines[i]?.kill();

        gsap.set(content[i], {
          autoAlpha: open ? 1 : 0,
          xPercent: 0,
          yPercent: 0,
        });

        gsap.set(label[i], {
          autoAlpha: open ? 0 : 1,
        });

        gsap.set(lines[i], {
          yPercent: 0,
        });

        gsap.set(media[i], {
          clipPath: "inset(0% 0% 0% 0%)",
        });

        gsap.set(visual[i], {
          scale: 1,
        });

        gsap.set(text[i], {
          autoAlpha: 1,
          y: 0,
        });
      };

      const enter = (i, direction) => {
        const axis = stacked.matches ? "yPercent" : "xPercent";
        const startAt = SIGNATURE.duration * 0.2;

        timelines[i]?.kill();

        timelines[i] = gsap
          .timeline({
            defaults: {
              ease: "fa-reveal",
              duration: 1,
            },
          })
          .set(content[i], { autoAlpha: 1 })
          .to(
            label[i],
            {
              autoAlpha: 0,
              duration: 0.2,
              ease: "power1.out",
            },
            0,
          )
          .fromTo(
            content[i],
            { [axis]: direction * 6 },
            {
              [axis]: 0,
              duration: SIGNATURE.duration * 1.15,
              ease: SIGNATURE.ease,
            },
            0,
          )
          .fromTo(
            lines[i],
            { yPercent: 140 },
            {
              yPercent: 0,
              stagger: 0.075,
            },
            startAt,
          )
          .fromTo(media[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, startAt + 0.08)
          .fromTo(
            visual[i],
            { scale: 1.3 },
            {
              scale: 1,
              duration: 1.4,
            },
            "<",
          )
          .fromTo(
            text[i],
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
            },
            startAt + 0.18,
          );
      };

      const leave = (i, direction) => {
        const axis = stacked.matches ? "yPercent" : "xPercent";

        timelines[i]?.kill();

        timelines[i] = gsap
          .timeline({
            defaults: {
              ease: "fa-exit",
              duration: 0.42,
            },
          })
          .to(
            text[i],
            {
              autoAlpha: 0,
              duration: 0.2,
              ease: "none",
            },
            0,
          )
          .to(
            media[i],
            {
              clipPath: "inset(0% 0% 100% 0%)",
            },
            0,
          )
          .to(
            lines[i],
            {
              yPercent: -140,
              stagger: 0.03,
            },
            0,
          )
          .to(
            content[i],
            {
              [axis]: direction * -6,
              duration: 0.6,
            },
            0,
          )
          .to(
            content[i],
            {
              autoAlpha: 0,
              duration: 0.12,
              ease: "none",
            },
            0.38,
          )
          .to(
            label[i],
            {
              autoAlpha: 1,
              duration: 0.8,
              ease: "fa-reveal",
            },
            SIGNATURE.duration * 0.45,
          );
      };

      const go = (next) => {
        if (next === index || !panels[next]) return;

        const previous = index;
        const direction = next > previous ? 1 : -1;

        const state = Flip.getState(item, {
          props: "borderRadius",
        });

        index = next;

        item.forEach((_, i) => {
          toggle(i, i === next);
        });

        if (reduced.matches) {
          item.forEach((_, i) => {
            reset(i, i === next);
          });
        } else {
          flip = Flip.from(state, {
            ...SIGNATURE,
            absolute: true,
          });

          if (previous > -1) {
            leave(previous, direction);
          }

          enter(next, direction);
        }

        onChange?.(next);
      };

      const wrap = gsap.utils.wrap(0, count);

      const hovered = () => {
        if (!pointer) return -1;

        const hoveredElement = document.elementFromPoint(pointer.x, pointer.y)?.closest("li");

        return hoveredElement ? item.indexOf(hoveredElement) : -1;
      };

      const resolveHover = () => {
        intent?.kill();

        const locked = flip?.isActive() ? Math.max(HOVER_LOCK - flip.time(), 0) : 0;

        intent = gsap.delayedCall(locked + HOVER_INTENT, () => {
          const hoveredIndex = hovered();

          if (hoveredIndex > -1) {
            go(hoveredIndex);
          }
        });
      };

      const onMove = (event) => {
        if (event.pointerType !== "mouse" || trigger !== "hover" || !canHover.matches) {
          return;
        }

        const before = hovered();

        pointer = {
          x: event.clientX,
          y: event.clientY,
        };

        if (hovered() !== before) {
          resolveHover();
        }
      };

      const onLeave = () => {
        pointer = null;
        intent?.kill();
      };

      const onKey = (event) => {
        const keys = {
          ArrowRight: 1,
          ArrowDown: 1,
          ArrowLeft: -1,
          ArrowUp: -1,
        };

        let next = null;

        if (event.key in keys) {
          next = wrap(index + keys[event.key]);
        }

        if (event.key === "Home") next = 0;
        if (event.key === "End") next = count - 1;

        if (next === null) return;

        event.preventDefault();
        go(next);
        button[next].focus();
      };

      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      element.addEventListener("keydown", onKey);

      const clickHandlers = button.map((currentButton, i) => {
        const handler = () => go(i);

        currentButton.addEventListener("click", handler);

        return handler;
      });

      item.forEach((_, i) => {
        toggle(i, false);
        reset(i, false);
      });

      const start = gsap.utils.clamp(0, count - 1, initial);

      if (reduced.matches) {
        toggle(start, true);
        reset(start, true);
        index = start;
        onChange?.(start);
      } else {
        gsap.from(item, {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          ease: "fa-reveal",
          stagger: 0.05,
          clearProps: "opacity,visibility,transform",
          onComplete: () => go(start),
        });
      }

      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
        element.removeEventListener("keydown", onKey);

        button.forEach((currentButton, i) => {
          currentButton.removeEventListener("click", clickHandlers[i]);
        });

        intent?.kill();
        flip?.kill();

        timelines.forEach((timeline) => {
          timeline?.kill();
        });

        lines.forEach((splitLines) => {
          splitLines.forEach((line) => {
            gsap.killTweensOf(line);
          });
        });
      };
    },
    {
      scope: listRef,
      dependencies: [panels, initial, trigger, onChange],
    },
  );

  const variables = {
    "--fa-count": panels.length,
    "--fa-pill": `${PILL}rem`,
    "--fa-bar": `${BAR}rem`,
    "--fa-gap": `${GAP}rem`,
    "--fa-open": `calc(100cqw - (${panels.length - 1}) * (${PILL + GAP}rem))`,
    "--fa-open-y": `calc(100cqh - (${panels.length - 1}) * (${BAR + GAP}rem))`,
  };

  const pad = (number) => String(number).padStart(2, "0");

  return (
    <ul
      ref={listRef}
      style={variables}
      className={styles.list}
    >
      {panels.map((panel, i) => (
        <li
          key={i}
          ref={setItem(i)}
          style={{ backgroundColor: panel.color }}
          className={styles.item}
        >
          <span className={styles.tint} />

          <button
            ref={setButton(i)}
            type='button'
            aria-label={`Open ${panel.label}`}
            aria-controls={`fa-panel-${i}`}
            aria-expanded='false'
            className={styles.trigger}
          />

          <p
            ref={setLabel(i)}
            aria-hidden='true'
            className={styles.label}
          >
            {panel.label}
          </p>

          <div
            ref={setContent(i)}
            id={`fa-panel-${i}`}
            role='region'
            className={styles.content}
          >
            <div className={styles.top}>
              <h2
                ref={setHeading(i)}
                className={styles.heading}
              >
                {panel.title.map((line, lineIndex) => (
                  <span key={lineIndex}>{line}</span>
                ))}
              </h2>

              <span className={styles.counter}>
                {pad(i + 1)} — {pad(panels.length)}
              </span>
            </div>

            <div className={styles.bottom}>
              <div
                ref={setMedia(i)}
                className={styles.media}
              >
                <img
                  ref={setVisual(i)}
                  src={panel.image}
                  alt={panel.alt || ""}
                  width='900'
                  height='600'
                  loading={i === initial ? "eager" : "lazy"}
                />
              </div>

              <p
                ref={setText(i)}
                className={styles.text}
              >
                {panel.text}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Demo() {
  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        <Accordion
          panels={DEFAULT_PANELS}
          initial={1}
          trigger='hover'
        />
      </div>
    </main>
  );
}
