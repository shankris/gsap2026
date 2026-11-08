"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Screenshot.module.css";

export default function Screenshot({ slug, name }) {
  const [imageSrc, setImageSrc] = useState(`/scrShot/${slug}.png`);

  return (
    <div className={styles.screenshot}>
      <Image
        src={imageSrc}
        alt={`${name} screenshot`}
        fill
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        className={styles.image}
        onError={() => {
          if (imageSrc !== "/scrShot/comingSoon.png") {
            setImageSrc("/scrShot/comingSoon.png");
          }
        }}
      />
    </div>
  );
}
