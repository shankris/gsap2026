/* src/demos/users-01/Demo.jsx */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./Demo.module.css";

const sampleUsers = [
  {
    id: 1,
    name: "Olivia",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    id: 2,
    name: "James",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 3,
    name: "Sophia",
    avatar: "https://i.pravatar.cc/100?img=44",
  },
  {
    id: 4,
    name: "William",
    avatar: "https://i.pravatar.cc/100?img=13",
  },
  {
    id: 5,
    name: "Emma",
    avatar: "https://i.pravatar.cc/100?img=49",
  },
];

export default function Demo({ users = sampleUsers }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={styles.demo}>
      <div className={styles.stack}>
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`${styles.avatarWrapper} ${hovered === index ? styles.hovered : ""}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <Image
              src={user.avatar}
              alt={user.name}
              width={50}
              height={50}
              unoptimized
              className={styles.avatar}
            />

            <span className={styles.name}>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
