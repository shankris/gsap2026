/* src/demos/dropdown-01/Demo.jsx */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

const MENU_ITEMS = [
  { id: "add", label: "Add another account", icon: "+" },
  { id: "manage", label: "Manage your account", icon: "⚙" },
  { id: "signout", label: "Sign out", icon: "↪" },
];

export default function Dropdown01() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [message, setMessage] = useState("");

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const highlightRef = useRef(null);
  const itemRefs = useRef([]);

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------
     Open and close animations
  -------------------------------------------------- */

  useLayoutEffect(() => {
    if (!isVisible || !panelRef.current) return;

    const panel = panelRef.current;
    const rows = panel.querySelectorAll(`.${styles.profile}, .${styles.menuItem}, .${styles.storage}`);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(panel, { opacity: 1, scale: 1, y: 0 });
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.94, y: -6 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.34,
          ease: "back.out(1.25)",
        },
      );

      gsap.fromTo(
        rows,
        { opacity: 0, y: -4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          stagger: 0.025,
          ease: "power2.out",
          delay: 0.04,
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [isVisible, reducedMotion]);

  const openMenu = () => {
    if (isOpen) return;

    setIsOpen(true);
    setIsVisible(true);
    setActiveIndex(-1);
  };

  const closeMenu = (refocus = false) => {
    if (!isOpen) return;

    setIsOpen(false);
    setActiveIndex(-1);

    const panel = panelRef.current;

    if (!panel || reducedMotion) {
      setIsVisible(false);
      if (refocus) triggerRef.current?.focus();
      return;
    }

    gsap.to(panel, {
      opacity: 0,
      scale: 0.97,
      y: -4,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        setIsVisible(false);
        if (refocus) triggerRef.current?.focus();
      },
    });
  };

  /* --------------------------------------------------
     Highlight
  -------------------------------------------------- */

  const moveHighlight = (index, instant = false) => {
    const highlight = highlightRef.current;
    const item = itemRefs.current[index];

    if (!highlight) return;

    if (index < 0 || !item) {
      gsap.to(highlight, {
        opacity: 0,
        duration: 0.16,
        ease: "power2.out",
      });
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(index);

    const y = item.offsetTop;
    const height = item.offsetHeight;

    if (instant || reducedMotion) {
      gsap.set(highlight, { y, height, opacity: 1 });
      return;
    }

    gsap.to(highlight, {
      y,
      height,
      opacity: 1,
      duration: 0.26,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.fromTo(
      highlight,
      { scaleY: 1 },
      {
        keyframes: { scaleY: [1, 1.08, 1] },
        duration: 0.3,
        ease: "sine.inOut",
      },
    );
  };

  /* --------------------------------------------------
     Menu actions
  -------------------------------------------------- */

  const chooseItem = (item) => {
    setMessage(item.label);
    closeMenu(true);
  };

  /* --------------------------------------------------
     Outside click and keyboard
  -------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleListKeyDown = (event) => {
    let nextIndex = activeIndex;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % MENU_ITEMS.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = activeIndex < 0 ? MENU_ITEMS.length - 1 : (activeIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = MENU_ITEMS.length - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0) chooseItem(MENU_ITEMS[activeIndex]);
      return;
    } else if (event.key === "Tab") {
      closeMenu(false);
      return;
    } else {
      return;
    }

    moveHighlight(nextIndex);
  };

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */

  return (
    <main className={styles.stage}>
      <div
        className={styles.switcher}
        ref={rootRef}
      >
        <button
          className={styles.trigger}
          type='button'
          aria-label='Open account menu'
          aria-haspopup='true'
          aria-expanded={isOpen}
          aria-controls='account-panel'
          onClick={() => (isOpen ? closeMenu(false) : openMenu())}
          ref={triggerRef}
        >
          <span className={styles.triggerPress}>
            <svg
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <circle
                cx='12'
                cy='8'
                r='4'
              />
              <path d='M4 21a8 8 0 0 1 16 0' />
            </svg>
          </span>
        </button>

        {isVisible && (
          <div
            className={styles.panel}
            id='account-panel'
            ref={panelRef}
          >
            <div className={styles.profile}>
              <span className={styles.avatar}>J</span>

              <span className={styles.profileText}>
                <span className={styles.profileName}>Jamie Wilson</span>
                <span className={styles.profileEmail}>jamie.wilson@gmail.com</span>
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.listWrap}>
              <span
                className={styles.highlight}
                ref={highlightRef}
                aria-hidden='true'
              />

              <ul
                className={styles.menuList}
                role='menu'
                aria-label='Account options'
                onKeyDown={handleListKeyDown}
              >
                {MENU_ITEMS.map((item, index) => (
                  <li
                    key={item.id}
                    className={styles.menuItem}
                    role='menuitem'
                    tabIndex={-1}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    onPointerEnter={() => moveHighlight(index)}
                    onClick={() => chooseItem(item)}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.divider} />

            <div className={styles.storage}>
              <svg
                className={styles.storageChart}
                viewBox='0 0 48 48'
                aria-label='47 percent storage used'
              >
                <circle
                  className={styles.storageTrack}
                  cx='24'
                  cy='24'
                  r='19'
                />
                <circle
                  className={styles.storageProgress}
                  cx='24'
                  cy='24'
                  r='19'
                />
              </svg>

              <span className={styles.storageText}>47% of 20 GB used</span>
            </div>
          </div>
        )}

        <p
          className={styles.sr}
          aria-live='polite'
        >
          {message}
        </p>
      </div>
    </main>
  );
}
