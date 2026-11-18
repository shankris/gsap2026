/* src/demos/ios-dock-01/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const ICONS = [
  { name: "Home", image: "home.jpg" },
  { name: "Mail", image: "mail.jpg" },
  { name: "Messages", image: "messages.jpg" },
  { name: "Music", image: "music.jpg" },
  { name: "Camera", image: "camera.jpg" },
  { name: "Favorites", image: "favorites.jpg", extra: true },
  { name: "Settings", image: "settings.jpg", extra: true },
];

export default function Demo() {
  const dockRef = useRef(null);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const tray = dock.querySelector("[data-tray]");
    const tip = dock.querySelector("[data-tip]");
    const items = [...dock.querySelectorAll("[data-item]")];
    const lines = [...dock.querySelectorAll("[data-open]")];

    const MAX = 1.85;
    const RANGE = 150;
    const FOLLOW = 0.08;
    const JUMP = [24, 2];
    const HOLD = 1.6;

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let SIZE = 0;
    let GAP = 0;
    let PAD = 0;

    let shown = [];
    let rest = [];
    let restWidth = 0;

    const px = (name) => parseFloat(getComputedStyle(dock).getPropertyValue(name)) || 0;

    function measure() {
      dock.style.removeProperty("--size");

      GAP = px("--gap");
      PAD = px("--pad");
      SIZE = px("--size");

      shown = items.map((_, index) => index).filter((index) => getComputedStyle(items[index]).display !== "none");

      const count = shown.length;

      const room = window.innerWidth - 32 - PAD * 2 - GAP * (count - 1);

      const swellRoom = REDUCED ? 0 : (MAX - 1) * 2.2;

      if (SIZE * (count + swellRoom) > room) {
        SIZE = Math.floor(room / (count + swellRoom));
        dock.style.setProperty("--size", `${SIZE}px`);
      }

      rest = [];

      shown.forEach((index, position) => {
        rest[index] = (position - (count - 1) / 2) * (SIZE + GAP);
      });

      restWidth = SIZE * count + GAP * (count - 1);

      dock.style.width = `${restWidth + PAD * 2}px`;
    }

    measure();

    const scale = items.map(() => 1);
    const centre = items.map(() => 0);
    const jump = items.map(() => ({ y: 0 }));
    const lit = items.map(() => ({ x: 0 }));

    const swell = { x: 0, k: 0 };

    let mouseIn = false;
    let mouseX = 0;
    let focused = -1;
    let held = -1;
    let holdCall = null;
    let tipAt = -1;
    let last = 0;

    const tipWidth = [];
    const timelines = [];

    function aim() {
      if (mouseIn) return [mouseX, 1];
      if (focused >= 0) return [rest[focused], 1];
      if (held >= 0) return [rest[held], 1];

      return [swell.x, 0];
    }

    function tipTo(index) {
      if (index === tipAt) return;

      tipAt = index;

      if (index < 0) {
        gsap.to(tip, {
          opacity: 0,
          duration: 0.15,
          overwrite: "auto",
        });

        return;
      }

      tip.textContent = items[index].getAttribute("aria-label");
      tipWidth[index] = tip.offsetWidth;

      gsap.fromTo(
        tip,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          overwrite: "auto",
        },
      );
    }

    function render() {
      const top = REDUCED ? 1 : MAX;
      const sigma = RANGE / 2;

      let total = GAP * (shown.length - 1);
      let nearest = shown[0];

      for (const index of shown) {
        const distance = swell.x - rest[index];

        scale[index] = 1 + (top - 1) * swell.k * Math.exp(-(distance * distance) / (2 * sigma * sigma));

        total += SIZE * scale[index];

        if (Math.abs(distance) < Math.abs(swell.x - rest[nearest])) {
          nearest = index;
        }
      }

      const limit = window.innerWidth - 24 - PAD * 2;

      if (total > limit && total > restWidth) {
        const factor = Math.max(0, (limit - restWidth) / (total - restWidth));

        total = GAP * (shown.length - 1);

        for (const index of shown) {
          scale[index] = 1 + (scale[index] - 1) * factor;

          total += SIZE * scale[index];
        }
      }

      let x = -total / 2;

      for (const index of shown) {
        const width = SIZE * scale[index];

        centre[index] = x + width / 2;

        items[index].style.transform = `translate3d(${centre[index].toFixed(2)}px, ` + `${jump[index].y.toFixed(2)}px, 0) ` + `scale(${scale[index].toFixed(4)})`;

        lines[index].style.transform = `translateX(${centre[index].toFixed(2)}px) ` + `scaleX(${lit[index].x.toFixed(3)})`;

        x += width + GAP;
      }

      const wide = total + PAD * 2;

      tray.style.width = `${wide.toFixed(2)}px`;
      tray.style.marginLeft = `${(-wide / 2).toFixed(2)}px`;

      const [targetX, active] = aim();

      tipTo(swell.k > 0.5 && active ? nearest : -1);

      if (tipAt >= 0) {
        const y = PAD + SIZE * scale[tipAt] * 0.92 + 10 - jump[tipAt].y;

        tip.style.transform = `translate3d(` + `${(centre[tipAt] - tipWidth[tipAt] / 2).toFixed(2)}px, ` + `${(-y).toFixed(2)}px, 0)`;
      }
    }

    function tick(time) {
      const dt = Math.min(0.05, time - last || 0.016);
      last = time;

      const [targetX, on] = aim();

      const kx = 1 - Math.exp(-dt / FOLLOW);

      const kk = 1 - Math.exp(-dt / (on ? FOLLOW * 1.6 : FOLLOW * 2.6));

      if (swell.k < 0.02 && on) {
        swell.x = targetX;
      } else {
        swell.x += (targetX - swell.x) * kx;
      }

      swell.k += (on - swell.k) * kk;

      render();
    }

    function open(index) {
      gsap.killTweensOf(jump[index]);
      timelines[index]?.kill();

      if (!REDUCED) {
        const timeline = gsap.timeline();
        timelines[index] = timeline;

        let height = JUMP[0];

        for (let count = 0; count < JUMP[1]; count++) {
          const duration = 0.16 + height / 160;

          timeline
            .to(jump[index], {
              y: -height,
              duration,
              ease: "power2.out",
            })
            .to(jump[index], {
              y: 0,
              duration,
              ease: "power2.in",
            });

          height *= 0.45;
        }
      }

      gsap.to(lines[index], {
        opacity: 1,
        duration: 0.2,
      });

      gsap.to(lit[index], {
        x: 1,
        duration: 0.5,
        ease: "back.out(2.2)",
      });
    }

    function hold(index) {
      held = index;

      if (holdCall) holdCall.kill();

      holdCall = gsap.delayedCall(HOLD, () => {
        held = -1;
      });
    }

    function onPointerMove(event) {
      if (event.pointerType !== "mouse") return;

      const bounds = dock.getBoundingClientRect();
      const middle = bounds.left + bounds.width / 2;

      const half = (parseFloat(tray.style.width) || bounds.width) / 2;

      mouseIn = event.clientX > middle - half && event.clientX < middle + half && event.clientY < bounds.bottom && event.clientY > bounds.bottom - (SIZE * MAX + PAD * 2 + 6);

      mouseX = event.clientX - middle;
    }

    function onPointerLeave() {
      mouseIn = false;
    }

    let finger = false;
    let start = 0;
    let slid = false;

    function fingerAt(event) {
      const bounds = dock.getBoundingClientRect();

      mouseX = event.clientX - (bounds.left + bounds.width / 2);
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse") return;

      finger = true;
      slid = false;
      start = event.clientX;
      mouseIn = true;

      fingerAt(event);
    }

    function onTouchPointerMove(event) {
      if (!finger) return;

      fingerAt(event);

      if (Math.abs(event.clientX - start) > 10) {
        slid = true;
      }
    }

    function lift() {
      if (!finger) return;

      finger = false;
      mouseIn = false;
    }

    function onClick(index) {
      if (slid) {
        slid = false;
        return;
      }

      open(index);

      if (!mouseIn) {
        hold(index);
      }
    }

    const clickHandlers = [];
    const focusHandlers = [];
    const blurHandlers = [];

    items.forEach((button, index) => {
      const clickHandler = () => onClick(index);

      const focusHandler = () => {
        if (button.matches(":focus-visible")) {
          focused = index;
        }
      };

      const blurHandler = () => {
        if (focused === index) {
          focused = -1;
        }
      };

      clickHandlers.push(clickHandler);
      focusHandlers.push(focusHandler);
      blurHandlers.push(blurHandler);

      button.addEventListener("click", clickHandler);
      button.addEventListener("focus", focusHandler);
      button.addEventListener("blur", blurHandler);
    });

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    dock.addEventListener("pointerdown", onPointerDown);
    dock.addEventListener("pointermove", onTouchPointerMove);
    dock.addEventListener("pointerup", lift);
    dock.addEventListener("pointercancel", lift);

    window.addEventListener("resize", measure);

    gsap.ticker.add(tick);

    render();

    gsap.set(items, { autoAlpha: 0 });
    gsap.set(tray, { autoAlpha: 1 });

    if (!REDUCED) {
      gsap.to(items, {
        autoAlpha: 1,
        duration: 0.4,
        ease: "power1.out",
        stagger: 0.05,
        delay: 0.2,
      });

      gsap.from(jump, {
        y: 34,
        duration: 0.8,
        ease: "back.out(2)",
        stagger: 0.05,
        delay: 0.2,
      });
    } else {
      gsap.set(items, { autoAlpha: 1 });
    }

    // Clean up when the component unmounts.
    return () => {
      gsap.ticker.remove(tick);

      if (holdCall) holdCall.kill();

      timelines.forEach((timeline) => timeline?.kill());

      items.forEach((button, index) => {
        button.removeEventListener("click", clickHandlers[index]);
        button.removeEventListener("focus", focusHandlers[index]);
        button.removeEventListener("blur", blurHandlers[index]);
      });

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", measure);

      document.documentElement.removeEventListener("pointerleave", onPointerLeave);

      dock.removeEventListener("pointerdown", onPointerDown);
      dock.removeEventListener("pointermove", onTouchPointerMove);
      dock.removeEventListener("pointerup", lift);
      dock.removeEventListener("pointercancel", lift);
    };
  }, []);

  return (
    <main className={styles.stage}>
      <nav
        ref={dockRef}
        className={styles.dock}
        aria-label='Apps'
        data-dock
      >
        <span
          className={styles.tray}
          data-tray
          aria-hidden='true'
        />

        {ICONS.map((icon) => (
          <button
            key={icon.name}
            className={`${styles.item} ${icon.extra ? styles.extra : ""}`}
            type='button'
            aria-label={icon.name}
            data-item
          >
            <img
              className={styles.icon}
              src={`/demos/ios-dock-01/${icon.image}`}
              alt=''
              draggable='false'
            />
          </button>
        ))}

        {ICONS.map((icon) => (
          <span
            key={icon.name}
            className={styles.open}
            data-open
            aria-hidden='true'
          />
        ))}

        <span
          className={styles.tip}
          data-tip
          aria-hidden='true'
        />
      </nav>
    </main>
  );
}
