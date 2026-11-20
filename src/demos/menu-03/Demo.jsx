"use client";

// src/demos/menu-03/Demo.jsx

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import styles from "./Demo.module.css";

gsap.registerPlugin(SplitText);

const LOGO_WHITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 44'%3E%3Ctext x='2' y='34' font-family='Arial, Helvetica, sans-serif' font-size='37' font-weight='900' letter-spacing='-1' fill='%23ffffff'%3EClikd%3C/text%3E%3C/svg%3E";

const LOGO_PURPLE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 44'%3E%3Ctext x='2' y='34' font-family='Arial, Helvetica, sans-serif' font-size='37' font-weight='900' letter-spacing='-1' fill='%23a374ff'%3EClikd%3C/text%3E%3C/svg%3E";

const OPEN_HIDDEN = "M1131,0 Q565.5,0 0,0 L0,0 L1131,0 Z";

const OPEN_BULGE = "M1131,345 Q565.5,620 0,345 L0,0 L1131,0 Z";

const OPEN_FULL = "M1131,861 Q565.5,861 0,861 L0,0 L1131,0 Z";

const CLOSE_START = "M1131,0 Q565.5,0 0,0 L0,861 L1131,861 Z";

const CLOSE_BULGE = "M1131,350 Q565.5,130 0,350 L0,861 L1131,861 Z";

const CLOSE_HIDDEN = "M1131,861 Q565.5,861 0,861 L0,861 L1131,861 Z";

export default function Demo() {
  const rootRef = useRef(null);
  const pathRef = useRef(null);

  const closeRequestedRef = useRef(false);

  const splitsRef = useRef([]);
  const menuLinksRef = useRef([]);
  const menuInfoItemsRef = useRef([]);
  const menuLogoRef = useRef(null);

  const activeTimelineRef = useRef(null);
  const isOpenRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const menuLinks = root.querySelectorAll(`.${styles.menuColLinks} a`);

    const menuInfoItems = root.querySelectorAll(
      `.${styles.menuColInfo} p,
       .${styles.menuColInfo} h3,
       .${styles.menuColInfo} h6`,
    );

    const menuLogo = root.querySelector(`.${styles.menuLogo}`);

    menuLinksRef.current = menuLinks;
    menuInfoItemsRef.current = menuInfoItems;
    menuLogoRef.current = menuLogo;

    // Split navigation links into characters.
    menuLinks.forEach((link) => {
      const split = new SplitText(link, {
        type: "chars",
        charsClass: "char",
      });

      splitsRef.current.push(split);

      gsap.set(split.chars, {
        opacity: 0,
        x: "750%",
      });
    });

    // Initial contact details state.
    gsap.set(menuInfoItems, {
      opacity: 0,
      y: 100,
    });

    return () => {
      activeTimelineRef.current?.kill();

      splitsRef.current.forEach((split) => {
        split.revert();
      });

      splitsRef.current = [];
    };
  }, []);

  function handleToggle() {
    if (isAnimatingRef.current) {
      if (isOpenRef.current) {
        closeRequestedRef.current = true;
      }

      return;
    }

    const path = pathRef.current;
    const menuLogo = menuLogoRef.current;
    const menuLinks = menuLinksRef.current;
    const menuInfoItems = menuInfoItemsRef.current;

    if (!path) return;

    isAnimatingRef.current = true;

    if (!isOpenRef.current) {
      // OPEN MENU

      isOpenRef.current = true;
      setIsOpen(true);
      setIsMenuActive(true);

      gsap.set(menuLinks, {
        opacity: 1,
      });

      const menuLinksChars = splitsRef.current.flatMap((split) => split.chars);

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;

          if (closeRequestedRef.current) {
            closeRequestedRef.current = false;
            handleToggle();
          }
        },
      });

      activeTimelineRef.current = tl;

      // Curtain
      tl.to(path, {
        duration: 0.5,
        attr: { d: OPEN_BULGE },
        ease: "power4.in",
      }).to(path, {
        duration: 0.5,
        attr: { d: OPEN_FULL },
        ease: "power4.out",
      });

      // Logo
      tl.to(
        menuLogo,
        {
          duration: 0.1,
          opacity: 1,
          ease: "none",
        },
        "-=0.75",
      );

      // Contact details
      tl.to(
        menuInfoItems,
        {
          duration: 0.75,
          opacity: 1,
          y: 0,
          ease: "power3.out",
          stagger: 0.075,
        },
        "-=0.35",
      );

      // Navigation characters
      tl.to(
        menuLinksChars,
        {
          duration: 1.5,
          x: "0%",
          ease: "elastic.out(1, 0.25)",
          stagger: 0.01,
        },
        0.45,
      );

      tl.to(
        menuLinksChars,
        {
          duration: 0.75,
          opacity: 1,
          ease: "power2.out",
          stagger: 0.01,
        },
        0.45,
      );
    } else {
      // CLOSE MENU

      isOpenRef.current = false;
      setIsOpen(false);

      gsap.set(path, {
        attr: { d: CLOSE_START },
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsMenuActive(false);

          gsap.set(path, {
            attr: { d: OPEN_HIDDEN },
          });

          splitsRef.current.forEach((split) => {
            gsap.set(split.chars, {
              opacity: 0,
              x: "750%",
            });
          });

          gsap.set(menuInfoItems, {
            opacity: 0,
            y: 100,
          });

          gsap.set(menuLogo, {
            opacity: 0,
          });

          isAnimatingRef.current = false;
        },
      });

      activeTimelineRef.current = tl;

      // Fade out menu content.
      tl.to(menuLogo, {
        duration: 0.3,
        opacity: 0,
      })
        .to(
          menuLinks,
          {
            duration: 0.3,
            opacity: 0,
          },
          "<",
        )
        .to(
          menuInfoItems,
          {
            duration: 0.3,
            opacity: 0,
          },
          "<",
        );

      // Curtain closing.
      tl.to(
        path,
        {
          duration: 0.5,
          attr: { d: CLOSE_BULGE },
          ease: "power3.in",
        },
        "<",
      ).to(path, {
        duration: 0.5,
        attr: { d: CLOSE_HIDDEN },
        ease: "power3.out",
      });
    }
  }

  return (
    <div
      className={styles.stage}
      ref={rootRef}
    >
      <div className={styles.nav}>
        <div className={styles.navLogo}>
          <a href='/'>
            <img
              src={LOGO_WHITE}
              alt='Clikd'
            />
          </a>
        </div>

        <button
          type='button'
          className={styles.navToggle}
          aria-label='Toggle navigation menu'
          aria-expanded={isOpen}
          onClick={handleToggle}
        >
          <span className={`${styles.navToggleMenu} ${isOpen ? styles.labelHidden : styles.labelVisible}`}>Menu</span>
          <span className={`${styles.navToggleClose} ${isOpen ? styles.labelVisible : styles.labelHidden}`}>Close</span>
        </button>

        <div
          className={`${styles.menu} ${isMenuActive ? styles.isOpen : ""}`}
          aria-hidden={!isMenuActive}
        >
          <svg
            className={styles.menuBgSvg}
            viewBox='0 0 1131 861'
            preserveAspectRatio='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              ref={pathRef}
              className={styles.menuPath}
              fill='#f0eeee'
              d={OPEN_HIDDEN}
            />
          </svg>

          <div className={styles.menuLogo}>
            <a href='/'>
              <img
                src={LOGO_PURPLE}
                alt='Clikd'
              />
            </a>
          </div>

          <div className={`${styles.menuCol} ${styles.menuColInfo}`}>
            <p>Get in touch</p>
            <h3>studio@clikd.co</h3>
            <h3>+1 (437) 982 4412</h3>
            <br />
            <h6>42 Mercer Street</h6>
            <h6>Toronto, ON M5V</h6>
          </div>

          <div className={`${styles.menuCol} ${styles.menuColLinks}`}>
            <a href='/work'>work</a>
            <a href='/services'>services</a>
            <a href='/about'>about</a>
            <a href='/insights'>insights</a>
            <a href='/careers'>careers</a>
            <a href='/contact'>contact</a>
          </div>
        </div>
      </div>

      <section className={styles.hero} />
    </div>
  );
}
