// src/demos/calendar-02/Demo.jsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import eventsByMonth from "./events.json";
import styles from "./Demo.module.css";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  return [...Array.from({ length: startOffset }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
}

function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default function Demo() {
  const calendarRef = useRef(null);
  const previousHeightRef = useRef(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthKey = getMonthKey(year, month);
  const days = getMonthDays(year, month);
  const monthEvents = eventsByMonth[monthKey] || [];

  const selectedEvents = monthEvents.filter(([day]) => day === selectedDay);

  function prepareHeightAnimation() {
    const calendar = calendarRef.current;

    if (calendar) {
      previousHeightRef.current = calendar.getBoundingClientRect().height;
    }
  }

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(null);
  };

  function changeMonth(direction) {
    prepareHeightAnimation();

    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + direction, 1));

    setSelectedDay(null);
  }

  function selectDay(day) {
    prepareHeightAnimation();
    setSelectedDay((previous) => (previous === day ? null : day));
  }

  useLayoutEffect(() => {
    const calendar = calendarRef.current;
    const previousHeight = previousHeightRef.current;

    if (!calendar || previousHeight === null) {
      return;
    }

    previousHeightRef.current = null;

    calendar.style.height = "auto";
    const nextHeight = calendar.getBoundingClientRect().height;

    calendar.style.height = `${previousHeight}px`;

    // Force layout so GSAP starts from the preserved height.
    calendar.offsetHeight;

    const animation = gsap.to(calendar, {
      height: nextHeight,
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        calendar.style.height = "auto";
      },
    });

    return () => {
      animation.kill();
    };
  }, [currentMonth, selectedDay]);

  return (
    <main className={styles.stage}>
      <section
        ref={calendarRef}
        className={styles.calendar}
        aria-label='Calendar'
      >
        <header className={styles.header}>
          <button
            type='button'
            className={`${styles.monthButton} ${styles.previous}`}
            onClick={() => changeMonth(-1)}
            aria-label='Previous month'
          />

          <h1 className={styles.title}>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h1>

          <button
            type='button'
            className={`${styles.monthButton} ${styles.next}`}
            onClick={() => changeMonth(1)}
            aria-label='Next month'
          />
        </header>

        <div className={styles.weekdays}>
          {WEEK_DAYS.map((day) => (
            <div
              className={styles.weekday}
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        <div className={styles.days}>
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div
                  className={styles.emptyDay}
                  key={`empty-${index}`}
                />
              );
            }

            const hasEvents = monthEvents.some(([eventDay]) => eventDay === day);

            const isSelected = selectedDay === day;

            return (
              <div
                className={styles.day}
                key={day}
              >
                <button
                  type='button'
                  className={`${styles.dayButton} ${isSelected ? styles.selectedDay : ""}`}
                  onClick={() => selectDay(day)}
                  aria-label={`Select ${currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })} ${day}`}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>

                {hasEvents && (
                  <span
                    className={styles.eventIndicator}
                    aria-hidden='true'
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type='button'
          className={styles.todayButton}
          onClick={goToToday}
        >
          Today
        </button>

        {selectedDay !== null && (
          <section
            className={styles.details}
            aria-live='polite'
          >
            <h2 className={styles.detailsTitle}>
              {new Date(year, month, selectedDay).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </h2>

            {selectedEvents.length > 0 ? (
              <div className={styles.eventList}>
                {selectedEvents.map(([day, title, description, category], index) => (
                  <article
                    className={styles.event}
                    key={`${monthKey}-${day}-${index}`}
                  >
                    <span className={styles.eventCategory}>{category}</span>
                    <h3 className={styles.eventTitle}>{title}</h3>
                    <p className={styles.eventDescription}>{description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.noEvents}>No events scheduled for this date.</p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
