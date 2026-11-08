/* src/demos/icon-01/Demo.jsx */

"use client";

import PuffyIcon from "./PuffyIcon";
import styles from "./Demo.module.css";

const icons = [
  {
    name: "Heart",
    color: "#ff5a5f",
    svg: '<svg viewBox="0 0 24 24"><path d="M12 21C5 15.5 2 12 2 8.2 2 5.3 4.3 3 7.1 3 9.1 3 11 4.2 12 6 13 4.2 14.9 3 16.9 3 19.7 3 22 5.3 22 8.2 22 12 19 15.5 12 21Z"/></svg>',
  },
  {
    name: "Star",
    color: "#f6bd3b",
    svg: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2Z"/></svg>',
  },
  {
    name: "Lightning",
    color: "#8067f5",
    svg: '<svg viewBox="0 0 24 24"><path d="M13.2 2 4.5 13.2c-.5.7 0 1.6.8 1.6h5.1L9.8 22l9.7-12.1c.5-.7 0-1.6-.8-1.6h-5.3L13.2 2Z"/></svg>',
  },
  {
    name: "Cloud",
    color: "#56a8ed",
    svg: '<svg viewBox="0 0 24 24"><path d="M19.5 18H5.2a4.2 4.2 0 0 1-.5-8.4A7.3 7.3 0 0 1 18.8 8a5 5 0 0 1 .7 10Z"/></svg>',
  },
  {
    name: "Smile",
    color: "#f49b45",
    svg: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3 7a1.4 1.4 0 1 1 0 2.8A1.4 1.4 0 0 1 9 9Zm6 0a1.4 1.4 0 1 1 0 2.8A1.4 1.4 0 0 1 15 9Zm-7 5h8a4 4 0 0 1-8 0Z"/></svg>',
  },
  {
    name: "Moon",
    color: "#4c65c9",
    svg: '<svg viewBox="0 0 24 24"><path d="M20.8 15.3A9 9 0 0 1 8.7 3.2 9.5 9.5 0 1 0 20.8 15.3Z"/></svg>',
  },
  {
    name: "Flower",
    color: "#ed78ad",
    svg: '<svg viewBox="0 0 24 24"><path d="M12 8.5C8.5 2 3 5 7.5 10 1 8 0 15 7 14.5 2.5 20 9 23 12 16c3 7 9.5 4 5-1.5 7 .5 6-6.5-.5-4.5C21 5 15.5 2 12 8.5Z"/></svg>',
  },
  {
    name: "Play",
    color: "#38a98c",
    svg: '<svg viewBox="0 0 24 24"><path d="M6 3.8c0-.9 1-1.4 1.8-.9l13 8.2a1.1 1.1 0 0 1 0 1.8l-13 8.2c-.8.5-1.8 0-1.8-.9V3.8Z"/></svg>',
  },
  {
    name: "Diamond",
    color: "#e58c5c",
    svg: '<svg viewBox="0 0 24 24"><path d="M12 2 2 9l10 13L22 9 12 2Zm0 2.5L18.5 9h-13L12 4.5ZM5.5 11h13L12 19.5 5.5 11Z"/></svg>',
  },
  {
    name: "Bell",
    color: "#7775d9",
    svg: '<svg viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2Zm7-5-2-2.5V10a5 5 0 0 0-4-4.9V4a1 1 0 0 0-2 0v1.1A5 5 0 0 0 7 10v4.5L5 17v1h14v-1Z"/></svg>',
  },
  {
    name: "Leaf",
    color: "#6eae65",
    svg: '<svg viewBox="0 0 24 24"><path d="M21 3C10 3 3 7 3 14a7 7 0 0 0 7 7c7 0 11-7 11-18ZM6 18c4-5 8-8 12-11-3 5-6 9-12 11Z"/></svg>',
  },
  {
    name: "Sparkle",
    color: "#d58bd9",
    svg: '<svg viewBox="0 0 24 24"><path d="M11.4 3.2C11.6 2.6 12.4 2.6 12.6 3.2C13.6 8.4 15.6 10.4 20.8 11.4C21.4 11.6 21.4 12.4 20.8 12.6C15.6 13.6 13.6 15.6 12.6 20.8C12.4 21.4 11.6 21.4 11.4 20.8C10.4 15.6 8.4 13.6 3.2 12.6C2.6 12.4 2.6 11.6 3.2 11.4C8.4 10.4 10.4 8.4 11.4 3.2Z"/></svg>',
  },
];

export default function Demo() {
  return (
    <main className={styles.demo}>
      <div className={styles.iconGrid}>
        {icons.map((icon) => (
          <div
            className={styles.iconItem}
            key={icon.name}
          >
            <PuffyIcon
              svg={icon.svg}
              color={icon.color}
              iconColor='#ffffff'
              className={styles.icon}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
