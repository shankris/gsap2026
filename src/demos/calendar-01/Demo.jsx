"use client";

// src/demos/calendar-01/Demo.jsx

import { useEffect, useMemo, useState } from "react";
import styles from "./Demo.module.css";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-first calendar
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let i = startOffset; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  const remaining = (7 - (days.length % 7)) % 7;

  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

const CATEGORIES = [
  { name: "Governance", color: "yellow" },
  { name: "Financial", color: "orange" },
  { name: "Strategy", color: "blue" },
  { name: "Compliance", color: "green" },
];

export default function Demo() {
  const today = useMemo(() => new Date(), []);

  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => formatDate(today));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/demos/calendar-01/events.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load calendar events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Calendar initialization failed:", error);
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const weeks = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const eventMap = useMemo(() => {
    const map = {};

    events.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }

      map[event.date].push(event);
    });

    return map;
  }, [events]);

  const selectedWeekIndex = days.findIndex((day) => formatDate(day) === selectedDate);

  const selectedWeek = Math.floor(selectedWeekIndex / 7);
  const selectedColumn = selectedWeekIndex % 7;

  function changeMonth(direction) {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + direction, 1));
    setSelectedDate("");
  }

  function selectDay(day) {
    setSelectedDate(formatDate(day));
  }

  return (
    <main className={styles.calendar}>
      <div className={styles.calendarPanel}>
        <header className={styles.header}>
          <button
            type='button'
            className={styles.left}
            onClick={() => changeMonth(-1)}
            aria-label='Previous month'
          />

          <h1>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h1>

          <button
            type='button'
            className={styles.right}
            onClick={() => changeMonth(1)}
            aria-label='Next month'
          />
        </header>

        <section className={styles.month}>
          <div className={styles.weekdayHeader}>
            {WEEK_DAYS.map((day) => (
              <div
                className={styles.weekday}
                key={day}
              >
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div
              className={styles.weekGroup}
              key={weekIndex}
            >
              <div className={styles.week}>
                {week.map((day) => {
                  const dateKey = formatDate(day);
                  const dayEvents = eventMap[dateKey] || [];
                  const isCurrentMonth = day.getMonth() === month;
                  const isToday = dateKey === formatDate(today);
                  const isSelected = dateKey === selectedDate;

                  return (
                    <button
                      type='button'
                      key={dateKey}
                      className={[styles.day, !isCurrentMonth ? styles.other : "", isToday ? styles.today : "", isSelected ? styles.selected : ""].join(" ")}
                      onClick={() => selectDay(day)}
                    >
                      <span className={styles.dayNumber}>{day.getDate()}</span>

                      <span className={styles.dayEvents}>
                        {dayEvents.map((event, index) => (
                          <span
                            key={`${event.eventName}-${index}`}
                            className={styles[event.color]}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && selectedWeek === weekIndex && (
                <section className={styles.details}>
                  <div className={`${styles.arrow} ${styles[`arrow${selectedColumn}`]}`} />

                  <div className={styles.events}>
                    {loading ? (
                      <div className={`${styles.event} ${styles.empty}`}>Loading events...</div>
                    ) : loadError ? (
                      <div className={`${styles.event} ${styles.empty}`}>Unable to load events</div>
                    ) : (eventMap[selectedDate] || []).length > 0 ? (
                      eventMap[selectedDate].map((event, index) => (
                        <div
                          className={styles.event}
                          key={`${event.eventName}-${index}`}
                        >
                          <span className={`${styles.eventCategory} ${styles[event.color]}`} />
                          <span>{event.eventName}</span>
                        </div>
                      ))
                    ) : (
                      <div className={`${styles.event} ${styles.empty}`}>No Events</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ))}
        </section>

        <footer className={styles.legend}>
          {CATEGORIES.map((category) => (
            <span
              key={category.name}
              className={`${styles.entry} ${styles[category.color]}`}
            >
              {category.name}
            </span>
          ))}
        </footer>
      </div>
    </main>
  );
}
