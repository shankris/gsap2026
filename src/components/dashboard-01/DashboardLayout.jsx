// src/components/dashboard-01/DashboardLayout.jsx

import Sidebar from "./Sidebar";
import Main from "./Main";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout() {
  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <main className={styles.main}>
        <Main />
      </main>
    </div>
  );
}
