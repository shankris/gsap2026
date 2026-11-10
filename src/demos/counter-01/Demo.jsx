// src/demos/counter-01/Demo.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Demo.module.css";

const INITIAL_VALUES = {
  v1: 97,
  v2: 97,
  v3: 95,
};

const MODES = [
  { id: "v1", label: "Click & hold" },
  { id: "v2", label: "Drag dial" },
  { id: "v3", label: "Forms" },
];

function RollingValue({ value, draggable, onPointerDown, onPointerMove, onPointerUp }) {
  const digits = String(value).padStart(3, "0").split("");

  return (
    <div
      className={`${styles.value} ${draggable ? styles.draggable : ""}`}
      title={draggable ? "Drag up or down" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {digits.map((digit, index) => (
        <span
          key={index}
          className={`${styles.reel} ${index === 0 ? (value < 100 ? styles.hiddenDigit : styles.hundreds) : index === 1 ? (value < 10 ? styles.hiddenDigit : styles.tens) : styles.units}`}
        >
          <span className={`${styles.strip} ${styles[`position${digit}`]}`}>
            {Array.from({ length: 10 }, (_, number) => (
              <i key={number}>{number}</i>
            ))}
          </span>
        </span>
      ))}
      <span
        className={styles.sr}
        aria-live='polite'
      >
        {value}
      </span>
    </div>
  );
}

function StepButton({ direction, onStep, disabled, onUse }) {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const repeatedRef = useRef(false);

  const stopRepeating = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const startRepeating = () => {
    repeatedRef.current = false;

    timeoutRef.current = setTimeout(() => {
      repeatedRef.current = true;
      onUse();
      onStep();

      intervalRef.current = setInterval(() => {
        onStep();
      }, 80);
    }, 400);
  };

  const handlePointerDown = (event) => {
    if (disabled) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRepeating();
  };

  const handlePointerUp = () => {
    stopRepeating();
  };

  const handleClick = () => {
    if (disabled) return;

    if (repeatedRef.current) {
      repeatedRef.current = false;
      return;
    }

    onUse();
    onStep();
  };

  useEffect(() => stopRepeating, []);

  return (
    <button
      type='button'
      className={`${styles.step} ${direction === "minus" ? styles.minus : styles.plus}`}
      aria-label={direction === "minus" ? "Decrease" : "Increase"}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onClick={handleClick}
    >
      <svg
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path d={direction === "minus" ? "M5 12h14" : "M5 12h14M12 5v14"} />
      </svg>
    </button>
  );
}

function Counter({ mode }) {
  const min = mode === "v3" ? 0 : 0;
  const max = mode === "v3" ? 150 : 999;
  const step = mode === "v3" ? 5 : 1;

  const [value, setValue] = useState(INITIAL_VALUES[mode]);
  const [disabled, setDisabled] = useState(false);
  const [tried, setTried] = useState({
    drag: false,
    click: false,
    press: false,
  });

  const dragRef = useRef(null);

  const changeValue = (amount) => {
    if (disabled) return;
    setValue((current) => Math.min(max, Math.max(min, current + amount)));
  };

  const startDrag = (event) => {
    if (mode === "v1" || disabled) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startY: event.clientY,
      startValue: value,
    };
  };

  const moveDrag = (event) => {
    if (!dragRef.current || disabled) return;

    const delta = dragRef.current.startY - event.clientY;
    const steps = Math.round(delta / 10);

    setValue(Math.min(max, Math.max(min, dragRef.current.startValue + steps * step)));

    if (Math.abs(delta) > 0) {
      setTried((current) => ({ ...current, drag: true }));
    }
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const markUsed = (type) => {
    setTried((current) => ({ ...current, [type]: true }));
  };

  return (
    <form
      className={`${styles.counter} ${disabled ? styles.disabled : ""}`}
      role='group'
      aria-label='Counter'
      onSubmit={(event) => event.preventDefault()}
    >
      <input
        type='hidden'
        name='quantity'
        value={value}
      />

      <StepButton
        direction='minus'
        disabled={disabled || value <= min}
        onStep={() => changeValue(-step)}
        onUse={() => markUsed("click")}
      />

      <RollingValue
        value={value}
        draggable={mode !== "v1" && !disabled}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
      />

      <StepButton
        direction='plus'
        disabled={disabled || value >= max}
        onStep={() => changeValue(step)}
        onUse={() => markUsed("click")}
      />

      {mode !== "v1" && (
        <>
          {!tried.drag && (
            <p className={`${styles.hint} ${styles.dragHint}`}>
              <span>drag</span>
              <svg
                viewBox='0 0 50 100'
                aria-hidden='true'
              >
                <path d='M2 98 C1 60 18 24 48 3 M33 5 L49 2 L45 19' />
              </svg>
            </p>
          )}

          {!tried.click && (
            <p className={`${styles.hint} ${styles.clickHint}`}>
              <span>click / tap</span>
              <svg
                viewBox='0 0 50 100'
                aria-hidden='true'
              >
                <path d='M2 98 C1 60 18 24 48 3 M33 5 L49 2 L45 19' />
              </svg>
            </p>
          )}

          {!tried.press && (
            <p className={`${styles.hint} ${styles.pressHint}`}>
              <span>press</span>
              <svg
                viewBox='0 0 50 100'
                aria-hidden='true'
              >
                <path d='M2 98 C1 60 18 24 48 3 M33 5 L49 2 L45 19' />
              </svg>
            </p>
          )}
        </>
      )}

      {mode === "v3" && (
        <div className={styles.formBar}>
          <label className={styles.toggle}>
            <input
              type='checkbox'
              checked={disabled}
              onChange={(event) => setDisabled(event.target.checked)}
            />
            Disable the field
          </label>

          <code className={styles.field}>
            &lt;input name="quantity" value="{value}" min="0" max="150" step="5"
            {disabled ? " disabled" : ""}&gt;
          </code>
        </div>
      )}
    </form>
  );
}

export default function Demo() {
  const [activeMode, setActiveMode] = useState("v3");

  const descriptions = {
    v1: "Tap − or + to step; hold one to repeat. A hidden field carries the count into a form.",
    v2: "Everything in v1, plus: drag the number up or down like a dial, one step every 10px.",
    v3: "Everything in v2, plus: the form sets the range and step (0–150, by 5), and disabling the field stops the counter.",
  };

  return (
    <main className={styles.demo}>
      <div className={styles.versions}>
        <div
          className={styles.tabs}
          role='tablist'
          aria-label='Counter versions'
        >
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type='button'
              role='tab'
              aria-selected={activeMode === mode.id}
              className={activeMode === mode.id ? styles.activeTab : ""}
              onClick={() => setActiveMode(mode.id)}
            >
              <b>{mode.id}</b>
              {mode.label}
            </button>
          ))}
        </div>

        <p className={styles.about}>{descriptions[activeMode]}</p>
      </div>

      <section className={styles.stage}>
        <Counter
          key={activeMode}
          mode={activeMode}
        />
      </section>

      <section className={styles.colophon}>
        <div className={styles.colophonHead}>
          <h2>How it is built</h2>
          <a
            href='#how-text'
            aria-label='Read how it is built'
          >
            <svg
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path d='M12 4v15M6 13l6 6 6-6' />
            </svg>
          </a>
        </div>

        <div
          className={styles.howText}
          id='how-text'
        >
          <p>The reels are built with CSS. Each digit moves independently, creating an odometer-style counter. React manages the count, button interactions, drag behavior, and form settings.</p>

          <ul>
            <li>The − and + buttons change the count within its permitted range. The hidden quantity field stays synchronized with the displayed value.</li>
            <li>Hold either button to repeat the action. The first repeat starts after a short delay, followed by faster steps.</li>
            <li>In v2, dragging the number up or down changes the count, one step for every 10 pixels.</li>
            <li>In v3, the counter uses a range of 0–150 and changes in increments of 5. The checkbox disables the counter.</li>
          </ul>
        </div>
      </section>

      <div className={styles.labels}>
        <span>
          Built with <b>React + CSS</b>
        </span>
        <a
          href='https://reactivecss.com'
          target='_blank'
          rel='noopener noreferrer'
        >
          Original concept ↗
        </a>
      </div>
    </main>
  );
}
