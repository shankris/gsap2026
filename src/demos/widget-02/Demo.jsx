"use client";

// src/demos/widget-02/Demo.jsx

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, GripVertical, Pin } from "lucide-react";
import gsap from "gsap";

import styles from "./Demo.module.css";

const pinnedNotes = [
  {
    id: "move",
    title: "Studio move checklist",
    preview: "Kiln shelves first, the van at eight",
    date: "Today",
    long: "Sunday, 8 November · 09:40",
    tag: "Studio",
    color: "orange",
    items: ["Wrap the glaze jars in newspaper", "Kiln shelves go in the van first", "Return the keys to the landlord"],
  },
  {
    id: "dough",
    title: "Pasta dough ratios",
    preview: "100 g flour to one egg, rest 30 min",
    date: "Yesterday",
    long: "Saturday, 7 November · 19:02",
    tag: "Kitchen",
    color: "yellow",
    items: ["100 g of flour for every egg", "Knead ten minutes, until it springs back", "Rest it covered for half an hour"],
  },
  {
    id: "gifts",
    title: "Gift ideas for Ines",
    preview: "A linen apron, a good fountain pen",
    date: "Nov 2",
    long: "Monday, 2 November · 22:15",
    tag: "Personal",
    color: "green",
    items: ["The linen apron from the market", "A fountain pen with a fine nib", "Tickets for the spring concert"],
  },
];

const recentNotes = [
  {
    id: "standup",
    title: "Thursday standup",
    preview: "Ship search fix, review onboarding",
    date: "21:14",
    long: "Sunday, 8 November · 21:14",
    tag: "Work",
    color: "blue",
    items: ["Ship the search fix to everyone", "Review the onboarding copy with Sam", "Book the room for the demo"],
  },
  {
    id: "books",
    title: "Books to read",
    preview: "A slow book on rivers, a field guide",
    date: "Nov 5",
    long: "Thursday, 5 November · 08:30",
    tag: "Reading",
    color: "purple",
    items: ["A slow book about rivers", "The field guide to mosses", "Something funny for the train"],
  },
];

const notes = [...pinnedNotes, ...recentNotes];

function NoteRow({ note, pinned, rowRef, onOpen, onGripPointerDown, onGripPointerMove, onGripPointerUp, shouldIgnoreClick }) {
  return (
    <li
      ref={rowRef}
      className={styles.row}
      tabIndex={0}
      role='button'
      aria-label={`Open ${note.title}${pinned ? ", pinned" : ""}`}
      onClick={() => {
        if (shouldIgnoreClick?.()) return;
        onOpen(note);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(note);
        }
      }}
    >
      {pinned && (
        <span
          className={styles.row__grip}
          aria-label='Drag to reorder'
          onPointerDown={(event) => onGripPointerDown(note, event)}
          onPointerMove={onGripPointerMove}
          onPointerUp={onGripPointerUp}
          onPointerCancel={onGripPointerUp}
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
  const notesCardRef = useRef(null);
  const readerRef = useRef(null);
  const rowRefs = useRef({});
  const backButtonRef = useRef(null);
  const closeTimelineRef = useRef(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const statusRef = useRef(null);
  const [showOrderSaved, setShowOrderSaved] = useState(false);

  const [orderedPinnedNotes, setOrderedPinnedNotes] = useState(pinnedNotes);

  const pinnedOrderRef = useRef(pinnedNotes.map((note) => note.id));
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);

  const getRowRect = (noteId) => {
    const row = rowRefs.current[noteId];
    const card = notesCardRef.current;

    if (!row || !card) return null;

    const rowRect = row.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    return {
      left: rowRect.left - cardRect.left - card.clientLeft,
      top: rowRect.top - cardRect.top - card.clientTop,
      width: rowRect.width,
      height: rowRect.height,
    };
  };

  const startDrag = (note, event) => {
    if (selectedNote || closeTimelineRef.current || event.button !== 0) return;

    const row = rowRefs.current[note.id];
    if (!row) return;

    const list = row.parentElement;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 7;
    const step = row.offsetHeight + gap;
    const startOrder = [...pinnedOrderRef.current];
    const originalIndex = startOrder.indexOf(note.id);

    if (originalIndex < 0) return;

    dragMovedRef.current = false;

    const siblingY = {};

    startOrder.forEach((id) => {
      if (id === note.id) return;

      const sibling = rowRefs.current[id];
      if (!sibling) return;

      siblingY[id] = gsap.quickTo(sibling, "y", {
        duration: 0.22,
        ease: "power2.out",
      });
    });

    dragRef.current = {
      id: note.id,
      row,
      pointerId: event.pointerId,
      startY: event.clientY,
      originalIndex,
      startOrder,
      step,
      moved: false,
      siblingY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);

    gsap.killTweensOf(row);
    row.classList.add(styles.rowDragging);

    gsap.to(row, {
      scale: 1.035,
      boxShadow: "0 14px 30px -10px rgba(29,27,24,0.35), 0 2px 6px rgba(29,27,24,0.08)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaY) > 4) {
      drag.moved = true;
      dragMovedRef.current = true;
    }

    if (!drag.moved) return;

    const minY = -drag.originalIndex * drag.step - 8;
    const maxY = (drag.startOrder.length - 1 - drag.originalIndex) * drag.step + 8;

    const y = Math.max(minY, Math.min(maxY, deltaY));

    gsap.set(drag.row, { y });

    const targetIndex = Math.max(0, Math.min(drag.startOrder.length - 1, Math.round((drag.originalIndex * drag.step + deltaY) / drag.step)));

    // Rebuild the target order from the order at drag start.
    const nextOrder = [...drag.startOrder];
    nextOrder.splice(drag.originalIndex, 1);
    nextOrder.splice(targetIndex, 0, drag.id);

    pinnedOrderRef.current = nextOrder;

    // Every sibling offset is relative to its original position.
    nextOrder.forEach((id, index) => {
      if (id === drag.id) return;

      const startIndex = drag.startOrder.indexOf(id);
      const moveSibling = drag.siblingY[id];

      if (startIndex < 0 || !moveSibling) return;

      moveSibling((index - startIndex) * drag.step);
    });
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;

    if (!drag.moved) {
      drag.row.classList.remove(styles.rowDragging);

      gsap.to(drag.row, {
        y: 0,
        scale: 1,
        rotation: 0,
        boxShadow: "none",
        duration: 0.25,
        ease: "power2.out",
      });

      Object.values(drag.siblingY).forEach((moveSibling) => moveSibling(0));
      return;
    }

    const finalIndex = pinnedOrderRef.current.indexOf(drag.id);
    const finalY = (finalIndex - drag.originalIndex) * drag.step;

    gsap.to(drag.row, {
      y: finalY,
      scale: 1,
      rotation: 0,
      boxShadow: "none",
      duration: 0.5,
      ease: "back.out(1.7)",
      onComplete: () => {
        drag.row.classList.remove(styles.rowDragging);

        setOrderedPinnedNotes(pinnedOrderRef.current.map((id) => pinnedNotes.find((note) => note.id === id)));
      },
    });
  };

  useLayoutEffect(() => {
    Object.values(rowRefs.current).forEach((row) => {
      if (row) {
        gsap.set(row, {
          clearProps: "transform,boxShadow",
        });
      }
    });
  }, [orderedPinnedNotes]);

  useLayoutEffect(() => {
    if (!selectedNote) return;

    const reader = readerRef.current;
    const row = rowRefs.current[selectedNote.id];
    const card = notesCardRef.current;

    if (!reader || !row || !card) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = getRowRect(selectedNote.id);
    if (!from) return;

    const readerParts = reader.querySelectorAll([`.${styles.reader__bar}`, `.${styles.reader__title}`, `.${styles.reader__date}`, `.${styles.reader__item}`, `.${styles.reader__progress}`, `.${styles.reader__foot}`].join(", "));

    gsap.set(reader, {
      ...from,
      borderRadius: 13,
      visibility: "visible",
      opacity: 1,
      overflowY: "hidden",
    });

    if (reducedMotion) {
      gsap.set(reader, {
        left: 0,
        top: 0,
        width: card.clientWidth,
        height: card.clientHeight,
        borderRadius: 22,
      });

      gsap.set(readerParts, { opacity: 1, y: 0 });
      backButtonRef.current?.focus({ preventScroll: true });
      return;
    }

    gsap.set(readerParts, { opacity: 0, y: 10 });
    gsap.to(row, { opacity: 0, duration: 0.15 });

    const openTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(reader, { overflowY: "auto" });
        backButtonRef.current?.focus({ preventScroll: true });
      },
    });

    openTimeline
      .to(reader, {
        left: 0,
        top: 0,
        width: card.clientWidth,
        height: card.clientHeight,
        borderRadius: 22,
        duration: 0.6,
        ease: "expo.inOut",
      })
      .to(readerParts, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.06,
        ease: "power3.out",
      });

    return () => {
      gsap.killTweensOf([reader, readerParts, row]);
    };
  }, [selectedNote]);

  const openNote = (note) => {
    if (selectedNote || closeTimelineRef.current) return;
    setSelectedNote(note);
  };

  const closeNote = () => {
    if (!selectedNote || closeTimelineRef.current) return;

    const note = selectedNote;
    const reader = readerRef.current;
    const row = rowRefs.current[note.id];
    gsap.set(reader, { overflowY: "hidden" });
    if (!reader || !row) {
      setSelectedNote(null);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const readerParts = reader.querySelectorAll([`.${styles.reader__bar}`, `.${styles.reader__title}`, `.${styles.reader__date}`, `.${styles.reader__item}`, `.${styles.reader__progress}`, `.${styles.reader__foot}`].join(", "));

    const finishClose = () => {
      gsap.set(reader, { visibility: "hidden" });
      setSelectedNote(null);
      row.focus({ preventScroll: true });
      closeTimelineRef.current = null;
    };

    if (reducedMotion) {
      closeTimelineRef.current = gsap.to(reader, {
        opacity: 0,
        duration: 0.25,
        onComplete: finishClose,
      });

      gsap.set(row, { opacity: 1 });
      return;
    }

    const to = getRowRect(note.id);
    if (!to) return;

    gsap.killTweensOf([reader, readerParts, row]);

    gsap.to(readerParts, {
      opacity: 0,
      y: 6,
      duration: 0.2,
      stagger: { each: 0.02, from: "end" },
      ease: "power1.in",
    });

    closeTimelineRef.current = gsap.to(reader, {
      ...to,
      borderRadius: 13,
      duration: 0.51,
      delay: 0.12,
      ease: "expo.inOut",
      onComplete: finishClose,
    });

    gsap.to(row, {
      opacity: 1,
      duration: 0.2,
      delay: 0.54,
    });

    gsap.fromTo(
      row,
      { scale: 0.985 },
      {
        scale: 1,
        duration: 0.5,
        delay: 0.6,
        ease: "back.out(3)",
      },
    );
  };

  return (
    <main className={styles.stage}>
      <section
        className={styles.notes}
        ref={notesCardRef}
      >
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
            {orderedPinnedNotes.map((note, index) => (
              <NoteRow
                key={note.id}
                note={note}
                pinned
                rowRef={(element) => {
                  rowRefs.current[note.id] = element;
                }}
                onOpen={openNote}
                onGripPointerDown={(note, event) => startDrag(note, event)}
                onGripPointerMove={moveDrag}
                onGripPointerUp={endDrag}
                shouldIgnoreClick={() => {
                  const moved = dragMovedRef.current;
                  dragMovedRef.current = false;
                  return moved;
                }}
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
                rowRef={(element) => {
                  rowRefs.current[note.id] = element;
                }}
                onOpen={openNote}
              />
            ))}
          </ul>
        </section>

        {selectedNote && (
          <section
            ref={readerRef}
            className={styles.reader}
            aria-hidden='false'
            aria-label={`${selectedNote.title} reader`}
          >
            <div className={styles.reader__bar}>
              <button
                ref={backButtonRef}
                className={styles.reader__back}
                type='button'
                onClick={closeNote}
              >
                <ChevronLeft size={14} />
                All notes
              </button>

              <span className={styles.reader__tag}>{selectedNote.tag}</span>
            </div>

            <h2 className={styles.reader__title}>{selectedNote.title}</h2>
            <div className={styles.reader__date}>{selectedNote.long}</div>

            <div className={styles.reader__body}>
              {selectedNote.items.map((item, index) => (
                <div
                  className={styles.reader__item}
                  key={`${selectedNote.id}-${index}`}
                >
                  <span
                    className={styles.reader__box}
                    aria-hidden='true'
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className={styles.reader__progress}>
              <div className={styles.reader__plabel}>
                <span>Progress</span>
                <span>0 of {selectedNote.items.length} done</span>
              </div>

              <div className={styles.reader__track}>
                <div className={styles.reader__fill} />
              </div>
            </div>

            <div className={styles.reader__foot}>{selectedNote.items.length} checklist items</div>
          </section>
        )}
      </section>
    </main>
  );
}
