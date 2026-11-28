/* src/demos/heatmap-02/Demo.jsx */

"use client";

import React, { useMemo } from "react";
import styles from "./Demo.module.css";
import data from "./data.json";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Parse YYYY-MM-DD as a local date
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function Demo({ year }) {
  // Default to the latest year available in the data
  const latestYear = useMemo(() => Math.max(...data.map((item) => Number(item.date.slice(0, 4)))), []);

  const displayYear = Number(year ?? latestYear);

  // Filter data for the selected year
  const yearData = useMemo(() => data.filter((item) => item.date.startsWith(`${displayYear}-`)), [displayYear]);

  // Build the 7 x 12 grid
  const grid = useMemo(() => {
    const result = Array.from({ length: 7 }, () => Array(12).fill(null));

    yearData.forEach((item) => {
      const date = parseLocalDate(item.date);

      const day = date.getDay();
      const month = date.getMonth();

      result[day][month] = item;
    });

    return result;
  }, [yearData]);

  return (
    <div className={styles.yearHeatmap}>
      <div className={styles.heatmapContent}>
        {/* Month Labels */}
        <div className={styles.monthRow}>
          <div className={styles.dayLabelSpacer} />

          {monthNames.map((month) => (
            <div
              key={month}
              className={styles.monthLabel}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className={styles.grid}>
          {grid.map((row, dayIndex) => (
            <div
              key={dayIndex}
              className={styles.row}
            >
              <div className={styles.dayLabel}>{dayNames[dayIndex]}</div>

              {row.map((cell, monthIndex) => {
                const count = cell?.count || 0;
                const level = Math.min(count, 4);

                return (
                  <div
                    key={monthIndex}
                    className={styles.cellWrapper}
                  >
                    <div className={`${styles.cell} ${styles[`level${level}`]}`}>
                      {cell && (
                        <span className={styles.tooltip}>
                          {parseLocalDate(cell.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}

                          <br />

                          {cell.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
