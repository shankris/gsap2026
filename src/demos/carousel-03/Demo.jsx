/* src/demos/carousel-03/Demo.jsx */

"use client";

import { Children, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Demo.module.css";

gsap.registerPlugin(useGSAP);

const MAX_GROW = 12;
const MIN_GROW = 0.35;
const DECAY = 0.55;
const MAX_CLIP_Y = 22;
const SIGMA = 0.3;
const SAMPLES = 15;
const RADIUS = 15;

export const DEFAULT_IMAGES = [1011, 1025, 1005, 1015, 1043, 1050, 1062, 1074, 1084, 110, 119, 122, 133, 137, 145, 152, 160, 169, 177, 183].map((id, index) => ({
  src: `/demos/carousel-03/image-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Portrait ${String(index + 1).padStart(2, "0")}`,
}));

export function HoverExpandGallery({ children, images = DEFAULT_IMAGES, title = "Selected Work", className = "" }) {
  const rowRef = useRef(null);
  const itemRefs = useRef([]);
  const clipRefs = useRef([]);

  const items = Children.count(children)
    ? Children.toArray(children)
    : images.map((img) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={800}
          height={800}
          decoding='async'
          draggable='false'
        />
      ));

  const count = items.length;

  useGSAP(
    () => {
      const row = rowRef.current;
      const strips = itemRefs.current.slice(0, count);

      if (!row || !strips.length) return;

      const growSetters = strips.map((element) =>
        gsap.quickTo(element, "flexGrow", {
          duration: 0.45,
          ease: "power3.out",
        }),
      );

      const sizes = strips.map(() => ({
        left: 0,
        w: 0,
        h: 0,
      }));

      const measure = () => {
        strips.forEach((element, index) => {
          const bounds = element.getBoundingClientRect();

          sizes[index].left = bounds.left;
          sizes[index].w = bounds.width;
          sizes[index].h = bounds.height;
        });
      };

      measure();

      const format = (number) => number.toFixed(1);

      const clips = strips.map((_, index) => {
        const clip = clipRefs.current[index];
        const depths = new Array(SAMPLES + 1).fill(0);

        const apply = () => {
          const { w, h } = sizes[index];

          if (!w || !h || !clip) return;

          const radius = Math.min(RADIUS, w / 2 - 0.5);

          const yAt = (px) => {
            const u = gsap.utils.clamp(0, SAMPLES, (px / w) * SAMPLES);

            const j = Math.min(Math.floor(u), SAMPLES - 1);

            const t = u - j;

            return ((depths[j] * (1 - t) + depths[j + 1] * t) / 100) * h;
          };

          const points = [
            {
              x: radius,
              y: yAt(radius),
            },
          ];

          for (let j = 1; j < SAMPLES; j++) {
            const px = (j / SAMPLES) * w;

            if (px > radius && px < w - radius) {
              points.push({
                x: px,
                y: yAt(px),
              });
            }
          }

          points.push({
            x: w - radius,
            y: yAt(w - radius),
          });

          const smooth = (list, mapY) => {
            let segment = "";

            for (let k = 1; k < list.length - 1; k++) {
              const mx = (list[k].x + list[k + 1].x) / 2;

              const yv = (list[k].y + list[k + 1].y) / 2;

              segment += ` Q ${format(list[k].x)} ${format(mapY(list[k].y))}` + ` ${format(mx)} ${format(mapY(yv))}`;
            }

            const last = list[list.length - 1];

            return segment + ` L ${format(last.x)} ${format(mapY(last.y))}`;
          };

          const bottom = (y) => h - y;
          const reversed = [...points].reverse();

          const topLeft = points[0];
          const topRight = points[points.length - 1];

          let path = `M 0 ${format(topLeft.y + radius)}` + ` Q 0 ${format(topLeft.y)}` + ` ${format(topLeft.x)} ${format(topLeft.y)}`;

          path += smooth(points, (y) => y);

          path += ` Q ${w} ${format(topRight.y)}` + ` ${w} ${format(topRight.y + radius)}`;

          path += ` L ${w} ${format(bottom(topRight.y) - radius)}` + ` Q ${w} ${format(bottom(topRight.y))}` + ` ${format(topRight.x)} ${format(bottom(topRight.y))}`;

          path += smooth(reversed, bottom);

          path += ` Q 0 ${format(bottom(topLeft.y))}` + ` 0 ${format(bottom(topLeft.y) - radius)} Z`;

          clip.style.clipPath = `path("${path}")`;
        };

        apply();

        const setters = depths.map((_, index) =>
          gsap.quickTo(depths, String(index), {
            duration: 0.45,
            ease: "power3.out",
            onUpdate: apply,
          }),
        );

        return {
          setters,
          apply,
        };
      });

      const clipAt = (x, cursorX, sigma) => MAX_CLIP_Y * (1 - Math.exp(-((x - cursorX) ** 2) / (2 * sigma * sigma)));

      let lastX = null;

      const update = (clientX) => {
        const bounds = row.getBoundingClientRect();

        const sigma = bounds.width * SIGMA;

        const ratio = gsap.utils.clamp(0, 0.9999, (clientX - bounds.left) / bounds.width);

        const active = Math.floor(ratio * strips.length);

        strips.forEach((_, index) => {
          const t = Math.pow(DECAY, Math.abs(index - active));

          growSetters[index](MIN_GROW + (MAX_GROW - MIN_GROW) * t);

          clips[index].setters.forEach((set, sampleIndex) => {
            const px = sizes[index].left + (sampleIndex / SAMPLES) * sizes[index].w;

            set(clipAt(px, clientX, sigma));
          });
        });
      };

      const onMove = (event) => {
        lastX = event.clientX;
        update(lastX);
      };

      const onLeave = () => {
        lastX = null;

        growSetters.forEach((set) => set(MIN_GROW));

        clips.forEach((clip) => clip.setters.forEach((set) => set(0)));
      };

      const tick = () => {
        measure();

        if (lastX !== null) {
          update(lastX);
        }

        clips.forEach((clip) => clip.apply());
      };

      row.addEventListener("mousemove", onMove);
      row.addEventListener("mouseleave", onLeave);

      window.addEventListener("resize", measure);

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);

        row.removeEventListener("mousemove", onMove);
        row.removeEventListener("mouseleave", onLeave);

        window.removeEventListener("resize", measure);
      };
    },
    {
      scope: rowRef,
      dependencies: [count],
    },
  );

  return (
    <section className={`${styles.section} ${className}`}>
      <h1 className={styles.heading}>{title}</h1>

      <div
        ref={rowRef}
        className={styles.row}
      >
        {items.map((node, index) => (
          <figure
            key={index}
            ref={(element) => {
              if (element) {
                itemRefs.current[index] = element;
              }
            }}
            className={styles.item}
          >
            <div
              ref={(element) => {
                if (element) {
                  clipRefs.current[index] = element;
                }
              }}
              className={styles.clip}
            >
              {node}
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function Carousel03() {
  return <HoverExpandGallery />;
}
