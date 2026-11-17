/*
  src/demos/sort-01/Demo.jsx
  Kilnhouse — Animated Sort Menu
*/

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import styles from "./Demo.module.css";

gsap.registerPlugin(Flip);

/* ---------- Product data ---------- */

const PRODUCTS = [
  {
    id: "mug",
    name: "Everyday Stoneware Mug",
    category: "Drinkware",
    image: "mug.jpg",
    price: 28,
    rate: 4.9,
    added: new Date("2026-11-16T10:00:00Z").getTime(),
    isNew: true,
  },
  {
    id: "bowl",
    name: "Organic Ceramic Bowl",
    category: "Tableware",
    image: "bowl.jpg",
    price: 34,
    rate: 4.8,
    added: new Date("2026-11-14T10:00:00Z").getTime(),
    isNew: true,
  },
  {
    id: "vase",
    name: "Sculpted Stoneware Vase",
    category: "Home decor",
    image: "vase.jpg",
    price: 68,
    rate: 4.9,
    added: new Date("2026-11-12T10:00:00Z").getTime(),
  },
  {
    id: "plate",
    name: "Minimal Ceramic Plate",
    category: "Tableware",
    image: "plate.jpg",
    price: 24,
    rate: 4.7,
    added: new Date("2026-11-10T10:00:00Z").getTime(),
  },
  {
    id: "jug",
    name: "Handcrafted Pouring Jug",
    category: "Serveware",
    image: "jug.jpg",
    price: 52,
    rate: 4.8,
    added: new Date("2026-11-08T10:00:00Z").getTime(),
  },
  {
    id: "tumbler",
    name: "Textured Ceramic Tumbler",
    category: "Drinkware",
    image: "tumbler.jpg",
    price: 22,
    rate: 4.6,
    added: new Date("2026-11-05T10:00:00Z").getTime(),
  },
];

/* ---------- Sort options ---------- */

const ORDERS = [
  {
    key: "new",
    label: "Newest",
    short: "Newest",
    description: "newest first",
    compare: (a, b) => b.added - a.added,
    icon: "new",
  },
  {
    key: "low",
    label: "Price: low to high",
    short: "Price, low",
    description: "lowest price first",
    compare: (a, b) => a.price - b.price,
    icon: "low",
  },
  {
    key: "high",
    label: "Price: high to low",
    short: "Price, high",
    description: "highest price first",
    compare: (a, b) => b.price - a.price,
    icon: "high",
  },
  {
    key: "rate",
    label: "Best rated",
    short: "Top rated",
    description: "best rated first",
    compare: (a, b) => b.rate - a.rate,
    icon: "rate",
  },
];

const FLIP_TIME = 0.7;
const STAGGER = 0.035;
const MENU_SPRING = 1.35;

/* ---------- Helpers ---------- */

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

/* ---------- Sort icons ---------- */

function SortIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "new") {
    return (
      <svg
        viewBox='0 0 20 20'
        {...common}
      >
        <path d='M4 6.5H16M4 10H13M4 13.5H10' />
      </svg>
    );
  }

  if (type === "low") {
    return (
      <svg
        viewBox='0 0 20 20'
        {...common}
      >
        <path d='M6 4V16M3.5 13.5L6 16L8.5 13.5' />
        <path d='M11 6H16M11 10H14M11 14H12.5' />
      </svg>
    );
  }

  if (type === "high") {
    return (
      <svg
        viewBox='0 0 20 20'
        {...common}
      >
        <path d='M6 16V4M3.5 6.5L6 4L8.5 6.5' />
        <path d='M11 6H12.5M11 10H14M11 14H16' />
      </svg>
    );
  }

  return (
    <svg
      viewBox='0 0 20 20'
      {...common}
    >
      <path d='M10 2.8L12.2 7.3L17.2 8L13.6 11.5L14.5 16.5L10 14.1L5.5 16.5L6.4 11.5L2.8 8L7.8 7.3L10 2.8Z' />
    </svg>
  );
}

/* ---------- Check icon ---------- */

function CheckIcon() {
  return (
    <svg
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M3.5 8.2L6.5 11L12.5 5'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/* ---------- Brand mark ---------- */

function BrandMark() {
  return (
    <div
      className={styles.mark}
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 40 40'
        fill='none'
      >
        <path
          d='M8 13.5C8 10.46 10.46 8 13.5 8H26.5C29.54 8 32 10.46 32 13.5V26.5C32 29.54 29.54 32 26.5 32H13.5C10.46 32 8 29.54 8 26.5V13.5Z'
          stroke='currentColor'
          strokeWidth='1.5'
        />
        <path
          d='M13 24.5C16.5 21.5 23.5 21.5 27 24.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
        <path
          d='M15 17.5C15 15.57 17.24 14 20 14C22.76 14 25 15.57 25 17.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
}

/* =========================================================
   Demo component
   ========================================================= */

export default function Sort01() {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const menuListRef = useRef(null);
  const highlightRef = useRef(null);
  const pillRef = useRef(null);
  const pillValueRef = useRef(null);
  const chevRef = useRef(null);
  const countRef = useRef(null);

  const optionRefs = useRef([]);
  const tileRefs = useRef([]);
  const pendingFlipRef = useRef(null);
  const previousProductsRef = useRef(null);
  const isOpenRef = useRef(false);

  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [sortedProducts, setSortedProducts] = useState(PRODUCTS);

  const currentOrder = ORDERS[current];

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Highlight positioning ---------- */

  const moveHighlight = (index, instant = false) => {
    const option = optionRefs.current[index];
    const highlight = highlightRef.current;

    if (!option || !highlight) return;

    const y = option.offsetTop;

    gsap.killTweensOf(highlight);

    if (instant || reducedMotion || gsap.getProperty(highlight, "opacity") < 0.05) {
      gsap.set(highlight, { y });

      gsap.to(highlight, {
        opacity: 1,
        duration: reducedMotion ? 0 : 0.16,
      });
    } else {
      gsap.to(highlight, {
        y,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.5)",
      });
    }
  };

  /* ---------- Open dropdown ---------- */

  const openMenu = (focusOption = false) => {
    if (isOpenRef.current) return;

    isOpenRef.current = true;
    setIsOpen(true);

    const menu = menuRef.current;
    const chev = chevRef.current;

    if (!menu) return;

    gsap.killTweensOf(menu);

    gsap.set(menu, {
      visibility: "visible",
      pointerEvents: "auto",
    });

    moveHighlight(current, true);

    if (reducedMotion) {
      gsap.to(menu, {
        opacity: 1,
        duration: 0.18,
      });
    } else {
      gsap.fromTo(
        menu,
        {
          opacity: 0,
          scale: 0.92,
          y: -8,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.42,
          ease: `back.out(${MENU_SPRING})`,
        },
      );

      gsap.fromTo(
        optionRefs.current,
        {
          opacity: 0,
          y: -4,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.03,
          delay: 0.05,
          ease: "power2.out",
        },
      );

      gsap.to(chev, {
        rotation: 180,
        duration: 0.4,
        ease: "back.out(2)",
      });
    }

    if (focusOption) {
      optionRefs.current[current]?.focus({
        preventScroll: true,
      });
    }
  };

  /* ---------- Close dropdown ---------- */

  const closeMenu = (returnFocus = false) => {
    if (!isOpenRef.current) return;

    isOpenRef.current = false;
    setIsOpen(false);

    const menu = menuRef.current;
    const chev = chevRef.current;

    if (!menu) return;

    gsap.killTweensOf(menu);

    const finishClose = () => {
      gsap.set(menu, {
        visibility: "hidden",
        pointerEvents: "none",
      });
    };

    if (reducedMotion) {
      gsap.to(menu, {
        opacity: 0,
        duration: 0.14,
        onComplete: finishClose,
      });
    } else {
      gsap.to(menu, {
        opacity: 0,
        scale: 0.96,
        y: -5,
        duration: 0.2,
        ease: "power2.in",
        onComplete: finishClose,
      });

      gsap.to(chev, {
        rotation: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    }

    if (returnFocus) {
      pillRef.current?.focus({
        preventScroll: true,
      });
    }
  };

  /* ---------- Choose sorting option ---------- */

  const choose = (index) => {
    if (index < 0 || index >= ORDERS.length) return;

    const changed = current !== index;

    setCurrent(index);
    closeMenu();

    if (!changed) return;

    const sorted = [...PRODUCTS].sort(ORDERS[index].compare);

    if (!reducedMotion) {
      const tiles = tileRefs.current.filter(Boolean);

      pendingFlipRef.current = Flip.getState(tiles);
    }

    setSortedProducts(sorted);
  };

  /* ---------- Update pill and count ---------- */

  useLayoutEffect(() => {
    const pillValue = pillValueRef.current;
    const count = countRef.current;

    if (pillValue) {
      if (reducedMotion) {
        pillValue.textContent = currentOrder.short;
      } else {
        gsap.killTweensOf(pillValue);

        gsap.to(pillValue, {
          opacity: 0,
          y: -5,
          duration: 0.12,
          ease: "power1.in",
          onComplete: () => {
            if (!pillValue.isConnected) return;

            pillValue.textContent = currentOrder.short;

            gsap.fromTo(
              pillValue,
              {
                opacity: 0,
                y: 5,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.22,
                ease: "power2.out",
              },
            );
          },
        });
      }
    }

    if (count) {
      count.textContent = `${PRODUCTS.length} pieces - ${currentOrder.description}`;
    }

    optionRefs.current.forEach((option, index) => {
      if (!option) return;

      option.setAttribute("aria-selected", index === current ? "true" : "false");
    });

    if (isOpenRef.current) {
      moveHighlight(current, true);
    }
  }, [current]);

  /* ---------- Flip transition after React update ---------- */

  useLayoutEffect(() => {
    const previous = previousProductsRef.current;

    if (!previous) {
      previousProductsRef.current = sortedProducts;
      return;
    }

    const flipState = pendingFlipRef.current;
    pendingFlipRef.current = null;

    if (flipState && !reducedMotion) {
      Flip.from(flipState, {
        duration: FLIP_TIME,
        ease: "power3.inOut",
        stagger: STAGGER,
      });
    }

    previousProductsRef.current = sortedProducts;
  }, [sortedProducts]);

  /* ---------- Initial animations and cleanup ---------- */

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(menuRef.current, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      gsap.set(highlightRef.current, {
        opacity: 0,
        y: 0,
      });

      if (!reducedMotion) {
        gsap.fromTo(
          tileRefs.current.filter(Boolean),
          {
            opacity: 0,
            y: 14,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.07,
            ease: "power3.out",
            delay: 0.12,
          },
        );
      }
    }, root);

    const handleOutsideClick = (event) => {
      if (isOpenRef.current && !event.target.closest(`.${styles.sort}`)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpenRef.current) {
        closeMenu(true);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);

      ctx.revert();

      gsap.killTweensOf([menuRef.current, highlightRef.current, chevRef.current, pillValueRef.current]);

      gsap.killTweensOf(tileRefs.current.filter(Boolean));

      Flip.killFlipsOf(tileRefs.current.filter(Boolean));

      isOpenRef.current = false;
      pendingFlipRef.current = null;
    };
  }, []);

  /* ---------- Keyboard navigation ---------- */

  const handleOptionKeyDown = (event, index) => {
    let next = index;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      next = (index + 1) % ORDERS.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      next = (index - 1 + ORDERS.length) % ORDERS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      next = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      next = ORDERS.length - 1;
    } else {
      return;
    }

    optionRefs.current[next]?.focus({
      preventScroll: true,
    });
  };

  /* ---------- Render ---------- */

  return (
    <div
      className={styles.stage}
      ref={rootRef}
    >
      <section
        className={styles.card}
        aria-label='Kilnhouse shop catalogue'
      >
        {/* Header */}

        <header className={styles.head}>
          <div className={styles.head__brand}>
            <BrandMark />

            <div className={styles.head__text}>
              <h1 className={styles.head__name}>Kilnhouse</h1>

              <span
                className={styles.head__count}
                ref={countRef}
              >
                6 pieces - newest first
              </span>
            </div>
          </div>

          {/* Sort control */}

          <div className={styles.head__bottom}>
            <div className={styles.sort}>
              <button
                ref={pillRef}
                className={styles.pill}
                type='button'
                aria-haspopup='listbox'
                aria-expanded={isOpen}
                aria-controls='sort-menu'
                onClick={() => {
                  if (isOpenRef.current) {
                    closeMenu();
                  } else {
                    openMenu();
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMenu(true);
                  }
                }}
              >
                <span className={styles.pill__key}>Sort by</span>

                <span className={styles.pill__win}>
                  <span
                    className={styles.pill__val}
                    ref={pillValueRef}
                  >
                    Newest
                  </span>
                </span>

                <span
                  className={styles.pill__chev}
                  ref={chevRef}
                  aria-hidden='true'
                >
                  <svg
                    viewBox='0 0 16 16'
                    fill='none'
                  >
                    <path
                      d='M4 6L8 10L12 6'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
              </button>

              {/* Dropdown */}

              <div
                className={styles.menu}
                id='sort-menu'
                ref={menuRef}
                aria-hidden={!isOpen}
              >
                <div className={styles.menu__title}>Sort catalogue</div>

                <div
                  className={styles.menu__list}
                  ref={menuListRef}
                  role='listbox'
                  aria-label='Sort products'
                  tabIndex='-1'
                >
                  <div
                    className={styles.menu__hl}
                    ref={highlightRef}
                    aria-hidden='true'
                  />

                  {ORDERS.map((order, index) => (
                    <button
                      key={order.key}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      className={styles.opt}
                      type='button'
                      role='option'
                      aria-selected={index === current}
                      onPointerEnter={() => {
                        moveHighlight(index);
                      }}
                      onFocus={() => {
                        moveHighlight(index);
                      }}
                      onKeyDown={(event) => {
                        handleOptionKeyDown(event, index);
                      }}
                      onClick={() => {
                        choose(index);
                      }}
                    >
                      <span
                        className={styles.opt__icon}
                        aria-hidden='true'
                      >
                        <SortIcon type={order.icon} />
                      </span>

                      <span className={styles.opt__label}>{order.label}</span>

                      <span
                        className={styles.opt__check}
                        aria-hidden='true'
                      >
                        {index === current && <CheckIcon />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Product catalogue */}

        <div
          className={styles.grid}
          aria-label='Products'
          aria-live='polite'
        >
          {sortedProducts.map((product, index) => (
            <article
              key={product.id}
              className={styles.tile}
              ref={(element) => {
                tileRefs.current[index] = element;
              }}
            >
              <div className={styles.tile__media}>
                <img
                  className={styles.tile__image}
                  src={`/demos/sort-01/${product.image}`}
                  alt={product.name}
                  loading={index < 3 ? "eager" : "lazy"}
                  draggable='false'
                />

                {product.isNew && <span className={styles.tile__badge}>NEW</span>}
              </div>

              <div className={styles.tile__meta}>
                <div className={styles.tile__top}>
                  <h2 className={styles.tile__name}>{product.name}</h2>

                  <span className={styles.tile__price}>{formatPrice(product.price)}</span>
                </div>

                <div className={styles.tile__bottom}>
                  <span className={styles.tile__category}>{product.category}</span>

                  <span className={styles.tile__rating}>
                    <span
                      className={styles.tile__star}
                      aria-hidden='true'
                    >
                      ★
                    </span>
                    {product.rate.toFixed(1)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
