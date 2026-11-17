/* src/demos/flyout-01/Demo.jsx */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import styles from "./Demo.module.css";

export default function Demo() {
  const avatarRef = useRef(null);
  const faceRef = useRef(null);
  const menuRef = useRef(null);
  const menuListRef = useRef(null);
  const highlightRef = useRef(null);
  const themePillRef = useRef(null);

  const menuItemsRef = useRef([]);
  const themeButtonsRef = useRef([]);
  const timelineRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState("system");
  const [isDark, setIsDark] = useState(false);

  const reducedMotionRef = useRef(false);

  /* ---------- Reduced motion ---------- */

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      reducedMotionRef.current = media.matches;
    };

    update();
    media.addEventListener?.("change", update);

    return () => {
      media.removeEventListener?.("change", update);
      timelineRef.current?.kill();
    };
  }, []);

  /* ---------- Menu highlight ---------- */

  function moveHighlight(index, animate = true) {
    const item = menuItemsRef.current[index];
    const highlight = highlightRef.current;

    if (!item || !highlight) return;

    setActiveIndex(index);

    const position = {
      y: item.offsetTop,
      height: item.offsetHeight,
    };

    if (!animate || reducedMotionRef.current) {
      gsap.set(highlight, {
        ...position,
        opacity: 1,
      });

      return;
    }

    gsap.to(highlight, {
      ...position,
      opacity: 1,
      duration: 0.3,
      ease: "power3.out",
      overwrite: true,
    });
  }

  /* ---------- Open menu animation ---------- */

  useLayoutEffect(() => {
    if (!isVisible || !isOpen) return;

    const menu = menuRef.current;
    const highlight = highlightRef.current;
    const face = faceRef.current;

    if (!menu || !highlight || !face) return;

    const head = menu.querySelector(`.${styles.menuHead}`);
    const rule = menu.querySelector(`.${styles.menuRule}`);

    const parts = [head, ...menu.querySelectorAll(`.${styles.item}`), rule].filter(Boolean);

    timelineRef.current?.kill();

    gsap.set(highlight, { opacity: 0 });

    if (reducedMotionRef.current) {
      timelineRef.current = gsap.timeline().fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.25 });

      gsap.set(parts, { opacity: 1, y: 0 });
    } else {
      timelineRef.current = gsap
        .timeline()
        .fromTo(
          menu,
          {
            scaleX: 0.16,
            scaleY: 0.08,
            opacity: 0,
            borderRadius: 26,
          },
          {
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            borderRadius: 14,
            duration: 0.5,
            ease: "back.out(1.3)",
          },
        )
        .fromTo(
          parts,
          {
            opacity: 0,
            y: -6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.035,
            ease: "power2.out",
          },
          0.5 * 0.25,
        )
        .fromTo(
          face,
          { scale: 0.92 },
          {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
          },
          0,
        );
    }

    menuItemsRef.current[activeIndex]?.focus();
  }, [isVisible, isOpen]);

  /* ---------- Open and close ---------- */

  function openMenu() {
    if (isOpen) return;

    timelineRef.current?.kill();

    setIsVisible(true);
    setIsOpen(true);
  }

  function closeMenu(returnFocus = false) {
    if (!isOpen) return;

    setIsOpen(false);

    const menu = menuRef.current;

    if (!menu) return;

    timelineRef.current?.kill();

    const finishClose = () => {
      setIsVisible(false);

      if (returnFocus) {
        avatarRef.current?.focus();
      }
    };

    if (!reducedMotionRef.current) {
      timelineRef.current = gsap.timeline({
        onComplete: finishClose,
      });

      timelineRef.current.to(menu, {
        scaleX: 0.16,
        scaleY: 0.08,
        opacity: 0,
        borderRadius: 26,
        duration: 0.24,
        ease: "power2.in",
      });
    } else {
      gsap.set(menu, {
        opacity: 0,
        scaleX: 1,
        scaleY: 1,
      });

      finishClose();
    }
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* ---------- Avatar press animation ---------- */

  function pressFace() {
    if (reducedMotionRef.current || !faceRef.current) return;

    gsap.fromTo(
      faceRef.current,
      { scale: 0.94 },
      {
        scale: 1,
        duration: 0.45,
        ease: "elastic.out(1, 0.55)",
        overwrite: "auto",
      },
    );
  }

  /* ---------- Menu item actions ---------- */

  function chooseItem(index) {
    const item = menuItemsRef.current[index];

    if (!item) return;

    moveHighlight(index);
    closeMenu();
  }

  /* ---------- Keyboard navigation ---------- */

  function handleMenuKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    const menuItems = menuItemsRef.current;
    const focusedIndex = menuItems.indexOf(document.activeElement);

    if (focusedIndex === -1) return;

    let nextIndex = focusedIndex;

    switch (event.key) {
      case "ArrowDown":
        nextIndex = (focusedIndex + 1) % menuItems.length;
        break;

      case "ArrowUp":
        nextIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = menuItems.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();
    menuItems[nextIndex]?.focus();
  }

  /* ---------- Click outside ---------- */

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      const menu = menuRef.current;
      const avatar = avatarRef.current;

      if (menu && avatar && !menu.contains(event.target) && !avatar.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  /* ---------- Theme switching ---------- */

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    function updateTheme() {
      setIsDark(mode === "dark" || (mode === "system" && systemTheme.matches));
    }

    updateTheme();

    systemTheme.addEventListener?.("change", updateTheme);

    return () => {
      systemTheme.removeEventListener?.("change", updateTheme);
    };
  }, [mode]);

  function setTheme(nextMode) {
    if (!["light", "dark", "system"].includes(nextMode)) return;

    setMode(nextMode);
  }

  useLayoutEffect(() => {
    if (!isVisible) return;

    const button = themeButtonsRef.current.find((item) => item?.dataset.theme === mode);

    const pill = themePillRef.current;

    if (!button || !pill) return;

    const position = {
      x: button.offsetLeft,
      width: button.offsetWidth,
    };

    if (reducedMotionRef.current) {
      gsap.set(pill, position);
    } else {
      gsap.to(pill, {
        ...position,
        duration: 0.3,
        ease: "power3.out",
        overwrite: true,
      });
    }
  }, [mode, isVisible]);

  function handleThemeKeyDown(event) {
    const buttons = themeButtonsRef.current;
    const currentIndex = buttons.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else {
      return;
    }

    event.preventDefault();

    const nextButton = buttons[nextIndex];

    nextButton?.focus();
    nextButton?.click();
  }

  /* ---------- Resize ---------- */

  useEffect(() => {
    function handleResize() {
      if (isOpen) {
        const item = menuItemsRef.current[activeIndex];

        if (item && highlightRef.current) {
          gsap.set(highlightRef.current, {
            y: item.offsetTop,
            height: item.offsetHeight,
          });
        }
      }

      const button = themeButtonsRef.current.find((item) => item?.dataset.theme === mode);

      if (button && themePillRef.current) {
        gsap.set(themePillRef.current, {
          x: button.offsetLeft,
          width: button.offsetWidth,
        });
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, activeIndex, mode]);

  /* ---------- Render ---------- */

  return (
    <main className={styles.stage}>
      <div className={styles.frame}>
        <header className={styles.bar}>
          <div className={styles.barBrand}>
            <svg
              className={styles.barMark}
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path d='M6 4v16' />
              <path d='M18 4 9.5 12 18 20' />
              <path d='M12.6 9.2 18 4' />
            </svg>

            <span className={styles.barName}>Kelvra</span>
          </div>

          <nav
            className={styles.barNav}
            aria-label='Main navigation'
          >
            <span className={`${styles.barLink} ${styles.isOn}`}>Projects</span>
            <span className={styles.barLink}>Reports</span>
          </nav>

          <button
            ref={avatarRef}
            className={`${styles.avatar} ${isOpen ? styles.avatarOpen : ""}`}
            type='button'
            aria-haspopup='menu'
            aria-expanded={isOpen}
            aria-controls='menu-account'
            aria-label='Open account menu for Iris Calder'
            onClick={() => {
              pressFace();
              toggleMenu();
            }}
          >
            <span
              ref={faceRef}
              className={styles.avatarFace}
            >
              IC
            </span>
          </button>
        </header>

        <div
          ref={menuRef}
          className={`${styles.menu} ${isDark ? styles.dark : ""}`}
          id='menu-account'
          role='menu'
          aria-label='Account'
          hidden={!isVisible}
          onKeyDown={handleMenuKeyDown}
        >
          <div className={styles.menuHead}>
            <span
              className={styles.menuFace}
              aria-hidden='true'
            >
              IC
            </span>

            <span className={styles.menuWho}>
              <span className={styles.menuName}>Iris Calder</span>
              <span className={styles.menuMail}>iris@kelvra.app</span>
            </span>
          </div>

          <div
            ref={menuListRef}
            className={styles.menuList}
          >
            <span
              ref={highlightRef}
              className={styles.menuHighlight}
              aria-hidden='true'
            />

            <button
              ref={(el) => (menuItemsRef.current[0] = el)}
              className={styles.item}
              type='button'
              role='menuitem'
              tabIndex={-1}
              onPointerEnter={() => moveHighlight(0)}
              onFocus={() => moveHighlight(0)}
              onClick={() => chooseItem(0)}
            >
              <svg
                className={styles.itemIcon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <circle
                  cx='12'
                  cy='8.5'
                  r='3.6'
                />
                <path d='M4.8 19.6a7.4 7.4 0 0 1 14.4 0' />
              </svg>
              <span className={styles.itemLabel}>Profile</span>
            </button>

            <button
              ref={(el) => (menuItemsRef.current[1] = el)}
              className={styles.item}
              type='button'
              role='menuitem'
              tabIndex={-1}
              onPointerEnter={() => moveHighlight(1)}
              onFocus={() => moveHighlight(1)}
              onClick={() => chooseItem(1)}
            >
              <svg
                className={styles.itemIcon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <rect
                  x='3.2'
                  y='5.6'
                  width='17.6'
                  height='12.8'
                  rx='2.4'
                />
                <path d='M3.2 9.8h17.6' />
                <path d='M6.8 14.6h3.6' />
              </svg>
              <span className={styles.itemLabel}>Billing</span>
              <span className={styles.itemNote}>Pro</span>
            </button>

            <button
              ref={(el) => (menuItemsRef.current[2] = el)}
              className={styles.item}
              type='button'
              role='menuitem'
              tabIndex={-1}
              onPointerEnter={() => moveHighlight(2)}
              onFocus={() => moveHighlight(2)}
              onClick={() => chooseItem(2)}
            >
              <svg
                className={styles.itemIcon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <rect
                  x='2.8'
                  y='6'
                  width='18.4'
                  height='12'
                  rx='2.4'
                />
                <path d='M6.4 9.6h.01M9.8 9.6h.01M13.2 9.6h.01M16.6 9.6h.01M8 14.2h8' />
              </svg>
              <span className={styles.itemLabel}>Keyboard shortcuts</span>
              <kbd className={styles.key}>?</kbd>
            </button>

            <div
              className={`${styles.item} ${styles.itemTheme}`}
              role='group'
              aria-label='Theme'
            >
              <svg
                className={styles.itemIcon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <circle
                  cx='12'
                  cy='12'
                  r='8.4'
                />
                <path
                  d='M12 3.6v16.8a8.4 8.4 0 0 0 0-16.8Z'
                  className={styles.fill}
                />
              </svg>

              <span className={styles.itemLabel}>Theme</span>

              <span
                className={styles.segment}
                role='radiogroup'
                aria-label='Theme'
                onKeyDown={handleThemeKeyDown}
              >
                <span
                  ref={themePillRef}
                  className={styles.segmentPill}
                  aria-hidden='true'
                />

                {[
                  {
                    name: "light",
                    label: "Light",
                    icon: (
                      <>
                        <circle
                          cx='12'
                          cy='12'
                          r='3.8'
                        />
                        <path d='M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6' />
                      </>
                    ),
                  },
                  {
                    name: "dark",
                    label: "Dark",
                    icon: <path d='M19.4 14.6A7.8 7.8 0 0 1 9.4 4.6a7.8 7.8 0 1 0 10 10Z' />,
                  },
                  {
                    name: "system",
                    label: "System",
                    icon: (
                      <>
                        <rect
                          x='3.4'
                          y='4.6'
                          width='17.2'
                          height='11.6'
                          rx='2'
                        />
                        <path d='M9 20h6M12 16.2V20' />
                      </>
                    ),
                  },
                ].map((theme, index) => (
                  <button
                    key={theme.name}
                    ref={(el) => (themeButtonsRef.current[index] = el)}
                    className={`${styles.segmentButton} ${mode === theme.name ? styles.segmentActive : ""}`}
                    type='button'
                    role='radio'
                    data-theme={theme.name}
                    aria-checked={mode === theme.name}
                    aria-label={theme.label}
                    tabIndex={mode === theme.name ? 0 : -1}
                    onClick={() => setTheme(theme.name)}
                  >
                    <svg
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                    >
                      {theme.icon}
                    </svg>
                  </button>
                ))}
              </span>
            </div>

            <span
              className={styles.menuRule}
              aria-hidden='true'
            />

            <button
              ref={(el) => (menuItemsRef.current[3] = el)}
              className={`${styles.item} ${styles.itemOut}`}
              type='button'
              role='menuitem'
              tabIndex={-1}
              onPointerEnter={() => moveHighlight(3)}
              onFocus={() => moveHighlight(3)}
              onClick={() => chooseItem(3)}
            >
              <svg
                className={styles.itemIcon}
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path d='M13.6 4.4H6.4a1.8 1.8 0 0 0-1.8 1.8v11.6a1.8 1.8 0 0 0 1.8 1.8h7.2' />
                <path d='M10.4 12h9.4' />
                <path d='M16.6 8.6 20 12l-3.4 3.4' />
              </svg>
              <span className={styles.itemLabel}>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
