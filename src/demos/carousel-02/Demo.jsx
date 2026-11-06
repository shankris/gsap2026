/* src/demos/carousel-02/Demo.jsx */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

const NAMES = [
  ["Ava Bennett", "Head of Design"],
  ["Marcus Reid", "Principal Engineer"],
  ["Priya Nair", "Product Manager"],
  ["Diego Santos", "iOS Engineer"],
  ["Hannah Cole", "UX Researcher"],
  ["Kenji Tanaka", "Data Scientist"],
  ["Zara Okafor", "Engineering Manager"],
  ["Liam Walsh", "Backend Engineer"],
  ["Sofia Rossi", "Creative Director"],
  ["Omar Haddad", "DevOps Lead"],
  ["Chloe Martin", "Content Strategist"],
  ["Noah Kim", "Frontend Engineer"],
  ["Isabella Ferreira", "Marketing Lead"],
  ["Ethan Brooks", "QA Engineer"],
  ["Mei Lin", "Motion Designer"],
  ["Gabriel Silva", "Security Engineer"],
  ["Amara Diallo", "People Operations"],
  ["Lucas Meyer", "Sales Director"],
  ["Yuki Sato", "Machine Learning Engineer"],
  ["Elena Petrova", "Design Systems Lead"],
  ["Tomás Herrera", "Solutions Architect"],
  ["Aisha Rahman", "Customer Success"],
  ["Daniel Novak", "Platform Engineer"],
  ["Grace Wong", "Finance Lead"],
  ["Felix Andersen", "Growth Marketer"],
  ["Nadia Karim", "Head of Operations"],
];

export const DEFAULT_PEOPLE = NAMES.map(([name, role], index) => {
  const image = `/demos/carousel-02/${String(index + 1).padStart(2, "0")}.jpg`;

  return {
    name,
    role,
    cover: image,
    thumb: image,
  };
});

const POOL = 20;

const FLY = {
  min: 0.34,
  max: 0.72,
  pace: 2.4,
};

const ACTIVE_REST = 1.1;
const PEAK = 1.6;
const RADIUS = 2.6;
const RING_PAD = 5;
const LABEL_GAP = 12;

const EASE = {
  scale: 0.24,
  pan: 0.18,
  ring: 0.6,
};

const DOCK_QUERY = "(pointer: fine)";

const subscribeDock = (onChange) => {
  const mediaQuery = window.matchMedia(DOCK_QUERY);

  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
};

const getDockSnapshot = () => window.matchMedia(DOCK_QUERY).matches;

const getServerDockSnapshot = () => false;

function useDockOn() {
  return useSyncExternalStore(subscribeDock, getDockSnapshot, getServerDockSnapshot);
}

export default function Carousel02() {
  const [active, setActive] = useState(0);
  const dockOn = useDockOn();
  const stageRef = useRef(null);
  const listRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  const tileRefs = useRef([]);
  const cardRefs = useRef([]);
  const selectRef = useRef(() => {});

  const people = DEFAULT_PEOPLE;

  useEffect(() => {
    const stage = stageRef.current;
    const list = listRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    const tiles = tileRefs.current;
    const cards = cardRefs.current;

    if (!stage || !list || !ring || !label) return;

    const count = tiles.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    people.forEach((person) => {
      const image = new Image();
      image.src = person.cover;
    });

    /* -----------------------------------------------
       Cover image transitions
    ----------------------------------------------- */

    let zIndex = POOL;
    let last = 0;

    const flights = new Map();

    cards.forEach((card, index) => {
      card.style.zIndex = String(index === 0 ? POOL : index);

      gsap.set(card, {
        opacity: index === 0 ? 1 : 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });
    });

    const order = [...cards.slice(1), cards[0]];

    const fly = (index) => {
      const card = order.shift();

      if (!card) return;

      order.push(card);

      const image = card.querySelector("img");

      image.src = people[index].cover;
      image.alt = people[index].name;

      card.style.zIndex = String(++zIndex);

      flights.get(card)?.kill();
      flights.delete(card);

      gsap.killTweensOf(card);

      const stageRect = stage.getBoundingClientRect();
      const tileRect = tiles[index].getBoundingClientRect();

      if (reduced || !stageRect.width || !tileRect.width) {
        gsap.set(card, {
          opacity: 1,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        });

        return;
      }

      const now = performance.now();

      const duration = gsap.utils.clamp(FLY.min, FLY.max, ((last ? now - last : Infinity) / 1000) * FLY.pace);

      last = now;

      // Speed up cards that are still in flight.
      for (const timeline of flights.values()) {
        const remaining = timeline.duration() - timeline.time();

        if (remaining / timeline.timeScale() > duration * 0.85) {
          timeline.timeScale(remaining / (duration * 0.85));
        }
      }

      gsap.set(card, {
        opacity: 1,
        x: tileRect.left + tileRect.width / 2 - (stageRect.left + stageRect.width / 2),
        y: tileRect.top + tileRect.height / 2 - (stageRect.top + stageRect.height / 2),
        scaleX: tileRect.width / stageRect.width,
        scaleY: tileRect.height / stageRect.height,
      });

      const timeline = gsap.timeline({
        onComplete: () => flights.delete(card),
      });

      flights.set(card, timeline);

      timeline.to(card, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration,
        ease: "power2.out",
      });
    };

    let current = 0;

    const select = (index) => {
      if (index === current) return;

      current = index;
      setActive(index);
      fly(index);
    };

    selectRef.current = select;

    /* -----------------------------------------------
       Dock magnification and pointer interaction
    ----------------------------------------------- */

    if (!dockOn) {
      return () => {
        flights.forEach((timeline) => timeline.kill());
      };
    }

    const rest = (index) => (index === current ? ACTIVE_REST : 1);

    const scale = tiles.map((_, index) => rest(index));
    const target = [...scale];

    const box = tiles.map(() => ({
      left: 0,
      width: 0,
    }));

    let hover = null;
    let focus = current;
    let pointerX = null;

    let frame = 0;
    let clock = 0;

    let base = 0;
    let gap = 0;

    let centers = [];
    let origin = 0;
    let listLeft = 0;
    let maxScroll = 0;

    const measure = () => {
      const previousTransforms = tiles.map((tile) => tile.style.transform);

      tiles.forEach((tile) => {
        tile.style.transform = "none";
      });

      listLeft = list.getBoundingClientRect().left;

      const rects = tiles.map((tile) => tile.getBoundingClientRect());

      base = rects[0].width;

      gap = count > 1 ? rects[1].left - rects[0].right : 0;

      centers = rects.map((rect) => rect.left + rect.width / 2 - listLeft + list.scrollLeft);

      origin = centers[0] - base / 2;

      maxScroll = Math.max(0, list.scrollWidth - list.clientWidth);

      tiles.forEach((tile, index) => {
        tile.style.transform = previousTransforms[index];
      });
    };

    // Calculate magnification from each tile's original center.
    const retarget = () => {
      if (pointerX === null) {
        tiles.forEach((_, index) => {
          target[index] = rest(index);
        });

        hover = null;
        label.style.opacity = "0";

        return;
      }

      const x = pointerX - list.getBoundingClientRect().left + list.scrollLeft;

      const radius = RADIUS * (base + gap);

      let nearest = 0;

      centers.forEach((center, index) => {
        if (Math.abs(x - center) < Math.abs(x - centers[nearest])) {
          nearest = index;
        }
      });

      if (hover !== nearest) {
        label.textContent = people[nearest].name;
        label.style.opacity = "1";
      }

      hover = nearest;

      select(nearest);

      centers.forEach((center, index) => {
        const distance = Math.abs(x - center);

        const amount = distance >= radius ? 0 : 0.5 * (1 + Math.cos((Math.PI * distance) / radius));

        target[index] = rest(index) + (PEAK - rest(index)) * amount;
      });
    };

    const render = () => {
      frame = 0;

      const now = performance.now();

      const delta = Math.min(clock ? (now - clock) / 16.667 : 1, 4);

      clock = now;

      let moving = false;

      // Move the strip according to the cursor position.
      if (maxScroll > 0 && pointerX !== null) {
        const goal = Math.min(1, Math.max(0, (pointerX - listLeft) / list.clientWidth)) * maxScroll;

        const distance = goal - list.scrollLeft;

        if (Math.abs(distance) > 0.5) {
          list.scrollLeft += distance * (1 - Math.pow(1 - EASE.pan, delta));

          moving = true;
        }

        retarget();
      }

      const scaleEase = 1 - Math.pow(1 - EASE.scale, delta);

      tiles.forEach((_, index) => {
        const difference = target[index] - scale[index];

        if (Math.abs(difference) < 0.0005) {
          scale[index] = target[index];
        } else {
          scale[index] += difference * scaleEase;
          moving = true;
        }
      });

      // Use transforms instead of width changes to avoid reflow.
      const total = scale.reduce((sum, value) => sum + base * value, 0) + gap * (count - 1);

      let cursor = (base * count + gap * (count - 1) - total) / 2;

      tiles.forEach((tile, index) => {
        const width = base * scale[index];

        const translateX = cursor + width / 2 - (index * (base + gap) + base / 2);

        box[index] = {
          left: origin + cursor,
          width,
        };

        cursor += width + gap;

        tile.style.transform = `translateX(${translateX.toFixed(2)}px) ` + `scale(${scale[index].toFixed(4)})`;
      });

      // Move the selection ring and label.
      const drift = (hover ?? current) - focus;

      if (Math.abs(drift) < 0.001) {
        focus = hover ?? current;
      } else {
        focus += drift * (1 - Math.pow(1 - EASE.ring, delta));

        moving = true;
      }

      const firstIndex = Math.floor(focus);
      const secondIndex = Math.min(firstIndex + 1, count - 1);
      const fraction = focus - firstIndex;

      const left = box[firstIndex].left + (box[secondIndex].left - box[firstIndex].left) * fraction;

      const width = box[firstIndex].width + (box[secondIndex].width - box[firstIndex].width) * fraction;

      ring.style.transform = `translateX(${(left - RING_PAD).toFixed(2)}px)`;

      ring.style.width = ring.style.height = `${(width + RING_PAD * 2).toFixed(2)}px`;

      label.style.transform = `translate(calc(${(left + width / 2).toFixed(2)}px - 50%), ` + `${-(width + LABEL_GAP).toFixed(2)}px)`;

      if (moving) {
        frame = requestAnimationFrame(render);
      }
    };

    const kick = () => {
      if (frame) return;

      clock = 0;
      frame = requestAnimationFrame(render);
    };

    const update = () => {
      retarget();
      kick();
    };

    const onMove = (event) => {
      if (event.pointerType !== "mouse") return;

      pointerX = event.clientX;
      update();
    };

    const onLeave = () => {
      pointerX = null;
      update();
    };

    const onResize = () => {
      measure();
      update();
    };

    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    list.addEventListener("scroll", update);

    window.addEventListener("resize", onResize);

    measure();
    kick();

    return () => {
      cancelAnimationFrame(frame);

      flights.forEach((timeline) => timeline.kill());

      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      list.removeEventListener("scroll", update);

      window.removeEventListener("resize", onResize);
    };
  }, [people, dockOn]);

  const person = people[active];

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.personInfo}>
          <h1>{person.name}</h1>
          <p>{person.role}</p>
        </div>

        <div
          ref={stageRef}
          className={styles.stage}
        >
          {Array.from({ length: POOL }, (_, index) => (
            <div
              key={index}
              ref={(element) => {
                if (element) {
                  cardRefs.current[index] = element;
                }
              }}
              className={styles.coverCard}
            >
              <img
                src={index === 0 ? people[0].cover : undefined}
                alt={index === 0 ? people[0].name : ""}
              />
            </div>
          ))}
        </div>

        <ul
          ref={listRef}
          className={styles.dock}
        >
          <li
            ref={ringRef}
            aria-hidden='true'
            className={`${styles.selectionRing} ${dockOn ? "" : styles.hidden}`}
          />

          <li
            ref={labelRef}
            aria-hidden='true'
            className={styles.hoverLabel}
          />

          {people.map((item, index) => (
            <li
              key={item.name}
              className={styles.dockItem}
            >
              <button
                ref={(element) => {
                  if (element) {
                    tileRefs.current[index] = element;
                  }
                }}
                type='button'
                aria-current={index === active ? "true" : undefined}
                onClick={() => selectRef.current(index)}
                className={`${styles.thumbnail} ${index === active ? styles.active : ""} ${dockOn ? styles.magnifiable : styles.touchThumbnail}`}
              >
                <img
                  src={item.thumb}
                  alt={item.name}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
