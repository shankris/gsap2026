/* src/demos/heatmap-01/Demo.jsx */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./Demo.module.css";
import data from "./data.json";

function getDates(start, end) {
  const dates = [];
  const cur = new Date(start);

  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

function groupByWeeks(dates) {
  // Groups with weeks starting on Sunday
  const weeks = [];
  let week = [];

  dates.forEach((date) => {
    if (date.getDay() === 0 && week.length) {
      weeks.push(week);
      week = [];
    }

    week.push(date);
  });

  if (week.length) weeks.push(week);

  return weeks;
}

export default function Demo({ startDate: startProp, endDate: endProp }) {
  // Default range: last 365 days, including today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultEnd = today;

  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 364);

  const startDate = useMemo(() => (startProp ? new Date(startProp) : defaultStart), [startProp]);

  const endDate = useMemo(() => (endProp ? new Date(endProp) : defaultEnd), [endProp]);

  // Create lookup
  const lookup = useMemo(() => {
    const map = {};

    data.forEach((item) => {
      map[item.date] = item.count;
    });

    return map;
  }, []);

  // Generate dates and weeks
  const dates = useMemo(() => getDates(startDate, endDate), [startDate, endDate]);

  const weeks = useMemo(() => groupByWeeks(dates), [dates]);

  // Read CSS variables for month label positioning
  const [colWidth, setColWidth] = useState(20);
  const [spacer, setSpacer] = useState(40);

  useEffect(() => {
    function computeFromCSS() {
      const root = getComputedStyle(document.documentElement);

      const cell = parseFloat(root.getPropertyValue("--heatmap-cell-size")) || 16;

      const gap = parseFloat(root.getPropertyValue("--heatmap-cell-gap")) || 4;

      const weekdaySpacer = parseFloat(root.getPropertyValue("--heatmap-weekday-spacer")) || 40;

      setColWidth(cell + gap);
      setSpacer(weekdaySpacer);
    }

    computeFromCSS();

    window.addEventListener("resize", computeFromCSS);

    return () => {
      window.removeEventListener("resize", computeFromCSS);
    };
  }, []);

  return (
    <div className={styles.heatmapWrapper}>
      <div className={styles.heatmapContent}>
        {/* Month labels */}
        <div className={styles.monthRow}>
          {weeks.map((week, index) => {
            const firstDay = week[0];

            const month = firstDay.toLocaleString("default", {
              month: "short",
            });

            const previousMonth =
              index > 0
                ? weeks[index - 1][0].toLocaleString("default", {
                    month: "short",
                  })
                : null;

            const showLabel = index === 0 || month !== previousMonth;

            return (
              <div
                key={index}
                className={styles.monthLabel}
                style={{
                  left: `${spacer + index * colWidth}px`,
                }}
              >
                {showLabel ? month : ""}
              </div>
            );
          })}
        </div>

        <div className={styles.heatmapGrid}>
          {/* Weekday labels */}
          <div className={styles.weekdayCol}>
            <span>Sun</span>
            <span>Wed</span>
            <span>Sat</span>
          </div>

          {/* Week columns */}
          <div className={styles.weeks}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className={styles.week}
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = week.find((day) => day.getDay() === dayIndex);

                  if (!date) {
                    return (
                      <div
                        key={dayIndex}
                        className={styles.cell}
                      />
                    );
                  }

                  const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

                  const count = lookup[iso] || 0;

                  let level = 0;

                  if (count > 0) level = 1;
                  if (count > 3) level = 2;
                  if (count > 6) level = 3;
                  if (count > 10) level = 4;

                  return (
                    <div
                      key={dayIndex}
                      className={styles.tooltipWrapper}
                    >
                      <div className={`${styles.cell} ${styles[`level${level}`]}`} />

                      <span className={styles.tooltip}>
                        {count} contribution{count !== 1 ? "s" : ""} on{" "}
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
