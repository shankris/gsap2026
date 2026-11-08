// src/demos/button-02/SkewSlideButton.jsx

import styles from "./Demo.module.css";

function Copy({ label, arrow, kind, stagger }) {
  const chars = [...label];
  const copyClass = kind === "out" ? styles.out : styles.in;

  return (
    <span
      aria-hidden='true'
      className={styles.copy}
    >
      <span className={styles.label}>
        {chars.map((char, index) => (
          <span
            key={index}
            className={`${styles.piece} ${copyClass}`}
            style={{
              "--char": index + 1,
              "--stagger": `${stagger}s`,
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {arrow && (
        <svg
          viewBox='0 0 15 14'
          fill='none'
          className={styles.arrow}
        >
          {["M1.25 12.25L6.25 6.75L1.25 1.25", "M8.25 12.25L13.25 6.75L8.25 1.25"].map((path, index) => (
            <path
              key={path}
              d={path}
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`${styles.piece} ${styles.arrowPiece} ${copyClass}`}
              style={{
                "--char": chars.length + 1 + index,
                "--stagger": `${stagger}s`,
              }}
            />
          ))}
        </svg>
      )}
    </span>
  );
}

export default function SkewSlideButton({ children = "Book a ride", href, onClick, color = "#ff5a1f", ink = "#140b06", arrow = true, stagger = 0.018, className = "" }) {
  const style = {
    "--ease": "cubic-bezier(.19,1,.22,1)",
    "--stagger": `${stagger}s`,
    color: ink,
  };

  const content = (
    <>
      <span
        aria-hidden='true'
        className={styles.plate}
        style={{ background: color }}
      />

      <span className={styles.content}>
        <Copy
          label={children}
          arrow={arrow}
          kind='out'
          stagger={stagger}
        />
        <Copy
          label={children}
          arrow={arrow}
          kind='in'
          stagger={stagger}
        />
      </span>
    </>
  );

  const buttonClass = `${styles.button} ${className}`;

  return href ? (
    <a
      href={href}
      aria-label={children}
      className={buttonClass}
      style={style}
    >
      {content}
    </a>
  ) : (
    <button
      type='button'
      aria-label={children}
      onClick={onClick}
      className={buttonClass}
      style={style}
    >
      {content}
    </button>
  );
}
