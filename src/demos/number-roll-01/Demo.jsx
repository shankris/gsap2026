/* src/demos/number-roll-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const CELLS = 40;

const stats = [
  { label: "Installs", value: 6495, suffix: "", decimals: 0 },
  { label: "Releases", value: 41, suffix: "", decimals: 0 },
  { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
];

const wrap = (number) => ((number % 10) + 10) % 10;

const percentFor = (index) => -(index / CELLS) * 100;

function buildPieces(value, decimals, separator, decimalMark) {
  const places = Math.min(6, Math.max(0, Math.round(decimals)));
  const [whole = "0", fraction = ""] = Math.abs(value).toFixed(places).split(".");

  const grouped = separator ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, "\u0000") : whole;

  const characters = [...(value < 0 ? ["-"] : []), ...grouped, ...(places > 0 ? ["\u0001", ...fraction] : [])];

  const digitCount = characters.filter((character) => character >= "0" && character <= "9").length;

  let seen = 0;

  return characters.map((character) => {
    if (character >= "0" && character <= "9") {
      seen += 1;

      return {
        kind: "digit",
        digit: Number(character),
        fromRight: digitCount - seen,
      };
    }

    return {
      kind: "text",
      char: character === "\u0000" ? separator : character === "\u0001" ? decimalMark : character,
    };
  });
}

function startDigits(from, decimals, count) {
  const places = Math.min(6, Math.max(0, Math.round(decimals)));

  const digits = Math.abs(from).toFixed(places).replace(".", "").split("").map(Number);

  while (digits.length < count) {
    digits.unshift(0);
  }

  return digits.slice(digits.length - count);
}

function Odometer({ value = 12480, from = 0, duration = 3.6, stagger = 0.06, prefix = "", suffix = "", decimals = 0, separator = ",", decimalMark = ".", trigger = "inView", ease = "power3.out", className = "", affixClassName = "" }) {
  const boxRef = useRef(null);
  const firstRollPending = useRef(true);
  const [ready, setReady] = useState(false);

  const pieces = buildPieces(value, decimals, separator, decimalMark);

  const plain = pieces.map((piece) => (piece.kind === "digit" ? piece.digit : piece.char)).join("");

  const spoken = `${prefix}${plain}${suffix}`;

  const digitCount = pieces.filter((piece) => piece.kind === "digit").length;

  const layoutKey = `${digitCount}|${decimals}|${separator}|${decimalMark}`;

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    const box = boxRef.current;

    if (!ready || !box) return;

    const strips = Array.from(box.querySelectorAll("[data-wheel]"));

    if (strips.length === 0) return;

    const end = pieces.filter((piece) => piece.kind === "digit").map((piece) => piece.digit);

    const start = startDigits(from, decimals, end.length);

    const indexOf = (strip) => (-Number(gsap.getProperty(strip, "yPercent")) / 100) * CELLS;

    const show = (strip, index) => {
      gsap.set(strip, {
        yPercent: percentFor(index),
      });
    };

    const fresh = strips.some((strip) => !strip.dataset.set);

    if (fresh) {
      strips.forEach((strip, index) => {
        strip.dataset.set = "1";

        show(strip, trigger === "change" ? end[index] : start[index]);
      });

      firstRollPending.current = trigger !== "change";
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      strips.forEach((strip, index) => {
        show(strip, end[index]);
      });

      firstRollPending.current = false;
      return;
    }

    let timeline = null;
    let observer = null;

    const roll = () => {
      const forced = firstRollPending.current;

      const current = strips.map((strip) => wrap(indexOf(strip)));

      const distance = end.map((digit, index) => wrap(digit - current[index]));

      let first = distance.findIndex((distanceValue) => distanceValue > 0.001);

      if (forced) first = 0;

      if (first === -1) return;

      timeline = gsap.timeline({
        onComplete: () => {
          firstRollPending.current = false;
        },
      });

      strips.forEach((strip, index) => {
        if (index < first) return;

        const fromRight = strips.length - 1 - index;

        const turns = forced ? (fromRight === 0 ? 2 : 1) : distance[index] > 0.001 ? (fromRight === 0 && index > first ? 1 : 0) : 1;

        const travel = distance[index] + turns * 10;

        show(strip, current[index]);

        timeline.to(
          strip,
          {
            yPercent: percentFor(current[index] + travel),
            duration,
            ease,
            onComplete: () => {
              show(strip, end[index]);
            },
          },
          (index - first) * stagger,
        );
      });
    };

    if (firstRollPending.current && trigger === "inView") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;

          observer?.disconnect();
          roll();
        },
        { threshold: 0.3 },
      );

      observer.observe(box);
    } else {
      roll();
    }

    return () => {
      observer?.disconnect();
      timeline?.kill();
    };
    // pieces are represented by plain and layoutKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, plain, layoutKey, from, trigger, duration, stagger, ease]);

  const renderAffix = (text) =>
    text ? (
      <span
        aria-hidden='true'
        className={`${styles.affix} ${affixClassName}`}
      >
        {text}
      </span>
    ) : null;

  return (
    <span
      ref={boxRef}
      className={`${styles.odometer} ${className}`}
    >
      <span className={styles.srOnly}>{spoken}</span>

      {renderAffix(prefix)}

      <span
        key={ready ? layoutKey : "static"}
        aria-hidden='true'
        className={styles.digitGroup}
      >
        {ready
          ? pieces.map((piece, index) =>
              piece.kind === "text" ? (
                <span
                  key={`text-${index}`}
                  className={styles.fixedCharacter}
                >
                  {piece.char}
                </span>
              ) : (
                <span
                  key={`digit-${piece.fromRight}`}
                  className={styles.digitWindow}
                >
                  <span
                    data-wheel
                    className={styles.wheel}
                  >
                    {Array.from({ length: CELLS }, (_, cell) => (
                      <span
                        key={cell}
                        className={styles.wheelCell}
                      >
                        {cell % 10}
                      </span>
                    ))}
                  </span>
                </span>
              ),
            )
          : plain}
      </span>

      {renderAffix(suffix)}
    </span>
  );
}

export default function Demo(props) {
  const [round, setRound] = useState(0);

  const changes = props.trigger === "change";
  const bump = changes ? round : 0;

  const { value = 12480, className, ...shared } = props;

  const shownValue = value + bump * 1337;

  return (
    <div className={styles.demo}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>Installs this month</p>

        <div className={styles.heroNumber}>
          <Odometer
            key={changes ? "change" : round}
            {...shared}
            value={shownValue}
            className={`${styles.heroOdometer} ${className ?? ""}`}
            affixClassName={styles.heroAffix}
          />
        </div>
      </main>

      <div className={styles.stats}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`${styles.stat} ${index > 0 ? styles.statBorder : ""}`}
          >
            <Odometer
              key={changes ? stat.label : `${stat.label}-${round}`}
              value={stat.value + (stat.decimals ? 0 : bump * (index + 1) * 17)}
              decimals={stat.decimals}
              suffix={stat.suffix}
              trigger={props.trigger}
              duration={props.duration}
              stagger={props.stagger}
              ease={props.ease}
              separator={props.separator}
              className={styles.statNumber}
              affixClassName={styles.statAffix}
            />

            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <button
        type='button'
        onClick={() => setRound((current) => current + 1)}
        className={styles.rollButton}
      >
        {changes ? "Change the numbers" : "Roll again"}
      </button>
    </div>
  );
}
