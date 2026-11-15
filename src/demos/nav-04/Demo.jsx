/* src/demos/nav-04/Demo.jsx */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Demo.module.css";

const links = [
  { title: "Projects", href: "/" },
  { title: "Agency", href: "/" },
  { title: "Expertise", href: "/" },
  { title: "Careers", href: "/" },
  { title: "Contact", href: "/" },
];

const footerLinks = [
  { title: "Facebook", href: "/" },
  { title: "LinkedIn", href: "/" },
  { title: "Instagram", href: "/" },
  { title: "Twitter", href: "/" },
];

const menuVariants = {
  open: {
    width: "480px",
    height: "650px",
    top: "-25px",
    right: "-25px",
    transition: {
      duration: 0.75,
      type: "tween",
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    width: "100px",
    height: "40px",
    top: "0px",
    right: "0px",
    transition: {
      duration: 0.75,
      delay: 0.35,
      type: "tween",
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const perspective = {
  initial: {
    opacity: 0,
    rotateX: 90,
    y: 80,
    x: -20,
  },
  enter: (i) => ({
    opacity: 1,
    rotateX: 0,
    y: 0,
    x: 0,
    transition: {
      duration: 0.65,
      delay: 0.5 + i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
      opacity: { duration: 0.35 },
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      type: "linear",
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const slideIn = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.75 + i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      type: "tween",
      ease: "easeInOut",
    },
  },
};

function PerspectiveText({ label }) {
  return (
    <div className={styles.perspectiveText}>
      <p>{label}</p>
      <p>{label}</p>
    </div>
  );
}

function MenuButton({ isActive, toggleMenu }) {
  return (
    <div className={styles.button}>
      <motion.div
        className={styles.slider}
        animate={{ top: isActive ? "-100%" : "0%" }}
        transition={{
          duration: 0.5,
          type: "tween",
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        <button
          type='button'
          className={styles.el}
          onClick={toggleMenu}
          aria-label='Open menu'
        >
          <PerspectiveText label='Menu' />
        </button>

        <button
          type='button'
          className={`${styles.el} ${styles.close}`}
          onClick={toggleMenu}
          aria-label='Close menu'
        >
          <PerspectiveText label='Close' />
        </button>
      </motion.div>
    </div>
  );
}

function Navigation() {
  return (
    <div className={styles.nav}>
      <div className={styles.body}>
        {links.map((link, i) => (
          <div
            key={link.title}
            className={styles.linkContainer}
          >
            <motion.div
              custom={i}
              variants={perspective}
              initial='initial'
              animate='enter'
              exit='exit'
            >
              <a href={link.href}>{link.title}</a>
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div className={styles.footer}>
        {footerLinks.map((link, i) => (
          <motion.a
            href={link.href}
            key={link.title}
            custom={i}
            variants={slideIn}
            initial='initial'
            animate='enter'
            exit='exit'
          >
            {link.title}
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}

export default function Nav04() {
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <main className={styles.demo}>
      <header className={styles.header}>
        <motion.div
          className={styles.menu}
          variants={menuVariants}
          animate={isActive ? "open" : "closed"}
          initial='closed'
        >
          <AnimatePresence>{isActive && <Navigation />}</AnimatePresence>
        </motion.div>

        <MenuButton
          isActive={isActive}
          toggleMenu={toggleMenu}
        />
      </header>
    </main>
  );
}
