// src/demos/btn-01-float/Demo.jsx

"use client";

import { useState } from "react";
import { Settings, ChevronRight } from "lucide-react";
import styles from "./Demo.module.css";

export default function Demo({ errorCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  const hasError = errorCount > 0;

  const menuItems = [
    { label: "Issues", badge: hasError ? errorCount : null },
    { label: "Route", right: "Static" },
    {
      label: "Try Turbopack",
      submenu: ["Docs", "Benchmarks"],
      icon: <ChevronRight size={16} />,
    },
    {
      label: "Route Info",
      submenu: ["Params", "Headers"],
      icon: <ChevronRight size={16} />,
    },
    {
      label: "Preferences",
      icon: <Settings size={16} />,
    },
  ];

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setSubmenu((current) => (current === item.label ? null : item.label));
    } else {
      setOpen(false);
      setSubmenu(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type='button'
        className={`${styles.floatingButton} ${hasError ? styles.error : ""}`}
        onClick={() => {
          setOpen((current) => !current);
          setSubmenu(null);
        }}
        aria-label='Open Dev Tools'
        aria-expanded={open}
      >
        <span className={styles.buttonLabel}>N</span>
        {hasError && <span className={styles.dot} />}
      </button>

      {open && (
        <div className={styles.menu}>
          {menuItems.map((item) => (
            <button
              type='button'
              key={item.label}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item)}
            >
              <span>{item.label}</span>

              <span className={styles.itemRight}>
                {item.badge !== null && item.badge !== undefined && <span className={styles.badge}>{item.badge}</span>}

                {item.right && <span className={styles.rightLabel}>{item.right}</span>}

                {item.icon && <span className={styles.icon}>{item.icon}</span>}
              </span>
            </button>
          ))}
        </div>
      )}

      {submenu && (
        <div className={styles.submenu}>
          {menuItems
            .find((item) => item.label === submenu)
            ?.submenu.map((sub) => (
              <button
                type='button'
                key={sub}
                className={styles.submenuItem}
              >
                {sub}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
