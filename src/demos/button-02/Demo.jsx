// src/demos/button-02/Demo.jsx

"use client";

import SkewSlideButton from "./SkewSlideButton";
import styles from "./Demo.module.css";

export default function Demo({ props = {} }) {
  const stagger = props.stagger ?? 0.018;
  const color = props.color ?? "#ff5a1f";

  return (
    <div className={styles.demo}>
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Anton&display=swap'
      />

      <SkewSlideButton
        href='#'
        stagger={stagger}
        color={color}
      />

      <SkewSlideButton
        href='#'
        stagger={stagger}
        color='#141414'
        ink='#f4f1ec'
      >
        Meet the team
      </SkewSlideButton>

      <SkewSlideButton
        href='#'
        stagger={stagger}
        color='#c8ff2e'
        arrow={false}
      >
        Join the grid
      </SkewSlideButton>
    </div>
  );
}
