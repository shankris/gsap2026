/* src/demos/background-02/Demo.jsx */

"use client";

import AuroraBackground from "./AuroraBackground";
import styles from "./Demo.module.css";

export default function Demo(props) {
  return (
    <div className={styles.demo}>
      <AuroraBackground
        {...props}
        wordmark={props.wordmark ?? "AURORA"}
        className={props.className ?? ""}
      >
        <div className={styles.content}>
          <span className={styles.brand}>DiMaac</span>

          <div className={styles.hero}>
            <h1>Light that rises slowly</h1>

            <p>A calm backdrop made from nothing but gradients. Switch the site theme and watch it retune itself.</p>

            <div className={styles.actions}>
              <button
                type='button'
                className={styles.primaryButton}
              >
                Get started
              </button>

              <button
                type='button'
                className={styles.secondaryButton}
              >
                Browse components
              </button>
            </div>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
