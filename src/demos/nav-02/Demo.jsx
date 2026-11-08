"use client";

// src/demos/nav-02/Demo.jsx

import LiquidDock from "./LiquidDock";
import styles from "./Demo.module.css";

export default function Demo({ props = {} }) {
  return (
    <div className={styles.demo}>
      <div
        aria-hidden='true'
        className={styles.background}
      >
        <div className={styles.orangeGlow} />
        <div className={styles.purpleGlow} />
        <div className={styles.tealGlow} />
      </div>

      <LiquidDock
        magnify={props.magnify}
        stretch={props.stretch}
        size={props.size}
        tooltips={props.tooltips}
      />
    </div>
  );
}
