/* src/demos/menu-02/Demo.jsx */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import styles from "./Demo.module.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function Menu02() {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const linksRef = useRef([]);
  const detailsRef = useRef([]);
  const footerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const menu = menuRef.current;
    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!menu || !overlay || !panel) return;

    const ctx = gsap.context(() => {
      gsap.set(overlay, {
        autoAlpha: 0,
      });

      gsap.set(panel, {
        clipPath: "circle(0% at 100% 0%)",
      });

      gsap.set(linksRef.current, {
        x: 100,
        autoAlpha: 0,
      });

      gsap.set(detailsRef.current, {
        y: 35,
        autoAlpha: 0,
      });

      gsap.set(footerRef.current, {
        y: 25,
        autoAlpha: 0,
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .to(
          overlay,
          {
            autoAlpha: 1,
            duration: 0.35,
          },
          0,
        )
        .to(
          panel,
          {
            clipPath: "circle(150% at 100% 0%)",
            duration: 1.1,
            ease: "power4.inOut",
          },
          0,
        )
        .to(
          linksRef.current,
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.09,
            ease: "elastic.out(1, 0.65)",
          },
          0.48,
        )
        .to(
          detailsRef.current,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
          },
          0.85,
        )
        .to(
          footerRef.current,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
          },
          1,
        );

      timelineRef.current = timeline;
    }, menu);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  const openMenu = () => {
    setIsOpen(true);
    timelineRef.current?.play(0);
  };

  const closeMenu = () => {
    setIsOpen(false);
    timelineRef.current?.reverse();
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  return (
    <main
      className={styles.demo}
      ref={menuRef}
    >
      <div className={styles.backdrop} />

      <header className={styles.header}>
        <a
          href='#home'
          className={styles.logo}
        >
          <span className={styles.logoMark}>M.</span>
          <span className={styles.logoText}>STUDIO</span>
        </a>

        <button
          type='button'
          className={`${styles.menuToggle} ${isOpen ? styles.menuToggleOpen : ""}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls='menu-02-overlay'
        >
          <span>{isOpen ? "Close" : "Menu"}</span>
          <span className={styles.toggleIcon}>
            <span />
            <span />
          </span>
        </button>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Independent creative studio</p>

        <h1>
          We create
          <br />
          meaningful
          <br />
          <span>experiences.</span>
        </h1>

        <p className={styles.heroDescription}>Strategy, design and digital experiences for brands looking to make a lasting impression.</p>

        <button
          type='button'
          className={styles.heroButton}
          onClick={openMenu}
        >
          Explore the menu
          <ArrowUpRight
            size={17}
            strokeWidth={1.8}
          />
        </button>
      </section>

      <footer className={styles.pageFooter}>
        <span>© 2026 Studio</span>
        <span>Creative direction & digital design</span>
      </footer>

      <div
        id='menu-02-overlay'
        ref={overlayRef}
        className={styles.overlay}
        aria-hidden={!isOpen}
      >
        <div
          ref={panelRef}
          className={styles.panel}
        >
          <div className={styles.panelHeader}>
            <a
              href='#home'
              className={styles.panelLogo}
            >
              <span className={styles.logoMark}>M.</span>
              <span className={styles.logoText}>STUDIO</span>
            </a>

            <span className={styles.panelLabel}>Navigation</span>
          </div>

          <div className={styles.menuContent}>
            <nav
              className={styles.navigation}
              aria-label='Main'
            >
              {NAV_LINKS.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={styles.navLink}
                  ref={(element) => {
                    linksRef.current[index] = element;
                  }}
                  onClick={closeMenu}
                >
                  <span className={styles.linkNumber}>0{index + 1}</span>

                  <span className={styles.linkText}>{link.label}</span>

                  <ArrowUpRight
                    className={styles.linkArrow}
                    size={28}
                    strokeWidth={1.5}
                  />
                </a>
              ))}
            </nav>

            <div className={styles.menuDetails}>
              <div
                className={styles.detailBlock}
                ref={(element) => {
                  detailsRef.current[0] = element;
                }}
              >
                <span className={styles.detailLabel}>Get in touch</span>
                <a href='mailto:hello@studio.com'>hello@studio.com</a>
                <a href='tel:+1234567890'>+1 234 567 890</a>
              </div>

              <div
                className={styles.detailBlock}
                ref={(element) => {
                  detailsRef.current[1] = element;
                }}
              >
                <span className={styles.detailLabel}>Find us</span>
                <span>New York, NY</span>
                <span>United States</span>
              </div>

              <div
                className={styles.detailBlock}
                ref={(element) => {
                  detailsRef.current[2] = element;
                }}
              >
                <span className={styles.detailLabel}>Follow along</span>
                <a href='#instagram'>Instagram</a>
                <a href='#linkedin'>LinkedIn</a>
              </div>
            </div>
          </div>

          <div
            className={styles.panelFooter}
            ref={footerRef}
          >
            <span>Independent by design.</span>
            <span>© 2026 Studio</span>
            <span className={styles.footerStatus}>
              <span />
              Available for projects
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
