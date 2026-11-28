// src/demos/accordion-07-image/Demo.jsx

"use client";

import { useState } from "react";
import Image from "next/image";
import coolImages from "./data.json";
import styles from "./Demo.module.css";

export default function Demo() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.section}>
      <h1 className={styles.heading}>Accordion with Images</h1>
      <div className={styles.wrapper}>
        {coolImages.map((item, index) => (
          <article
            key={item.header}
            className={`${styles.item} ${activeIndex === index ? styles.active : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={item.image}
                alt={item.header}
                fill
                sizes='(max-width: 768px) 100vw, 100vw'
                className={styles.image}
              />
            </div>

            <div className={styles.content}>
              <h2 className={styles.title}>{item.header}</h2>
              <p className={styles.text}>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
