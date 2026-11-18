/* src/demos/number-roll-03/Demo.jsx */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

const MIN_VALUE = 100;
const MAX_VALUE = 99999;
const INITIAL_VALUE = 12486;
const MAX_TURNS = 3;

const isDigit = (char) => char >= "0" && char <= "9";

function getRandomNumber() {
  return Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE;
}

/* --------------------------------------------------
   Number Figure
-------------------------------------------------- */

function NumberFigure({ value }) {
  const formattedValue = value.toLocaleString("en-US");
  const chars = [...formattedValue];

  return (
    <>
      <span className={styles.srOnly}>{formattedValue}</span>

      <span
        className={styles.figure}
        aria-hidden='true'
      >
        {chars.map((char, index) => {
          if (!isDigit(char)) {
            return <span key={index}>{char}</span>;
          }

          const turns = Math.min(MAX_TURNS, chars.slice(0, index).filter(isDigit).length + 1);

          const rowCount = turns * 10 + Number(char) + 1;

          return (
            <span
              className={styles.slot}
              key={index}
            >
              <span className={styles.slotSize}>{char}</span>

              <span className={styles.wheel}>
                {Array.from({ length: rowCount }, (_, number) => (
                  <span key={number}>{number % 10}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}

/* --------------------------------------------------
   Demo
-------------------------------------------------- */

export default function NumberRoll03() {
  const [value, setValue] = useState(INITIAL_VALUE);
  const [rollKey, setRollKey] = useState(0);

  const numberRef = useRef(null);
  const animationRef = useRef(null);

  useLayoutEffect(() => {
    const container = numberRef.current;

    if (!container) return;

    const wheels = container.querySelectorAll(`.${styles.wheel}`);

    if (!wheels.length) return;

    animationRef.current?.kill();

    // Begin every wheel at zero.
    gsap.set(wheels, { y: 0 });

    // Roll to the target digit.
    animationRef.current = gsap.to(wheels, {
      y: (_, wheel) => {
        const digitHeight = wheel.parentElement.querySelector(`.${styles.slotSize}`).getBoundingClientRect().height;

        return -(wheel.children.length - 1) * digitHeight;
      },
      duration: 4.4,
      stagger: 0.3,
      ease: "power4.out",
      overwrite: true,
    });

    return () => {
      animationRef.current?.kill();
    };
  }, [rollKey]);

  const generateNumber = () => {
    setValue(getRandomNumber());
    setRollKey((previous) => previous + 1);
  };

  return (
    <main className={styles.stage}>
      <section className={styles.component}>
        <div
          className={styles.numberWrap}
          ref={numberRef}
          onCopy={(event) => {
            event.preventDefault();
            event.clipboardData.setData("text/plain", value.toLocaleString("en-US"));
          }}
        >
          <NumberFigure value={value} />
        </div>

        <button
          className={styles.button}
          type='button'
          onClick={generateNumber}
        >
          Generate number
        </button>
      </section>
    </main>
  );
}
