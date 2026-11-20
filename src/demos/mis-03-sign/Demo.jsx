"use client";

// src/demos/mis-03-sign/Demo.jsx

import styles from "./Demo.module.css";

export default function Demo() {
  return (
    <section className={styles.stage}>
      <div
        className={styles.followers}
        aria-label='5000 followers'
      >
        <div className={`${styles.pin} ${styles.back}`} />

        <div className={`${styles.pin} ${styles.front}`}>
          <div className={styles.icon}>
            <div className={styles.bottom}>
              <div className={styles.head} />
              <div className={styles.body} />
            </div>

            <div className={styles.top}>
              <div className={styles.head} />
              <div className={styles.body} />
            </div>
          </div>

          <div className={styles.number}>
            <div className={styles.bottom}>5,000</div>
            <div className={styles.top}>5,000</div>
          </div>
        </div>
      </div>
    </section>
  );
}
