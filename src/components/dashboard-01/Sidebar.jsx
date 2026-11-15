// src/components/dashboard-01/Sidebar.jsx

import { LayoutDashboard, Mail, Users, Megaphone, Share2, Search, Sparkles, Settings, HelpCircle, ChevronRight, Zap } from "lucide-react";

import styles from "./Sidebar.module.css";

const mainNavigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Email Marketing", icon: Mail },
  { label: "Audience Insight", icon: Users, active: true },
  { label: "Ads Optimizer", icon: Megaphone },
  { label: "Social Media", icon: Share2 },
];

const toolsNavigation = [
  { label: "SEO Intelligence", icon: Search },
  { label: "AI Campaign", icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap
            size={19}
            strokeWidth={2.5}
          />
        </div>

        <span>Cogniva</span>
      </div>

      {/* Main Navigation */}
      <div className={styles.navigation}>
        <p className={styles.sectionLabel}>MAIN MENU</p>

        <nav className={styles.navList}>
          {mainNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                href='#'
                key={item.label}
                className={`${styles.navItem} ${item.active ? styles.active : ""}`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* AI & Tools */}
        <p className={styles.sectionLabel}>AI & TOOLS</p>

        <nav className={styles.navList}>
          {toolsNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                href='#'
                key={item.label}
                className={styles.navItem}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <a
          href='#'
          className={styles.navItem}
        >
          <Settings
            size={18}
            strokeWidth={1.8}
          />
          <span>Settings</span>
        </a>

        <a
          href='#'
          className={styles.navItem}
        >
          <HelpCircle
            size={18}
            strokeWidth={1.8}
          />
          <span>Help Center</span>
        </a>

        {/* Upgrade Card */}
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeIcon}>
            <Sparkles size={17} />
          </div>

          <h3>Unlock more with Pro</h3>

          <p>Get advanced insights and smarter AI recommendations.</p>

          <button className={styles.upgradeButton}>
            Upgrade plan
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatar}>SK</div>

          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Shankar</span>
            <span className={styles.profileRole}>Free Plan</span>
          </div>

          <ChevronRight
            size={16}
            className={styles.profileArrow}
          />
        </div>
      </div>
    </aside>
  );
}
