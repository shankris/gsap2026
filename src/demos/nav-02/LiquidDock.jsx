"use client";

// src/demos/nav-02/LiquidDock.jsx

import { animate, AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./Demo.module.css";

const DEFAULT_ITEMS = [
  { icon: "home", label: "Home", color: "#FF8A5C" },
  { icon: "search", label: "Search", color: "#FFC94D" },
  { icon: "inbox", label: "Inbox", color: "#FF7AB0" },
  { icon: "folder", label: "Projects", color: "#A78BFA" },
  { icon: "spark", label: "Studio", color: "#5EE0C0" },
  { icon: "settings", label: "Settings", color: "#7CB8FF" },
];

const PATHS = {
  home: ["M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"],
  search: ["M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z", "m15.5 15.5 4.5 4.5"],
  inbox: ["M4 13.5 6.2 5.6A1 1 0 0 1 7.2 5h9.6a1 1 0 0 1 1 .6L20 13.5V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", "M4 13.5h4.5l1.2 2h4.6l1.2-2H20"],
  folder: ["M3.5 7.5A1.5 1.5 0 0 1 5 6h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v8.3A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"],
  spark: ["M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5z", "M18.5 16v4M16.5 18h4"],
  heart: ["M12 19.5s-7.5-4.4-7.5-9.6A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.3c0 5.2-7.5 9.6-7.5 9.6z"],
  bell: ["M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z", "M10 20.5a2.2 2.2 0 0 0 4 0"],
  user: ["M12 4.5a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z", "M4.5 20a7.5 7.5 0 0 1 15 0"],
  settings: ["M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M12 3.5l1.6 2.3 2.8-.6.6 2.8 2.3 1.6-1.4 2.4 1.4 2.4-2.3 1.6-.6 2.8-2.8-.6L12 20.5l-1.6-2.3-2.8.6-.6-2.8-2.3-1.6L6.1 12 4.7 9.6 7 8l.6-2.8 2.8.6z"],
};

function Icon({ name }) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='24'
      height='24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {PATHS[name].map((path) => (
        <path
          key={path}
          d={path}
        />
      ))}
    </svg>
  );
}

export default function LiquidDock({ items = DEFAULT_ITEMS, active: activeProp = 0, onSelect, size = 48, magnify = 1.25, stretch = 1, glass = "rgba(16, 16, 20, 0.55)", iconColor = "rgba(255, 255, 255, 0.72)", inkColor = "#141416", tooltips = true, className = "" }) {
  const id = useId().replace(/:/g, "");
  const dockRef = useRef(null);

  const [active, setActive] = useState(activeProp);
  const [activeFrom, setActiveFrom] = useState(activeProp);

  if (activeFrom !== activeProp) {
    setActiveFrom(activeProp);
    setActive(activeProp);
  }

  const [hovered, setHovered] = useState(null);
  const [inside, setInside] = useState(false);

  const pad = Math.round(size * 0.21);
  const gap = Math.round(size * 0.17);

  const lit = hovered ?? active;
  const slot = (i) => pad + i * (size + gap);

  // The blob: spring to the lit slot, skewed by its own velocity.
  const target = useMotionValue(slot(activeProp ?? 0));

  const x = useSpring(target, {
    stiffness: 150,
    damping: 20,
    mass: 1,
  });

  const skew = useTransform(useVelocity(x), [-1000, 1000], [15 * stretch, -15 * stretch], { clamp: true });

  const fill = useMotionValue(items[activeProp ?? 0]?.color ?? "#fff");

  // The droplet that trails the pointer.
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const dx = useSpring(mx, {
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  });

  const dy = useSpring(my, {
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  });

  const pointerX = useMotionValue(-1000);

  useEffect(() => {
    if (lit === null) return;

    target.set(pad + lit * (size + gap));

    const animation = animate(fill, items[lit]?.color ?? "#fff", {
      duration: 0.35,
      ease: "easeOut",
    });

    return () => animation.stop();
  }, [lit, target, fill, items, pad, gap, size]);

  const showBlob = lit !== null;
  const dropR = 12 * Math.min(1.5, Math.max(0, stretch));

  return (
    <div className={`${styles.dockWrapper} ${className}`}>
      <div
        ref={dockRef}
        role='toolbar'
        aria-label='Dock'
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;

          const rect = dockRef.current.getBoundingClientRect();

          mx.set(event.clientX - rect.left);
          my.set(event.clientY - rect.top);
          pointerX.set(event.clientX - rect.left);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") {
            setInside(true);
          }
        }}
        onPointerLeave={() => {
          setInside(false);
          setHovered(null);
          pointerX.set(-1000);
        }}
        className={styles.dock}
        style={{
          gap,
          padding: pad,
          background: glass,
        }}
      >
        {/* Liquid layer */}
        <div className={styles.liquidLayer}>
          <svg
            className={styles.liquidSvg}
            aria-hidden='true'
          >
            <defs>
              <filter id={`goo-${id}`}>
                <feGaussianBlur
                  in='SourceGraphic'
                  stdDeviation='8'
                  result='blur'
                />

                <feColorMatrix
                  in='blur'
                  mode='matrix'
                  values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9'
                  result='goo'
                />

                <feComposite
                  in='SourceGraphic'
                  in2='goo'
                  operator='atop'
                />
              </filter>
            </defs>

            <motion.g
              filter={`url(#goo-${id})`}
              style={{ fill }}
            >
              <motion.rect
                y={pad}
                width={size}
                height={size}
                rx={size / 3}
                style={{
                  x,
                  skewX: skew,
                }}
                initial={false}
                animate={{
                  opacity: showBlob ? 1 : 0,
                }}
                transition={{ duration: 0.25 }}
              />

              <motion.circle
                cx={dx}
                cy={dy}
                r={dropR}
                initial={false}
                animate={{
                  opacity: inside && dropR > 0 ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.g>
          </svg>

          {/* Glassy sheen riding on the blob */}
          <motion.div
            className={styles.blobSheen}
            style={{
              x,
              skewX: skew,
              top: pad,
              width: size,
              height: size,
              background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 42%, rgba(0,0,0,0.18) 100%)",
            }}
            initial={false}
            animate={{
              opacity: showBlob ? 1 : 0,
            }}
            transition={{ duration: 0.25 }}
          />
        </div>

        {items.map((item, index) => (
          <DockButton
            key={index}
            item={item}
            size={size}
            centre={slot(index) + size / 2}
            pointerX={pointerX}
            magnify={magnify}
            lit={lit === index}
            current={active === index}
            iconColor={iconColor}
            inkColor={inkColor}
            tooltip={tooltips && hovered === index}
            onHover={() => setHovered(index)}
            onSelect={() => {
              setActive(index);
              onSelect?.(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DockButton({ item, size, centre, pointerX, magnify, lit, current, iconColor, inkColor, tooltip, onHover, onSelect }) {
  // Icons swell as the pointer nears them.
  const scale = useSpring(
    useTransform(pointerX, (px) => {
      const distance = Math.abs(px - centre);

      return distance >= 150 ? 1 : distance <= 80 ? magnify - ((magnify - (magnify * 0.5 + 0.5)) * distance) / 80 : magnify * 0.5 + 0.5 - ((magnify * 0.5 - 0.5) * (distance - 80)) / 70;
    }),
    {
      stiffness: 350,
      damping: 25,
    },
  );

  const Tag = item.href ? motion.a : motion.button;

  return (
    <Tag
      {...(item.href ? { href: item.href } : { type: "button" })}
      aria-label={item.label}
      aria-current={current ? "page" : undefined}
      onPointerEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
      whileTap={{ scale: 0.9 }}
      className={styles.dockButton}
      style={{
        width: size,
        height: size,
      }}
    >
      <AnimatePresence>
        {tooltip && (
          <motion.span
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 5,
              scale: 0.9,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={styles.tooltip}
            style={{
              x: "-50%",
              background: item.color ?? "#fff",
              color: inkColor,
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className={styles.icon}
        style={{
          scale,
          color: lit ? inkColor : iconColor,
        }}
      >
        <Icon name={item.icon} />
      </motion.span>

      {current && !lit && (
        <span
          aria-hidden='true'
          className={styles.activeIndicator}
          style={{
            background: item.color ?? "#fff",
          }}
        />
      )}
    </Tag>
  );
}
