// src/demos/datepicker-01/Demo.jsx

"use client";

import { useRef, useState } from "react";
import styles from "./Demo.module.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getWeekday(day, month, year) {
  return new Date(year, month - 1, day).getDay();
}

function DigitReel({ value, className = "" }) {
  return (
    <span className={`${styles.reel} ${className}`}>
      <span className={`${styles.strip} ${styles[`digit${value}`]}`}>
        {"01234567890".split("").map((digit, index) => (
          <i key={index}>{digit}</i>
        ))}
      </span>
    </span>
  );
}

function MonthReel({ month }) {
  return (
    <span className={`${styles.reel} ${styles.monthReel}`}>
      <span className={`${styles.strip} ${styles[`month${month - 1}`]}`}>
        {MONTHS.map((name) => (
          <i key={name}>{name}</i>
        ))}
      </span>
    </span>
  );
}

function DayDisplay({ day, month }) {
  const tens = Math.floor(day / 10);
  const units = day % 10;

  return (
    <p
      className={styles.date}
      aria-label={`${day} ${MONTHS[month - 1]}`}
    >
      <span className={`${styles.reel} ${styles.dayTens} ${day < 10 ? styles.hiddenDigit : ""}`}>
        <span className={`${styles.strip} ${styles[`digit${tens}`]}`}>
          {"0123".split("").map((digit, index) => (
            <i key={index}>{digit}</i>
          ))}
        </span>
      </span>

      <DigitReel
        value={units}
        className={styles.dayUnits}
      />

      <MonthReel month={month} />
    </p>
  );
}

function YearDisplay({ year }) {
  const digits = [Math.floor(year / 1000) % 10, Math.floor(year / 100) % 10, Math.floor(year / 10) % 10, year % 10];

  return (
    <span
      className={styles.years}
      aria-label={String(year)}
    >
      {digits.map((digit, index) => (
        <DigitReel
          key={index}
          value={digit}
          className={styles.yearDigit}
        />
      ))}
    </span>
  );
}

function Ruler({ type, value, min, max, gap, labels, onChange }) {
  const dragRef = useRef(null);

  function handlePointerDown(event) {
    if (event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return;
    if (dragRef.current.pointerId !== event.pointerId) return;

    const distance = dragRef.current.startX - event.clientX;
    const steps = Math.round(distance / gap);

    onChange(clamp(dragRef.current.startValue + steps, min, max));
  }

  function handlePointerEnd() {
    dragRef.current = null;
  }

  const isYear = type === "year";

  return (
    <div
      className={`${styles.ruler} ${styles[type]}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <input
        className={styles.rangeInput}
        type='range'
        min={min}
        max={max}
        value={value}
        aria-label={type === "day" ? "Day" : type === "month" ? "Month" : "Year"}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      {isYear ? (
        <div className={`${styles.track} ${styles.yearTrack}`}>
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : (
        <div
          className={styles.track}
          style={{ "--position": value }}
        >
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRuler({ hasYear, date, onChange }) {
  const { day, month, year } = date;
  const effectiveYear = hasYear ? year : 2025;
  const monthLength = getDaysInMonth(month, effectiveYear);
  const weekday = getWeekday(day, month, year);

  function updateDay(nextDay) {
    onChange({
      ...date,
      day: clamp(nextDay, 1, monthLength),
    });
  }

  function updateMonth(nextMonth) {
    const nextLength = getDaysInMonth(nextMonth, effectiveYear);

    onChange({
      ...date,
      month: nextMonth,
      day: Math.min(day, nextLength),
    });
  }

  function updateYear(nextYear) {
    const nextLength = getDaysInMonth(month, nextYear);

    onChange({
      ...date,
      year: nextYear,
      day: Math.min(day, nextLength),
    });
  }

  return (
    <div className={styles.picker}>
      {hasYear && (
        <div className={styles.meta}>
          <span className={styles.weekday}>{WEEKDAYS[weekday]}</span>
          <YearDisplay year={year} />
        </div>
      )}

      <DayDisplay
        day={day}
        month={month}
      />

      <Ruler
        type='day'
        value={day}
        min={1}
        max={monthLength}
        gap={64}
        labels={Array.from({ length: monthLength }, (_, index) => index + 1)}
        onChange={updateDay}
      />

      <Ruler
        type='month'
        value={month}
        min={1}
        max={12}
        gap={64}
        labels={MONTHS.map((name) => name.slice(0, 3))}
        onChange={updateMonth}
      />

      {hasYear && (
        <Ruler
          type='year'
          value={year}
          min={1900}
          max={2100}
          gap={72}
          labels={Array.from({ length: 9 }, (_, index) => year + index - 4)}
          onChange={updateYear}
        />
      )}

      <code className={styles.field}>
        day={day}&amp;month={month}
        {hasYear ? `&year=${year}` : ""}
      </code>
    </div>
  );
}

export default function Demo() {
  const [version, setVersion] = useState("v2");
  const [date, setDate] = useState({
    day: 27,
    month: 10,
    year: 2026,
  });

  const hasYear = version === "v2";

  return (
    <div className={styles.demo}>
      <div className={styles.versions}>
        <fieldset className={styles.tabs}>
          <legend className={styles.srOnly}>Date picker version</legend>

          <label className={version === "v1" ? styles.activeTab : ""}>
            <input
              type='radio'
              name='version'
              value='v1'
              checked={version === "v1"}
              onChange={() => setVersion("v1")}
            />
            <span className={styles.tabNumber}>V1</span>
            <span className={styles.tabText}>Day and month</span>
          </label>

          <label className={version === "v2" ? styles.activeTab : ""}>
            <input
              type='radio'
              name='version'
              value='v2'
              checked={version === "v2"}
              onChange={() => setVersion("v2")}
            />
            <span className={styles.tabNumber}>V2</span>
            <span className={styles.tabText}>With year</span>
          </label>
        </fieldset>

        <p className={styles.about}>{hasYear ? "Everything in v1, plus a year ruler (1900–2100), the weekday, and leap years." : "Drag a ruler sideways and the date rolls on the reels. The day stops at the month's end."}</p>
      </div>

      <main className={styles.main}>
        <section className={styles.stage}>
          <DateRuler
            hasYear={hasYear}
            date={date}
            onChange={setDate}
          />
        </section>

        <section
          className={styles.colophon}
          aria-labelledby='how-title'
        >
          <div className={styles.colophonHead}>
            <h2 id='how-title'>How it is built</h2>
            <a
              className={styles.down}
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
            <p>The rulers and rolling date reels are built with CSS transitions and React state. Drag a ruler to change the date, or focus its range control and use the arrow keys. The selected day is automatically adjusted when a month or year has fewer days.</p>

            <ul>
              <li>Day and month are controlled independently, with the day constrained by the selected month.</li>
              <li>The year version calculates weekdays and leap years, including the century and 400-year rules.</li>
              <li>Each ruler supports pointer dragging and keyboard range input.</li>
              <li>The rolling digits use registered visual positions represented by CSS classes and animated transforms.</li>
            </ul>
          </div>
        </section>
      </main>

      <div className={styles.labels}>
        <span className={styles.labelMade}>
          Built with <b>React + CSS</b>
        </span>
        <a
          className={styles.labelLink}
          href='https://reactivecss.com'
          target='_blank'
          rel='noopener noreferrer'
        >
          Original concept ↗
        </a>
      </div>

      <div className={`${styles.labels} ${styles.labelsLeft}`}>
        <a
          className={styles.labelX}
          href='https://x.com/troshkin_pavel'
          target='_blank'
          rel='noopener noreferrer'
        >
          𝕏 @troshkin_pavel
        </a>
      </div>
    </div>
  );
}
