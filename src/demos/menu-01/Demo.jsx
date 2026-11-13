/* src/demos/menu-01/Demo.jsx */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import styles from "./Demo.module.css";

export default function Demo() {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const menu = root.querySelector(".menu-01__overlay");
      const curtain = root.querySelector(".menu-01__curtain");

      const links = gsap.utils.toArray(".menu-01__link", root);

      const details = gsap.utils.toArray(".menu-01__detail", root);

      const footer = root.querySelector(".menu-01__footer");

      gsap.set(menu, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      gsap.set(curtain, {
        clipPath: "circle(0% at 100% 0%)",
      });

      gsap.set(links, {
        x: 100,
        autoAlpha: 0,
      });

      gsap.set(details, {
        y: 35,
        autoAlpha: 0,
      });

      gsap.set(footer, {
        y: 25,
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          gsap.set(menu, {
            autoAlpha: 1,
            pointerEvents: "auto",
          });
        },
        onReverseComplete: () => {
          gsap.set(menu, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
        },
      });

      tl.to(
        curtain,
        {
          clipPath: "circle(150% at 100% 0%)",
          duration: 1.1,
          ease: "power4.inOut",
        },
        0,
      )
        .to(
          links,
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
          details,
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
          footer,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
          },
          1,
        );

      timelineRef.current = tl;
    }, root);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (isOpen) {
      timeline.play();
    } else {
      timeline.reverse();
    }

    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <main
      className={styles.root}
      ref={rootRef}
    >
      <header className='menu-01__header'>
        <a
          href='#'
          className='menu-01__logo'
        >
          POPPR<span>.</span>
        </a>

        <button
          type='button'
          className='menu-01__toggle'
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span>{isOpen ? "Close" : "Menu"}</span>

          <span className='menu-01__icon'>
            <i />
            <i />
          </span>
        </button>
      </header>

      <section className='menu-01__hero'>
        <div>
          <span className='menu-01__eyebrow'>CREATIVE DIGITAL STUDIO</span>

          <h1>
            We create
            <br />
            digital <span>experiences.</span>
          </h1>

          <p>An experimental navigation concept inspired by expressive agency websites.</p>
        </div>

        <span className='menu-01__hint'>CLICK MENU TO EXPLORE</span>
      </section>

      <div
        className='menu-01__overlay'
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className='menu-01__curtain' />

        <div className='menu-01__menu-content'>
          <div className='menu-01__menu-top'>
            <span>EXPLORE</span>
            <span>MENU / 01</span>
          </div>

          <nav
            className='menu-01__nav'
            aria-label='Main navigation'
          >
            {[
              ["01", "Home", "#home"],
              ["02", "About", "#about"],
              ["03", "Work", "#work"],
              ["04", "Services", "#services"],
              ["05", "Contact", "#contact"],
            ].map(([number, label, href]) => (
              <a
                href={href}
                className='menu-01__link'
                key={number}
                onClick={closeMenu}
              >
                <span className='menu-01__number'>{number}</span>

                <span className='menu-01__link-label'>{label}</span>

                <ArrowUpRight
                  className='menu-01__arrow'
                  size={30}
                  strokeWidth={1.5}
                />
              </a>
            ))}
          </nav>

          <div className='menu-01__footer'>
            <div className='menu-01__contact'>
              <span className='menu-01__detail'>GET IN TOUCH</span>

              <a
                href='mailto:hello@example.com'
                className='menu-01__detail'
              >
                hello@example.com
              </a>
            </div>

            <div className='menu-01__socials'>
              <a href='https://www.instagram.com/'>
                Instagram <ArrowUpRight size={14} />
              </a>

              <a href='https://www.linkedin.com/'>
                LinkedIn <ArrowUpRight size={14} />
              </a>
            </div>

            <span className='menu-01__copyright'>© 2026 — CREATIVE DIGITAL STUDIO</span>
          </div>
        </div>
      </div>
    </main>
  );
}
