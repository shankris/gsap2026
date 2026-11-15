// src/components/dashboard-01/StatsOverview.jsx

import { Users, UserPlus, Activity, Target } from "lucide-react";

import StatCard from "./StatCard";
import styles from "./StatsOverview.module.css";

const stats = [
  {
    title: "Total Audience",
    value: "48,294",
    change: "+12.8%",
    icon: Users,
    iconColor: "#B47A52",
    iconBackground: "#F8EDE3",
  },
  {
    title: "New Leads",
    value: "3,842",
    change: "+8.4%",
    icon: UserPlus,
    iconColor: "#72977C",
    iconBackground: "#EAF2EA",
  },
  {
    title: "Engagement Rate",
    value: "68.4%",
    change: "+5.2%",
    icon: Activity,
    iconColor: "#8C83B2",
    iconBackground: "#F0EDF7",
  },
  {
    title: "AI Match Score",
    value: "92.8",
    change: "-3.6%",
    icon: Target,
    iconColor: "#C18A64",
    iconBackground: "#F8EFE8",
  },
];

export default function StatsOverview() {
  return (
    <section className={styles.statsGrid}>
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </section>
  );
}
