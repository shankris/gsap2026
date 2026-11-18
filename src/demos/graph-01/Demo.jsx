/* src/demos/graph-01/Demo.jsx */

"use client";

import styles from "./Demo.module.css";

const DATA = [
  { name: "Housing", amount: 1450, color: "#075e57" },
  { name: "Groceries", amount: 612, color: "#0f766e" },
  { name: "Shopping", amount: 442, color: "#4d9b91" },
  { name: "Transport", amount: 384, color: "#83b8ae" },
  { name: "Dining out", amount: 296, color: "#b5d3ca" },
];

const TOTAL = DATA.reduce((sum, item) => sum + item.amount, 0);
const BUDGET = 4200;

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.2;

const TICKS = Array.from({ length: 72 }, (_, index) => ({
  angle: index * 5,
  long: index % 6 === 0,
}));

const formatAmount = (amount) => amount.toLocaleString("en-US");

export default function Graph01() {
  let offset = 0;

  const slices = DATA.map((item) => {
    const length = (item.amount / TOTAL) * CIRCUMFERENCE;
    const gapLength = (GAP / 360) * CIRCUMFERENCE;

    const slice = {
      ...item,
      length: length - gapLength,
      offset: offset,
    };

    offset += length;

    return slice;
  });

  return (
    <main className={styles.stage}>
      <section
        className={styles.card}
        aria-label='Orra, October budget'
      >
        <header className={styles.card__head}>
          <div className={styles.card__brand}>
            <svg
              className={styles.card__mark}
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <circle
                cx='12'
                cy='12'
                r='8.2'
              />
              <path d='M12 3.8a8.2 8.2 0 0 1 8.2 8.2' />
            </svg>

            <div>
              <p className={styles.card__name}>October budget</p>
              <p className={styles.card__sub}>Orra · Joint account</p>
            </div>
          </div>

          <span className={styles.card__chip}>Oct 1 – 31</span>
        </header>

        <div className={styles.card__body}>
          <div className={styles.donut}>
            <svg
              className={styles.donut__svg}
              viewBox='-6 -6 212 212'
              aria-hidden='true'
            >
              <g>
                {TICKS.map((tick) => (
                  <path
                    key={tick.angle}
                    className={styles.tick}
                    d={tick.long ? "M100 10.8V13.2" : "M100 10.2V10.8"}
                    transform={`rotate(${tick.angle} 100 100)`}
                  />
                ))}
              </g>

              <circle
                className={styles.donut__bed}
                cx='100'
                cy='100'
                r={RADIUS}
              />

              <g transform='rotate(-90 100 100)'>
                {slices.map((slice) => (
                  <circle
                    key={slice.name}
                    className={styles.slice__paint}
                    cx='100'
                    cy='100'
                    r={RADIUS}
                    stroke={slice.color}
                    strokeDasharray={`${slice.length} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-slice.offset}
                  />
                ))}
              </g>

              <circle
                className={styles.donut__gloss}
                cx='100'
                cy='100'
                r='79.4'
              />

              <circle
                className={styles.donut__inner}
                cx='100'
                cy='100'
                r='60.4'
              />
            </svg>

            <div className={styles.donut__center}>
              <p className={styles.donut__label}>Spent</p>

              <p className={styles.donut__value}>
                <span className={styles.donut__cur}>$</span>
                {formatAmount(TOTAL)}
              </p>

              <p className={styles.donut__note}>of ${formatAmount(BUDGET)}</p>
            </div>
          </div>

          <ul
            className={styles.legend}
            aria-label='Categories'
          >
            {DATA.map((item) => (
              <li
                className={styles.row}
                key={item.name}
              >
                <div className={styles.row__top}>
                  <span className={styles.row__name}>{item.name}</span>

                  <span className={styles.row__amt}>${formatAmount(item.amount)}</span>
                </div>

                <span className={styles.row__bar}>
                  <span
                    className={styles.row__fill}
                    style={{
                      backgroundColor: item.color,
                      transform: `scaleX(${item.amount / DATA[0].amount})`,
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className={styles.card__foot}>
          <svg
            className={styles.card__trend}
            viewBox='0 0 16 16'
            aria-hidden='true'
          >
            <path d='M3 5.5 8 10.5l5-5' />
          </svg>

          <p className={styles.card__insight}>
            <b>${formatAmount(BUDGET - TOTAL)}</b> under budget, moved to Savings
          </p>
        </footer>
      </section>
    </main>
  );
}
