/* src/demos/add-to-cart-01/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Demo.module.css";

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const MAX = 9;
    const MORPH = 0.55;
    const ROLL = 0.4;
    const SPRING = 2;

    const pill = root.querySelector("[data-pill]");
    const add = root.querySelector("[data-add]");
    const addLabel = root.querySelector("[data-add-label]");
    const bag = root.querySelector("[data-bag]");
    const stepper = root.querySelector("[data-stepper]");
    const minus = root.querySelector("[data-minus]");
    const plus = root.querySelector("[data-plus]");
    const dash = root.querySelector("[data-dash]");
    const bin = root.querySelector("[data-bin]");
    const countEl = root.querySelector("[data-count]");
    const pop = root.querySelector("[data-pop]");
    const said = root.querySelector("[data-said]");

    let state = "add";
    let n = 0;
    let shown = "1";
    let busy = null;
    let keys = false;

    const ctx = gsap.context(() => {
      // Pill width
      function fit() {
        if (busy) return;

        pill.style.width = `${state === "add" ? add.offsetWidth : stepper.offsetWidth}px`;
      }

      const observer = new ResizeObserver(fit);
      observer.observe(add);
      observer.observe(stepper);

      // Quantity number
      function slots(value) {
        countEl.replaceChildren(
          ...[...value].map((character) => {
            const slot = document.createElement("span");
            slot.className = styles.slot;

            const figure = document.createElement("span");
            figure.textContent = character;

            slot.appendChild(figure);
            return slot;
          }),
        );

        shown = value;
      }

      function roll(direction) {
        const value = String(n);

        if (REDUCED) {
          slots(value);
          return;
        }

        if (value.length !== shown.length) {
          gsap
            .timeline()
            .to(countEl, {
              yPercent: -70 * direction,
              opacity: 0,
              duration: ROLL * 0.35,
              ease: "power2.in",
              onComplete: () => slots(value),
            })
            .fromTo(
              countEl,
              {
                yPercent: 70 * direction,
                opacity: 0,
              },
              {
                yPercent: 0,
                opacity: 1,
                duration: ROLL * 0.65,
                ease: "power3.out",
                immediateRender: false,
              },
            );

          return;
        }

        [...value].forEach((character, index) => {
          if (character === shown[index]) return;

          const slot = countEl.children[index];

          [...slot.children].slice(0, -1).forEach((element) => {
            gsap.killTweensOf(element);
            element.remove();
          });

          const old = slot.lastElementChild;
          gsap.killTweensOf(old);

          const fresh = document.createElement("span");
          fresh.textContent = character;
          slot.appendChild(fresh);

          gsap.fromTo(
            old,
            { yPercent: 0, y: 0 },
            {
              yPercent: -100 * direction,
              y: -6 * direction,
              duration: ROLL,
              ease: "back.out(1.6)",
              onComplete: () => old.remove(),
            },
          );

          gsap.fromTo(
            fresh,
            {
              yPercent: 100 * direction,
              y: 6 * direction,
            },
            {
              yPercent: 0,
              y: 0,
              duration: ROLL,
              ease: "back.out(1.6)",
            },
          );
        });

        shown = value;
      }

      // Small animations
      function rise(text) {
        if (REDUCED) return;

        pop.textContent = text;

        gsap
          .timeline()
          .fromTo(
            pop,
            { y: 8, opacity: 0 },
            {
              y: -18,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
              overwrite: true,
            },
          )
          .to(pop, {
            y: -38,
            opacity: 0,
            duration: 0.45,
            ease: "power1.in",
          });
      }

      function knock(element) {
        if (REDUCED) return;

        gsap.fromTo(
          element,
          { scale: 0.84 },
          {
            scale: 1,
            duration: 0.55,
            ease: "elastic.out(1, 0.45)",
            overwrite: "auto",
          },
        );
      }

      function shake(element) {
        if (REDUCED) return;

        gsap.fromTo(
          element,
          { x: 0 },
          {
            keyframes: {
              x: [-5, 5, -3, 3, 0],
            },
            duration: 0.35,
            ease: "none",
            overwrite: "auto",
          },
        );
      }

      // Minus and trash icon
      function setBin(on, animate = true) {
        minus.setAttribute("aria-label", on ? "Remove from cart" : "Remove one");

        const show = on ? bin : dash;
        const hide = on ? dash : bin;

        if (!animate || REDUCED) {
          gsap.set(show, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            transformOrigin: "50% 50%",
          });

          gsap.set(hide, { opacity: 0 });
          return;
        }

        gsap.to(hide, {
          opacity: 0,
          scale: 0.5,
          rotation: on ? 90 : -90,
          duration: 0.2,
          ease: "power2.in",
          transformOrigin: "50% 50%",
          overwrite: true,
        });

        gsap.fromTo(
          show,
          {
            opacity: 0,
            scale: 0.5,
            rotation: on ? -90 : 90,
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: "back.out(2.5)",
            delay: 0.12,
            transformOrigin: "50% 50%",
            overwrite: true,
          },
        );
      }

      // Add button to counter
      function toCounter() {
        if (state !== "add" || busy) return;

        state = "qty";
        n = 1;

        slots("1");
        setBin(true, false);
        plus.removeAttribute("aria-disabled");

        stepper.style.visibility = "visible";
        said.textContent = "Added to cart, 1.";

        const addWidth = add.offsetWidth;
        const stepperWidth = stepper.offsetWidth;

        const end = () => {
          busy = null;
          add.style.visibility = "hidden";

          if (keys) plus.focus();
        };

        if (REDUCED) {
          pill.style.width = `${stepperWidth}px`;
          end();
          return;
        }

        gsap.set([minus, countEl, plus], { opacity: 0 });

        busy = gsap
          .timeline({ onComplete: end })
          .to(
            bag,
            {
              y: -9,
              rotation: -14,
              duration: 0.14,
              ease: "power2.out",
            },
            0,
          )
          .to(
            bag,
            {
              y: -46,
              rotation: 10,
              opacity: 0,
              duration: 0.3,
              ease: "power2.in",
            },
            0.14,
          )
          .to(
            addLabel,
            {
              yPercent: -150,
              opacity: 0,
              duration: 0.28,
              ease: "power2.in",
            },
            0.1,
          )
          .fromTo(
            pill,
            { width: addWidth },
            {
              width: stepperWidth,
              duration: MORPH,
              ease: "back.out(1.4)",
            },
            0.18,
          )
          .to(
            pill,
            {
              keyframes: { scaleY: [0.9, 1.04, 1] },
              duration: 0.6,
              ease: "power2.out",
            },
            0.18,
          )
          .fromTo(
            minus,
            { scale: 0.3, opacity: 0, x: 18 },
            {
              scale: 1,
              opacity: 1,
              x: 0,
              duration: 0.5,
              ease: `back.out(${SPRING})`,
            },
            0.32,
          )
          .fromTo(
            plus,
            { scale: 0.3, opacity: 0, x: -18 },
            {
              scale: 1,
              opacity: 1,
              x: 0,
              duration: 0.5,
              ease: `back.out(${SPRING})`,
            },
            0.37,
          )
          .fromTo(
            countEl,
            { scale: 0.3, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: `back.out(${SPRING + 0.5})`,
            },
            0.42,
          )
          .add(() => rise("+1"), 0.42);
      }

      // Counter to add button
      function toButton() {
        if (state !== "qty" || busy) return;

        state = "add";
        n = 0;

        said.textContent = "Removed from cart.";
        add.style.visibility = "visible";

        const addWidth = add.offsetWidth;
        const stepperWidth = stepper.offsetWidth;

        const end = () => {
          busy = null;
          stepper.style.visibility = "hidden";

          if (keys) add.focus();
        };

        if (REDUCED) {
          pill.style.width = `${addWidth}px`;
          end();
          return;
        }

        busy = gsap
          .timeline({ onComplete: end })
          .to(
            [minus, countEl, plus],
            {
              scale: 0.3,
              opacity: 0,
              duration: 0.22,
              ease: "power2.in",
              stagger: 0.03,
            },
            0,
          )
          .fromTo(
            pill,
            { width: stepperWidth },
            {
              width: addWidth,
              duration: MORPH,
              ease: "back.out(1.4)",
            },
            0.1,
          )
          .to(
            pill,
            {
              keyframes: { scaleY: [0.92, 1.03, 1] },
              duration: 0.6,
              ease: "power2.out",
            },
            0.1,
          )
          .fromTo(
            bag,
            { y: -30, rotation: 0, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: "back.out(2)",
            },
            0.24,
          )
          .fromTo(
            addLabel,
            { yPercent: -150, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.45,
              ease: "back.out(1.8)",
            },
            0.3,
          );
      }

      // Increase quantity
      function more() {
        if (state !== "qty" || busy) return;

        if (n >= MAX) {
          shake(plus);
          return;
        }

        n += 1;

        roll(1);
        rise("+1");
        knock(plus);

        if (n === 2) setBin(false);

        if (n >= MAX) {
          plus.setAttribute("aria-disabled", "true");
        }

        said.textContent = String(n);
      }

      // Decrease quantity
      function less() {
        if (state !== "qty" || busy) return;

        if (n <= 1) {
          knock(minus);
          toButton();
          return;
        }

        n -= 1;

        roll(-1);
        knock(minus);

        if (n === 1) setBin(true);

        plus.removeAttribute("aria-disabled");
        said.textContent = String(n);
      }

      // Events
      add.addEventListener("click", toCounter);
      plus.addEventListener("click", more);
      minus.addEventListener("click", less);

      const handlePointerDown = () => {
        keys = false;
      };

      const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          keys = true;
        }
      };

      root.addEventListener("pointerdown", handlePointerDown);
      root.addEventListener("keydown", handleKeyDown);

      // Initial state
      slots("1");
      fit();

      document.fonts?.ready.then(fit);

      if (!REDUCED) {
        gsap.from(pill, {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
        });

        gsap.to(bag, {
          keyframes: {
            y: [-7, 0],
            rotation: [-10, 0],
          },
          duration: 0.5,
          ease: "power2.out",
          delay: 0.8,
        });
      }

      return () => {
        observer.disconnect();

        add.removeEventListener("click", toCounter);
        plus.removeEventListener("click", more);
        minus.removeEventListener("click", less);

        root.removeEventListener("pointerdown", handlePointerDown);
        root.removeEventListener("keydown", handleKeyDown);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main
      className={styles.stage}
      ref={rootRef}
    >
      <div className={styles.cart}>
        <div
          className={styles.cartPill}
          data-pill
        >
          <button
            className={styles.cartAdd}
            type='button'
            data-add
          >
            <svg
              className={styles.cartBag}
              viewBox='0 0 24 24'
              aria-hidden='true'
              data-bag
            >
              <path d='M5.5 8.5h13l-1 11.5h-11zM9 8.5V7a3 3 0 0 1 6 0v1.5' />
            </svg>

            <span data-add-label>Add to cart</span>
          </button>

          <div
            className={styles.cartStepper}
            role='group'
            aria-label='Quantity'
            data-stepper
          >
            <button
              className={styles.cartMinus}
              type='button'
              aria-label='Remove from cart'
              data-minus
            >
              <svg
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  className={styles.cartDash}
                  data-dash
                  d='M6.5 12h11'
                />
                <path
                  className={styles.cartBin}
                  data-bin
                  d='M6 8h12M10 8V6.5h4V8M7.5 8l.8 10.5h7.4L16.5 8M10.5 11.5v4M13.5 11.5v4'
                />
              </svg>
            </button>

            <span
              className={styles.cartCount}
              data-count
            />

            <button
              className={styles.cartPlus}
              type='button'
              aria-label='Add one more'
              data-plus
            >
              <svg
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path d='M12 6v12M6 12h12' />
              </svg>
            </button>
          </div>
        </div>

        <span
          className={styles.cartPop}
          aria-hidden='true'
          data-pop
        >
          +1
        </span>

        <p
          className={styles.sr}
          role='status'
          aria-live='polite'
          data-said
        />
      </div>
    </main>
  );
}
