/* src/demos/nav-05/Demo.jsx */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Demo.module.css";

const navItems = [
  { title: "Home", href: "/" },
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const footerLinks = [
  { title: "Awwwards", href: "https://www.awwwards.com/" },
  { title: "Instagram", href: "https://www.instagram.com/" },
  { title: "Dribbble", href: "https://dribbble.com/" },
  { title: "LinkedIn", href: "https://www.linkedin.com/" },
];

const ease = [0.76, 0, 0.24, 1];

const menuSlide = {
  initial: { x: "calc(100% + 100px)" },
  enter: {
    x: "0%",
    transition: { duration: 0.8, ease },
  },
  exit: {
    x: "calc(100% + 100px)",
    transition: { duration: 0.8, ease },
  },
};

const slide = {
  initial: { x: 80 },
  enter: (i) => ({
    x: 0,
    transition: {
      duration: 0.8,
      ease,
      delay: 0.15 + 0.1 * i,
    },
  }),
  exit: (i) => ({
    x: 80,
    transition: {
      duration: 0.8,
      ease,
      delay: 0.05 * i,
    },
  }),
};

const scale = {
  open: {
    scale: 1,
    transition: { duration: 0.3 },
  },
  closed: {
    scale: 0,
    transition: { duration: 0.4 },
  },
};

function MenuButton({ isActive, onClick }) {
  return (
    <div className={styles.header}>
      <button
        type='button'
        className={styles.button}
        onClick={onClick}
        aria-label={isActive ? "Close menu" : "Open menu"}
        aria-expanded={isActive}
      >
        <span className={`${styles.burger} ${isActive ? styles.burgerActive : ""}`} />
      </button>
    </div>
  );
}

function NavigationLink({ data, index, isActive, setSelectedIndicator, closeMenu }) {
  return (
    <motion.div
      className={styles.link}
      onMouseEnter={() => setSelectedIndicator(data.href)}
      custom={index}
      variants={slide}
      initial='initial'
      animate='enter'
      exit='exit'
    >
      <motion.div
        className={styles.indicator}
        variants={scale}
        animate={isActive ? "open" : "closed"}
      />

      <a
        href={data.href}
        onClick={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        {data.title}
      </a>
    </motion.div>
  );
}

function Footer() {
  return (
    <div className={styles.footer}>
      {footerLinks.map((link) => (
        <a
          key={link.title}
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
        >
          {link.title}
        </a>
      ))}
    </div>
  );
}

function Curve() {
  const initialPath = `M100 0 L100 ${window.innerHeight} Q-100 ${window.innerHeight / 2} 100 0`;

  const targetPath = `M100 0 L100 ${window.innerHeight} Q100 ${window.innerHeight / 2} 100 0`;

  const curve = {
    initial: {
      d: initialPath,
    },
    enter: {
      d: targetPath,
      transition: {
        duration: 1,
        ease: [0.76, 0, 0.24, 1],
      },
    },
    exit: {
      d: initialPath,
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <svg className={styles.svgCurve}>
      <motion.path
        variants={curve}
        initial='initial'
        animate='enter'
        exit='exit'
      />
    </svg>
  );
}

function Navigation({ closeMenu }) {
  const [selectedIndicator, setSelectedIndicator] = useState("/");

  return (
    <motion.div
      className={styles.menu}
      variants={menuSlide}
      initial='initial'
      animate='enter'
      exit='exit'
    >
      <div className={styles.body}>
        <div
          className={styles.nav}
          onMouseLeave={() => setSelectedIndicator("/")}
        >
          <div className={styles.navHeader}>
            <p>Navigation</p>
          </div>

          {navItems.map((data, index) => (
            <NavigationLink
              key={data.title}
              data={data}
              index={index}
              isActive={selectedIndicator === data.href}
              setSelectedIndicator={setSelectedIndicator}
              closeMenu={closeMenu}
            />
          ))}
        </div>

        <Footer />
      </div>

      <Curve />
    </motion.div>
  );
}

export default function Nav05() {
  const [isActive, setIsActive] = useState(false);

  const closeMenu = () => setIsActive(false);

  return (
    <main className={styles.demo}>
      <MenuButton
        isActive={isActive}
        onClick={() => setIsActive((prev) => !prev)}
      />

      <AnimatePresence mode='wait'>{isActive && <Navigation closeMenu={closeMenu} />}</AnimatePresence>
    </main>
  );
}
