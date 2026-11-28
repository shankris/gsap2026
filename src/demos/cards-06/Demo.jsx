/* src/demos/cards-06/Demo.jsx */

"use client";

import React, { useState } from "react";
import styles from "./Demo.module.css";

const applicantsData = {
  month: [
    { avatar: "/demos/cards-06/001-boy.svg", name: "Jeff Davies", role: "Art Director", stars: 5 },
    { avatar: "/demos/cards-06/047-girl-25.svg", name: "Melinda Doe", role: "Creative Director", stars: 4 },
    { avatar: "/demos/cards-06/043-boy-18.svg", name: "Bo Larsson", role: "Chief Designer", stars: 3 },
  ],
  week: [
    { avatar: "/demos/cards-06/014-girl-7.svg", name: "Shannon Drake", role: "Copywriter", stars: 4 },
    { avatar: "/demos/cards-06/018-girl-9.svg", name: "Taylor Drift", role: "Art Director", stars: 3 },
    { avatar: "/demos/cards-06/001-boy.svg", name: "Peter Rose", role: "Photographer", stars: 2 },
  ],
  day: [
    { avatar: "/demos/cards-06/047-girl-25.svg", name: "Kate Best", role: "Developer", stars: 4 },
    { avatar: "/demos/cards-06/043-boy-18.svg", name: "Ben North", role: "UX Designer", stars: 3 },
    { avatar: "/demos/cards-06/018-girl-9.svg", name: "Claire Tait", role: "UI Engineer", stars: 3 },
  ],
};

const tabs = [
  { label: "Month", key: "month" },
  { label: "Week", key: "week" },
  { label: "Day", key: "day" },
];

function Stars({ count }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }, (_, index) => (
        <img
          key={index}
          src={index < count ? "/demos/cards-06/star-1.svg" : "/demos/cards-06/star-0.svg"}
          alt=''
        />
      ))}
    </div>
  );
}

function ApplicantRow({ applicant }) {
  return (
    <tr>
      <td>
        <img
          className={styles.avatar}
          src={applicant.avatar}
          alt={`${applicant.name}'s avatar`}
        />
      </td>
      <td>
        <h3 className={styles.h3}>{applicant.name}</h3>
        <h4 className={styles.h4}>{applicant.role}</h4>
      </td>
      <td>
        <Stars count={applicant.stars} />
      </td>
    </tr>
  );
}

export default function Demo() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.demo}>
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <h2 className={styles.h2}>Leader Board</h2>

          <div className={styles.buttons}>
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                type='button'
                className={activeTab === index ? styles.active : ""}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className={styles.tables}>
          <div
            className={styles.tablesInner}
            style={{
              transform: `translateX(-${activeTab * (100 / 3)}%)`,
            }}
          >
            {tabs.map((tab, index) => (
              <div
                key={tab.key}
                className={styles.tablePanel}
                style={{
                  opacity: activeTab === index ? 1 : 0,
                }}
              >
                <table className={styles.table}>
                  <tbody>
                    {applicantsData[tab.key].map((applicant) => (
                      <ApplicantRow
                        key={applicant.name}
                        applicant={applicant}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
