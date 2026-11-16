/* src/demos/filter-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const STUDIO = "Kettleby";
const MOVE = 0.75;
const STAGGER = 0.035;
const BOUNCE = 1.25;
const GRAIN = 16;

const projects = [
  { title: "Saltmarsh Coffee", year: 2026, category: "brand", size: "big", palette: ["#f3d9c2", "#e98d63", "#7a3b2e"], shape: "sun" },
  { title: "Orbit Speaker", year: 2025, category: "product", palette: ["#dfe6ef", "#8ea4c2", "#2f3d57"], shape: "object" },
  { title: "Night Shift Titles", year: 2026, category: "motion", palette: ["#d9d2f4", "#7f6ad8", "#211a44"], shape: "waves" },
  { title: "Ferro Type", year: 2024, category: "brand", palette: ["#efe5cf", "#c9a35c", "#3b3221"], shape: "lines" },
  { title: "Loop Reel", year: 2025, category: "motion", palette: ["#cfeee6", "#3fb39b", "#0f3b35"], shape: "circles" },
  { title: "Halden Kettle", year: 2026, category: "product", size: "wide", palette: ["#ebe8e3", "#b6aea2", "#45403a"], shape: "horizon" },
  { title: "Wren Bakery", year: 2025, category: "brand", palette: ["#f6dfd9", "#e37b6d", "#5a2621"], shape: "circles" },
  { title: "Pulse Idents", year: 2024, category: "motion", palette: ["#f7d6ea", "#d35da1", "#3c1230"], shape: "lines" },
  { title: "Tilde Lamp", year: 2025, category: "product", palette: ["#e6ecf2", "#9fb3c9", "#28323f"], shape: "sun" },
  { title: "Marsh Records", year: 2026, category: "brand", palette: ["#e3ead6", "#93ab62", "#2c3a1b"], shape: "waves" },
  { title: "Drift Opener", year: 2026, category: "motion", palette: ["#d4e6f7", "#4f8fd6", "#122a47"], shape: "horizon" },
  { title: "Nook Chair", year: 2024, category: "product", palette: ["#f1e7dc", "#cf9e74", "#4a3426"], shape: "object" },
];

const filtersList = [
  { label: "All", value: "all" },
  { label: "Brand", value: "brand" },
  { label: "Product", value: "product" },
  { label: "Motion", value: "motion" },
];

function seededRandom(seed) {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

function paintCover(project, index) {
  const width = 640;
  const height = 480;
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  const random = seededRandom(97 + index * 131);

  const [light, medium, dark] = project.palette;

  const gradient = ctx.createLinearGradient(0, 0, width * 0.4, height);
  gradient.addColorStop(0, light);
  gradient.addColorStop(1, medium);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = (x, y, radius, color, alpha) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.globalAlpha = alpha;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  };

  glow(width * (0.2 + random() * 0.6), height * (0.2 + random() * 0.4), width * 0.6, light, 0.8);

  ctx.fillStyle = dark;

  if (project.shape === "sun") {
    glow(width * 0.62, height * 0.42, width * 0.32, "#ffffff", 0.55);

    ctx.beginPath();
    ctx.arc(width * 0.62, height * 0.42, height * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = light;
    ctx.fill();

    ctx.fillStyle = dark;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 8) {
      ctx.lineTo(x, height * 0.72 + Math.sin(x / 70 + index) * 18 + Math.sin(x / 23) * 4);
    }

    ctx.lineTo(width, height);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (project.shape === "object") {
    const w = width * 0.34;
    const h = height * 0.52;
    const x = width / 2 - w / 2;
    const y = height * 0.26;

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";

    ctx.beginPath();
    ctx.ellipse(width / 2, y + h + 14, w * 0.62, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    const objectGradient = ctx.createLinearGradient(x, 0, x + w, 0);
    objectGradient.addColorStop(0, dark);
    objectGradient.addColorStop(0.55, medium);
    objectGradient.addColorStop(1, dark);

    ctx.fillStyle = objectGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, w * 0.18);
    ctx.fill();

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w * 0.16, y + h * 0.1, w * 0.06, h * 0.8);
    ctx.globalAlpha = 1;
  } else if (project.shape === "waves") {
    for (let k = 0; k < 6; k++) {
      ctx.globalAlpha = 0.18 + k * 0.12;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 8) {
        ctx.lineTo(x, height * (0.35 + k * 0.1) + Math.sin(x / (60 + k * 12) + k + index) * 22);
      }

      ctx.lineTo(width, height);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  } else if (project.shape === "lines") {
    ctx.globalAlpha = 0.9;

    for (let k = 0; k < 9; k++) {
      const y = height * 0.12 + k * height * 0.09;

      ctx.fillRect(width * 0.12, y, width * (0.3 + 0.5 * Math.abs(Math.sin(k * 1.7 + index))), height * 0.035);
    }

    ctx.globalAlpha = 1;
  } else if (project.shape === "circles") {
    for (let k = 0; k < 5; k++) {
      ctx.globalAlpha = 0.22 + k * 0.14;
      ctx.beginPath();

      ctx.arc(width * (0.3 + k * 0.1), height * (0.62 - k * 0.06), height * (0.36 - k * 0.05), 0, Math.PI * 2);

      ctx.fill();
    }

    ctx.globalAlpha = 1;
  } else {
    const horizon = height * 0.62;

    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, horizon, width, height - horizon);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = light;

    for (let k = 0; k < 7; k++) {
      ctx.fillRect(width * 0.1 + random() * width * 0.6, horizon + 10 + k * 14, width * (0.1 + random() * 0.2), 2);
    }

    ctx.globalAlpha = 1;
  }

  // Grain
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  for (let p = 0; p < data.length; p += 4) {
    const noise = (random() - 0.5) * GRAIN * 2;

    data[p] += noise;
    data[p + 1] += noise;
    data[p + 2] += noise;
  }

  ctx.putImageData(image, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function Filter01() {
  const stageRef = useRef(null);
  const workRef = useRef(null);
  const gridRef = useRef(null);
  const filtersRef = useRef(null);
  const pillRef = useRef(null);
  const countRef = useRef(null);
  const countWordRef = useRef(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const work = workRef.current;
    const grid = gridRef.current;
    const filters = filtersRef.current;
    const pill = pillRef.current;
    const countEl = countRef.current;
    const countWord = countWordRef.current;

    if (!stage || !grid || !filters) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;

    const tiles = [...grid.querySelectorAll("[data-tile]")];
    const filterButtons = [...filters.querySelectorAll("[data-filter]")];

    let currentFilter = "all";
    let busy = false;
    let destroyed = false;

    const isVisible = (tile) => !tile.classList.contains(styles.gone);

    const matchesFilter = (tile, filter) => filter === "all" || tile.dataset.cat === filter;

    // Generate the project artwork.
    tiles.forEach((tile, index) => {
      const image = tile.querySelector("[data-card-image]");

      image.style.backgroundImage = `url(${paintCover(projects[index], index)})`;
    });

    const setHover = (tile, active) => {
      tile.querySelector("[data-card]").classList.toggle(styles.hover, active);
    };

    // Manual card hover only.
    if (hasHover) {
      tiles.forEach((tile) => {
        tile.addEventListener("pointerenter", () => setHover(tile, true));
        tile.addEventListener("pointerleave", () => setHover(tile, false));
      });
    }

    // Rolling project counter.
    function updateCounter(number, animate) {
      const value = String(number).padStart(2, " ");

      if (!countEl.children.length) {
        for (let k = 0; k < 2; k++) {
          const column = document.createElement("span");
          column.className = styles.countColumn;

          " 0123456789".split("").forEach((character) => {
            const digit = document.createElement("span");
            digit.textContent = character === " " ? "\u00a0" : character;
            column.appendChild(digit);
          });

          countEl.appendChild(column);
        }
      }

      [...countEl.children].forEach((column, index) => {
        const character = value[index];
        const digitIndex = character === " " ? 0 : Number(character) + 1;

        const height = column.firstElementChild.getBoundingClientRect().height || 16;

        gsap.to(column, {
          y: -digitIndex * height,
          duration: animate ? 0.6 : 0,
          ease: "back.out(1.6)",
          delay: animate ? index * 0.05 : 0,
        });

        column.style.display = character === " " ? "none" : "";
      });

      countWord.textContent = number === 1 ? "project" : "projects";
    }

    // Sliding filter pill.
    function movePill(filter, animate) {
      const button = filters.querySelector(`[data-filter="${filter}"]`);

      if (!button) return;

      const filterRect = filters.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      gsap.to(pill, {
        x: buttonRect.left - filterRect.left,
        width: buttonRect.width,
        duration: animate ? 0.55 : 0,
        ease: `back.out(${1 + BOUNCE * 0.5})`,
      });
    }

    // Fit the complete four-row mosaic into the viewport.
    function measure() {
      const computed = getComputedStyle(grid);
      const gap = parseFloat(computed.columnGap) || 8;

      const columnWidth = (grid.clientWidth - gap * 3) / 4;
      const verticalPadding = parseFloat(getComputedStyle(stage).paddingBottom) * 2;

      const aboveGrid = grid.getBoundingClientRect().top - work.getBoundingClientRect().top;

      const available = window.innerHeight - verticalPadding - aboveGrid - 4;

      const rowHeight = Math.max(34, Math.min(columnWidth * 0.78, (available - gap * 3) / 4));

      grid.style.setProperty("--riga", `${rowHeight.toFixed(1)}px`);

      const totalHeight = aboveGrid + rowHeight * 4 + gap * 3;

      stage.style.paddingTop = `${Math.max(verticalPadding / 2, (window.innerHeight - totalHeight) / 2).toFixed(1)}px`;

      movePill(currentFilter, false);
    }

    // Filter transition: manually calculated FLIP.
    function changeFilter(name) {
      if (name === currentFilter || busy || destroyed) return;

      filterButtons.forEach((button) => {
        const active = button.dataset.filter === name;

        button.classList.toggle(styles.active, active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      currentFilter = name;

      movePill(name, !reducedMotion);

      const activeButton = filters.querySelector(`[data-filter="${name}"] span`);

      gsap.fromTo(
        activeButton,
        { scale: 0.92 },
        {
          scale: 1,
          duration: 0.5,
          ease: "back.out(3)",
        },
      );

      const after = tiles.filter((tile) => matchesFilter(tile, name));

      updateCounter(after.length, !reducedMotion);

      tiles.forEach((tile) => setHover(tile, false));

      if (reducedMotion) {
        gsap.to(grid, {
          autoAlpha: 0,
          duration: 0.25,
          onComplete: () => {
            tiles.forEach((tile) => {
              tile.classList.toggle(styles.gone, !matchesFilter(tile, name));
            });

            gsap.to(grid, {
              autoAlpha: 1,
              duration: 0.3,
            });
          },
        });

        return;
      }

      busy = true;

      const gridRect = grid.getBoundingClientRect();
      const previousPositions = new Map();

      tiles.forEach((tile) => {
        if (!isVisible(tile)) return;

        const rect = tile.getBoundingClientRect();

        previousPositions.set(tile, {
          x: rect.left - gridRect.left,
          y: rect.top - gridRect.top,
          width: rect.width,
          height: rect.height,
        });
      });

      const previousHeight = grid.offsetHeight;

      const leaving = tiles.filter((tile) => isVisible(tile) && !matchesFilter(tile, name));

      const staying = tiles.filter((tile) => isVisible(tile) && matchesFilter(tile, name));

      const entering = tiles.filter((tile) => !isVisible(tile) && matchesFilter(tile, name));

      // Lift leaving tiles out of the grid.
      leaving.forEach((tile) => {
        const position = previousPositions.get(tile);

        gsap.set(tile, {
          position: "absolute",
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
          zIndex: 0,
        });
      });

      // Add the entering tiles back into the grid.
      entering.forEach((tile) => {
        tile.classList.remove(styles.gone);
      });

      gsap.set(grid, { height: "auto" });

      const nextHeight = grid.offsetHeight;
      const nextGridRect = grid.getBoundingClientRect();

      const timeline = gsap.timeline({
        onComplete: () => {
          leaving.forEach((tile) => {
            tile.classList.add(styles.gone);
            gsap.set(tile, { clearProps: "all" });
          });

          gsap.set(grid, { clearProps: "height" });

          busy = false;
        },
      });

      const spring = `back.out(${BOUNCE})`;

      if (leaving.length) {
        timeline.to(
          leaving,
          {
            scale: 0.86,
            autoAlpha: 0,
            duration: 0.32,
            ease: "power2.in",
            stagger: STAGGER * 0.5,
          },
          0,
        );
      }

      staying.forEach((tile, index) => {
        const previous = previousPositions.get(tile);
        const rect = tile.getBoundingClientRect();

        const dx = previous.x - (rect.left - nextGridRect.left);
        const dy = previous.y - (rect.top - nextGridRect.top);

        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

        timeline.fromTo(
          tile,
          { x: dx, y: dy, zIndex: 2 },
          {
            x: 0,
            y: 0,
            duration: MOVE,
            ease: spring,
            clearProps: "zIndex",
          },
          0.08 + index * STAGGER,
        );
      });

      if (entering.length) {
        timeline.fromTo(
          entering,
          { scale: 0.82, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: MOVE * 0.85,
            ease: spring,
            stagger: STAGGER,
          },
          0.2,
        );
      }

      timeline.fromTo(
        grid,
        { height: previousHeight },
        {
          height: nextHeight,
          duration: MOVE,
          ease: spring,
        },
        0.04,
      );
    }

    function handleFilterClick(event) {
      const button = event.target.closest("[data-filter]");

      if (!button) return;

      changeFilter(button.dataset.filter);
    }

    function handleResize() {
      if (!busy) measure();
    }

    // Initialize.
    measure();
    updateCounter(tiles.length, false);

    gsap.set(pill, { x: 3 });
    movePill("all", false);

    if (!reducedMotion) {
      gsap.from(tiles, {
        scale: 0.9,
        autoAlpha: 0,
        duration: 0.7,
        ease: "back.out(1.4)",
        stagger: 0.04,
        delay: 0.15,
      });

      gsap.from([work.querySelector(`.${styles.top}`), filters], {
        y: 8,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      });
    }

    filters.addEventListener("click", handleFilterClick);
    window.addEventListener("resize", handleResize);

    return () => {
      destroyed = true;

      filters.removeEventListener("click", handleFilterClick);
      window.removeEventListener("resize", handleResize);

      gsap.killTweensOf([...tiles, grid, pill, countEl, ...countEl.children]);

      tiles.forEach((tile) => {
        gsap.killTweensOf(tile);
        gsap.killTweensOf(tile.querySelector("[data-card]"));
      });
    };
  }, []);

  return (
    <main
      className={styles.stage}
      ref={stageRef}
      data-stage
    >
      <section
        className={styles.work}
        ref={workRef}
        data-work
      >
        <header className={styles.top}>
          <div className={styles.topHead}>
            <span className={styles.brand}>
              <svg
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path d='M5 4v16M5 12l9-8M5 12l10 8' />
              </svg>
              <span>{STUDIO}</span>
            </span>

            <h1 className={styles.title}>Selected work</h1>
          </div>

          <p className={styles.count}>
            <span
              className={styles.countNumber}
              ref={countRef}
            />
            <span ref={countWordRef}>projects</span>
          </p>
        </header>

        <nav
          className={styles.filters}
          ref={filtersRef}
          aria-label='Filter projects'
          data-filters
        >
          <span
            className={styles.filterPill}
            ref={pillRef}
            aria-hidden='true'
            data-pill
          />

          {filtersList.map((filter, index) => (
            <button
              key={filter.value}
              className={`${styles.filter} ${index === 0 ? styles.active : ""}`}
              type='button'
              data-filter={filter.value}
              aria-pressed={index === 0 ? "true" : "false"}
            >
              <span>{filter.label}</span>
            </button>
          ))}
        </nav>

        <div
          className={styles.grid}
          ref={gridRef}
          data-grid
        >
          {projects.map((project, index) => (
            <a
              key={project.title}
              href='#'
              className={`${styles.tile} ${project.size === "big" ? styles.tileBig : project.size === "wide" ? styles.tileWide : ""}`}
              data-tile
              data-cat={project.category}
              aria-label={`${project.title}, ${project.year}`}
              onClick={(event) => event.preventDefault()}
            >
              <span
                className={styles.card}
                data-card
              >
                <span
                  className={styles.cardImage}
                  data-card-image
                />

                <span className={styles.cardInfo}>
                  <b>{project.title}</b>
                  <i>{project.year}</i>
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
