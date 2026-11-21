/* src/demos/widget-02/Demo.jsx */

import { FileText, Pin, GripVertical, ChevronRight, Plus } from "lucide-react";

import styles from "./Demo.module.css";

const pinnedNotes = [
  {
    id: "move",
    title: "Studio move checklist",
    preview: "Kiln shelves first, the van at eight",
    date: "Today",
    color: "orange",
  },
  {
    id: "dough",
    title: "Pasta dough ratios",
    preview: "100 g flour to one egg, rest 30 min",
    date: "Yesterday",
    color: "yellow",
  },
  {
    id: "gifts",
    title: "Gift ideas for Ines",
    preview: "A linen apron, a good fountain pen",
    date: "Nov 2",
    color: "green",
  },
];

const recentNotes = [
  {
    id: "standup",
    title: "Thursday standup",
    preview: "Ship search fix, review onboarding",
    date: "21:14",
    color: "blue",
  },
  {
    id: "books",
    title: "Books to read",
    preview: "A slow book on rivers, a field guide",
    date: "Nov 5",
    color: "purple",
  },
];

function NoteRow({ note, pinned = false }) {
  return (
    <li className={styles.row}>
      {pinned && (
        <span
          className={styles.row__grip}
          aria-hidden='true'
        >
          <GripVertical size={15} />
        </span>
      )}

      <span
        className={`${styles.row__colorBar} ${styles[`row__colorBar--${note.color}`]}`}
        aria-hidden='true'
      />

      <div className={styles.row__text}>
        <div className={styles.row__title}>{note.title}</div>
        <div className={styles.row__preview}>{note.preview}</div>
      </div>

      <span className={styles.row__date}>{note.date}</span>

      <span
        className={styles.row__chev}
        aria-hidden='true'
      >
        <ChevronRight size={15} />
      </span>
    </li>
  );
}

export default function Demo() {
  return (
    <main className={styles.stage}>
      <section className={styles.notes}>
        <header className={styles.notes__head}>
          <div className={styles.notes__app}>
            <FileText
              size={19}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <span className={styles.notes__brand}>Sorrel</span>
            <span className={styles.notes__sub}>12 notes · synced</span>
          </div>

          <button
            className={styles.notes__new}
            type='button'
            aria-label='New note'
          >
            +
          </button>
        </header>

        <section>
          <h2 className={styles.notes__label}>
            <span className={styles.notes__pin}>
              <Pin size={12} />
            </span>
            Pinned
            <span className={styles.notes__hint}>Drag to reorder</span>
          </h2>

          <ul className={styles.notes__pinned}>
            {pinnedNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                pinned
              />
            ))}
          </ul>
        </section>

        <section>
          <h2 className={`${styles.notes__label} ${styles["notes__label--recent"]}`}>Recent</h2>

          <ul className={styles.notes__recent}>
            {recentNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
              />
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
