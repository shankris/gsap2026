/* src/demos/user-02-mac/Demo.jsx */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./Demo.module.css";

const sampleUsers = [
  { id: 1, name: "Olivia", avatar: "https://i.pravatar.cc/100?img=47" },
  { id: 2, name: "James", avatar: "https://i.pravatar.cc/100?img=12" },
  { id: 3, name: "Sophia", avatar: "https://i.pravatar.cc/100?img=44" },
  { id: 4, name: "William", avatar: "https://i.pravatar.cc/100?img=13" },
  { id: 5, name: "Emma", avatar: "https://i.pravatar.cc/100?img=49" },
  { id: 6, name: "Noah", avatar: "https://i.pravatar.cc/100?img=14" },
];

export default function Demo({ users = sampleUsers, size = 50, expandedGap = 2, maxScale = 2, influence = 2 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [stackHover, setStackHover] = useState(false);

  const itemSpacing = size + expandedGap;
  const stackWidth = users.length > 0 ? size + (users.length - 1) * itemSpacing : 0;

  return (
    <div className={styles.demo}>
      <motion.div
        className={styles.stack}
        style={{
          width: stackWidth,
          height: size + 50,
        }}
        onMouseEnter={() => setStackHover(true)}
        onMouseLeave={() => {
          setStackHover(false);
          setHoveredIndex(null);
        }}
      >
        {users.map((user, index) => {
          let itemScale = 1;

          if (hoveredIndex !== null) {
            const distance = Math.abs(index - hoveredIndex);

            itemScale = Math.max(1, maxScale - (distance / Math.max(influence, 1)) * (maxScale - 1));
          }

          const xOffset = stackHover ? index * itemSpacing : index * 20;

          return (
            <motion.div
              key={user.id}
              className={styles.avatarWrapper}
              animate={{
                x: xOffset,
                scale: itemScale,
              }}
              style={{
                zIndex: hoveredIndex === index ? 20 : users.length - index,
                width: size,
                height: size,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={size}
                height={size}
                unoptimized
                className={styles.avatar}
                style={{
                  width: size,
                  height: size,
                }}
              />

              <span className={styles.name}>{user.name}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
