/* src/demos/mis-01-radar/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SatelliteDish, TriangleAlert } from "lucide-react";
import styles from "./Demo.module.css";

const trackedTargets = [
  { id: 1, name: "UNKNOWN-01", type: "HOSTILE?" },
  { id: 2, name: "SIGNAL-02", type: "UNKNOWN" },
  { id: 3, name: "OBJECT-03", type: "UNKNOWN" },
  { id: 4, name: "SIGNAL-04", type: "UNKNOWN" },
];

const signalBars = Array.from({ length: 20 }, (_, index) => index);

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const $ = (name) => root.querySelector(`.${styles[name]}`);
    const $$ = (name) => Array.from(root.querySelectorAll(`.${styles[name]}`));

    const bootScreen = $("bootScreen");
    const bootBar = $("bootBar");
    const bootPercent = $("bootPercent");
    const bootStatus = $("bootStatus");
    const radar = $("radar");
    const targets = $$(".target");
    const targetRows = $$(".targetRow");
    const targetLock = $("targetLock");
    const clock = $("clock");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let activeTarget = 1;
    let clockInterval;
    let signalInterval;
    let animationContext;

    /* -----------------------------------------
           DIGITAL CLOCK
        ----------------------------------------- */

    function updateClock() {
      if (!clock) return;

      clock.textContent = new Date().toLocaleTimeString("en-GB", {
        hour12: false,
      });
    }

    updateClock();
    clockInterval = window.setInterval(updateClock, 1000);

    /* -----------------------------------------
           TARGET SELECTION
        ----------------------------------------- */

    function selectTarget(id) {
      activeTarget = id;

      targetRows.forEach((row) => {
        row.classList.toggle(styles.active, Number(row.dataset.target) === id);
      });

      const selected = $(`target${id}`);

      if (!selected || !radar || !targetLock) return;

      const x = selected.offsetLeft + selected.offsetWidth / 2;
      const y = selected.offsetTop + selected.offsetHeight / 2;

      gsap.to(targetLock, {
        left: `${(x / radar.clientWidth) * 100}%`,
        top: `${(y / radar.clientHeight) * 100}%`,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      });

      targetLock.classList.add(styles.isLocked);

      gsap.fromTo(
        selected,
        { scale: 1 },
        {
          scale: 1.8,
          duration: 0.25,
          repeat: 1,
          yoyo: true,
          ease: "power2.inOut",
        },
      );
    }

    /* -----------------------------------------
           SIGNAL ANIMATION
        ----------------------------------------- */

    function animateSignal() {
      const bars = $$(".signalBar");

      bars.forEach((bar) => {
        const randomHeight = gsap.utils.random(25, 100);

        gsap.to(bar, {
          scaleY: randomHeight / 100,
          transformOrigin: "bottom",
          duration: gsap.utils.random(0.2, 0.65),
          ease: "power2.out",
        });
      });
    }

    /* -----------------------------------------
           TARGET MOVEMENT
        ----------------------------------------- */

    function animateTargets() {
      targets.forEach((target, index) => {
        gsap.to(target, {
          x: gsap.utils.random(-5, 5),
          y: gsap.utils.random(-5, 5),
          duration: gsap.utils.random(1.5, 3),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });
      });
    }

    /* -----------------------------------------
           DASHBOARD INTRO
        ----------------------------------------- */

    function startDashboard() {
      if (prefersReducedMotion) {
        gsap.set([$("topbar"), $("sidebarLeft"), $("radarStage"), $("sidebarRight"), $("bottomBar"), radar, ...$$("ring"), ...targets, $("radarCenter")], {
          clearProps: "all",
        });

        selectTarget(1);
        animateSignal();
        signalInterval = window.setInterval(animateSignal, 700);
        animateTargets();
        return;
      }

      const intro = gsap.timeline({
        onComplete: () => {
          animateTargets();
          selectTarget(1);
          animateSignal();

          signalInterval = window.setInterval(animateSignal, 700);
        },
      });

      intro
        .to($("topbar"), {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          [$("sidebarLeft"), $("sidebarRight")],
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.5",
        )
        .to(
          $("bottomBar"),
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          $("radarStage"),
          {
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.65",
        )
        .to(
          radar,
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 1.3,
            ease: "back.out(1.4)",
          },
          "-=0.7",
        )
        .to(
          $$(".ring"),
          {
            scale: 1,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.75",
        )
        .to(
          $("radarCenter"),
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.7",
        )
        .to(
          targets,
          {
            scale: 1,
            opacity: 1,
            stagger: 0.15,
            duration: 0.6,
            ease: "back.out(2)",
          },
          "-=0.7",
        );
    }

    /* -----------------------------------------
           BOOT SEQUENCE
        ----------------------------------------- */

    function startSystem() {
      if (prefersReducedMotion) {
        gsap.set(bootScreen, { display: "none" });
        startDashboard();
        return;
      }

      const progress = { value: 0 };

      const bootTimeline = gsap.timeline({
        onComplete: () => {
          gsap.to(bootScreen, {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
              bootScreen.style.display = "none";
              startDashboard();
            },
          });
        },
      });

      bootTimeline
        .to(progress, {
          value: 100,
          duration: 2.7,
          ease: "power2.inOut",
          onUpdate: () => {
            const value = Math.round(progress.value);

            bootPercent.textContent = `${String(value).padStart(3, "0")}%`;

            gsap.set(bootBar, {
              width: `${value}%`,
            });

            if (value > 30) {
              bootStatus.textContent = "CALIBRATING RADAR";
            }

            if (value > 65) {
              bootStatus.textContent = "ESTABLISHING CONNECTION";
            }

            if (value > 90) {
              bootStatus.textContent = "SYSTEM ONLINE";
            }
          },
        })
        .to(
          $("bootLogo"),
          {
            scale: 1.08,
            duration: 0.4,
            yoyo: true,
            repeat: 1,
          },
          1.5,
        );
    }

    /* -----------------------------------------
           INITIAL ANIMATION STATES
        ----------------------------------------- */

    animationContext = gsap.context(() => {
      gsap.set([$("topbar"), $("sidebarLeft"), $("radarStage"), $("sidebarRight"), $("bottomBar")], {
        opacity: 0,
        y: 25,
      });

      gsap.set(radar, {
        scale: 0.75,
        rotation: -30,
        opacity: 0,
      });

      gsap.set($$(".ring"), {
        scale: 0.5,
        opacity: 0,
      });

      gsap.set(targets, {
        scale: 0,
        opacity: 0,
      });

      gsap.set($("radarCenter"), {
        scale: 0,
        opacity: 0,
      });

      startSystem();
    }, root);

    /* -----------------------------------------
           INTERACTION EVENTS
        ----------------------------------------- */

    const rowHandlers = targetRows.map((row) => {
      const handler = () => {
        selectTarget(Number(row.dataset.target));
      };

      row.addEventListener("click", handler);

      return { element: row, handler };
    });

    const targetHandlers = targets.map((target, index) => {
      target.style.cursor = "pointer";

      const handler = (event) => {
        event.stopPropagation();
        selectTarget(index + 1);
      };

      target.addEventListener("click", handler);

      return { element: target, handler };
    });

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(signalInterval);

      rowHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });

      targetHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });

      animationContext?.revert();
    };
  }, []);

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      {/* BOOT SCREEN */}
      <div className={styles.bootScreen}>
        <div className={styles.bootLogo}>
          <span className={styles.bootLogoIcon}>
            <SatelliteDish />
          </span>

          <span>
            R<span className={styles.bootLogoAccent}>//</span>479
          </span>
        </div>

        <div className={styles.bootProgress}>
          <div className={styles.bootBar} />
        </div>

        <div className={styles.bootInfo}>
          <span className={styles.bootStatus}>INITIALIZING SYSTEM</span>
          <span className={styles.bootPercent}>000%</span>
        </div>

        <div className={styles.bootLog}>ESTABLISHING SECURE CONNECTION...</div>
      </div>

      {/* BACKGROUND ENVIRONMENT */}
      <div className={styles.environment}>
        <div className={styles.environmentGrid} />
        <div className={styles.environmentGlow} />
        <div className={styles.environmentVignette} />
      </div>

      <div className={styles.noise} />
      <div className={styles.scanlines} />

      <div className={styles.bg}>
        <video
          src='/demos/mis-01-radar/bg.mp4'
          loop
          muted
          autoPlay
          playsInline
          aria-hidden='true'
        />
      </div>

      {/* MAIN DASHBOARD */}
      <main className={styles.dashboard}>
        {/* HEADER */}
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <SatelliteDish />
            </div>

            <div className={styles.brandText}>
              <strong>
                RADAR<span>//</span>479
              </strong>
              <small>TACTICAL SURVEILLANCE SYSTEM</small>
            </div>
          </div>

          <div className={styles.topbarCenter}>
            <span className={styles.liveIndicator} />
            SYSTEM ONLINE
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.topbarDate}>OPERATION 09 / 11</span>
            <span className={styles.clock}>00:00:00</span>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <section className={styles.mainLayout}>
          {/* LEFT SIDEBAR */}
          <aside className={`${styles.sidebar} ${styles.sidebarLeft}`}>
            <div className={styles.sectionLabel}>
              <span>01</span>
              MISSION CONTROL
            </div>

            <div className={styles.mission}>
              <span className={styles.missionLabel}>CURRENT OPERATION</span>

              <h1>
                DEEP
                <br />
                <span>WATCH</span>
              </h1>

              <p>Long-range surveillance and real-time signal detection.</p>

              <div className={styles.missionStatus}>
                <span className={styles.statusDot} />
                ACTIVE MONITORING
              </div>
            </div>

            <div className={styles.coordinates}>
              <span className={styles.sectionLabel}>POSITION DATA</span>

              <div className={styles.dataRow}>
                <span>LATITUDE</span>
                <strong>48°27'14"N</strong>
              </div>

              <div className={styles.dataRow}>
                <span>LONGITUDE</span>
                <strong>35°02'18"E</strong>
              </div>

              <div className={styles.dataRow}>
                <span>ALTITUDE</span>
                <strong>2,450 M</strong>
              </div>

              <div className={styles.dataRow}>
                <span>RANGE</span>
                <strong>120.0 KM</strong>
              </div>
            </div>

            <div className={styles.systemStatus}>
              <span className={styles.sectionLabel}>SYSTEM HEALTH</span>

              <div className={styles.healthItem}>
                <div className={styles.healthItemTop}>
                  <span>RADAR POWER</span>
                  <span>98%</span>
                </div>

                <div className={styles.healthBar}>
                  <span className={styles.healthPower} />
                </div>
              </div>

              <div className={styles.healthItem}>
                <div className={styles.healthItemTop}>
                  <span>SIGNAL QUALITY</span>
                  <span>87%</span>
                </div>

                <div className={styles.healthBar}>
                  <span className={styles.healthQuality} />
                </div>
              </div>
            </div>
          </aside>

          {/* CENTRAL RADAR */}
          <div className={styles.radarStage}>
            <div className={styles.radarHeading}>
              <span>SECTOR 07 / NORTH-EAST</span>

              <span className={styles.radarHeadingRight}>
                <span className={styles.liveIndicator} />
                LIVE SCANNING
              </span>
            </div>

            <div className={styles.radar}>
              <div className={styles.radarSurface} />

              <div className={styles.radarRings}>
                <span className={`${styles.ring} ${styles.ring1}`} />
                <span className={`${styles.ring} ${styles.ring2}`} />
                <span className={`${styles.ring} ${styles.ring3}`} />
                <span className={`${styles.ring} ${styles.ring4}`} />
              </div>

              <div className={styles.radarCrosshair} />

              <div className={`${styles.direction} ${styles.directionNorth}`}>N</div>
              <div className={`${styles.direction} ${styles.directionEast}`}>E</div>
              <div className={`${styles.direction} ${styles.directionSouth}`}>S</div>
              <div className={`${styles.direction} ${styles.directionWest}`}>W</div>

              <div className={styles.radarSweep}>
                <div className={styles.radarBeam} />
              </div>

              <div className={styles.targets}>
                {trackedTargets.map((target) => (
                  <div
                    key={target.id}
                    className={`${styles.target} ${styles[`target${target.id}`]}`}
                    data-target={target.id}
                    role='button'
                    tabIndex={0}
                    aria-label={`Select ${target.name}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        rootRef.current?.querySelector(`[data-target="${target.id}"].${styles.targetRow}`)?.click();
                      }
                    }}
                  >
                    <span className={styles.targetPulse} />
                    <span className={styles.targetCore} />
                  </div>
                ))}
              </div>

              <div className={styles.radarCenter}>
                <span />
              </div>

              <div className={styles.targetLock}>
                <span className={`${styles.lockCorner} ${styles.lockCorner1}`} />
                <span className={`${styles.lockCorner} ${styles.lockCorner2}`} />
                <span className={`${styles.lockCorner} ${styles.lockCorner3}`} />
                <span className={`${styles.lockCorner} ${styles.lockCorner4}`} />
              </div>

              <div className={styles.radarTicks} />
            </div>

            <div className={styles.radarFooter}>
              <span>FREQUENCY: 9.45 GHZ</span>
              <span>ROTATION: 360°</span>
              <span>MODE: ACTIVE</span>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className={`${styles.sidebar} ${styles.sidebarRight}`}>
            <div className={styles.sectionLabel}>
              <span>02</span>
              DETECTION LOG
            </div>

            <div className={styles.detectionCounter}>
              <span className={styles.detectionCounterLabel}>OBJECTS DETECTED</span>

              <strong className={styles.detectionCounterValue}>04</strong>

              <span className={styles.detectionCounterSub}>ACTIVE SIGNALS</span>
            </div>

            <div className={styles.targetList}>
              <span className={styles.sectionLabel}>TRACKED OBJECTS</span>

              {trackedTargets.map((target) => (
                <button
                  type='button'
                  key={target.id}
                  className={`${styles.targetRow} ${target.id === 1 ? styles.active : ""}`}
                  data-target={target.id}
                >
                  <span className={styles.targetRowDot} />
                  <span className={styles.targetRowName}>{target.name}</span>
                  <span className={styles.targetRowType}>{target.type}</span>
                </button>
              ))}
            </div>

            <div className={styles.signalPanel}>
              <span className={styles.sectionLabel}>SIGNAL ANALYSIS</span>

              <div className={styles.signalValue}>
                <strong>94.8</strong>
                <span>%</span>
              </div>

              <div className={styles.signalBars}>
                {signalBars.map((bar) => (
                  <i
                    key={bar}
                    className={styles.signalBar}
                  />
                ))}
              </div>

              <span className={styles.signalCaption}>RECEIVING FREQUENCY</span>
            </div>

            <div className={styles.alertPanel}>
              <span className={styles.alertIcon}>
                <TriangleAlert />
              </span>

              <div>
                <strong>ANOMALY DETECTED</strong>
                <small>UNIDENTIFIED SIGNAL IN SECTOR 07</small>
              </div>
            </div>
          </aside>
        </section>

        {/* BOTTOM BAR */}
        <footer className={styles.bottomBar}>
          <div className={styles.bottomBarLeft}>
            <span className={styles.liveIndicator} />
            CONNECTION ESTABLISHED
          </div>

          <div className={styles.bottomBarCenter}>
            <span>SECURE CHANNEL</span>
            <span className={styles.bottomBarSeparator}>/</span>
            <span>ENCRYPTION ACTIVE</span>
          </div>

          <div className={styles.bottomBarRight}>RADAR//479 — SYSTEM VERSION 4.08</div>
        </footer>
      </main>
    </div>
  );
}
