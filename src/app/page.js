/* src/app/page.js */

import components from "@/data/components.json";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/* --------------------------------------------------
Date Formatting
-------------------------------------------------- */

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

/* --------------------------------------------------
Main Page
-------------------------------------------------- */

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>COMPONENT LIBRARY</p>
          <h1>GSAP Library</h1>
          <p className={styles.subtitle}>A collection of GSAP animations and interactive demos.</p>
        </div>
      </header>

      <section className={styles.library}>
        <div className={styles.sectionHeader}>
          <h2>All Components</h2>
        </div>

        {components.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No components yet</h3>
            <p>Add a component to src/data/components.json.</p>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {components.map((component) => (
              <article
                className={styles.componentCard}
                key={component.id}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.category}>{component.category}</span>
                    <h3>{component.name}</h3>
                  </div>

                  {component.status === "ready" && (
                    <Link
                      href={`/${component.slug}`}
                      className={styles.componentLink}
                      aria-label={`Preview ${component.name}`}
                      title={`Preview ${component.name}`}
                    >
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.8}
                      />
                    </Link>
                  )}
                </div>

                <p className={styles.description}>{component.description}</p>

                <div className={styles.metadata}>
                  <div>
                    <span>Created</span>
                    <strong>{formatDate(component.date)}</strong>
                  </div>

                  <div>
                    <span>Lines</span>
                    <strong>{component.lines == null ? "—" : component.lines.toLocaleString()}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
