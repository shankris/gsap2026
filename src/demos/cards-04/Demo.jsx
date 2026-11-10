// src/demos/cards-04/Demo.jsx

"use client";

import { useState } from "react";
import styles from "./Demo.module.css";

const productImages = ["/demos/cards-04/01.png", "/demos/cards-04/02.png", "/demos/cards-04/03.png", "/demos/cards-04/04.png", "/demos/cards-04/05.png", "/demos/cards-04/06.png", "/demos/cards-04/07.png"];

const colors = [
  { name: "Blue", className: "blue" },
  { name: "Red", className: "red" },
  { name: "White", className: "white" },
  { name: "Green", className: "green" },
];

export default function Demo() {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const showNextImage = () => {
    setActiveImage((current) => Math.min(current + 1, productImages.length - 1));
  };

  const showPreviousImage = () => {
    setActiveImage((current) => Math.max(current - 1, 0));
  };

  const flipToBack = () => {
    setIsFlipped(true);
    setActiveImage(0);
  };

  const flipToFront = () => {
    setIsFlipped(false);
  };

  return (
    <div className={styles.demo}>
      <div className={styles.make3DSpace}>
        <div
          className={`${styles.productCard} ${isHovered ? styles.hovered : ""} ${isFlipped ? styles.flipped : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Front of the card */}
          <div className={styles.productFront}>
            <div className={styles.shadow} />

            <img
              className={styles.productImage}
              src='/demos/cards-04/08.png'
              alt='Adidas Originals running shirt'
            />

            <div className={styles.imageOverlay} />

            <button
              type='button'
              className={styles.viewDetails}
              onClick={flipToBack}
            >
              View details
            </button>

            <div className={styles.statsContainer}>
              <span className={styles.productPrice}>$39</span>

              <span className={styles.productName}>Adidas Originals</span>

              <p>Men&apos;s running shirt</p>

              <div className={styles.productOptions}>
                <strong>Sizes</strong>
                <span>XS, S, M, L, XL, XXL</span>

                <strong>Colors</strong>

                <div className={styles.colors}>
                  {colors.map((color) => (
                    <div
                      key={color.name}
                      className={`${styles.color} ${styles[color.className]}`}
                      title={color.name}
                    >
                      <span />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back of the card */}
          <div className={styles.productBack}>
            <div className={styles.shadow} />

            <div className={styles.carousel}>
              <div
                className={styles.carouselTrack}
                style={{
                  transform: `translateX(-${activeImage * 100}%)`,
                }}
              >
                {productImages.map((image, index) => (
                  <div
                    className={styles.carouselSlide}
                    key={image}
                  >
                    <img
                      src={image}
                      alt={`Product view ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.arrowsPerspective}>
                <button
                  type='button'
                  aria-label='Previous image'
                  className={`${styles.carouselPrev} ${activeImage > 0 ? styles.visible : ""}`}
                  onClick={showPreviousImage}
                  disabled={activeImage === 0}
                >
                  <span className={styles.arrowX} />
                  <span className={styles.arrowY} />
                </button>

                <button
                  type='button'
                  aria-label='Next image'
                  className={`${styles.carouselNext} ${activeImage < productImages.length - 1 ? styles.visible : ""}`}
                  onClick={showNextImage}
                  disabled={activeImage === productImages.length - 1}
                >
                  <span className={styles.arrowX} />
                  <span className={styles.arrowY} />
                </button>
              </div>
            </div>

            <button
              type='button'
              className={styles.flipBack}
              onClick={flipToFront}
              aria-label='Return to product details'
            >
              <span className={styles.closeX} />
              <span className={styles.closeY} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
