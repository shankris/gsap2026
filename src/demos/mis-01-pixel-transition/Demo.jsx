/* src/demos/mis-01-pixel-transition/Demo.jsx */

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import styles from "./Demo.module.css";

const menuAnim = {
  initial: { opacity: 0 },
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

const centeredAnim = {
  initial: { opacity: 0 },
  open: (i) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.03 * i },
  }),
  closed: (i) => ({
    opacity: 0,
    transition: { duration: 0, delay: 0.03 * i },
  }),
};

const horizontalAnim = {
  initial: { opacity: 0 },
  open: (delay) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.02 * delay[0] },
  }),
  closed: (delay) => ({
    opacity: 0,
    transition: { duration: 0, delay: 0.02 * delay[1] },
  }),
};

const verticalAnim = {
  initial: { opacity: 0 },
  open: (delay) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.04 * delay[1] },
  }),
  closed: (delay) => ({
    opacity: 0,
    transition: { duration: 0, delay: 0.04 * delay[0] },
  }),
};

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

function Header({ menuIsActive, setMenuIsActive }) {
  return (
    <header className={styles.header}>
      <button
        type='button'
        aria-label={menuIsActive ? "Close menu" : "Open menu"}
        aria-expanded={menuIsActive}
        className={`${styles.burger} ${menuIsActive ? styles.burgerActive : ""}`}
        onClick={() => setMenuIsActive((prev) => !prev)}
      />
    </header>
  );
}

function Menu({ menuIsActive }) {
  return (
    <motion.div
      className={styles.menu}
      variants={menuAnim}
      initial='initial'
      animate={menuIsActive ? "open" : "closed"}
    >
      <p>Home</p>
      <p>About</p>
      <p>Contact</p>
    </motion.div>
  );
}

function CenteredPixelTransition({ menuIsActive, viewport }) {
  const blockSize = viewport.width * 0.05;
  const numberOfBlocks = blockSize ? Math.ceil(viewport.height / blockSize) : 0;

  const columns = useMemo(() => Array.from({ length: 20 }, () => shuffle(Array.from({ length: numberOfBlocks }, (_, i) => i))), [numberOfBlocks]);

  if (!viewport.width) return null;

  return (
    <div className={styles.pixelBackground}>
      {columns.map((blocks, columnIndex) => (
        <div
          key={columnIndex}
          className={styles.column}
        >
          {blocks.map((randomIndex, index) => (
            <motion.div
              key={index}
              className={styles.block}
              variants={centeredAnim}
              initial='initial'
              animate={menuIsActive ? "open" : "closed"}
              custom={randomIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HorizontalPixelTransition({ menuIsActive, viewport }) {
  const blockSize = viewport.width * 0.05;
  const numberOfBlocks = blockSize ? Math.ceil(viewport.height / blockSize) : 0;

  const columns = useMemo(() => Array.from({ length: 20 }, () => shuffle(Array.from({ length: numberOfBlocks }, (_, i) => i))), [numberOfBlocks]);

  if (!viewport.width) return null;

  return (
    <div className={styles.pixelBackground}>
      {columns.map((blocks, columnIndex) => (
        <div
          key={columnIndex}
          className={styles.column}
        >
          {blocks.map((randomIndex, index) => (
            <motion.div
              key={index}
              className={styles.block}
              variants={horizontalAnim}
              initial='initial'
              animate={menuIsActive ? "open" : "closed"}
              custom={[columnIndex + randomIndex, 20 - columnIndex + randomIndex]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function VerticalPixelTransition({ menuIsActive, viewport }) {
  const blockSize = viewport.height * 0.1;
  const numberOfBlocks = blockSize ? Math.ceil(viewport.width / blockSize) : 0;

  const rows = useMemo(() => Array.from({ length: 10 }, () => shuffle(Array.from({ length: numberOfBlocks }, (_, i) => i))), [numberOfBlocks]);

  if (!viewport.width) return null;

  return (
    <div className={`${styles.pixelBackground} ${styles.verticalBackground}`}>
      {rows.map((blocks, rowIndex) => (
        <div
          key={rowIndex}
          className={styles.row}
        >
          {blocks.map((randomIndex, index) => (
            <motion.div
              key={index}
              className={styles.block}
              variants={verticalAnim}
              initial='initial'
              animate={menuIsActive ? "open" : "closed"}
              custom={[rowIndex + randomIndex, 10 - rowIndex + randomIndex]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Mis01PixelTransition() {
  const [menuIsActive, setMenuIsActive] = useState(false);
  const viewport = useViewport();

  return (
    <main className={styles.main}>
      <Header
        menuIsActive={menuIsActive}
        setMenuIsActive={setMenuIsActive}
      />

      <Menu menuIsActive={menuIsActive} />

      {/* Original active variation */}
      <VerticalPixelTransition
        menuIsActive={menuIsActive}
        viewport={viewport}
      />

      {/* Other original variations */}
      {/* <CenteredPixelTransition menuIsActive={menuIsActive} viewport={viewport} /> */}
      {/* <HorizontalPixelTransition menuIsActive={menuIsActive} viewport={viewport} /> */}
    </main>
  );
}
