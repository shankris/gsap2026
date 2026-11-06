/* src/demos/electric-border/Demo.jsx */

"use client";

import styles from "./Demo.module.css";

export default function ElectricBorder() {
  return (
    <main className={styles.page}>
      <svg
        className={styles.filterSvg}
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <filter
            id='electric-turbulent-displace'
            x='-20%'
            y='-20%'
            width='140%'
            height='140%'
          >
            <feTurbulence
              type='turbulence'
              baseFrequency='0.02'
              numOctaves='10'
              result='noise1'
              seed='1'
            />
            <feOffset
              in='noise1'
              dx='0'
              dy='0'
              result='offsetNoise1'
            >
              <animate
                attributeName='dy'
                values='700; 0'
                dur='6s'
                repeatCount='indefinite'
                calcMode='linear'
              />
            </feOffset>

            <feTurbulence
              type='turbulence'
              baseFrequency='0.02'
              numOctaves='10'
              result='noise2'
              seed='1'
            />
            <feOffset
              in='noise2'
              dx='0'
              dy='0'
              result='offsetNoise2'
            >
              <animate
                attributeName='dy'
                values='0; -700'
                dur='6s'
                repeatCount='indefinite'
                calcMode='linear'
              />
            </feOffset>

            <feTurbulence
              type='turbulence'
              baseFrequency='0.02'
              numOctaves='10'
              result='noise3'
              seed='2'
            />
            <feOffset
              in='noise3'
              dx='0'
              dy='0'
              result='offsetNoise3'
            >
              <animate
                attributeName='dx'
                values='490; 0'
                dur='6s'
                repeatCount='indefinite'
                calcMode='linear'
              />
            </feOffset>

            <feTurbulence
              type='turbulence'
              baseFrequency='0.02'
              numOctaves='10'
              result='noise4'
              seed='2'
            />
            <feOffset
              in='noise4'
              dx='0'
              dy='0'
              result='offsetNoise4'
            >
              <animate
                attributeName='dx'
                values='0; -490'
                dur='6s'
                repeatCount='indefinite'
                calcMode='linear'
              />
            </feOffset>

            <feComposite
              in='offsetNoise1'
              in2='offsetNoise2'
              result='yMove'
            />
            <feComposite
              in='offsetNoise3'
              in2='offsetNoise4'
              result='xMove'
            />
            <feBlend
              in='yMove'
              in2='xMove'
              mode='color-dodge'
              result='result'
            />

            <feDisplacementMap
              in='SourceGraphic'
              in2='result'
              scale='50'
            />
          </filter>
        </defs>
      </svg>

      <article className={styles.card}>
        <div className={styles.stack}>
          <div className={styles.frame}>
            <div className={styles.wire} />
          </div>

          <div className={styles.glowSm} />
          <div className={styles.glowLg} />
        </div>

        <div className={styles.shine} />
        <div className={styles.shineSoft} />
        <div className={styles.aura} />

        <div className={styles.copy}>
          <div className={styles.top}>
            <div className={styles.pill}>Purple</div>
            <p className={styles.heading}>Neon Pulse</p>
          </div>

          <hr className={styles.rule} />

          <div className={styles.bottom}>
            <p className={styles.text}>The border hums with energy. Hover to charge it up.</p>
          </div>
        </div>
      </article>
    </main>
  );
}
