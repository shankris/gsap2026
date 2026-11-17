/* src/demos/widget-01/Demo.jsx */

"use client";

import { useLayoutEffect, useRef } from "react";
import { Star, Gauge, LayoutGrid, Activity } from "lucide-react";
import gsap from "gsap";

import styles from "./Demo.module.css";

const bars = [35, 52, 42, 68, 55, 75, 62, 88, 72, 100, 83, 94];

function StatCard({ children, index }) {
  return (
    <article
      className={styles.statCard}
      data-card={index}
    >
      {children}
    </article>
  );
}

export default function Demo() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".stat-card", root);
      const counters = gsap.utils.toArray(".counter", root);
      const ratingStars = gsap.utils.toArray(".rating-stars span", root);
      const chartLine = root.querySelector(".chart-line");
      const chartBars = gsap.utils.toArray(".bar-chart span", root);
      const gaugeNeedle = root.querySelector(".gauge-needle");

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Reduced-motion fallback
      if (prefersReducedMotion) {
        counters.forEach((counter) => {
          const value = Number(counter.dataset.value);
          const decimals = Number(counter.dataset.decimals || 0);

          counter.textContent = value.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        });

        return;
      }

      // Prepare chart line
      if (chartLine) {
        const length = chartLine.getTotalLength();

        gsap.set(chartLine, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      }

      // Initial states
      gsap.set(".stats-header > *", {
        opacity: 0,
        y: 14,
      });

      gsap.set(cards, {
        opacity: 0,
        y: 24,
      });

      gsap.set(chartBars, {
        scaleY: 0,
        transformOrigin: "bottom",
      });

      // Counter animation
      counters.forEach((counter, index) => {
        const target = Number(counter.dataset.value);
        const decimals = Number(counter.dataset.decimals || 0);
        const state = { value: 0 };

        gsap.to(state, {
          value: target,
          duration: 1.7,
          delay: 0.25 + index * 0.22,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = state.value.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
          },
        });
      });

      // Header and card entrance
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .to(".stats-header > *", {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
        })
        .to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.16,
          },
          "-=0.2",
        );

      // Growth line drawing
      if (chartLine) {
        gsap.to(chartLine, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: 0.65,
          ease: "power2.inOut",
        });
      }

      // Bar chart rising
      gsap.to(chartBars, {
        scaleY: 1,
        duration: 0.7,
        stagger: 0.07,
        delay: 0.8,
        ease: "back.out(1.3)",
      });

      // Customer satisfaction stars
      gsap.to(ratingStars, {
        opacity: 1,
        duration: 0.35,
        stagger: 0.12,
        delay: 1.1,
        ease: "power1.out",
      });

      // Speedometer needle
      const responseTime = 42;
      const maxResponseTime = 200;

      const needleRotation = -90 + (responseTime / maxResponseTime) * 180;

      if (gaugeNeedle) {
        gsap.set(gaugeNeedle, {
          svgOrigin: "110 110",
          rotation: 0,
        });

        gsap.to(gaugeNeedle, {
          rotation: needleRotation,
          duration: 1.3,
          delay: 1.25,
          ease: "power2.out",
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className={styles.widget}
    >
      <section className={styles.statsSection}>
        <header className='stats-header'>
          <div>
            <span className={styles.eyebrow}>OVERVIEW / 2026</span>
            <h1 className={styles.pageTitle}>Small numbers. Big progress.</h1>
            <div className={styles.subHead}>A snapshot of the work we're doing together.</div>
          </div>
        </header>

        <section className={styles.statsGrid}>
          {/* Stat 01 */}
          <StatCard index={0}>
            <div className={styles.cardTop}>
              <span className={styles.statLabel}>Projects completed</span>
              <span className={`${styles.statIcon} ${styles.iconViolet}`}>
                <LayoutGrid
                  size={18}
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <div className={styles.statValue}>
              <span
                className='counter'
                data-value='248'
              >
                0
              </span>
              <span className={styles.statSuffix}>+</span>
            </div>

            <div className={styles.chartArea}>
              <svg
                className={styles.lineChart}
                viewBox='0 0 280 70'
                preserveAspectRatio='none'
                aria-hidden='true'
              >
                <path
                  className={styles.chartFill}
                  d='M0 58 C25 54 35 48 55 52 S85 37 110 42 S145 25 165 32 S200 15 220 24 S255 5 280 8 V70 H0 Z'
                />
                <path
                  className='chart-line'
                  d='M0 58 C25 54 35 48 55 52 S85 37 110 42 S145 25 165 32 S200 15 220 24 S255 5 280 8'
                />
              </svg>
            </div>

            <div className={styles.cardFooter}>
              <span>Completed successfully</span>
              <span className={styles.positive}>+18.6%</span>
            </div>
          </StatCard>

          {/* Stat 02 */}
          <StatCard index={1}>
            <div className={styles.cardTop}>
              <span className={styles.statLabel}>Active workspaces</span>
              <span className={`${styles.statIcon} ${styles.iconBlue}`}>
                <Activity
                  size={18}
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <div className={styles.statValue}>
              <span
                className='counter'
                data-value='1840'
              >
                0
              </span>
            </div>

            <div className={`${styles.chartArea} ${styles.barChart} bar-chart`}>
              {bars.map((height, index) => (
                <span
                  key={index}
                  style={{ "--bar-height": `${height}%` }}
                />
              ))}
            </div>

            <div className={styles.cardFooter}>
              <span>Across all teams</span>
              <span className={styles.positive}>+24.2%</span>
            </div>
          </StatCard>

          {/* Stat 03 */}
          <StatCard index={2}>
            <div className={styles.cardTop}>
              <span className={styles.statLabel}>Customer satisfaction</span>
              <span className={`${styles.statIcon} ${styles.iconOrange}`}>
                <Star
                  size={18}
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <div className={`${styles.statValue} ${styles.ratingValue}`}>
              <span
                className='counter'
                data-value='4.7'
                data-decimals='1'
              >
                0
              </span>
              <span className={styles.statSuffix}>/ 5</span>
            </div>

            <div
              className={`${styles.ratingStars} rating-stars`}
              aria-label='4.7 out of 5 stars'
            >
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span className={styles.partialStar}>★</span>
            </div>

            <div className={styles.ratingCaption}>Based on recent customer feedback</div>

            <div className={styles.cardFooter}>
              <span>Customer experience</span>
              <span className={styles.positive}>Excellent</span>
            </div>
          </StatCard>

          {/* Stat 04 */}
          <StatCard index={3}>
            <div className={styles.cardTop}>
              <span className={styles.statLabel}>Average response time</span>
              <span className={`${styles.statIcon} ${styles.iconGreen}`}>
                <Gauge
                  size={18}
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <div className={styles.statValue}>
              <span
                className='counter'
                data-value='42'
              >
                0
              </span>
              <span className={styles.statSuffix}>ms</span>
            </div>

            <div className={styles.speedometer}>
              <svg
                viewBox='0 0 220 132'
                className={styles.speedometerSvg}
                aria-hidden='true'
              >
                <path
                  className={`${styles.gaugeSegment} ${styles.gaugeGreen}`}
                  d='M28 110 A82 82 0 0 1 52 52'
                />
                <path
                  className={`${styles.gaugeSegment} ${styles.gaugeYellow}`}
                  d='M52 52 A82 82 0 0 1 110 28'
                />
                <path
                  className={`${styles.gaugeSegment} ${styles.gaugeOrange}`}
                  d='M110 28 A82 82 0 0 1 168 52'
                />
                <path
                  className={`${styles.gaugeSegment} ${styles.gaugeRed}`}
                  d='M168 52 A82 82 0 0 1 192 110'
                />

                <line
                  className='gauge-needle'
                  x1='110'
                  y1='110'
                  x2='110'
                  y2='43'
                />

                <circle
                  className={styles.gaugeCenter}
                  cx='110'
                  cy='110'
                  r='7'
                />

                <text
                  x='25'
                  y='128'
                  className={styles.gaugeLabel}
                >
                  0 ms
                </text>
                <text
                  x='195'
                  y='128'
                  textAnchor='end'
                  className={styles.gaugeLabel}
                >
                  200 ms
                </text>
              </svg>
            </div>

            <div className={styles.cardFooter}>
              <span>Average across all regions</span>
              <span className={styles.positive}>−12.4%</span>
            </div>
          </StatCard>
        </section>

        <footer className={styles.statsFooter}>
          <span>Performance at a glance</span>
          <span>Data refreshed automatically</span>
        </footer>
      </section>
    </main>
  );
}
