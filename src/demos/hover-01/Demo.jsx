"use client";

// src/demos/hover-01/Demo.jsx

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const image = (filename) => `/demos/hover-01/${filename}`;

const DEFAULT_SERVICES = [
  {
    name: "Strategy",
    image: image("01.jpg"),
    alt: "Team planning strategy on a whiteboard with sticky notes",
    desc: "We work closely with our clients to uncover what truly defines their brand. Through shared exploration, we find the idea that guides how it speaks and acts.",
    link: "#strategy",
  },
  {
    name: "Brand Identity",
    image: image("02.jpg"),
    alt: "Colour palettes and brand identity materials on a designer desk",
    desc: "A brand is more than a logo. We craft complete identities — voice, colour and visual language — that make a brand instantly recognisable everywhere it shows up.",
    link: "#brand-identity",
  },
  {
    name: "Design",
    image: image("03.jpg"),
    alt: "Designer sketching interface wireframes with a pen",
    desc: "From print to product, we design with intent. Every layout, typeface and detail is considered, so the work feels effortless and unmistakably on-brand.",
    link: "#design",
  },
  {
    name: "Film",
    image: image("04.jpg"),
    alt: "Film clapperboard held up before a take",
    desc: "Stories move people. We concept, direct and produce films that bring brands to life — from quick social cuts to full campaign productions.",
    link: "#film",
  },
  {
    name: "Digital",
    image: image("05.jpg"),
    alt: "Laptop showing a digital analytics dashboard",
    desc: "Websites, campaigns and experiences built to connect. We translate brand thinking into digital products that people genuinely enjoy using.",
    link: "#digital",
  },
];

export default function Hover01({ eyebrow = "( Our Services )", services = DEFAULT_SERVICES, className = "" }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);

  const [layers, setLayers] = useState(() => [{ id: 0, service: services[0] }]);

  const [descs, setDescs] = useState(() => [{ id: 0, text: services[0].desc }]);

  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const eyebrowRef = useRef(null);
  const indicatorRef = useRef(null);
  const ctaRef = useRef(null);
  const ctaArrowRef = useRef(null);

  const itemRefs = useRef([]);
  const layerRefs = useRef(new Map());
  const imgRefs = useRef(new Map());
  const descRefs = useRef(new Map());
  const splits = useRef(new Map());

  const nextId = useRef(1);
  const revealed = useRef(false);

  const moveStrip = useCallback((index, instant = false) => {
    const item = itemRefs.current[index];
    const strip = indicatorRef.current;

    if (!item || !strip) return;

    const props = {
      y: item.offsetTop,
      height: item.offsetHeight,
    };

    if (instant) {
      gsap.set(strip, props);
    } else {
      gsap.to(strip, {
        ...props,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    }
  }, []);

  // Entrance animation
  useGSAP(
    () => {
      const section = sectionRef.current;
      const firstLayer = layerRefs.current.get(0);
      const firstImg = imgRefs.current.get(0);
      const firstDesc = descRefs.current.get(0);

      if (!section || !firstLayer || !firstImg) return;

      const items = itemRefs.current.filter(Boolean);

      gsap.set(firstLayer, { clipPath: "inset(50%)" });
      gsap.set(firstImg, { scale: 1.3 });
      gsap.set(eyebrowRef.current, { autoAlpha: 0, y: 24 });
      gsap.set(items, { autoAlpha: 0, y: 64 });
      gsap.set(indicatorRef.current, { autoAlpha: 0 });

      if (firstDesc) {
        gsap.set(firstDesc, { autoAlpha: 0 });
      }

      gsap.set(ctaRef.current, {
        autoAlpha: 0,
        scale: 0.6,
      });

      moveStrip(0, true);

      const revealDesc = () => {
        if (!firstDesc) return;

        const split = new SplitText(firstDesc, {
          type: "lines",
          mask: "lines",
        });

        splits.current.set(0, split);

        gsap.set(firstDesc, { autoAlpha: 1 });
        gsap.set(split.lines, { yPercent: 110 });

        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.7,
          ease: "power3.out",
          onComplete: () => {
            split.revert();
            splits.current.delete(0);
          },
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: "top 65%",
        once: true,
        onEnter: () => {
          revealed.current = true;

          gsap
            .timeline({
              defaults: { ease: "power3.out" },
            })
            .to(
              firstLayer,
              {
                clipPath: "inset(0%)",
                duration: 1,
                ease: "power3.inOut",
              },
              0,
            )
            .to(
              firstImg,
              {
                scale: 1,
                duration: 1.8,
                ease: "power2.out",
              },
              0,
            )
            .to(
              eyebrowRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
              },
              0.2,
            )
            .to(
              items,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.09,
              },
              0.3,
            )
            .add(() => moveStrip(0, true), 0.3)
            .to(
              indicatorRef.current,
              {
                autoAlpha: 1,
                duration: 0.5,
              },
              0.9,
            )
            .add(revealDesc, 0.65)
            .to(
              ctaRef.current,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.6,
                ease: "back.out(1.6)",
              },
              0.8,
            );
        },
      });

      const reanchor = () => moveStrip(active, true);

      window.addEventListener("resize", reanchor);
      document.fonts?.ready.then(reanchor);

      return () => {
        window.removeEventListener("resize", reanchor);
      };
    },
    { scope: sectionRef },
  );

  // Preload images
  useEffect(() => {
    services.forEach((service) => {
      const img = new Image();
      img.src = service.image;
    });
  }, [services]);

  // Image reveal
  useGSAP(
    () => {
      const top = layers[layers.length - 1];

      if (!top || top.id === 0) return;

      const layer = layerRefs.current.get(top.id);
      const img = imgRefs.current.get(top.id);

      if (!layer || !img) return;

      gsap.set(layer, { clipPath: "inset(50%)" });
      gsap.set(img, { scale: 1.5 });

      gsap
        .timeline({
          onComplete: () => {
            setLayers((currentLayers) => currentLayers.filter((layerItem) => layerItem.id >= top.id));
          },
        })
        .to(
          layer,
          {
            clipPath: "inset(0%)",
            duration: 0.7,
            ease: "expoScale(0.5,7,power2.inOut)",
          },
          0,
        )
        .to(
          img,
          {
            scale: 1,
            duration: 1,
            ease: "power2.out",
          },
          0,
        );
    },
    { dependencies: [layers], scope: sectionRef },
  );

  // Description transitions
  useGSAP(
    () => {
      const incoming = descs[descs.length - 1];

      if (!incoming || incoming.id === 0) return;

      descs.slice(0, -1).forEach((old) => {
        const el = descRefs.current.get(old.id);

        if (!el) return;

        const split =
          splits.current.get(old.id) ||
          new SplitText(el, {
            type: "lines",
            mask: "lines",
          });

        splits.current.set(old.id, split);
        gsap.killTweensOf(split.lines);

        gsap.to(split.lines, {
          yPercent: -110,
          duration: 0.2,
          ease: "none",
          onComplete: () => {
            splits.current.delete(old.id);
            setDescs((currentDescs) => currentDescs.filter((desc) => desc.id !== old.id));
          },
        });
      });

      const el = descRefs.current.get(incoming.id);

      if (!el) return;

      const split = new SplitText(el, {
        type: "lines",
        mask: "lines",
      });

      splits.current.set(incoming.id, split);

      gsap.set(split.lines, { yPercent: 110 });

      gsap.to(split.lines, {
        yPercent: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.1,
        onComplete: () => {
          split.revert();
          splits.current.delete(incoming.id);
        },
      });
    },
    { dependencies: [descs], scope: sectionRef },
  );

  // Activate a service
  const activate = useCallback(
    (index) => {
      if (index === active || !services[index]) return;

      setActive(index);

      const id = nextId.current++;

      setLayers((currentLayers) => [...currentLayers, { id, service: services[index] }]);

      setDescs((currentDescs) => [...currentDescs, { id, text: services[index].desc }]);

      moveStrip(index);

      const arrow = ctaArrowRef.current;

      if (arrow) {
        gsap.killTweensOf(arrow);

        gsap
          .timeline({ defaults: { ease: "none" } })
          .to(arrow, {
            x: 46,
            y: -46,
            duration: 0.12,
          })
          .set(arrow, {
            x: -46,
            y: 46,
          })
          .to(arrow, {
            x: 0,
            y: 0,
            duration: 0.16,
          });
      }
    },
    [active, services, moveStrip],
  );

  // Track pointer position while scrolling
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    let x = -1;
    let y = -1;

    const update = () => {
      if (x < 0) return;

      const el = document.elementFromPoint(x, y);
      const row = el?.closest("[data-service-index]");

      const inside = row && section.contains(row) ? row : null;

      const index = inside ? Number(inside.dataset.serviceIndex) : null;

      setHovered(index);

      if (index !== null) {
        activate(index);
      }
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      update();
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", update);
    };
  }, [activate]);

  const current = services[active];

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${className}`}
    >
      <figure className={styles.figure}>
        {layers.map((layer) => (
          <div
            key={layer.id}
            ref={(el) => {
              if (el) {
                layerRefs.current.set(layer.id, el);
              } else {
                layerRefs.current.delete(layer.id);
              }
            }}
            className={styles.imageLayer}
          >
            <img
              ref={(el) => {
                if (el) {
                  imgRefs.current.set(layer.id, el);
                } else {
                  imgRefs.current.delete(layer.id);
                }
              }}
              src={layer.service.image}
              alt={layer.service.alt}
              className={styles.image}
            />
          </div>
        ))}
      </figure>

      <div className={styles.content}>
        <nav
          ref={listRef}
          aria-label='Our services'
          className={styles.nav}
        >
          <span
            ref={eyebrowRef}
            className={styles.eyebrow}
          >
            {eyebrow}
          </span>

          {services.map((service, index) => {
            const isActive = index === active;
            const isHovered = index === hovered;

            return (
              <a
                key={service.name}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                href={service.link}
                data-service-index={index}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  activate(index);
                }}
                className={`${styles.serviceLink} ${isActive ? styles.active : isHovered ? styles.hovered : ""}`}
              >
                <span className={`${styles.number} ${isActive ? styles.activeNumber : ""}`}>{String(index + 1).padStart(2, "0")}</span>

                {service.name}
              </a>
            );
          })}

          <span
            ref={indicatorRef}
            aria-hidden='true'
            className={styles.indicator}
          />
        </nav>

        <div className={styles.footer}>
          <div className={styles.descriptionWrap}>
            {descs.map((desc) => (
              <p
                key={desc.id}
                ref={(el) => {
                  if (el) {
                    descRefs.current.set(desc.id, el);
                  } else {
                    descRefs.current.delete(desc.id);
                  }
                }}
                className={styles.description}
              >
                {desc.text}
              </p>
            ))}
          </div>

          <a
            ref={ctaRef}
            href={current.link}
            aria-label={`View ${current.name} service`}
            className={styles.cta}
          >
            <svg
              ref={ctaArrowRef}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
              className={styles.arrow}
            >
              <path d='M7 17 17 7M9 7h8v8' />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
