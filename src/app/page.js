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
  const totalComponents = components.length;

  const readyComponents = components.filter((component) => component.status.toLowerCase() === "ready").length;

  return (
    <main className={styles.page}>
      {/* Page Header */}

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>COMPONENT LIBRARY</p>
          <h1>GSAP Components</h1>
          <p className={styles.subtitle}>A collection of reusable animations and interactive components.</p>
        </div>

        <div className={styles.headerStats}>
          <div>
            <strong>{totalComponents}</strong>
            <span>Components</span>
          </div>

          <div>
            <strong>{readyComponents}</strong>
            <span>Ready</span>
          </div>
        </div>
      </header>

      {/* Component Cards */}

      <section className={styles.library}>
        <div className={styles.sectionHeader}>
          <h2>All Components</h2>
          <span>
            {totalComponents} {totalComponents === 1 ? "item" : "items"}
          </span>
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
                {/* Card Header */}

                <div className={styles.cardHeader}>
                  <div>
                    <h3>{component.name}</h3>
                  </div>

                  {component.route && component.status.toLowerCase() === "ready" && (
                    <Link
                      href={component.route}
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

                {/* Description */}

                <p className={styles.description}>{component.description}</p>

                {/* Metadata */}

                <div className={styles.metadata}>
                  <div>
                    <span>Category</span>
                    <strong>{component.category}</strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>{formatDate(component.date)}</strong>
                  </div>

                  <div>
                    <span>Lines</span>
                    <strong>{component.lines == null ? "—" : component.lines.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Card Footer */}

                <div className={styles.cardFooter}>
                  <span className={styles.componentId}>{component.id}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      {/* <footer className={styles.footer}>
        <span>GSAP Component Library</span>
        <span>Managed through JSON</span>
      </footer> */}
    </main>
  );
}
