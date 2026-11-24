// src/demos/drawer-01/Demo.jsx

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

import styles from "./Demo.module.css";

const menuItems = ["About us", "Our work", "Services", "Blog", "Contact us"];

const socials = ["Instagram", "LinkedIn", "X/Twitter", "Awwwards"];

export default function Demo() {
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const panelsRef = useRef([]);
  const linksRef = useRef([]);
  const fadeTargetsRef = useRef([]);
  const buttonRef = useRef(null);
  const buttonTextsRef = useRef([]);
  const buttonIconRef = useRef(null);
  const timelineRef = useRef(null);
  const isOpenRef = useRef(false);
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const menu = menuRef.current;
    const overlay = overlayRef.current;
    const button = buttonRef.current;
    const buttonIcon = buttonIconRef.current;

    if (!nav || !menu || !overlay || !button || !buttonIcon) return;

    const panels = panelsRef.current.filter(Boolean);
    const links = linksRef.current.filter(Boolean);
    const fadeTargets = fadeTargetsRef.current.filter(Boolean);
    const buttonTexts = buttonTextsRef.current.filter(Boolean);

    gsap.registerPlugin(CustomEase);
    CustomEase.create("drawerMain", "0.65, 0.01, 0.05, 0.99");

    gsap.defaults({
      ease: "drawerMain",
      duration: 0.7,
    });

    gsap.set(nav, { display: "none" });
    gsap.set(menu, { xPercent: 120 });
    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(panels, { xPercent: 101 });
    gsap.set(links, { yPercent: 140, rotation: 10 });
    gsap.set(fadeTargets, { autoAlpha: 0, yPercent: 50 });
    gsap.set(buttonTexts, { yPercent: 0 });
    gsap.set(buttonIcon, { rotation: 0 });

    const openNav = () => {
      if (isOpenRef.current) return;

      isOpenRef.current = true;
      nav.setAttribute("data-nav", "open");

      timelineRef.current?.kill();

      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      timeline.set(nav, { display: "block" }).set(menu, { xPercent: 0 }, "<").fromTo(buttonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 }).fromTo(buttonIcon, { rotation: 0 }, { rotation: 315 }, "<").fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<").fromTo(panels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<").fromTo(links, { yPercent: 140, rotation: 10 }, { yPercent: 0, rotation: 0, stagger: 0.05 }, "<+=0.35").fromTo(fadeTargets, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04 }, "<+=0.2");
    };

    const closeNav = () => {
      if (!isOpenRef.current) return;

      isOpenRef.current = false;
      nav.setAttribute("data-nav", "closed");

      timelineRef.current?.kill();

      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(nav, { display: "none" });
        },
      });

      timelineRef.current = timeline;

      timeline.to(overlay, { autoAlpha: 0 }).to(menu, { xPercent: 120 }, "<").to(buttonTexts, { yPercent: 0 }, "<").to(buttonIcon, { rotation: 0 }, "<");
    };

    const toggleNav = () => {
      if (isOpenRef.current) {
        closeNav();
      } else {
        openNav();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpenRef.current) {
        closeNav();
      }
    };

    button.addEventListener("click", toggleNav);
    overlay.addEventListener("click", closeNav);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      button.removeEventListener("click", toggleNav);
      overlay.removeEventListener("click", closeNav);
      document.removeEventListener("keydown", handleKeyDown);
      timelineRef.current?.kill();
    };
  }, []);

  const menuLinks = [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <main className={styles.stage}>
      <header className={styles.header}>
        <nav
          className={styles.navRow}
          aria-label='Main navigation'
        >
          <span className={styles.wordmark}>Drawer - Nav</span>

          <button
            ref={buttonRef}
            className={styles.menuButton}
            type='button'
            aria-label='Toggle menu'
            aria-controls='drawer-menu'
          >
            <span className={styles.menuButtonText}>
              <span ref={(element) => (buttonTextsRef.current[0] = element)}>Menu</span>
              <span ref={(element) => (buttonTextsRef.current[1] = element)}>Close</span>
            </span>

            <span className={styles.iconWrap}>
              <svg
                ref={buttonIconRef}
                className={styles.menuButtonIcon}
                viewBox='0 0 16 16'
                fill='none'
                aria-hidden='true'
              >
                <path
                  d='M7.333 0h1.334v16H7.333zM0 7.333h16v1.334H0z'
                  fill='currentColor'
                />
              </svg>
            </span>
          </button>
        </nav>
      </header>

      <section
        className={styles.content}
        aria-label='Drawer demo'
      >
        <svg
          className={styles.centerIcon}
          viewBox='0 0 160 160'
          fill='none'
          aria-hidden='true'
        >
          <path
            d='M94.828 53.858C92.309 56.378 88 54.593 88 51.029V0H72V60C72 66.627 66.627 72 60 72H0V88H51.029C54.593 88 56.378 92.309 53.858 94.828L18.343 130.343 29.657 141.657 65.172 106.142C67.684 103.63 71.975 105.396 72 108.939V160H88V100C88 93.373 93.373 88 100 88H160V72H108.939C105.407 71.975 103.64 65.71 106.12 65.194L106.142 65.172 141.657 29.657 130.343 18.343 94.828 53.858Z'
            fill='currentColor'
          />
        </svg>

        <div
          ref={navRef}
          className={styles.drawer}
          data-nav='closed'
        >
          <div
            ref={overlayRef}
            className={styles.overlay}
            aria-hidden='true'
          />

          <nav
            ref={menuRef}
            className={styles.menu}
            id='drawer-menu'
            aria-label='Drawer navigation'
          >
            <div
              className={styles.menuBackground}
              aria-hidden='true'
            >
              <div
                ref={(element) => (panelsRef.current[0] = element)}
                className={`${styles.backgroundPanel} ${styles.backgroundPanelFirst}`}
              />
              <div
                ref={(element) => (panelsRef.current[1] = element)}
                className={`${styles.backgroundPanel} ${styles.backgroundPanelSecond}`}
              />
              <div
                ref={(element) => (panelsRef.current[2] = element)}
                className={styles.backgroundPanel}
              />
            </div>

            <div className={styles.menuInner}>
              <ul className={styles.menuList}>
                {menuLinks.map((link, index) => (
                  <li
                    className={styles.menuListItem}
                    key={link.label}
                  >
                    <a
                      ref={(element) => (linksRef.current[index] = element)}
                      className={styles.menuLink}
                      href={link.href}
                    >
                      <span
                        ref={(element) => (linksRef.current[index] = element)}
                        className={styles.menuLinkHeading}
                      >
                        {link.label}
                      </span>
                      <span className={styles.eyebrow}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.menuLinkBackground} />
                    </a>
                  </li>
                ))}
              </ul>

              <div className={styles.menuDetails}>
                <p
                  ref={(element) => (fadeTargetsRef.current[0] = element)}
                  className={styles.smallText}
                >
                  Socials
                </p>

                <div className={styles.socialsRow}>
                  {socials.map((social, index) => (
                    <a
                      ref={(element) => (fadeTargetsRef.current[index + 1] = element)}
                      className={styles.textLink}
                      href='#'
                      key={social}
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}
