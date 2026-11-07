/* src/demos/accordion-02/Demo.jsx */

"use client";

import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./Demo.module.css";

const art = (n) => `/demos/accordion-02/art-${n}.webp`;

const DEFAULT_ITEMS = [
  {
    title: "Discover",
    description: "We listen first. Workshops and research that turn loose ideas into a clear brief.",
    image: art(1),
    imageAlt: "Violet chrome ribbon coiling upward",
    tone: "#B9AEF2",
    linkLabel: "See the process",
  },
  {
    title: "Shape",
    description: "Concepts and systems that give a product a voice people remember.",
    image: art(2),
    imageAlt: "Rose metal rings wound into a coil",
    tone: "#F1B6C8",
    linkLabel: "See the process",
  },
  {
    title: "Craft",
    description: "Interfaces drawn to the pixel, tested in the hand, refined until they feel obvious.",
    image: art(3),
    imageAlt: "Mint chrome knot",
    tone: "#A9D9C7",
    linkLabel: "See the process",
  },
  {
    title: "Build",
    description: "Fast, accessible front ends, engineered to stay easy to change.",
    image: art(4),
    imageAlt: "Copper column with a half twist",
    tone: "#F1C29C",
    linkLabel: "See the process",
  },
  {
    title: "Launch",
    description: "Release, measure, refine. We stay close long after go-live.",
    image: art(5),
    imageAlt: "Stepped tower of blue metal plates",
    tone: "#AACFEF",
    linkLabel: "See the process",
  },
];

const COVER = "#24262B";
const TITLE_SIZE = 40;
const TILT = [-0.8, 0.7, -0.65, 0.9];
const OPEN_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 1,
  restDelta: 0.05,
  restSpeed: 0.5,
};
const TICKET_H = 72;

const smooth = (v, a, b) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const finePointer = (e) => e.pointerType !== "touch" && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

const startIndex = (open, n, collapsible) => {
  if (!n) return -1;

  const i = Math.min(n - 1, Math.max(-1, Math.round(Number.isFinite(open) ? open : 1) - 1));

  return !collapsible && i < 0 ? 0 : i;
};

const subscribeReduced = (callback) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);

  return () => media.removeEventListener("change", callback);
};

const getReducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getServerReducedSnapshot = () => false;

function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, getReducedSnapshot, getServerReducedSnapshot);
}

export default function Demo() {
  return (
    <main className={styles.demo}>
      <SpineAccordion />
    </main>
  );
}

function SpineAccordion({ items = DEFAULT_ITEMS, initialOpen = 3, collapsible = true, hoverToOpen = true, autoplay = true, interval = 5, cardHeight = 520, closedWidth = 112, mobileHeaderHeight = 96, breakpoint = 820, minOpenWidth = 442, gap = 8, radius = 8, artTravel = 4, hoverMotion = true, textColor = "#24262B", secondaryColor = "#30343D", coverTextColor = "#EFEEE9", focusColor = "#D7D5E5", className = "" }) {
  const n = items.length;
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduced = useReducedMotion();

  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const triggers = useRef([]);
  const cards = useRef([]);

  const [width, setWidth] = useState(0);
  const [minimums, setMinimums] = useState({});
  const [open, setOpen] = useState(() => startIndex(initialOpen, n, collapsible));

  const startKey = `${initialOpen}-${n}-${collapsible}`;
  const [startedFrom, setStartedFrom] = useState(startKey);

  if (startedFrom !== startKey) {
    setStartedFrom(startKey);
    setOpen(startIndex(initialOpen, n, collapsible));
  }

  const [selection, setSelection] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [timerClicked, setTimerClicked] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [settled, setSettled] = useState(true);
  const [timerFocus, setTimerFocus] = useState(false);
  const [timerHover, setTimerHover] = useState(false);

  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const hoverTimer = useRef(null);
  const pendingHover = useRef(-1);
  const pointer = useRef({ x: 0, y: 0 });
  const lastOpen = useRef({
    x: -9999,
    y: -9999,
    index: -1,
    time: 0,
  });
  const hoverBlockedUntil = useRef(0);
  const openRef = useRef(open);

  const intervalMs = Math.max(2, Number.isFinite(interval) ? interval : 5) * 1000;

  const timerOn = autoplay && n > 1 && !reduced;

  const running = settled && timerOn && !paused && (!pointerInside || timerClicked) && inView && tabVisible && open >= 0;

  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
    }

    hoverTimer.current = null;
    pendingHover.current = -1;
  }, []);

  const select = useCallback(
    (i) => {
      clearHover();
      lastOpen.current = {
        ...pointer.current,
        index: -1,
        time: 0,
      };
      elapsed.current = 0;
      setOpen(i);
      setSelection((value) => value + 1);
      setSettled(reduced);
    },
    [clearHover, reduced],
  );

  const linkFocused = () => {
    const element = document.activeElement;

    return element instanceof HTMLElement && !!element.dataset.bodyLink && rootRef.current?.contains(element) && element.matches(":focus-visible");
  };

  const hoverIntent = (i, e) => {
    if (!hoverToOpen || linkFocused() || i === open || e.pointerType === "touch" || e.buttons || e.timeStamp < hoverBlockedUntil.current || !finePointer(e)) {
      return;
    }

    pointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    const last = lastOpen.current;

    if (Math.abs(e.clientX - last.x) + Math.abs(e.clientY - last.y) < 4 || pendingHover.current === i) {
      return;
    }

    clearHover();
    pendingHover.current = i;

    const target = e.currentTarget;

    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null;
      pendingHover.current = -1;

      if (!target.isConnected || !target.matches(":hover") || linkFocused()) {
        return;
      }

      select(i);

      lastOpen.current = {
        ...pointer.current,
        index: i,
        time: performance.now(),
      };
    }, 120);
  };

  useEffect(() => clearHover, [clearHover]);

  useEffect(() => {
    clearHover();
  }, [hoverToOpen, n, clearHover]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useLayoutEffect(() => {
    elapsed.current = 0;
    progress.set(0);
  }, [open, selection, intervalMs, progress, reduced]);

  useEffect(() => {
    const onVisibility = () => {
      setTabVisible(document.visibilityState === "visible");
    };

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      },
      { threshold: [0, 0.25] },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      elapsed.current = Math.min(intervalMs, elapsed.current + Math.max(0, now - last));

      last = now;
      progress.set(elapsed.current / intervalMs);

      if (elapsed.current >= intervalMs) {
        return select((open + 1) % n);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [running, open, selection, intervalMs, n, progress, select]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => setWidth(root.clientWidth);

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  const onMinimum = useCallback((i, min) => {
    setMinimums((current) => (Math.abs((current[i] || 0) - min) > 0.5 ? { ...current, [i]: min } : current));
  }, []);

  const onSettled = useCallback((i, done) => {
    if (i === openRef.current || openRef.current < 0) {
      setSettled(done);
    }
  }, []);

  const rowGap = Math.max(0, n - 1) * gap;
  const spines = Math.max(0, n - 1) * closedWidth;
  const narrowest = Math.max(minOpenWidth, closedWidth + TITLE_SIZE * 7);

  const horizontal = n > 0 && width >= breakpoint;

  const trackW = horizontal ? Math.max(width, spines + rowGap + narrowest) : width;

  const openW = Math.max(0, trackW - rowGap - spines);
  const scrolls = horizontal && trackW > width + 0.5;
  const compact = width < 600;

  const panelH = Math.max(cardHeight, ...items.map((_, i) => minimums[i] || 0));

  const evenW = n ? Math.max(0, (trackW - rowGap) / n) : 0;

  useEffect(() => {
    clearHover();
  }, [horizontal, width, clearHover]);

  const reveal = useCallback(
    (i, triggerOnly = false, instant = false) => {
      const viewport = viewportRef.current;
      const card = cards.current[i];
      const trigger = triggers.current[i];

      if (!scrolls || !viewport || !card || !trigger) return;

      const elementWidth = triggerOnly ? trigger.offsetWidth : card.offsetWidth;

      const start = card.offsetLeft + (triggerOnly ? trigger.offsetLeft : 0);

      const end = start + elementWidth;
      let to = viewport.scrollLeft;

      if (elementWidth > viewport.clientWidth || start < to) {
        to = start;
      } else if (end > to + viewport.clientWidth) {
        to = end - viewport.clientWidth;
      }

      to = Math.max(0, Math.min(to, viewport.scrollWidth - viewport.clientWidth));

      if (Math.abs(to - viewport.scrollLeft) > 0.5) {
        viewport.scrollTo({
          left: to,
          behavior: reduced || instant ? "auto" : "smooth",
        });
      }
    },
    [scrolls, reduced],
  );

  useLayoutEffect(() => {
    if (!scrolls) {
      if (viewportRef.current) {
        viewportRef.current.scrollLeft = 0;
      }
      return;
    }

    if (settled && open >= 0) {
      const element = document.activeElement;

      const focused = element instanceof HTMLButtonElement && element.matches(":focus-visible") ? triggers.current.indexOf(element) : -1;

      if (focused >= 0 && focused !== open) {
        reveal(focused, true, true);
      } else {
        reveal(open);
      }
    }
  }, [scrolls, trackW, width, open, settled, reveal]);

  const onKeyDown = (e, i) => {
    let to = i;

    if (e.key === "ArrowDown" || (horizontal && e.key === "ArrowRight")) {
      to = (i + 1) % n;
    } else if (e.key === "ArrowUp" || (horizontal && e.key === "ArrowLeft")) {
      to = (i - 1 + n) % n;
    } else if (e.key === "Home") {
      to = 0;
    } else if (e.key === "End") {
      to = n - 1;
    } else {
      return;
    }

    e.preventDefault();
    triggers.current[to]?.focus({ preventScroll: scrolls });
    reveal(to, true, true);
  };

  if (!n) return null;

  const colors = {
    text: textColor,
    secondary: secondaryColor,
    coverText: coverTextColor,
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`}
      style={{
        "--sa-focus": focusColor,
        "--sa-text": textColor,
      }}
      data-autoplay={timerOn ? (running ? "running" : "paused") : "off"}
      onPointerMoveCapture={(e) => {
        pointer.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") {
          setPointerInside(true);
        }
      }}
      onPointerLeave={() => {
        setPointerInside(false);
        setTimerClicked(false);
        clearHover();
      }}
      onPointerDownCapture={(e) => {
        if (e.pointerType === "touch" && !(e.target instanceof Element && e.target.closest("[data-timer]"))) {
          setPaused(true);
        }
      }}
      onFocusCapture={(e) => {
        if (!(e.target instanceof HTMLElement) || !e.target.matches(":focus-visible")) {
          return;
        }

        clearHover();
        setPaused(true);

        const i = triggers.current.findIndex((trigger) => trigger === e.target);

        if (i >= 0) {
          reveal(i, true, true);
        }
      }}
    >
      <div
        ref={viewportRef}
        className={styles.viewport}
        style={{
          overflowX: scrolls ? "auto" : "visible",
          overflowY: scrolls ? "hidden" : "visible",
        }}
        onScroll={(e) => {
          clearHover();
          hoverBlockedUntil.current = e.timeStamp + 160;
          lastOpen.current = {
            ...pointer.current,
            index: -1,
            time: 0,
          };
        }}
      >
        <div
          className={styles.track}
          style={{
            width: trackW,
            flexDirection: horizontal ? "row" : "column",
            gap,
          }}
        >
          {width > 0 &&
            items.map((item, i) => (
              <Card
                key={i}
                item={item}
                index={i}
                open={open === i}
                collapsible={collapsible}
                horizontal={horizontal}
                compact={compact}
                width={horizontal ? (open < 0 ? evenW : open === i ? openW : closedWidth) : width}
                openW={horizontal ? openW : width}
                spine={closedWidth}
                panelH={panelH}
                headerMin={mobileHeaderHeight}
                colors={colors}
                padding={compact ? 20 : 24}
                radius={radius}
                reduced={reduced}
                hoverMotion={hoverMotion}
                artTravel={artTravel}
                motionActive={inView && tabVisible}
                id={id}
                selection={`${open}-${selection}`}
                setCard={(element) => {
                  cards.current[i] = element;
                }}
                setTrigger={(element) => {
                  triggers.current[i] = element;
                }}
                onToggle={(e) => {
                  clearHover();

                  const last = lastOpen.current;

                  if (e.detail > 0 && open === i && last.index === i && e.timeStamp - last.time < 650) {
                    return;
                  }

                  if (open === i && !collapsible) return;
                  if (open === i) setPaused(true);

                  select(open === i ? -1 : i);
                }}
                onKeyDown={(e) => onKeyDown(e, i)}
                onHoverIntent={(e) => hoverIntent(i, e)}
                onHoverLeave={clearHover}
                onMinimum={onMinimum}
                onSettled={onSettled}
                timer={
                  timerOn
                    ? {
                        progress,
                        paused,
                        focus: timerFocus,
                        engaged: timerHover,
                        onClick: () => {
                          clearHover();
                          setPaused((value) => !value);
                          setTimerClicked(true);
                        },
                        onFocus: setTimerFocus,
                        onHover: setTimerHover,
                      }
                    : null
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function Card({ item, index, open, collapsible, horizontal, compact, width, openW, spine, panelH, headerMin, colors, padding: pad, radius, reduced, hoverMotion, artTravel, motionActive, id, selection, setCard, setTrigger, onToggle, onKeyDown, onHoverIntent, onHoverLeave, onMinimum, onSettled, timer }) {
  const headerRef = useRef(null);
  const probeRef = useRef(null);
  const copyRef = useRef(null);
  const ticketRef = useRef(null);

  const [triggerHover, setTriggerHover] = useState(false);
  const [triggerFocus, setTriggerFocus] = useState(false);
  const [linkHover, setLinkHover] = useState(false);
  const [linkFocus, setLinkFocus] = useState(false);
  const [ready, setReady] = useState(true);

  const hasTicket = !!item.linkLabel;

  const [measurements, setMeasurements] = useState({
    header: horizontal ? 0 : headerMin,
    copy: 50,
    ticket: hasTicket ? TICKET_H : 0,
  });

  const { header: measuredHeader, copy, ticket } = measurements;

  const motionOn = !reduced && hoverMotion;
  const linkEngaged = open && (linkHover || linkFocus);
  const engaged = open && (triggerHover || linkHover || triggerFocus || linkFocus);

  const link = useMotionValue(0);
  const label = useTransform(link, [0, 1], [colors.secondary, colors.text]);

  useLayoutEffect(() => {
    if (!motionOn) {
      link.jump(+linkEngaged);
      return;
    }

    const animation = animate(link, +linkEngaged, {
      type: "spring",
      stiffness: 230,
      damping: 32,
      mass: 1,
      restDelta: 0.001,
      restSpeed: 0.005,
    });

    return () => animation.stop();
  }, [linkEngaged, motionOn, link]);

  const aimX = useMotionValue(0);
  const aimY = useMotionValue(0);
  const followX = useSpring(aimX, {
    stiffness: 180,
    damping: 27,
    mass: 1,
  });
  const followY = useSpring(aimY, {
    stiffness: 180,
    damping: 27,
    mass: 1,
  });

  const openness = useMotionValue(+open);

  const float = useSpring(0, {
    stiffness: 90,
    damping: 21,
    mass: 1,
    restDelta: 1e-4,
    restSpeed: 0.001,
  });

  const phase = useMotionValue(0);

  useLayoutEffect(() => {
    if (!motionOn) {
      float.jump(0);
      return;
    }

    float.set(engaged && motionActive ? 1 : 0);
  }, [engaged, motionActive, motionOn, float]);

  useEffect(() => {
    if (!motionOn || !motionActive || (!engaged && float.get() < 0.001)) {
      return;
    }

    const animation = animate(phase, phase.get() + Math.PI * 2, {
      duration: 6.8,
      ease: "linear",
      repeat: Infinity,
    });

    const unsubscribe = float.on("change", (value) => {
      if (!engaged && value < 0.001) {
        animation.stop();
      }
    });

    return () => {
      unsubscribe();
      animation.stop();
    };
  }, [engaged, motionActive, motionOn, float, phase]);

  const grip = () => (motionOn ? smooth(openness.get(), 0.2, 0.95) : 0);

  const drift = () => float.get() * grip();

  const hoverX = useTransform(() => followX.get() * grip() + Math.sin(phase.get()) * 0.65 * drift());

  const hoverY = useTransform(() => followY.get() * grip() + (-5 + Math.sin(phase.get()) * 1.4) * drift());

  const hoverScale = useTransform(() => 1 + 0.022 * drift());

  const hoverRotate = useTransform(() => (TILT[index % 4] + Math.sin(phase.get()) * 0.24) * drift() + Math.max(-0.6, Math.min(0.6, followX.get() * 0.16)) * grip());

  const ringProgress = useMotionValue(0);

  useLayoutEffect(() => {
    if (!open || !timer) return;

    ringProgress.set(0);

    return timer.progress.on("change", (value) => {
      ringProgress.set(value);
    });
  }, [open, timer, ringProgress]);

  const resetAim = () => {
    aimX.set(0);
    aimY.set(0);
  };

  const aim = (e) => {
    if (!motionOn || !open || !ready || !finePointer(e)) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    aimX.set(Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)) * artTravel);

    aimY.set(Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)) * artTravel * 0.65);
  };

  const panelEnter = (e) => {
    if (!finePointer(e)) return;

    setLinkHover(true);
    aim(e);
  };

  const panelLeave = () => {
    setLinkHover(false);
    resetAim();
  };

  useEffect(() => {
    aimX.set(0);
    aimY.set(0);

    if (!open) {
      setLinkHover(false);
      setLinkFocus(false);
    }
  }, [open, horizontal, aimX, aimY]);

  // Panel geometry
  const header = horizontal ? 0 : Math.max(headerMin, measuredHeader);

  const markY = horizontal ? 40 : header / 2;

  const contentW = Math.max(1, horizontal ? openW - spine : width);

  const inner = Math.max(1, contentW - pad * 2);

  const artBox = horizontal ? Math.max(220, panelH - pad * 2 - copy - ticket) : Math.max(180, Math.min(390, inner * 0.98));

  const contentH = pad + artBox + copy + ticket + pad;

  const height = horizontal ? panelH : header + (open ? contentH : 0);

  const size = Math.max(1, Math.min(artBox, inner));

  const hideClosedArt = !horizontal && width < 340;

  const artScale = Math.max(0.5, Math.min(1, item.imageScale ?? 0.94));

  const w = useMotionValue(width);
  const h = useMotionValue(height);

  const artX = useTransform(() => {
    const closed = horizontal ? Math.min(spine - 14, spine * 0.92) : width - pad - 22 - 12 - 24;

    return lerp(closed, (horizontal ? spine : 0) + pad + inner / 2, clamp01(openness.get())) - size / 2;
  });

  const artY = useTransform(() => {
    const closed = horizontal ? Math.max(h.get(), panelH) - 65 : markY;

    return lerp(closed, header + pad + artBox / 2, clamp01(openness.get())) - size / 2;
  });

  const artSize = useTransform(openness, (value) => lerp((horizontal ? Math.min(230, size * 0.74) : 48) / size, artScale, clamp01(value)));

  const artOpacity = useTransform(openness, (value) => (hideClosedArt ? smooth(value, 0.1, 0.8) : 1));

  const copyOpacity = useTransform(openness, (value) => (linkFocus ? 1 : smooth(value, 0.3, 0.92)));

  const toneOpacity = useTransform(openness, (value) => smooth(value, 0, 1));

  const wasHorizontal = useRef(horizontal);

  useLayoutEffect(() => {
    const switched = wasHorizontal.current !== horizontal;
    wasHorizontal.current = horizontal;

    if (reduced || switched) {
      w.jump(width);
      h.jump(height);
      openness.jump(+open);
      setReady(true);
      onSettled(index, true);
      return;
    }

    setReady(false);
    onSettled(index, false);

    let cancelled = false;
    let left = 3;

    const done = () => {
      if (!cancelled && --left === 0) {
        setReady(true);
        onSettled(index, true);
      }
    };

    const widthAnimation = animate(w, width, {
      ...OPEN_SPRING,
      onComplete: done,
    });

    const heightAnimation = animate(h, height, {
      ...OPEN_SPRING,
      onComplete: done,
    });

    const opennessAnimation = animate(openness, +open, {
      ...OPEN_SPRING,
      restDelta: 1e-4,
      restSpeed: 0.001,
      onComplete: done,
    });

    return () => {
      cancelled = true;
      widthAnimation.stop();
      heightAnimation.stop();
      opennessAnimation.stop();
    };
  }, [selection, open, width, height, horizontal, reduced, w, h, openness, index, onSettled]);

  useLayoutEffect(() => {
    const head = headerRef.current;
    if (!head) return;

    const measure = () => {
      const measuredCopy = copyRef.current?.offsetHeight || 0;

      const measuredTicket = ticketRef.current ? ticketRef.current.offsetHeight + 20 : 0;

      const next = {
        header: horizontal ? 0 : head.offsetHeight,
        copy: measuredCopy,
        ticket: measuredTicket,
      };

      setMeasurements((previous) => (Math.abs(previous.header - next.header) > 0.5 || Math.abs(previous.copy - next.copy) > 0.5 || Math.abs(previous.ticket - next.ticket) > 0.5 ? next : previous));

      onMinimum(index, Math.max(pad * 2 + measuredCopy + measuredTicket + 220, 94 + (probeRef.current?.offsetHeight || 0) + 200));
    };

    measure();

    const observer = new ResizeObserver(measure);

    [head, probeRef.current, copyRef.current, ticketRef.current].forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [horizontal, compact, contentW, pad, hasTicket, index, onMinimum]);

  const verticalTitle = {
    fontSize: TITLE_SIZE,
    writingMode: "vertical-rl",
  };

  const PanelTag = item.href ? "a" : "div";

  return (
    <motion.article
      ref={setCard}
      className={styles.card}
      data-open={open}
      data-trigger-engaged={triggerHover || triggerFocus || undefined}
      data-link-engaged={linkEngaged || undefined}
      style={{
        width: w,
        height: h,
        minHeight: horizontal ? panelH : header,
        borderRadius: radius,
        background: item.coverColor ?? COVER,
        color: colors.coverText,
      }}
    >
      <span
        ref={probeRef}
        aria-hidden='true'
        className={styles.titleProbe}
        style={{
          ...verticalTitle,
          lineHeight: "1.2em",
        }}
      >
        {item.title}
      </span>

      <motion.span
        aria-hidden='true'
        className={styles.tone}
        style={{
          left: horizontal ? spine : 0,
          top: header,
          background: item.tone ?? "#ddd",
          opacity: toneOpacity,
        }}
      />

      <span
        aria-hidden='true'
        className={styles.outline}
      />

      <h3 className={styles.heading}>
        <button
          ref={setTrigger}
          type='button'
          id={`${id}-trigger-${index}`}
          aria-label={item.title}
          aria-expanded={open}
          aria-disabled={open && !collapsible ? true : undefined}
          aria-controls={`${id}-panel-${index}`}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          onPointerEnter={(e) => {
            if (!finePointer(e)) return;

            setTriggerHover(true);

            if (!open) onHoverIntent(e);
          }}
          onPointerMove={(e) => {
            if (!open && finePointer(e)) {
              onHoverIntent(e);
            }
          }}
          onPointerLeave={() => {
            setTriggerHover(false);
            resetAim();
            onHoverLeave();
          }}
          onPointerCancel={() => {
            setTriggerHover(false);
            resetAim();
            onHoverLeave();
          }}
          onFocus={(e) => {
            setTriggerFocus(e.currentTarget.matches(":focus-visible"));
          }}
          onBlur={() => setTriggerFocus(false)}
          className={styles.trigger}
          style={{
            width: horizontal && open ? spine : "100%",
            height: horizontal ? "100%" : header,
            borderRadius: radius,
          }}
        >
          <span
            ref={headerRef}
            aria-hidden='true'
            className={horizontal ? styles.horizontalHeader : styles.mobileHeader}
            style={
              horizontal
                ? {
                    width: spine,
                    height: panelH,
                  }
                : {
                    width,
                    minHeight: headerMin,
                    padding: pad,
                  }
            }
          >
            <span className={`${styles.number} ${horizontal ? styles.horizontalNumber : ""}`}>{String(index + 1).padStart(2, "0")}</span>

            <span
              className={horizontal ? styles.verticalTitle : styles.mobileTitle}
              style={
                horizontal
                  ? {
                      ...verticalTitle,
                      lineHeight: "1.2em",
                      transform: "translateX(-50%) rotate(180deg)",
                    }
                  : {
                      fontSize: TITLE_SIZE * (compact ? 0.7 : 0.8),
                    }
              }
            >
              {item.title}
            </span>

            {!horizontal && !hideClosedArt && item.image && (
              <span
                aria-hidden='true'
                className={styles.mobileArtSpacer}
              />
            )}

            {!horizontal && (
              <span
                aria-hidden='true'
                className={styles.mobileMarkSpacer}
              />
            )}
          </span>
        </button>
      </h3>

      <div
        id={`${id}-panel-${index}`}
        role='region'
        aria-labelledby={`${id}-trigger-${index}`}
        aria-hidden={!open}
        className={styles.panelLayer}
      >
        <PanelTag
          {...(item.href
            ? {
                href: item.href,
                target: item.newTab ? "_blank" : undefined,
                rel: item.newTab ? "noopener noreferrer" : undefined,
                tabIndex: open ? 0 : -1,
                "aria-label": `${item.linkLabel || "Explore"} — ${item.title}`,
                "data-body-link": "true",
                onFocus: (e) => {
                  setLinkFocus(e.currentTarget.matches(":focus-visible"));
                },
                onBlur: () => setLinkFocus(false),
              }
            : {})}
          onPointerEnter={panelEnter}
          onPointerMove={aim}
          onPointerLeave={panelLeave}
          onPointerCancel={panelLeave}
          className={styles.panelLink}
          style={{
            borderRadius: radius,
            color: colors.text,
            pointerEvents: open ? "auto" : "none",
            cursor: item.href ? "pointer" : "default",
          }}
        >
          <motion.span
            aria-hidden={!item.imageAlt}
            className={styles.artPosition}
            style={{
              width: size,
              height: size,
              x: artX,
              y: artY,
              scale: artSize,
              opacity: artOpacity,
            }}
          >
            <motion.span
              className={styles.artMotion}
              style={{
                x: hoverX,
                y: hoverY,
                scale: hoverScale,
                rotate: hoverRotate,
              }}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.imageAlt ?? ""}
                  draggable={false}
                  className={styles.artImage}
                />
              ) : (
                <span
                  aria-hidden='true'
                  className={styles.artPlaceholder}
                  style={{
                    background: colors.coverText,
                  }}
                />
              )}
            </motion.span>
          </motion.span>

          <div
            className={styles.panelContent}
            style={{
              left: horizontal ? spine : 0,
              top: header,
              width: contentW,
              height: contentH,
              padding: pad,
            }}
          >
            <div
              aria-hidden='true'
              className={styles.artSpacer}
              style={{ height: artBox }}
            />

            <motion.div style={{ opacity: copyOpacity }}>
              <p
                ref={copyRef}
                className={styles.description}
                style={{ color: colors.secondary }}
              >
                {item.description}
              </p>

              {hasTicket && (
                <span
                  ref={ticketRef}
                  className={styles.ticket}
                  style={{ color: colors.text }}
                >
                  <span
                    aria-hidden='true'
                    className={styles.ticketRule}
                    style={{ background: colors.text }}
                  />

                  <motion.span
                    aria-hidden='true'
                    className={styles.ticketProgress}
                    style={{
                      background: colors.text,
                      scaleX: link,
                    }}
                  />

                  <motion.span
                    className={styles.ticketLabel}
                    style={{ color: label }}
                  >
                    {item.linkLabel}
                  </motion.span>
                </span>
              )}
            </motion.div>
          </div>
        </PanelTag>
      </div>

      <span
        aria-hidden={!timer || !open}
        className={styles.mark}
        data-timer-engaged={(open && timer?.engaged) || undefined}
        style={{
          left: horizontal ? spine - 56 : width - pad - 33,
          top: markY - 22,
        }}
      >
        <Mark
          openness={openness}
          progress={ringProgress}
          timer={!!timer}
          paused={!!timer?.paused}
          reduced={reduced}
        />

        {timer && open && (
          <button
            type='button'
            data-timer
            aria-label={timer.paused ? "Resume autoplay" : "Pause autoplay"}
            title={timer.paused ? "Resume autoplay" : "Pause autoplay"}
            aria-controls={`${id}-panel-${index}`}
            onClick={timer.onClick}
            onFocus={(e) => {
              timer.onFocus(e.currentTarget.matches(":focus-visible"));
            }}
            onBlur={() => timer.onFocus(false)}
            onPointerEnter={() => timer.onHover(true)}
            onPointerLeave={() => timer.onHover(false)}
            className={`${styles.timerButton} ${timer.focus ? styles.timerFocus : ""}`}
          />
        )}
      </span>
    </motion.article>
  );
}

function Mark({ openness, progress, timer, paused, reduced }) {
  const ring = useTransform(openness, (value) => smooth(value, 0.18, 0.92));

  const plus = useTransform(ring, (value) => (timer ? 1 - value : 1));

  const bar = useTransform(openness, (value) => (timer ? 1 : 1 - smooth(value, 0, 1)));

  const offset = useTransform(progress, (value) => 1 - value);

  const fade = {
    duration: reduced ? 0 : 0.16,
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <svg
      className={styles.markSvg}
      width='36'
      height='36'
      viewBox='0 0 36 36'
      fill='none'
      aria-hidden='true'
    >
      <circle
        cx='18'
        cy='18'
        r='15'
        stroke='currentColor'
        strokeWidth='1.5'
        className={styles.markCircle}
      />

      <motion.g style={{ opacity: plus }}>
        <path
          d='M11 18h14'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />

        <motion.path
          d='M18 11v14'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          style={{ opacity: bar }}
        />
      </motion.g>

      {timer && (
        <motion.g style={{ opacity: ring }}>
          <motion.circle
            cx='18'
            cy='18'
            r='15'
            pathLength='1'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeDasharray='1'
            transform='rotate(-90 18 18)'
            style={{ strokeDashoffset: offset }}
          />

          <motion.path
            initial={false}
            animate={{ opacity: +paused }}
            transition={fade}
            d='M15 12.5 23 18l-8 5.5z'
            fill='currentColor'
          />

          <motion.path
            initial={false}
            animate={{ opacity: +!paused }}
            transition={fade}
            d='M15.5 14v8M20.5 14v8'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </motion.g>
      )}
    </svg>
  );
}
