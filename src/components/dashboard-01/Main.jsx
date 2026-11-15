// src/components/dashboard-01/Main.jsx

import { Bell, ChevronRight, CalendarDays, Plus } from "lucide-react";
import StatsOverview from "./StatsOverview";

import styles from "./Main.module.css";

export default function Main() {
  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className={styles.currentPage}>Audience Insight</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.iconButton}
            aria-label='Notifications'
          >
            <Bell size={18} />
            <span className={styles.notificationDot} />
          </button>

          <div className={styles.headerAvatar}>SK</div>
        </div>
      </header>

      {/* Page Heading */}
      <section className={styles.pageHeading}>
        <div>
          <h1>Audience Insight</h1>
          <p>Understand audience behavior, segments, and growth with AI.</p>
        </div>

        <div className={styles.headingActions}>
          <button className={styles.dateButton}>
            <CalendarDays size={15} />
            Last 30 days
            <ChevronRight size={14} />
          </button>

          <button className={styles.exportButton}>
            <Plus size={16} />
            Add Widget
          </button>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className={styles.content}>
        <StatsOverview />
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Plus size={22} />
          </div>

          <h2>Dashboard workspace</h2>

          <p>Your audience analytics and insights will appear here.</p>
        </div>
      </section>
    </div>
  );
}
