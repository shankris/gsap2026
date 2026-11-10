// src/demos/table-01/Demo.jsx

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
// import {  Bolt, Crown, Dragon, Eye, Flame, Ghost, Leaf, Medal, Meteor, RotateCcw, Shield, Snowflake, Zap } from "lucide-react";
import { ArrowUp, Crown, Eye, Flame, Ghost, Leaf, Medal, RotateCcw, Shield, Snowflake, Zap } from "lucide-react";
import styles from "./Demo.module.css";

gsap.registerPlugin(SplitText, Flip);

const players = [
  {
    name: "NyxVortex",
    tag: "VOID WALKER",
    rate: 94,
    xp: 48920,
    avatar: "gold",
    icon: Flame,
  },
  {
    name: "ZeroGravity",
    tag: "STAR BREAKER",
    rate: 91,
    xp: 42760,
    avatar: "blue",
    icon: Leaf,
  },
  {
    name: "Phantom.exe",
    tag: "NIGHT STALKER",
    rate: 87,
    xp: 39150,
    avatar: "purple",
    icon: Ghost,
  },
  {
    name: "PixelReaper",
    tag: "STORM CHASER",
    rate: 82,
    xp: 34890,
    avatar: "pink",
    icon: Zap,
  },
  {
    name: "CyberRonin",
    tag: "SILENT EDGE",
    rate: 79,
    xp: 31440,
    avatar: "green",
    icon: Leaf,
  },
  {
    name: "InfernoX",
    tag: "ASH BRINGER",
    rate: 75,
    xp: 28670,
    avatar: "orange",
    icon: Flame,
  },
  {
    name: "FrostByte",
    tag: "ICE PROTOCOL",
    rate: 71,
    xp: 25310,
    avatar: "cyan",
    icon: Snowflake,
  },
  {
    name: "EchoProtocol",
    tag: "GHOST SIGNAL",
    rate: 68,
    xp: 22180,
    avatar: "white",
    icon: Eye,
  },
];

const rankClasses = ["rankOne", "rankTwo", "rankThree"];
const rankTextClasses = ["rankGold", "rankSilver", "rankBronze"];
const achievementClasses = ["achievementGold", "achievementSilver", "achievementBronze"];

const rankSymbols = ["♛", "✦", "✦"];

const formatXP = (value) => Number(value).toLocaleString("en-US");

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let titleSplit;
    let playerSplits = [];
    const cleanupListeners = [];
    const delayedCalls = [];

    const q = (className, scope = root) => scope.querySelector(`.${styles[className]}`);

    const qa = (className, scope = root) => Array.from(scope.querySelectorAll(`.${styles[className]}`));

    const panel = q("leaderboard");
    const topBar = q("leaderboardTop");
    const headingKicker = q("headingKicker");
    const title = q("title");
    const subtitle = q("subtitle");
    const tableHead = q("tableHead");
    const rows = qa("playerRow");
    const bottomBar = q("leaderboardBottom");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const addListener = (element, event, handler) => {
      element.addEventListener(event, handler);
      cleanupListeners.push(() => element.removeEventListener(event, handler));
    };

    const ctx = gsap.context(() => {
      async function initLeaderboard() {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        if (cancelled) return;

        if (reducedMotion) return;

        titleSplit = SplitText.create(title, {
          type: "chars",
          charsClass: styles.char,
          aria: "auto",
        });

        playerSplits = rows.map((row) => {
          const name = q("playerName", row);

          return SplitText.create(name, {
            type: "chars",
            charsClass: styles.char,
            aria: "auto",
          });
        });

        gsap.set(panel, {
          autoAlpha: 0,
          y: 35,
          scale: 0.985,
        });

        gsap.set([topBar, headingKicker, subtitle, tableHead, bottomBar], {
          autoAlpha: 0,
          y: 12,
        });

        gsap.set(titleSplit.chars, {
          autoAlpha: 0,
          yPercent: 110,
          rotateX: -65,
          transformOrigin: "50% 100%",
        });

        gsap.set(rows, {
          autoAlpha: 0,
          x: -24,
        });

        gsap.set(qa("avatar"), {
          scale: 0.7,
          rotation: -12,
        });

        gsap.set(qa("rateFill"), {
          scaleX: 0,
          transformOrigin: "left center",
        });

        gsap.set(qa("achievement"), {
          autoAlpha: 0,
          scale: 0.5,
          rotation: -20,
        });

        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        timeline.to(panel, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
        });

        timeline.to(
          topBar,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          },
          "-=0.4",
        );

        timeline.to(
          headingKicker,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.15",
        );

        timeline.to(
          titleSplit.chars,
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.65,
            stagger: 0.045,
            ease: "back.out(1.5)",
          },
          "-=0.1",
        );

        timeline.to(
          subtitle,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          },
          "-=0.3",
        );

        timeline.to(
          tableHead,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.15",
        );

        timeline.to(
          rows,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.55,
            stagger: 0.09,
            ease: "power3.out",
          },
          "-=0.05",
        );

        playerSplits.forEach((split, index) => {
          timeline.fromTo(
            split.chars,
            {
              autoAlpha: 0,
              y: 9,
              rotationX: -35,
            },
            {
              autoAlpha: 1,
              y: 0,
              rotationX: 0,
              duration: 0.3,
              stagger: 0.018,
              ease: "power2.out",
            },
            2.45 + index * 0.15,
          );
        });

        timeline.to(
          qa("avatar"),
          {
            scale: 1,
            rotation: 0,
            duration: 0.45,
            stagger: 0.11,
            ease: "back.out(2)",
          },
          2.4,
        );

        timeline.to(
          qa("rateFill"),
          {
            scaleX: 1,
            duration: 0.8,
            stagger: 0.11,
            ease: "power2.out",
          },
          2.7,
        );

        timeline.to(
          qa("achievement"),
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.45,
            stagger: 0.11,
            ease: "back.out(2)",
          },
          2.65,
        );

        timeline.to(
          bottomBar,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          },
          "-=0.2",
        );
      }

      // Player row hover effects
      rows.forEach((row) => {
        const avatar = q("avatar", row);
        const achievement = q("achievement", row);

        const handleEnter = () => {
          gsap.to(row, {
            y: -2,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(avatar, {
            scale: 1.08,
            duration: 0.3,
            ease: "back.out(2)",
            overwrite: "auto",
          });

          gsap.to(achievement, {
            scale: 1.15,
            duration: 0.25,
            overwrite: "auto",
          });
        };

        const handleLeave = () => {
          gsap.to(row, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(avatar, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(achievement, {
            scale: 1,
            duration: 0.25,
            overwrite: "auto",
          });
        };

        addListener(row, "mouseenter", handleEnter);
        addListener(row, "mouseleave", handleLeave);
      });

      // Ranking controls
      const boostButton = q("boostButton");
      const resetButton = q("resetButton");
      const playerList = q("playerList");

      const initialScores = new Map(rows.map((row) => [row, Number(q("xpValue", row).textContent.replace(/,/g, ""))]));

      let highlightedRows = [];
      let rankAnimationRunning = false;

      function updateRankDetails() {
        const currentRows = Array.from(playerList.children);

        currentRows.forEach((row, index) => {
          const rank = index + 1;
          const rankElement = q("rank", row);
          const achievement = q("achievement", row);
          const achievementIcon = q("achievementSymbol", row);

          rankElement.textContent = String(rank).padStart(2, "0");

          row.classList.remove(...rankClasses.map((name) => styles[name]));
          rankElement.classList.remove(...rankTextClasses.map((name) => styles[name]));
          achievement.classList.remove(...achievementClasses.map((name) => styles[name]));

          if (rank <= 3) {
            row.classList.add(styles[rankClasses[rank - 1]]);
            rankElement.classList.add(styles[rankTextClasses[rank - 1]]);
            achievement.classList.add(styles[achievementClasses[rank - 1]]);
            achievementIcon.textContent = rankSymbols[rank - 1];
          } else {
            achievementIcon.textContent = "⬡";
          }
        });
      }

      function animateRanking(scoreUpdater) {
        if (rankAnimationRunning) return;

        rankAnimationRunning = true;
        boostButton.disabled = true;
        resetButton.disabled = true;

        const previousOrder = Array.from(playerList.children);
        const state = Flip.getState(previousOrder);

        scoreUpdater();

        const sortedRows = [...previousOrder].sort((a, b) => {
          const scoreA = Number(q("xpValue", a).textContent.replace(/,/g, ""));

          const scoreB = Number(q("xpValue", b).textContent.replace(/,/g, ""));

          return scoreB - scoreA;
        });

        sortedRows.forEach((row) => playerList.appendChild(row));

        updateRankDetails();

        const movedRows = sortedRows.filter((row, index) => previousOrder[index] !== row);

        Flip.from(state, {
          duration: 0.9,
          ease: "power3.inOut",
          stagger: 0.025,
          absolute: false,
          prune: true,

          onComplete: () => {
            rankAnimationRunning = false;
            boostButton.disabled = false;
            resetButton.disabled = false;

            highlightedRows.forEach((row) => row.classList.remove(styles.rankChanged));

            movedRows.forEach((row) => row.classList.add(styles.rankChanged));

            highlightedRows = movedRows;

            const delayed = gsap.delayedCall(1.3, () => {
              movedRows.forEach((row) => row.classList.remove(styles.rankChanged));

              highlightedRows = [];
            });

            delayedCalls.push(delayed);
          },
        });
      }

      const handleBoost = () => {
        animateRanking(() => {
          const currentRows = Array.from(playerList.children);
          const candidates = currentRows.slice(1);

          const randomIndex = Math.floor(Math.random() * candidates.length);

          const chosenPlayer = candidates[randomIndex];
          const xpElement = q("xpValue", chosenPlayer);
          const currentXP = Number(xpElement.textContent.replace(/,/g, ""));

          const bonusXP = Math.floor(5000 + Math.random() * 8000);

          xpElement.textContent = formatXP(currentXP + bonusXP);
        });
      };

      const handleReset = () => {
        animateRanking(() => {
          rows.forEach((row) => {
            q("xpValue", row).textContent = formatXP(initialScores.get(row));
          });
        });
      };

      addListener(boostButton, "click", handleBoost);
      addListener(resetButton, "click", handleReset);

      initLeaderboard();
    }, root);

    return () => {
      cancelled = true;

      cleanupListeners.forEach((cleanup) => cleanup());
      delayedCalls.forEach((call) => call.kill());

      titleSplit?.revert();
      playerSplits.forEach((split) => split.revert());

      ctx.revert();
    };
  }, []);

  return (
    <div
      className={styles.demo}
      ref={rootRef}
    >
      <div className={`${styles.ambient} ${styles.ambientOne}`} />
      <div className={`${styles.ambient} ${styles.ambientTwo}`} />
      <div className={`${styles.ambient} ${styles.ambientThree}`} />
      <div className={styles.backgroundGrid} />
      <div className={styles.noise} />

      <main className={styles.arena}>
        <section className={styles.leaderboard}>
          <div className={styles.leaderboardTop}>
            <div className={styles.seasonLabel}>
              <span className={styles.liveDot} />
              SEASON 08 <span className={styles.separator}>/</span> LIVE
            </div>

            <div className={styles.onlineCount}>
              <span className={styles.onlineIcon} />
              2,481 ONLINE
            </div>
          </div>

          <div className={styles.heading}>
            <div className={styles.headingKicker}>THE COMPETITION</div>

            <h1 className={styles.title}>
              ELITE<span className={styles.titleAccent}>.</span>
            </h1>

            <p className={styles.subtitle}>Only the relentless make the top.</p>
          </div>

          <div className={styles.tableHead}>
            <span>RANK</span>
            <span>PLAYER</span>
            <span>WIN RATE</span>
            <span>EXPERIENCE</span>
            <span aria-hidden='true' />
          </div>

          <ul className={styles.playerList}>
            {players.map((player, index) => {
              const AvatarIcon = player.icon;

              return (
                <li
                  className={`${styles.playerRow} ${index === 0 ? styles.rankOne : index === 1 ? styles.rankTwo : index === 2 ? styles.rankThree : ""}`}
                  key={player.name}
                >
                  <span className={`${styles.rank} ${index === 0 ? styles.rankGold : index === 1 ? styles.rankSilver : index === 2 ? styles.rankBronze : ""}`}>{String(index + 1).padStart(2, "0")}</span>

                  <div className={styles.playerInfo}>
                    <div className={`${styles.avatar} ${styles[`avatar${player.avatar[0].toUpperCase()}${player.avatar.slice(1)}`]}`}>
                      <AvatarIcon
                        size={18}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className={styles.playerDetails}>
                      <span className={styles.playerName}>{player.name}</span>
                      <span className={styles.playerTag}>{player.tag}</span>
                    </div>
                  </div>

                  <div className={styles.winRate}>
                    <span className={styles.rateValue}>{player.rate}%</span>
                    <span className={styles.rateTrack}>
                      <span
                        className={styles.rateFill}
                        style={{ "--rate": `${player.rate}%` }}
                      />
                    </span>
                  </div>

                  <div className={styles.experience}>
                    <span className={styles.xpValue}>{formatXP(player.xp)}</span>
                    <span className={styles.xpLabel}>XP</span>
                  </div>

                  <div className={`${styles.achievement} ${index === 0 ? styles.achievementGold : index === 1 ? styles.achievementSilver : index === 2 ? styles.achievementBronze : ""}`}>
                    <span className={styles.achievementSymbol}>{index === 0 ? "♛" : index <= 2 ? "✦" : "⬡"}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={styles.rankControls}>
            <button
              className={styles.boostButton}
              type='button'
            >
              <Flame size={14} />
              BOOST RANDOM PLAYER
            </button>

            <button
              className={styles.resetButton}
              type='button'
            >
              <RotateCcw size={13} />
              RESET
            </button>
          </div>

          <div className={styles.leaderboardBottom}>
            <span>
              <span className={styles.bottomDot} />
              RANKINGS UPDATED LIVE
            </span>

            <span>
              TOP 08 <ArrowUp size={12} />
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
