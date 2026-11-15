// src/components/dashboard-01/StatCard.jsx

import { TrendingUp, TrendingDown } from "lucide-react";
import styles from "./StatCard.module.css";

export default function StatCard({ icon: Icon, title, value, change, changeLabel = "vs last month", iconColor = "#C17C56", iconBackground = "#F7EDE5" }) {
  const isNegative = change.trim().startsWith("-");

  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <div
          className={styles.icon}
          style={{
            color: iconColor,
            backgroundColor: iconBackground,
          }}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <p className={styles.title}>{title}</p>
      </div>

      <div className={styles.details}>
        <span className={styles.changeLabel}>{changeLabel}</span>

        <div className={styles.valueRow}>
          <h2 className={styles.value}>{value}</h2>

          <span className={`${styles.changePill} ${isNegative ? styles.negative : styles.positive}`}>
            <TrendIcon
              size={14}
              strokeWidth={2}
            />
            {change}
          </span>
        </div>
      </div>
    </article>
  );
}
