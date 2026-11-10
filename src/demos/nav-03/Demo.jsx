"use client";

// src/demos/nav-03/Demo.jsx

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LayoutGrid, Layers, StickyNote } from "lucide-react";
import styles from "./Demo.module.css";

const tabs = [
  { id: "apps", label: "Apps", Icon: LayoutGrid },
  { id: "components", label: "Components", Icon: Layers },
  { id: "notes", label: "Notes", Icon: StickyNote },
];

const panels = {
  apps: [
    {
      type: "app",
      icon: "K",
      title: "Klack",
      subtitle: "Satisfying key sounds",
    },
    {
      type: "app",
      icon: "Q",
      title: "Quill",
      subtitle: "Craft pages, and docs",
      light: true,
    },
  ],
  components: [
    { type: "component", title: "Action Bar", tag: "Dynamic" },
    { type: "component", title: "Image Expand", tag: "Overlay" },
    { type: "component", title: "Read Time", tag: "Scroll" },
  ],
  notes: [
    {
      type: "app",
      icon: "N",
      title: "Meeting Notes",
      subtitle: "Roadmap and priorities",
      light: true,
    },
  ],
};

export default function Demo() {
  const [activePanel, setActivePanel] = useState(null);
  const dockRef = useRef(null);
  const pillRef = useRef(null);
  const tabRefs = useRef({});
  const panelRefs = useRef({});
  const indicatorRefs = useRef({});

  const isOpen = activePanel !== null;

  const handleTabClick = (panelId) => {
    setActivePanel((current) => (current === panelId ? null : panelId));
  };

  const closeMenu = () => {
    setActivePanel(null);
  };

  const movePill = (immediate = false) => {
    const pill = pillRef.current;
    const activeTab = activePanel ? tabRefs.current[activePanel] : null;

    if (!pill) return;

    gsap.killTweensOf(pill);

    if (!isOpen || !activeTab) {
      gsap.to(pill, {
        opacity: 0,
        "--pill-width": "0px",
        duration: immediate ? 0 : 0.25,
        ease: "power1.out",
        overwrite: true,
      });
      return;
    }

    gsap.to(pill, {
      "--pill-x": `${activeTab.offsetLeft}px`,
      "--pill-width": `${activeTab.offsetWidth}px`,
      opacity: 1,
      duration: immediate ? 0 : 0.25,
      ease: "power3.inOut",
      overwrite: true,
    });
  };

  useLayoutEffect(() => {
    movePill();
  }, [activePanel]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handlePointerDown = (event) => {
      if (isOpen && dockRef.current && !dockRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleResize = () => movePill(true);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, activePanel]);

  useEffect(() => {
    return () => {
      Object.values(indicatorRefs.current).forEach((indicator) => {
        if (indicator) gsap.killTweensOf(indicator);
      });

      if (pillRef.current) {
        gsap.killTweensOf(pillRef.current);
      }
    };
  }, []);

  const showHoverIndicator = (panelId, item) => {
    const panel = panelRefs.current[panelId];
    const indicator = indicatorRefs.current[panelId];

    if (!panel || !indicator) return;

    const shouldFadeIn = Number(gsap.getProperty(indicator, "opacity")) < 0.5;

    gsap.killTweensOf(indicator);

    gsap.to(indicator, {
      "--hover-x": `${item.offsetLeft}px`,
      "--hover-y": `${item.offsetTop}px`,
      "--hover-width": `${item.offsetWidth}px`,
      "--hover-height": `${item.offsetHeight}px`,
      opacity: 1,
      duration: shouldFadeIn ? 0.15 : 0.25,
      ease: "power3.out",
      overwrite: true,
    });
  };

  const hideHoverIndicator = (panelId) => {
    const indicator = indicatorRefs.current[panelId];

    if (!indicator) return;

    gsap.killTweensOf(indicator);

    gsap.to(indicator, {
      opacity: 0,
      duration: 0.15,
      ease: "power1.out",
      overwrite: true,
    });
  };

  return (
    <div className={styles.wrapper}>
      <aside
        className={`${styles.dock} ${isOpen ? styles.isOpen : ""}`}
        ref={dockRef}
      >
        <div className={styles.panelStack}>
          {tabs.map((tab) => {
            const isActive = activePanel === tab.id;
            const items = panels[tab.id];

            return (
              <section
                className={`${styles.panel} ${isActive ? styles.panelActive : ""}`}
                data-panel={tab.id}
                id={`panel-${tab.id}`}
                key={tab.id}
                ref={(element) => {
                  panelRefs.current[tab.id] = element;
                }}
                aria-hidden={!isActive}
                onPointerLeave={() => hideHoverIndicator(tab.id)}
                onFocusCapture={(event) => {
                  const item = event.target.closest(`.${styles.item}`);

                  if (item) showHoverIndicator(tab.id, item);
                }}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    hideHoverIndicator(tab.id);
                  }
                }}
              >
                <span
                  className={styles.hoverIndicator}
                  aria-hidden='true'
                  ref={(element) => {
                    indicatorRefs.current[tab.id] = element;
                  }}
                />

                {items.map((item) => {
                  const isComponent = item.type === "component";

                  return (
                    <article
                      className={`${styles.item} ${isComponent ? styles.componentItem : ""}`}
                      key={item.title}
                      onPointerEnter={(event) => showHoverIndicator(tab.id, event.currentTarget)}
                    >
                      {isComponent ? (
                        <>
                          <div className={styles.iconGhost}>
                            <Layers aria-hidden='true' />
                          </div>
                          <div className={styles.itemTitle}>{item.title}</div>
                          <span className={styles.tag}>{item.tag}</span>
                        </>
                      ) : (
                        <>
                          <div className={`${styles.icon} ${item.light ? styles.iconLight : ""}`}>{item.icon}</div>
                          <div>
                            <div className={styles.itemTitle}>{item.title}</div>
                            <div className={styles.subtitle}>{item.subtitle}</div>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>

        <div className={styles.divider} />

        <nav
          className={styles.nav}
          role='tablist'
          aria-label='Menu sections'
        >
          <span
            className={styles.pill}
            ref={pillRef}
            aria-hidden='true'
          />

          {tabs.map(({ id, label, Icon }) => {
            const isActive = activePanel === id;

            return (
              <button
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                type='button'
                role='tab'
                key={id}
                ref={(element) => {
                  tabRefs.current[id] = element;
                }}
                aria-selected={isActive}
                aria-controls={`panel-${id}`}
                onClick={() => handleTabClick(id)}
              >
                <Icon aria-hidden='true' />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
