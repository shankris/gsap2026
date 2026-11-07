/* src/demos/background-01/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger);

const config = {
  horizon: 0.42,
  intensity: 1.35,
  spreadMax: 0.92,
  coreGlow: 1.25,
  flowSpeed: 0.5,
  waveAmount: 0.22,
  breath: 0.06,
  colorfulness: 0.9,
  colWhite: "#f2efff",
  colOrange: "#8b5cf6",
  colRed: "#4c1d95",
  colCyan: "#38bdf8",
  colMagenta: "#f0abfc",
  colGold: "#ff7ad9",
  parallax: 1.6,
  mouseGlow: 0.3,
  mouseGlowSize: 0.2,
  mouseBend: 0.47,
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec2 uMouseUV;
  uniform float uReveal;

  uniform float uHorizon;
  uniform float uIntensity;
  uniform float uSpreadMax;
  uniform float uCoreGlow;
  uniform float uFlowSpeed;
  uniform float uWaveAmount;
  uniform float uBreath;
  uniform float uColorfulness;
  uniform vec3 uColWhite;
  uniform vec3 uColOrange;
  uniform vec3 uColRed;
  uniform vec3 uColCyan;
  uniform vec3 uColMagenta;
  uniform vec3 uColGold;
  uniform float uParallax;
  uniform float uMouseGlow;
  uniform float uMouseGlowSize;
  uniform float uMouseBend;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;

    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(17.3, 9.1);
      a *= 0.5;
    }

    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;

    uv += uMouse * vec2(-0.03, -0.02) * uParallax;

    float x = uv.x;
    float d = uv.y - uHorizon;

    float n1 = fbm(vec2(
      x * 3.0 - uTime * 0.06,
      uv.y * 2.0 + uTime * 0.045
    ));

    float n2 = fbm(vec2(
      x * 7.0 + uTime * 0.05,
      uv.y * 5.0 - uTime * 0.06
    ));

    float grow = smoothstep(0.06, 0.72, x + (n1 - 0.5) * 0.12);
    grow = pow(grow, 1.7);

    float spread = mix(
      0.014,
      uSpreadMax,
      pow(smoothstep(0.18, 1.05, x), 2.1)
    );

    float dd = d + (n1 - 0.5) * uWaveAmount * smoothstep(0.25, 0.9, x);

    vec2 mq = (uv - uMouseUV) * vec2(aspect, 1.0) / max(uMouseGlowSize, 0.01);
    float mGauss = exp(-dot(mq, mq));

    dd -= mGauss * (uMouseUV.y - uHorizon) * uMouseBend;

    float band = exp(-abs(dd) / spread);
    float coreGlow = exp(-abs(d) / 0.028) * grow * uCoreGlow;
    float halo = exp(-abs(dd) / (spread * 2.6)) * 0.35;

    float light = (band + halo) * grow + coreGlow;

    float flow = fbm(vec2(
      x * 4.5 + n1,
      abs(dd) * 3.5 - uTime * uFlowSpeed
    ));

    light *= 0.72 + 0.55 * flow;
    light *= 1.0 - uBreath + uBreath * sin(uTime * 0.5 + x * 2.0);
    light += mGauss * uMouseGlow * (0.7 + 0.3 * sin(uTime * 0.8));
    light *= uIntensity;

    float colorAmt = smoothstep(0.25, 0.85, x) * uColorfulness;

    float up = smoothstep(0.0, 0.45, dd);
    float dn = smoothstep(0.0, -0.4, dd);

    vec3 col = uColWhite;

    col = mix(
      col,
      uColGold,
      smoothstep(0.06, 0.16, abs(dd)) *
      smoothstep(0.35, 0.0, abs(dd)) *
      colorAmt * 0.8
    );

    col = mix(
      col,
      uColOrange,
      clamp(up * (1.2 + n2 * 0.6) * colorAmt, 0.0, 1.0)
    );

    col = mix(
      col,
      uColRed,
      clamp((up * 2.4 - 0.9) * colorAmt, 0.0, 1.0)
    );

    col = mix(
      col,
      uColMagenta,
      clamp((n2 - 0.55) * 2.2, 0.0, 1.0) *
      (up + dn) * colorAmt * 0.65
    );

    col = mix(
      col,
      uColCyan,
      smoothstep(0.72, 1.0, x + (n2 - 0.5) * 0.08) * 0.85
    );

    col = mix(col, mix(uColWhite, uColCyan, 0.35), dn * 0.45);

    vec3 color = col * light;

    vec2 ep = (uv - vec2(0.86, 0.0)) * vec2(1.2 * aspect * 0.6, 2.0);
    float ember = exp(-dot(ep, ep)) * smoothstep(0.0, -0.12, d);

    color += uColRed * ember * (0.55 + 0.1 * sin(uTime * 0.7));

    vec2 lp = (uv - vec2(0.02, 0.0)) * vec2(2.2, 2.6);

    color += mix(uColRed, uColMagenta, 0.5) *
      exp(-dot(lp, lp)) *
      smoothstep(0.0, -0.12, d) * 0.22;

    float sheen = smoothstep(0.0, -0.5, d) * 0.05 * grow;
    color += vec3(0.6, 0.68, 0.72) * sheen;

    vec2 sp = uv * vec2(aspect, 1.0) * 90.0;
    vec2 cell = floor(sp);
    vec2 fp = fract(sp) - 0.5;

    float star = step(0.997, hash(cell)) *
      smoothstep(0.16, 0.0, length(fp));

    float twinkle = 0.5 + 0.5 *
      sin(uTime * 1.5 + hash(cell + 7.0) * 50.0);

    float darkness = 1.0 - clamp(light * 3.0, 0.0, 1.0);

    color += vec3(0.9) * star * twinkle * darkness *
      smoothstep(0.75, 0.35, x) *
      smoothstep(0.35, 0.6, uv.y) * 0.5;

    float vig = smoothstep(0.0, 0.35, uv.y) * 0.15 + 0.85;
    vig *= 1.0 - 0.45 * pow(1.0 - uv.y, 3.0);
    vig *= 1.0 - 0.35 * pow(uv.y, 4.0);
    vig *= 1.0 - 0.30 * pow(clamp(1.0 - x * 1.4, 0.0, 1.0), 2.0);
    vig *= 1.0 - 0.5 * pow(x, 5.0) * pow(uv.y, 5.0);

    color *= vig;
    color = 1.0 - exp(-color * 1.5);

    gl_FragColor = vec4(color * uReveal, 1.0);
  }
`;

function createUniforms() {
  return {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseUV: { value: new THREE.Vector2(0.63, 0.37) },
    uReveal: { value: 0 },

    uHorizon: { value: config.horizon },
    uIntensity: { value: config.intensity },
    uSpreadMax: { value: config.spreadMax },
    uCoreGlow: { value: config.coreGlow },
    uFlowSpeed: { value: config.flowSpeed },
    uWaveAmount: { value: config.waveAmount },
    uBreath: { value: config.breath },
    uColorfulness: { value: config.colorfulness },

    uColWhite: { value: new THREE.Color(config.colWhite) },
    uColOrange: { value: new THREE.Color(config.colOrange) },
    uColRed: { value: new THREE.Color(config.colRed) },
    uColCyan: { value: new THREE.Color(config.colCyan) },
    uColMagenta: { value: new THREE.Color(config.colMagenta) },
    uColGold: { value: new THREE.Color(config.colGold) },

    uParallax: { value: config.parallax },
    uMouseGlow: { value: config.mouseGlow },
    uMouseGlowSize: { value: config.mouseGlowSize },
    uMouseBend: { value: config.mouseBend },
  };
}

export default function Background01() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;

    if (!hero || !canvas) return;

    ScrollTrigger.config({ ignoreMobileResize: true });

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = createUniforms();

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    scene.add(new THREE.Mesh(geometry, material));

    const mouseTarget = new THREE.Vector2(0, 0);
    const mouseUVTarget = new THREE.Vector2(0.63, 0.37);
    const clock = new THREE.Clock();

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) return;

      renderer.setSize(width, height, false);

      uniforms.uRes.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());

      const portrait = height > width;

      uniforms.uHorizon.value = portrait ? 0.5 : config.horizon;
      uniforms.uIntensity.value = config.intensity * (portrait ? 1.25 : 1);
      uniforms.uSpreadMax.value = config.spreadMax * (portrait ? 1.25 : 1);
    };

    resize();
    window.addEventListener("resize", resize);
    renderer.render(scene, camera);

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    const onLenisScroll = () => ScrollTrigger.update();

    lenis.on("scroll", onLenisScroll);

    const tick = (time) => {
      lenis.raf(time * 1000);

      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.lerp(mouseTarget, 0.04);
      uniforms.uMouseUV.value.lerp(mouseUVTarget, 0.06);

      renderer.render(scene, camera);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const finePointer = window.matchMedia("(pointer: fine)");

    const onMouseMove = (event) => {
      if (!finePointer.matches) return;

      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      mouseTarget.set(px - 0.5, -(py - 0.5));
      mouseUVTarget.set(px, 1.0 - py);
    };

    const onMouseLeave = () => {
      mouseTarget.set(0, 0);
      mouseUVTarget.set(0.63, config.horizon);
    };

    hero.addEventListener("mousemove", onMouseMove);
    hero.addEventListener("mouseleave", onMouseLeave);

    const query = (selector) => hero.querySelector(selector);
    const queryAll = (selector) => Array.from(hero.querySelectorAll(selector));

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    timeline
      .to(
        uniforms.uReveal,
        {
          value: 1,
          duration: 2.2,
          ease: "power2.inOut",
        },
        0,
      )
      .from(
        queryAll("[data-nav-item]"),
        {
          y: -16,
          opacity: 0,
          duration: 0.7,
          stagger: 0.05,
          clearProps: "transform,opacity",
        },
        0.3,
      )
      .from(
        query(".heroBadge"),
        {
          y: 18,
          opacity: 0,
          duration: 0.7,
        },
        0.5,
      )
      .from(
        queryAll(".heroLine"),
        {
          y: 48,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
        },
        0.6,
      )
      .from(
        query(".ctaButton"),
        {
          y: 20,
          opacity: 0,
          duration: 0.7,
        },
        1.0,
      )
      .from(
        queryAll(".heroDescription, .heroTrust"),
        {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
        },
        1.1,
      );

    return () => {
      timeline.kill();

      gsap.ticker.remove(tick);

      hero.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);

      lenis.off("scroll", onLenisScroll);
      lenis.destroy();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <main className={styles.page}>
      <section
        className={styles.hero}
        ref={heroRef}
      >
        <div
          className={styles.scene}
          aria-hidden='true'
        >
          <canvas
            className={styles.sceneCanvas}
            ref={canvasRef}
          />
          <div className={styles.sceneGrain} />
          <div className={styles.sceneVignette} />
        </div>

        <header className={styles.nav}>
          <a
            className='navLogo'
            data-nav-item
            href='#'
            aria-label='Lumina home'
          >
            <svg
              viewBox='0 0 32 32'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M16 1 C 17.5 9 19 12.5 23 14 L 31 16 L 23 18 C 19 19.5 17.5 23 16 31 C 14.5 23 13 19.5 9 18 L 1 16 L 9 14 C 13 12.5 14.5 9 16 1 Z'
                fill='#f2f2f2'
              />
            </svg>
          </a>

          <nav
            className='navLinks'
            aria-label='Primary'
          >
            <a
              data-nav-item
              href='#'
            >
              Studio
            </a>
            <a
              data-nav-item
              href='#'
            >
              Features
            </a>
            <a
              data-nav-item
              href='#'
            >
              Process
            </a>
            <a
              data-nav-item
              href='#'
            >
              Stories
            </a>
            <a
              data-nav-item
              href='#'
            >
              Journal
            </a>
          </nav>

          <div className={styles.navActions}>
            <a
              className={`${styles.button} ${styles.buttonGhost}`}
              data-nav-item
              href='#'
            >
              Sign In
            </a>

            <a
              className={`${styles.button} ${styles.buttonLight}`}
              data-nav-item
              href='#'
            >
              Start Creating
            </a>
          </div>
        </header>

        <div className={styles.heroContent}>
          <div className='heroBadge'>
            <svg
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M8 0.5 C 8.7 4.5 9.5 6.3 11.5 7 L 15.5 8 L 11.5 9 C 9.5 9.7 8.7 11.5 8 15.5 C 7.3 11.5 6.5 9.7 4.5 9 L 0.5 8 L 4.5 7 C 6.5 6.3 7.3 4.5 8 0.5 Z'
                fill='#e8e8e8'
              />
            </svg>

            <span>Where light meets intelligence.</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className='heroLine'>Create Beyond</span>
            <span className='heroLine'>The Edge Of</span>
            <span className='heroLine'>Imagination.</span>
          </h1>

          <a
            className={`${styles.button} ${styles.buttonLight} ctaButton`}
            href='#'
          >
            Start Creating
          </a>
        </div>

        <footer className={styles.heroFooter}>
          <p className='heroDescription'>Lumina is an AI creative studio that senses your direction and moves with you — turning raw ideas into finished visuals at the speed of thought.</p>

          <div className='heroTrust'>
            <div className={styles.avatars}>
              <span className={styles.avatar} />
              <span className={styles.avatar} />
              <span className={styles.avatar} />
              <span className={styles.avatar} />
            </div>

            <span className={styles.heroTrustText}>Trusted by 40k+ visionaries.</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
