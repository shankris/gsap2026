// src/demos/carousel-07-pics/Demo.jsx

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const PANEL_WIDTH_COLLAPSED = 20;
const PANEL_WIDTH_EXPANDED = 400;
const PANEL_WIDTH_EXPANDED_MOBILE = 100;
const PANEL_GAP = 5;
const PANEL_COUNT_DESKTOP = 20;
const PANEL_COUNT_MOBILE = 10;
const BREAKPOINT_MOBILE = 1000;

export default function Carousel07Pics() {
    const trackRef = useRef(null);
    const focusIndicatorRef = useRef(null);
    const panelRefs = useRef([]);
    const hasPositionedRef = useRef(false);

    const [trackWidth, setTrackWidth] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [focusedPanel, setFocusedPanel] = useState(0);

    const panelCount = isMobile ? PANEL_COUNT_MOBILE : PANEL_COUNT_DESKTOP;
    const expandedWidth = isMobile
        ? PANEL_WIDTH_EXPANDED_MOBILE
        : PANEL_WIDTH_EXPANDED;

    useEffect(() => {
        const updateLayout = () => {
            setIsMobile(window.innerWidth < BREAKPOINT_MOBILE);
        };

        updateLayout();

        const track = trackRef.current;
        const observer = new ResizeObserver(([entry]) => {
            setTrackWidth(entry.contentRect.width);
        });

        if (track) {
            observer.observe(track);
        }

        window.addEventListener("resize", updateLayout);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateLayout);
        };
    }, []);

    useEffect(() => {
        setFocusedPanel(0);
    }, [panelCount]);

    const getPanelPosition = useCallback(
        (panelIndex) => {
            const totalTrackWidth =
                (panelCount - 1) * (PANEL_WIDTH_COLLAPSED + PANEL_GAP) +
                expandedWidth;

            const offsetToCenter = (trackWidth - totalTrackWidth) / 2;
            let left = offsetToCenter;

            for (let i = 0; i < panelIndex; i += 1) {
                const width =
                    i === focusedPanel
                        ? expandedWidth
                        : PANEL_WIDTH_COLLAPSED;

                left += width + PANEL_GAP;
            }

            const width =
                panelIndex === focusedPanel
                    ? expandedWidth
                    : PANEL_WIDTH_COLLAPSED;

            return { left, width };
        },
        [expandedWidth, focusedPanel, panelCount, trackWidth],
    );

    useLayoutEffect(() => {
        if (!trackWidth || !focusIndicatorRef.current) return;

        const positions = Array.from({ length: panelCount }, (_, index) =>
            getPanelPosition(index),
        );
        const indicatorPosition = positions[focusedPanel];

        if (!hasPositionedRef.current) {
            positions.forEach((position, index) => {
                const panel = panelRefs.current[index];
                if (panel) gsap.set(panel, position);
            });

            gsap.set(focusIndicatorRef.current, indicatorPosition);
            hasPositionedRef.current = true;
            return;
        }

        positions.forEach((position, index) => {
            const panel = panelRefs.current[index];
            if (panel) {
                gsap.to(panel, {
                    ...position,
                    duration: 1,
                    ease: "power3.inOut",
                    overwrite: true,
                });
            }
        });

        gsap.to(focusIndicatorRef.current, {
            ...indicatorPosition,
            duration: 1,
            ease: "power3.inOut",
            overwrite: true,
        });
    }, [focusedPanel, getPanelPosition, panelCount, trackWidth]);

    const focusPanel = useCallback((index) => {
        setFocusedPanel(index);
    }, []);

    const handlePanelKeyDown = (event, index) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            focusPanel(index);
        }
    };

    return (
        <section className={styles.spotlight}>
            <header className={styles.spotlightHeader}>
                <p className={styles.spotlightEyebrow}>
                    A photographic collection · Est. #romantic
                </p>

                <h1 className={styles.spotlightTitle}>
                    The Art of
                    <br />
                    <em>Being in Love</em>
                </h1>

                <p className={styles.spotlightSubtitle}>
                    Portraits, memories &amp; forgotten romances
                </p>
            </header>

            <div className={styles.spotlightTrack} ref={trackRef}>
                <div className={styles.spotlightPanels}>
                    <div
                        className={styles.spotlightFocusIndicator}
                        ref={focusIndicatorRef}
                        aria-hidden="true"
                    >
                        <span
                            className={`${styles.spotlightOrnament} ${styles.spotlightOrnamentTop}`}
                        >
                            ✦
                        </span>
                        <span
                            className={`${styles.spotlightOrnament} ${styles.spotlightOrnamentBottom}`}
                        >
                            ✦
                        </span>
                    </div>

                    {Array.from({ length: panelCount }, (_, index) => (
                        <div
                            key={`${isMobile ? "mobile" : "desktop"}-${index}`}
                            ref={(element) => {
                                panelRefs.current[index] = element;
                            }}
                            className={styles.spotlightPanel}
                            onMouseEnter={
                                !isMobile
                                    ? () => focusPanel(index)
                                    : undefined
                            }
                            onClick={() => focusPanel(index)}
                            onKeyDown={(event) =>
                                handlePanelKeyDown(event, index)
                            }
                            role="button"
                            tabIndex={0}
                            aria-label={`Focus photograph ${index + 1}`}
                            aria-pressed={focusedPanel === index}
                        >
                            <img
                                src={`/demos/carousel-07-pics/${index + 1}.jpg`}
                                alt={`Romantic archival portrait ${index + 1}`}
                                draggable="false"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <footer className={styles.spotlightFooter}>
                <span>Volume I · No. 001–{panelCount}</span>
                <span className={styles.spotlightFooterCenter}>
                    Forever, in a photograph
                </span>
                <span>Private Collection · #467</span>
            </footer>
        </section>
    );
}
