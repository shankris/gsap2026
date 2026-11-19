/* src/demos/mis-02-progress/Demo.jsx */

"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

const OPEN_SPRING = [200, 19];
const HAND_SPRING = [260, 26];

const DIAL_SIZE = 264;
const GAP = 6;
const SNAP = 5;
const WORDS_A_MINUTE = 230;

export default function Demo() {
  const readerRef = useRef(null);
  const reactId = useId();
  const filterId = `dial-lift-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader) return;

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NS = "http://www.w3.org/2000/svg";

    const text = reader.querySelector(`.${styles.text}`);
    const veil = reader.querySelector(`.${styles.veil}`);
    const svg = reader.querySelector(`.${styles.dial}`);

    const box = reader.querySelector(`.${styles.chapters}`);
    const grip = reader.querySelector(`.${styles.grip}`);

    const bar = reader.querySelector(`.${styles.bar}`);
    const slot = reader.querySelector(`.${styles.barDial}`);

    const nowEl = reader.querySelector(`.${styles.barNow}`);
    const leftEl = reader.querySelector(`.${styles.barLeft}`);

    // Check the main elements before querying inside the SVG.
    if (!text || !veil || !svg || !box || !grip || !bar || !slot || !nowEl || !leftEl) {
      console.error("Reading Dial: one or more required HTML elements are missing.");
      return;
    }

    const face = svg.querySelector(`.${styles.dialFace}`);
    const trackG = svg.querySelector(`.${styles.dialTracks}`);
    const readG = svg.querySelector(`.${styles.dialReads}`);
    const nameG = svg.querySelector(`.${styles.dialNames}`);

    const hand = svg.querySelector(`.${styles.dialHand}`);
    const needle = svg.querySelector(`.${styles.dialNeedle}`);
    const pin = svg.querySelector(`.${styles.dialPin}`);

    const nowBig = svg.querySelector(`.${styles.dialNow}`);
    const leftBig = svg.querySelector(`.${styles.dialLeft}`);

    if (!face || !trackG || !readG || !nameG || !hand || !needle || !pin || !nowBig || !leftBig) {
      console.error("Reading Dial: one or more required SVG elements are missing.");
      return;
    }

    const heads = [...text.querySelectorAll("[data-chapter]")];
    const n = heads.length;

    if (!n) {
      console.error("Reading Dial: no chapter headings were found.");
      return;
    }

    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

    const lerp = (a, b, t) => a + (b - a) * t;

    const rad = Math.PI / 180;

    const OK = Math.max(30, OPEN_SPRING[0]);
    const OC = Math.max(4, OPEN_SPRING[1]);

    const HK = Math.max(30, HAND_SPRING[0]);
    const HC = Math.max(4, HAND_SPRING[1]);

    const faceR = clamp(DIAL_SIZE, 200, 320) / 2;
    const snap = clamp(SNAP, 0, 15);
    const wpm = Math.max(60, WORDS_A_MINUTE);

    const SMALL_R = 16;

    const names = heads.map((head) => head.dataset.chapter);

    /* -----------------------------------------------------------
       Calculate chapter word counts
    ----------------------------------------------------------- */

    const words = new Array(n).fill(0);

    {
      let k = 0;

      [...text.children].forEach((el) => {
        const i = heads.indexOf(el);

        if (i >= 0) k = i;

        words[k] += (el.textContent.trim().match(/\S+/g) || []).length;
      });
    }

    /* -----------------------------------------------------------
       SVG elements
    ----------------------------------------------------------- */

    const svgEl = (tag, cls, parent) => {
      const element = document.createElementNS(NS, tag);

      if (cls) {
        element.setAttribute("class", cls);
      }

      parent.appendChild(element);

      return element;
    };

    // Clear generated elements before initialization.
    trackG.replaceChildren();
    readG.replaceChildren();
    nameG.replaceChildren();
    box.replaceChildren();

    const tracks = heads.map(() => svgEl("path", styles.dialTrack, trackG));

    const reads = heads.map(() => svgEl("path", styles.dialRead, readG));

    const labelPaths = heads.map((head, i) => {
      const path = svgEl("path", null, nameG);

      path.setAttribute("id", `dial-name-${filterId}-${i}`);

      path.style.stroke = "none";

      return path;
    });

    const labels = heads.map((head, i) => {
      const label = svgEl("text", null, nameG);
      const textPath = svgEl("textPath", null, label);

      textPath.setAttribute("href", `#dial-name-${filterId}-${i}`);

      textPath.setAttribute("startOffset", "50%");
      textPath.setAttribute("text-anchor", "middle");

      textPath.textContent = names[i];

      return label;
    });

    const buttons = heads.map((head, i) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = styles.chapter;
      button.textContent = names[i];
      button.tabIndex = -1;

      button.style.width = `${Math.round(names[i].length * 7.6 + 26)}px`;

      button.style.marginLeft = `${-Math.round(names[i].length * 3.8 + 13)}px`;

      box.appendChild(button);

      return button;
    });

    /* -----------------------------------------------------------
       Chapter positions and dial angles
    ----------------------------------------------------------- */

    let starts = [];
    let angles = [];

    let W = 0;
    let H = 0;

    let c0 = { x: 0, y: 0 };
    let c1 = { x: 0, y: 0 };

    function readSizes() {
      const r = reader.getBoundingClientRect();

      W = r.width;
      H = r.height;

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      const s = slot.getBoundingClientRect();

      c0 = {
        x: s.left - r.left + s.width / 2,
        y: s.top - r.top + s.height / 2,
      };

      const room = H - 64;

      c1 = {
        x: W >= faceR * 2 + 40 ? W - faceR - 18 : W / 2,

        y: Math.min(room - faceR - 14, room / 2 + 30),
      };

      const max = Math.max(1, text.scrollHeight - text.clientHeight);

      const top0 = text.getBoundingClientRect().top - text.scrollTop;

      const at = heads.map((head) => head.getBoundingClientRect().top - top0);

      starts = at.map((y, i) => (i === 0 ? 0 : clamp(Math.floor(y - 24), 0, max)));

      starts.push(max);

      for (let i = 1; i <= n; i++) {
        starts[i] = Math.max(starts[i], starts[i - 1] + 1);
      }

      const tops = at.map((y, i) => (i === 0 ? 0 : y));

      tops.push(text.scrollHeight);

      const total = tops[n] - tops[0];

      angles = tops.map((y) => ((y - tops[0]) / total) * 360);
    }

    function angleFor(s) {
      for (let i = 0; i < n; i++) {
        if (s <= starts[i + 1] || i === n - 1) {
          const f = clamp((s - starts[i]) / (starts[i + 1] - starts[i]), 0, 1);

          return angles[i] + (angles[i + 1] - angles[i]) * f;
        }
      }

      return 360;
    }

    function scrollFor(a) {
      for (let i = 0; i < n; i++) {
        if (a <= angles[i + 1] || i === n - 1) {
          const f = clamp((a - angles[i]) / (angles[i + 1] - angles[i]), 0, 1);

          return starts[i] + (starts[i + 1] - starts[i]) * f;
        }
      }

      return starts[n];
    }

    function chapterAt(a) {
      for (let i = n - 1; i >= 0; i--) {
        if (a >= angles[i] - 0.3) return i;
      }

      return 0;
    }

    /* -----------------------------------------------------------
       State
    ----------------------------------------------------------- */

    const open = {
      v: 0,
      s: 0,
      aim: 0,
    };

    let handA = 0;
    let handV = 0;

    let aimA = 0;

    let held = false;
    let shown = -1;
    let started = false;

    /* -----------------------------------------------------------
       Reading time
    ----------------------------------------------------------- */

    function minutesLeft(a) {
      const i = chapterAt(a);

      const f = clamp((a - angles[i]) / (angles[i + 1] - angles[i]), 0, 1);

      let remaining = words[i] * (1 - f);

      for (let k = i + 1; k < n; k++) {
        remaining += words[k];
      }

      if (remaining < 25) {
        return "Last lines";
      }

      return `${Math.max(1, Math.ceil(remaining / wpm))} min left`;
    }

    /* -----------------------------------------------------------
       SVG drawing
    ----------------------------------------------------------- */

    const pt = (c, r, a) => [c.x + r * Math.sin(a * rad), c.y - r * Math.cos(a * rad)];

    const f2 = (v) => v.toFixed(2);

    function arc(c, r, a0, a1) {
      if (a1 - a0 < 0.05) return "";

      const [x0, y0] = pt(c, r, a0);
      const [x1, y1] = pt(c, r, a1);

      return `M${f2(x0)} ${f2(y0)}` + `A${f2(r)} ${f2(r)} 0 ` + `${a1 - a0 > 180 ? 1 : 0} 1 ` + `${f2(x1)} ${f2(y1)}`;
    }

    function draw() {
      const o = open.v;
      const oc = clamp(o, 0, 1);

      const c = {
        x: lerp(c0.x, c1.x, o),
        y: lerp(c0.y, c1.y, o),
      };

      const bigR = faceR - 40;
      const R = lerp(SMALL_R, bigR, o);

      const width = lerp(3, 6, oc);
      const gap = GAP / Math.max(8, R) / rad;

      const inPart = chapterAt(handA);

      face.setAttribute("cx", f2(c.x));
      face.setAttribute("cy", f2(c.y));

      face.setAttribute("r", f2(Math.max(0, lerp(SMALL_R + 6, faceR, o))));

      face.style.opacity = clamp(o * 2.5, 0, 1);

      for (let i = 0; i < n; i++) {
        const a0 = angles[i] + gap / 2;
        const a1 = angles[i + 1] - gap / 2;

        tracks[i].setAttribute("d", arc(c, R, a0, a1));

        tracks[i].style.strokeWidth = width;

        reads[i].setAttribute("d", handA > a0 ? arc(c, R, a0, Math.min(a1, handA)) : "");

        reads[i].style.strokeWidth = width;

        reads[i].classList.toggle(styles.isNow, i === inPart);

        const mid = (angles[i] + angles[i + 1]) / 2;
        const bottom = mid > 95 && mid < 265;

        const rl = R + 14 + (bottom ? 9.5 : 0);

        const lp = bottom
          ? (() => {
              const [x0, y0] = pt(c, rl, mid + 75);
              const [x1, y1] = pt(c, rl, mid - 75);

              return `M${f2(x0)} ${f2(y0)}` + `A${f2(rl)} ${f2(rl)} 0 0 0 ` + `${f2(x1)} ${f2(y1)}`;
            })()
          : arc(c, rl, mid - 75, mid + 75);

        labelPaths[i].setAttribute("d", lp);

        const show = clamp((o - 0.55 - i * 0.05) / 0.3, 0, 1);

        labels[i].style.opacity = show.toFixed(3);

        labels[i].classList.toggle(styles.isNow, i === inPart);

        const [bx, by] = pt(c, R + 18.5, mid);

        buttons[i].style.transform = `translate(${f2(bx)}px, ${f2(by)}px) ` + `rotate(${f2(bottom ? mid - 180 : mid)}deg)`;
      }

      /* Hand */

      const [hx, hy] = pt(c, R + lerp(-4, 9, oc), handA);

      const [tx, ty] = pt(c, lerp(0, R - 13, oc), handA);

      needle.setAttribute("x1", f2(tx));
      needle.setAttribute("y1", f2(ty));
      needle.setAttribute("x2", f2(hx));
      needle.setAttribute("y2", f2(hy));

      needle.style.strokeWidth = lerp(1.7, 3, oc);

      pin.setAttribute("cx", f2(c.x));
      pin.setAttribute("cy", f2(c.y));
      pin.setAttribute("r", f2(lerp(2.2, 4.5, oc)));

      pin.style.strokeWidth = lerp(1.4, 2, oc);
      pin.style.opacity = clamp(1 - oc * 1.6, 0, 1);

      /* Center labels */

      const mid = clamp((o - 0.6) / 0.4, 0, 1);

      nowBig.setAttribute("x", f2(c.x));
      nowBig.setAttribute("y", f2(c.y + 4));

      leftBig.setAttribute("x", f2(c.x));
      leftBig.setAttribute("y", f2(c.y + 24));

      nowBig.style.opacity = mid;
      leftBig.style.opacity = mid;

      /* Drag area */

      const g = R + 12;

      grip.style.width = `${f2(g * 2)}px`;
      grip.style.height = `${f2(g * 2)}px`;

      grip.style.transform = `translate(${f2(c.x - g)}px, ${f2(c.y - g)}px)`;

      /* Overlay and interactive elements */

      veil.style.opacity = oc.toFixed(3);

      veil.style.visibility = o > 0.01 ? "visible" : "hidden";

      box.style.visibility = o > 0.9 && open.aim ? "visible" : "hidden";

      grip.style.visibility = o > 0.9 && open.aim ? "visible" : "hidden";

      writeWords();
    }

    /* -----------------------------------------------------------
       Chapter and time labels
    ----------------------------------------------------------- */

    let lastLeft = "";
    let roll = null;

    function writeWords() {
      const i = chapterAt(handA);
      const left = minutesLeft(handA);

      if (left !== lastLeft) {
        leftEl.textContent = left;
        leftBig.textContent = left;

        lastLeft = left;
      }

      if (i === shown) return;

      const up = i > shown;
      const first = shown < 0;

      shown = i;

      nowBig.textContent = names[i];

      if (first || REDUCED) {
        nowEl.textContent = names[i];

        if (!first) {
          gsap.fromTo(
            nowEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.3,
              ease: "none",
            },
          );
        }

        return;
      }

      if (roll) roll.kill();

      roll = gsap.timeline();

      roll.to(nowEl, {
        yPercent: up ? -100 : 100,
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      });

      roll.call(() => {
        nowEl.textContent = names[shown];
      });

      roll.fromTo(
        nowEl,
        {
          yPercent: up ? 100 : -100,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.42,
          ease: "back.out(1.6)",
        },
      );
    }

    /* -----------------------------------------------------------
       Animation loop
    ----------------------------------------------------------- */

    let running = false;

    function wake() {
      if (running || !started) return;

      running = true;
      gsap.ticker.add(tick);
    }

    function physics(dt) {
      let busy = false;

      open.s += (OK * (open.aim - open.v) - OC * open.s) * dt;

      open.v += open.s * dt;

      if (Math.abs(open.s) > 1e-4 || Math.abs(open.aim - open.v) > 1e-4) {
        busy = true;
      }

      if (held) {
        handA = aimA;
        handV = 0;
      } else {
        handV += (HK * (aimA - handA) - HC * handV) * dt;

        handA += handV * dt;

        if (Math.abs(handV) > 1e-3 || Math.abs(aimA - handA) > 1e-3) {
          busy = true;
        }
      }

      return busy;
    }

    function tick() {
      const dt = Math.min(1 / 30, gsap.ticker.deltaRatio(60) / 60);

      let busy = false;

      if (REDUCED) {
        open.v = open.aim;
        open.s = 0;

        handA = aimA;
        handV = 0;
      } else {
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));

        for (let k = 0; k < steps; k++) {
          busy = physics(dt / steps) || busy;
        }
      }

      draw();

      if (!busy && !gsap.isTweening(text)) {
        gsap.ticker.remove(tick);
        running = false;
      }
    }

    function handleScroll() {
      aimA = clamp(angleFor(text.scrollTop), 0, 360);

      wake();
    }

    text.addEventListener("scroll", handleScroll, { passive: true });

    /* -----------------------------------------------------------
       Open and close the dial
    ----------------------------------------------------------- */

    function setOpen(v, focusChapter = false) {
      if (!!open.aim === v) return;

      open.aim = v ? 1 : 0;

      bar.setAttribute("aria-expanded", String(v));

      buttons.forEach((button) => {
        button.tabIndex = v ? 0 : -1;
      });

      if (REDUCED) {
        open.v = open.aim;
        draw();
      }

      if (v && focusChapter) {
        gsap.delayedCall(REDUCED ? 0 : 0.35, () => {
          box.style.visibility = "visible";
          buttons[chapterAt(aimA)].focus();
        });
      }

      if (!v && box.contains(document.activeElement)) {
        bar.focus();
      }

      wake();
    }

    /* -----------------------------------------------------------
       Navigate to a chapter
    ----------------------------------------------------------- */

    function glideTo(i, then) {
      const to = starts[i];

      if (REDUCED) {
        text.scrollTop = to;

        if (then) then();

        return;
      }

      const far = Math.abs(to - text.scrollTop);

      gsap.to(text, {
        scrollTop: to,

        duration: clamp(0.45 + far / 2600, 0.45, 1.1),

        ease: "power3.inOut",
        overwrite: true,
        onComplete: then,
      });
    }

    /* -----------------------------------------------------------
       Bar interaction
    ----------------------------------------------------------- */

    let keyed = false;

    function handleBarKeydown(e) {
      if (e.key === "Enter" || e.key === " ") {
        keyed = true;
      }
    }

    function handleBarClick() {
      const keyboard = keyed;

      keyed = false;

      setOpen(!open.aim, keyboard);
    }

    function handleVeilClick() {
      setOpen(false);
    }

    function handleDocumentKeydown(e) {
      if (e.key === "Escape" && open.aim) {
        setOpen(false);
        bar.focus();
      }
    }

    bar.addEventListener("keydown", handleBarKeydown);
    bar.addEventListener("click", handleBarClick);
    veil.addEventListener("click", handleVeilClick);

    document.addEventListener("keydown", handleDocumentKeydown);

    /* -----------------------------------------------------------
       Chapter buttons
    ----------------------------------------------------------- */

    const buttonCleanups = [];

    buttons.forEach((button, i) => {
      const handleClick = () => {
        glideTo(i, () => {
          gsap.delayedCall(0.25, () => {
            setOpen(false);
          });
        });
      };

      const handleKeydown = (e) => {
        let to = -1;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          to = (i + 1) % n;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          to = (i - 1 + n) % n;
        }

        if (to >= 0) {
          e.preventDefault();
          buttons[to].focus();
        }
      };

      button.addEventListener("click", handleClick);
      button.addEventListener("keydown", handleKeydown);

      buttonCleanups.push(() => {
        button.removeEventListener("click", handleClick);
        button.removeEventListener("keydown", handleKeydown);
      });
    });

    /* -----------------------------------------------------------
       Drag the hand
    ----------------------------------------------------------- */

    let lastA = 0;

    function angleAt(e) {
      const r = reader.getBoundingClientRect();

      const c = {
        x: lerp(c0.x, c1.x, open.v),
        y: lerp(c0.y, c1.y, open.v),
      };

      const a = Math.atan2(e.clientX - r.left - c.x, -(e.clientY - r.top - c.y)) / rad;

      return (a + 360) % 360;
    }

    function dragTo(e) {
      let a = angleAt(e);

      if (lastA > 270 && a < 90) {
        a = 360;
      } else if (lastA < 90 && a > 270) {
        a = 0;
      }

      lastA = a;

      let to = clamp(a, 0, 359.9);

      for (let i = 1; i < n; i++) {
        if (Math.abs(to - angles[i]) < snap) {
          to = angles[i] + 0.01;
        }
      }

      aimA = to;

      gsap.killTweensOf(text);

      text.scrollTop = scrollFor(to);

      wake();
    }

    function handlePointerDown(e) {
      held = true;

      grip.classList.add(styles.isHeld);

      lastA = handA;

      try {
        grip.setPointerCapture(e.pointerId);
      } catch (err) {
        // Pointer capture is not available.
      }

      dragTo(e);
    }

    function handlePointerMove(e) {
      if (held) dragTo(e);
    }

    function letGo() {
      held = false;

      grip.classList.remove(styles.isHeld);

      aimA = clamp(angleFor(text.scrollTop), 0, 360);

      wake();
    }

    grip.addEventListener("pointerdown", handlePointerDown);
    grip.addEventListener("pointermove", handlePointerMove);
    grip.addEventListener("pointerup", letGo);
    grip.addEventListener("pointercancel", letGo);

    /* -----------------------------------------------------------
       Resize and initialize
    ----------------------------------------------------------- */

    let startedFlag = false;

    function start() {
      if (startedFlag) return;
      startedFlag = true;

      readSizes();

      aimA = clamp(angleFor(text.scrollTop), 0, 360);

      handA = aimA;

      started = true;

      draw();

      if (REDUCED) {
        gsap.from([svg, bar], {
          opacity: 0,
          duration: 0.6,
          ease: "none",
        });

        return;
      }

      gsap.from(reader, {
        opacity: 0,
        y: 8,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from([...tracks, ...reads], {
        opacity: 0,
        duration: 0.4,
        stagger: 0.07,
        delay: 0.3,
        ease: "none",
      });

      gsap.from(hand, {
        rotation: -90,
        svgOrigin: `${c0.x} ${c0.y}`,
        duration: 0.9,
        delay: 0.45,
        ease: "back.out(1.4)",
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      readSizes();

      aimA = clamp(angleFor(text.scrollTop), 0, 360);

      if (started) {
        draw();
        wake();
      }
    });

    resizeObserver.observe(reader);

    let cancelled = false;

    const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();

    fontReady.then(() => {
      if (!cancelled) start();
    });

    /* -----------------------------------------------------------
       Cleanup
    ----------------------------------------------------------- */

    return () => {
      cancelled = true;

      resizeObserver.disconnect();

      text.removeEventListener("scroll", handleScroll);

      bar.removeEventListener("keydown", handleBarKeydown);
      bar.removeEventListener("click", handleBarClick);
      veil.removeEventListener("click", handleVeilClick);

      document.removeEventListener("keydown", handleDocumentKeydown);

      buttonCleanups.forEach((cleanup) => cleanup());

      grip.removeEventListener("pointerdown", handlePointerDown);
      grip.removeEventListener("pointermove", handlePointerMove);
      grip.removeEventListener("pointerup", letGo);
      grip.removeEventListener("pointercancel", letGo);

      gsap.ticker.remove(tick);

      gsap.killTweensOf([reader, text, svg, bar, hand, nowEl, ...tracks, ...reads]);

      if (roll) roll.kill();
    };
  }, [filterId]);

  return (
    <main className={styles.stage}>
      <section
        ref={readerRef}
        className={styles.reader}
        aria-label='Fire, slowly'
      >
        <article
          className={styles.text}
          tabIndex='0'
        >
          <p className={styles.kicker}>A long read · Ceramics</p>

          <h1 className={styles.title}>Fire, slowly</h1>

          <p className={styles.lede}>A week inside a small pottery by the river, from a block of wet clay to the morning the kiln is opened.</p>

          <h2
            id='ch-clay'
            data-chapter='Clay'
          >
            Clay
          </h2>

          <p>The clay arrives on a Monday, in grey blocks wrapped in plastic, heavier than they look. Before anything else it has to be wedged: pressed, folded and turned on a slab of plaster until every pocket of air is gone and the block feels the same all the way through. It is slow, dull work, and nobody in the studio skips it.</p>

          <p>An air bubble left in the clay will not show for days. It waits through the shaping and the drying, and then, in the heat of the kiln, it swells and splits the pot open from the inside. So the wedging goes on until the cut face of the block is smooth and even, like the inside of a loaf.</p>

          <p>By noon there are twenty balls of clay on the shelf, each one weighed, each one the size of a large orange. They will be bowls by the evening.</p>

          <h2
            id='ch-wheel'
            data-chapter='The wheel'
          >
            The wheel
          </h2>

          <p>Throwing starts with centring. The ball is slapped onto the middle of the wheel, the wheel spins, and wet hands push the clay up into a cone and down again until it runs true, without the slightest wobble against the palm. A pot that starts off centre will stay off centre whatever happens next.</p>

          <p>Then the thumbs go in, the floor of the bowl is opened, and the walls are drawn up in three or four slow pulls, each one thinner and taller. The trick is to stop a pull early. A wall pulled one time too many goes soft, folds over on itself, and the whole thing goes back into the bucket.</p>

          <p>Every finished bowl is cut off the wheel with a wire and set on a board to rest. Twenty go up; seventeen are kept.</p>

          <h2
            id='ch-drying'
            data-chapter='Drying'
          >
            Drying
          </h2>

          <p>For two days the bowls dry under loose sheets of plastic, so that the rims, which are thin, do not dry faster than the feet, which are thick. When they are firm enough to hold but still soft enough to cut, they are turned upside down on the wheel and trimmed: a sharp loop of steel takes the extra clay off the base and carves the foot ring.</p>

          <p>Then the plastic comes off. The grey turns pale, almost white, and the bowls shrink as they lose their water, about a tenth of their size. They are as fragile now as they will ever be; a careless thumb on a rim is enough to crack it.</p>

          <h2
            id='ch-kiln'
            data-chapter='The kiln'
          >
            The kiln
          </h2>

          <p>The first firing is gentle and goes on overnight, up to the heat at which clay stops being clay and becomes something that will never soften in water again. After it the bowls are pink and ring when they are tapped. They are dipped in glaze, a grey slurry that looks nothing like the colour it will turn into, and wiped clean at the foot so they will not stick to the shelves.</p>

          <p>The second firing is the one everybody waits for. The kiln is packed with care, shelf by shelf, the bowls a finger apart, and the door is bricked up. For fourteen hours the temperature climbs, checked every half hour, until the cones of clay set on a shelf behind a spy hole bend over and tell the potters that the heat has done its work.</p>

          <p>Then the burners go off and nothing can be done but wait. A kiln cooled too fast will craze every glaze inside it.</p>

          <h2
            id='ch-opening'
            data-chapter='Opening'
          >
            Opening
          </h2>

          <p>Two days later the bricks come out of the door one by one. The air inside is still warm. The grey glaze has turned into a deep celadon green, pooling darker in the hollows and thinning to a pale edge at every rim, and there is the small, glassy sound of glazes still cooling, a tick here and there like a clock.</p>

          <p>Not every bowl makes it. One has a crack along its foot, one has stuck to its neighbour, one has a glaze that ran too far. The rest are lifted out, turned over in the light, and set in a line on the long table by the window, where they will wait for the market on Saturday.</p>

          <p>The studio sweeps the kiln, orders more clay, and on Monday it all begins again.</p>
        </article>

        <div
          className={styles.veil}
          aria-hidden='true'
        />

        <svg
          className={styles.dial}
          aria-hidden='true'
        >
          <defs>
            <filter
              id={filterId}
              x='-30%'
              y='-30%'
              width='160%'
              height='160%'
            >
              <feDropShadow
                dx='0'
                dy='10'
                stdDeviation='14'
                floodColor='#141414'
                floodOpacity='0.16'
              />
            </filter>
          </defs>

          <circle
            className={styles.dialFace}
            filter={`url(#${filterId})`}
          />

          <g className={styles.dialTracks} />
          <g className={styles.dialReads} />
          <g className={styles.dialNames} />

          <g className={styles.dialHand}>
            <line className={styles.dialNeedle} />
            <circle className={styles.dialPin} />
          </g>

          <text
            className={styles.dialNow}
            textAnchor='middle'
          />

          <text
            className={styles.dialLeft}
            textAnchor='middle'
          />
        </svg>

        <div
          className={styles.chapters}
          id={`reader-chapters-${filterId}`}
          role='group'
          aria-label='Chapters'
        />

        <div
          className={styles.grip}
          aria-hidden='true'
        />

        <button
          className={styles.bar}
          type='button'
          aria-expanded='false'
          aria-controls={`reader-chapters-${filterId}`}
        >
          <span className={styles.barWords}>
            <span className={styles.barNowBox}>
              <span className={styles.barNow}>Clay</span>
            </span>

            <span className={styles.barLeft}>5 min left</span>
          </span>

          <span className={styles.barDial} />
        </button>
      </section>

      <p className={styles.hint}>Click on the dial to navigate</p>
    </main>
  );
}
