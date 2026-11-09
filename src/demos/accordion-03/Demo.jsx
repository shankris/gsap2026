// src/demos/accordion-03/Demo.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Demo.module.css";

const schedule = [
  {
    day: "Mon",
    fullDay: "Monday",
    events: [
      {
        title: "Breakfast",
        time: "8:00AM - 9:00AM",
      },
      {
        title: "General Hours",
        time: (
          <>
            10:15AM - 1:45PM
            <br />
            3:30PM - 6:00PM
          </>
        ),
      },
      {
        title: "Demo Power Hour",
        time: "4:00PM - 5:00PM",
        highlight: true,
      },
      {
        title: "Happy Hour",
        time: "6:00PM - 7:00PM",
      },
    ],
  },
  {
    day: "Tues",
    fullDay: "Tuesday",
    events: [
      {
        title: "Breakfast",
        time: "8:30AM - 9:30AM",
      },
      {
        title: "General Hours",
        time: (
          <>
            10:15AM - 1:45PM
            <br />
            3:30PM - 6:00PM
          </>
        ),
      },
      {
        title: "Demo Power Hour",
        time: "3:00PM - 4:00PM",
        highlight: true,
      },
      {
        title: "Happy Hour",
        time: "6:00PM - 7:00PM",
      },
    ],
  },
  {
    day: "Wed",
    fullDay: "Wednesday",
    events: [
      {
        title: "Breakfast",
        time: "8:00AM - 9:00AM",
      },
      {
        title: "General Hours",
        time: (
          <>
            10:15AM - 1:45PM
            <br />
            3:30PM - 6:00PM
          </>
        ),
      },
      {
        title: "Demo Power Hour",
        time: "4:00PM - 5:00PM",
        highlight: true,
      },
      {
        title: "Happy Hour",
        time: "6:00PM - 7:00PM",
      },
    ],
  },
];

export default function Demo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const accordionRef = useRef(null);

  useEffect(() => {
    const accordion = accordionRef.current;

    if (!accordion) return;

    const allGroups = accordion.querySelectorAll(`.${styles.dayGroup}`);

    const animateGroups = (groups) => {
      gsap.to(groups, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: 0.3,
        stagger: 0.15,
        ease: "power2.out",
      });
    };

    // Hide all schedule items initially.
    gsap.set(allGroups, {
      opacity: 0,
      x: -50,
    });

    // Reveal the initial active panel.
    const initialGroups = accordion.querySelectorAll(`.${styles.panel}:nth-child(1) .${styles.dayGroup}`);

    animateGroups(initialGroups);

    return () => {
      gsap.killTweensOf(allGroups);
    };
  }, []);

  const handlePanelClick = (index) => {
    if (index === activeIndex) return;

    const accordion = accordionRef.current;

    if (!accordion) return;

    const allGroups = accordion.querySelectorAll(`.${styles.dayGroup}`);

    const activeGroups = accordion.querySelectorAll(`.${styles.panel}:nth-child(${index + 1}) .${styles.dayGroup}`);

    // Stop any previous animations.
    gsap.killTweensOf(allGroups);

    // Hide all schedule items.
    gsap.set(allGroups, {
      opacity: 0,
      x: -50,
    });

    setActiveIndex(index);

    // Reveal the selected panel's schedule.
    gsap.to(activeGroups, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      delay: 0.3,
      stagger: 0.15,
      ease: "power2.out",
    });
  };

  return (
    <div className={styles.demo}>
      <div
        className={styles.accordion}
        ref={accordionRef}
      >
        {schedule.map((day, index) => (
          <div
            className={`${styles.panel} ${activeIndex === index ? styles.active : ""}`}
            key={day.fullDay}
          >
            {activeIndex !== index && (
              <button
                type='button'
                className={styles.trigger}
                onClick={() => handlePanelClick(index)}
                aria-label={`Expand ${day.fullDay} schedule`}
              >
                <span className={styles.visuallyHidden}>Expand {day.fullDay} Schedule</span>
              </button>
            )}

            <div className={styles.content}>
              <h3>
                {day.day}
                <span className={styles.visuallyHidden}>{day.fullDay.slice(day.day.length)}</span>
              </h3>

              {day.events.map((event) => (
                <div
                  className={`${styles.dayGroup} ${event.highlight ? styles.powerHour : ""}`}
                  key={event.title}
                >
                  <h4>{event.title}</h4>
                  <p>{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
