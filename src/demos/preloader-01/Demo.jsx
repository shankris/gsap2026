/* src/demos/preloader-01/Demo.jsx */

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import styles from "./Demo.module.css";

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase, SplitText);

const STACK_IMAGES = ["https://picsum.photos/seed/mfa1/1280/800", "https://picsum.photos/seed/mfa2/1280/800", "https://picsum.photos/seed/mfa3/1280/800", "https://picsum.photos/seed/mfa4/1280/800", "https://picsum.photos/seed/mfa5/1280/800"];

const HERO_IMAGE = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1600&auto=format&fit=crop";

const VERTEX_SHADER = `
  uniform vec4 uVel;
  uniform vec2 uPlaneSize;
  uniform vec2 uGrabCorner;
  uniform float uLagPower;
  uniform float uZDip;
  uniform float uBow;
  uniform float uRippleAmp;
  uniform float uRippleFreq;
  uniform float uRippleSpeed;
  uniform float uWrinkleAmp;
  uniform float uWrinkleFreq;
  uniform float uTime;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vec3 pos = position;

    vec2 vvel = vec2(
      uVel.x + uv.x * uVel.z,
      uVel.y + (1.0 - uv.y) * uVel.w
    );

    vec2 cvel = vec2(
      uVel.x + 0.5 * uVel.z,
      uVel.y + 0.5 * uVel.w
    );

    float velMag = length(cvel);
    float d = distance(uv, uGrabCorner) / 1.4142135;
    float lag = pow(d, uLagPower);

    pos.x -= vvel.x * lag / uPlaneSize.x;
    pos.y += vvel.y * lag / uPlaneSize.y;

    pos.y += sin(uv.x * 3.141592653) * cvel.x * uBow / uPlaneSize.y;
    pos.x -= sin(uv.y * 3.141592653) * cvel.y * uBow / uPlaneSize.x;

    pos.z -= length(vvel) * lag * uZDip;

    pos.z += sin(d * uRippleFreq * 6.2831853 - uTime * uRippleSpeed)
      * uRippleAmp * (velMag / 100.0) * d;

    pos.z += sin(uv.x * uWrinkleFreq * 6.2831853 + uTime * 2.0)
      * sin(uv.y * uWrinkleFreq * 4.7 + uTime * 1.3)
      * uWrinkleAmp * (velMag / 100.0);

    vDepth = pos.z;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uPlaneSize;
  uniform vec2 uImageSize;
  uniform float uRadius;
  uniform vec3 uColorDark;
  uniform vec3 uColorLight;
  uniform float uShade;
  uniform float uReveal;
  uniform float uAlpha;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    float rs = uPlaneSize.x / uPlaneSize.y;
    float ri = uImageSize.x / uImageSize.y;

    vec2 st = rs < ri
      ? vec2(uImageSize.x * uPlaneSize.y / uImageSize.y, uPlaneSize.y)
      : vec2(uPlaneSize.x, uImageSize.y * uPlaneSize.x / uImageSize.x);

    vec2 offset = (st - uPlaneSize) * 0.5;
    vec2 uv = (vUv * uPlaneSize + offset) / st;

    vec4 tex = texture2D(uTexture, uv);

    float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 duotone = mix(uColorDark, uColorLight, luma);

    float w = smoothstep(
      0.1,
      0.9,
      uReveal * 1.8 - (1.0 - vUv.x) * 0.8
    );

    vec3 color = mix(duotone, tex.rgb, w);

    float shade = clamp(vDepth * 0.004, -0.5, 0.5) * uShade;
    color *= 1.0 + shade;

    vec2 p = (vUv - 0.5) * uPlaneSize;
    vec2 b = uPlaneSize * 0.5 - vec2(uRadius);
    vec2 d = abs(p) - b;

    float dist =
      length(max(d, 0.0)) +
      min(max(d.x, d.y), 0.0) -
      uRadius;

    float alpha = 1.0 - smoothstep(-1.0, 1.0, dist);

    gl_FragColor = vec4(color, alpha * uAlpha);
  }
`;

const DEFORM = {
  intensity: 10.83,
  maxPull: 551,
  lagPower: 0.73,
  corner: "top-right",
  stiffness: 0.085,
  damping: 0.4,
  zDip: 1.5,
  bow: 0.17,
  tilt: 0.24,
  shade: 0.38,
  rippleAmp: 29,
  rippleFreq: 1.45,
  rippleSpeed: 13.5,
  wrinkleAmp: 0,
  wrinkleFreq: 15,
  colorReveal: true,
};

const CORNERS = {
  "top-right": [1, 1],
  "top-left": [0, 1],
  "bottom-right": [1, 0],
  "bottom-left": [0, 0],
  center: [0.5, 0.5],
};

export default function Demo() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let booted = false;
    let snapping = false;
    let flipTween = null;
    let revealTween = null;
    let zoneCache = null;
    let wheelHeat = 0;
    let lastWheelAt = 0;
    let maxDPR = 1;
    let sampleFrames = 0;
    let slowFrames = 0;
    let glDirty = true;
    let renderer = null;
    let lenis = null;
    let titleSplit = null;
    let textSplit = null;
    let loaderTimeline = null;
    let resizeObserver = null;

    const cleanups = [];
    const clothPlanes = [];
    const stackPlanes = [];

    const query = (selector) => root.querySelector(selector);
    const queryAll = (selector) => [...root.querySelectorAll(selector)];

    const mediaCard = query(`.${styles.mediaCardHero}`);
    const homeSlot = query(`.${styles.mediaSlotHome}`);
    const awaySlot = query(`.${styles.mediaSlotAway}`);
    const approachSection = query(`.${styles.approach}`);
    const siteHeader = query(`.${styles.siteHeader}`);
    const menuBtn = query(`.${styles.menuBtn}`);
    const loaderEl = query(`.${styles.loader}`);
    const loaderCount = query(`.${styles.loaderCount}`);
    const loaderSlot = query(`.${styles.mediaSlotLoader}`);
    const stackCards = queryAll(`.${styles.mediaCardStack}`);
    const heroHeader = siteHeader;
    const pillBtn = query(`.${styles.approachContent} .${styles.pillBtn}`);
    const metaEl = query(`.${styles.approachMeta}`);
    const statEls = queryAll(`.${styles.approachStat}`);
    const mediaImg = mediaCard?.querySelector("img");

    if (!mediaCard || !homeSlot || !awaySlot || !approachSection || !loaderEl || !loaderSlot || !mediaImg) {
      console.error("Preloader 01: Required markup is missing.");
      return;
    }

    const addListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };

    const markGLDirty = () => {
      glDirty = true;
    };

    const getCardRadius = (el) => parseFloat(getComputedStyle(el).borderRadius) || 0;

    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4;

    maxDPR = lowEnd ? 1 : 2;

    const segments = lowEnd ? 12 : 32;

    /* Custom ease */

    CustomEase.create("hardExpo", "0.82, 0, 0.18, 1");

    const hardExpoEase = gsap.parseEase("hardExpo");

    /* Lenis */

    lenis = new Lenis();

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    const lenisTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    /* Three.js setup */

    const glCanvas = document.createElement("canvas");
    glCanvas.className = styles.glCanvas;

    const GL_ATTRS = {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    };

    try {
      const glContext = glCanvas.getContext("webgl2", GL_ATTRS) || glCanvas.getContext("webgl", GL_ATTRS);

      if (glContext) {
        renderer = new THREE.WebGLRenderer({
          canvas: glCanvas,
          context: glContext,
          ...GL_ATTRS,
        });

        renderer.setClearColor(0x000000, 0);
        root.appendChild(glCanvas);
      }
    } catch {
      renderer = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 10, 4000);

    const sizeGL = () => {
      if (!renderer) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.position.z = height / (2 * Math.tan((camera.fov * Math.PI) / 360));

      camera.updateProjectionMatrix();
    };

    const planeGeometry = new THREE.PlaneGeometry(1, 1, segments, segments);

    const textureLoader = new THREE.TextureLoader();

    const createClothPlane = ({ el, src, zBase = 0, isActive, soften = 1, grabCorner = null }) => {
      if (!renderer) {
        const img = el.querySelector("img");

        const stub = {
          el,
          uniforms: {
            uReveal: { value: 0 },
            uAlpha: { value: 1 },
          },
          update: () => false,
          ready: img?.decode ? img.decode().catch(() => {}) : Promise.resolve(),
          soften,
          grabCorner,
        };

        clothPlanes.push(stub);
        return stub;
      }

      let softenValue = soften;
      let grabCornerValue = grabCorner;

      const uniforms = {
        uTexture: { value: null },
        uVel: { value: new THREE.Vector4(0, 0, 0, 0) },
        uReveal: { value: 0 },
        uAlpha: { value: 1 },
        uGrabCorner: { value: new THREE.Vector2(1, 1) },
        uLagPower: { value: 1 },
        uZDip: { value: 0 },
        uBow: { value: 0 },
        uRippleAmp: { value: 0 },
        uRippleFreq: { value: 0 },
        uRippleSpeed: { value: 0 },
        uWrinkleAmp: { value: 0 },
        uWrinkleFreq: { value: 1 },
        uShade: { value: 0 },
        uTime: { value: 0 },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uRadius: { value: getCardRadius(el) },
        uColorDark: { value: new THREE.Color("#2b2bd5") },
        uColorLight: { value: new THREE.Color("#dfe0ff") },
      };

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      });

      const mesh = new THREE.Mesh(planeGeometry, material);
      mesh.visible = false;
      mesh.renderOrder = zBase;
      scene.add(mesh);

      const ready = new Promise((resolve) => {
        textureLoader.load(
          src,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            uniforms.uTexture.value = texture;
            uniforms.uImageSize.value.set(texture.image.width, texture.image.height);

            mesh.visible = true;
            el.classList.add(styles.glActive);
            markGLDirty();
            resolve();
          },
          undefined,
          () => resolve(),
        );
      });

      let lastRect = null;
      const edgeVel = [0, 0, 0, 0];
      const edgeSpr = [0, 0, 0, 0];

      const update = (time) => {
        const rect = el.getBoundingClientRect();

        mesh.scale.set(rect.width, rect.height, 1);

        mesh.position.set(rect.left + rect.width / 2 - window.innerWidth / 2, window.innerHeight / 2 - (rect.top + rect.height / 2), 0);

        uniforms.uPlaneSize.value.set(rect.width, rect.height);

        const s = softenValue;

        uniforms.uTime.value = time;
        uniforms.uLagPower.value = DEFORM.lagPower;
        uniforms.uZDip.value = DEFORM.zDip * s;
        uniforms.uBow.value = DEFORM.bow * s;
        uniforms.uRippleAmp.value = DEFORM.rippleAmp * s;
        uniforms.uRippleFreq.value = DEFORM.rippleFreq;
        uniforms.uRippleSpeed.value = DEFORM.rippleSpeed;
        uniforms.uWrinkleAmp.value = DEFORM.wrinkleAmp * s;
        uniforms.uWrinkleFreq.value = DEFORM.wrinkleFreq;
        uniforms.uShade.value = DEFORM.shade * s;

        uniforms.uGrabCorner.value.set(...CORNERS[grabCornerValue ?? DEFORM.corner]);

        if (lastRect === null) lastRect = rect;

        const raw = [rect.left - lastRect.left, rect.top - lastRect.top, rect.width - lastRect.width, rect.height - lastRect.height];

        lastRect = rect;

        const active = isActive();

        for (let i = 0; i < 4; i++) {
          const target = active ? gsap.utils.clamp(-DEFORM.maxPull, DEFORM.maxPull, raw[i] * DEFORM.intensity * s) : 0;

          edgeSpr[i] += (target - edgeVel[i]) * DEFORM.stiffness;
          edgeSpr[i] *= DEFORM.damping;
          edgeVel[i] += edgeSpr[i];
        }

        uniforms.uVel.value.set(edgeVel[0], edgeVel[1], edgeVel[2], edgeVel[3]);

        const meanX = edgeVel[0] + 0.5 * edgeVel[2];
        const meanY = edgeVel[1] + 0.5 * edgeVel[3];

        mesh.rotation.x = meanY * DEFORM.tilt * s * 0.002;
        mesh.rotation.y = -meanX * DEFORM.tilt * s * 0.002;

        return active || raw.some((value) => value !== 0) || edgeVel.reduce((sum, value) => sum + Math.abs(value), 0) > 0.01;
      };

      const plane = {
        el,
        mesh,
        uniforms,
        update,
        ready,
        get soften() {
          return softenValue;
        },
        set soften(value) {
          softenValue = value;
        },
        get grabCorner() {
          return grabCornerValue;
        },
        set grabCorner(value) {
          grabCornerValue = value;
        },
      };

      clothPlanes.push(plane);
      return plane;
    };

    sizeGL();

    /* Hero plane */

    const heroPlane = createClothPlane({
      el: mediaCard,
      src: mediaImg.currentSrc || mediaImg.src,
      zBase: 60,
      soften: 0.35,
      isActive: () => (flipTween && flipTween.isActive()) || gsap.isTweening(mediaCard),
    });

    /* Move hero image between slots */

    const SNAP_DURATION = 1.5;
    const SNAP_DURATION_MIN = 0.6;

    const moveMediaTo = (slot, duration = SNAP_DURATION) => {
      if (disposed || slot.contains(mediaCard)) return;

      const state = Flip.getState(mediaCard);
      slot.appendChild(mediaCard);

      flipTween?.kill();

      flipTween = Flip.from(state, {
        duration,
        ease: "hardExpo",
        absolute: true,
        simple: true,
        force3D: true,
      });

      revealTween?.kill();

      revealTween = gsap.to(heroPlane.uniforms.uReveal, {
        value: slot === awaySlot && DEFORM.colorReveal ? 1 : 0,
        duration,
        ease: "power3.in",
        onUpdate: markGLDirty,
      });
    };

    /* ScrollTrigger fallback */

    ScrollTrigger.create({
      trigger: query(`.${styles.showcase}`),
      start: "top 60%",
      onEnter: () => moveMediaTo(awaySlot),
      onLeaveBack: () => moveMediaTo(homeSlot),
    });

    /* Scroll snapping */

    const EPS = 10;

    const zonePoints = () => {
      if (zoneCache) return zoneCache;

      const y = lenis.scroll;

      const home = approachSection.getBoundingClientRect().top + y - (siteHeader?.offsetHeight ?? 0);

      const rect = awaySlot.getBoundingClientRect();

      const away = rect.top + y - (window.innerHeight - rect.height) / 2;

      zoneCache = { home, away };
      return zoneCache;
    };

    const trackWheelSpeed = (event) => {
      const now = performance.now();

      wheelHeat = now - lastWheelAt > 250 ? Math.abs(event.deltaY) : wheelHeat + Math.abs(event.deltaY);

      lastWheelAt = now;
    };

    const snapDurationFor = (heat) => gsap.utils.clamp(SNAP_DURATION_MIN, SNAP_DURATION, gsap.utils.mapRange(100, 1500, SNAP_DURATION, SNAP_DURATION_MIN, heat));

    const snapTo = (target, slot, duration = SNAP_DURATION) => {
      snapping = true;

      moveMediaTo(slot, duration);

      lenis.scrollTo(target, {
        duration,
        easing: hardExpoEase,
        lock: true,
        onComplete: () => {
          snapping = false;
        },
      });
    };

    const onWheel = (event) => {
      if (!booted || snapping) {
        event.preventDefault();
        return;
      }

      trackWheelSpeed(event);

      const y = lenis.scroll;
      const { home, away } = zonePoints();
      const duration = snapDurationFor(wheelHeat);

      if (event.deltaY > 0 && y >= home - EPS && y < away - EPS) {
        event.preventDefault();
        snapTo(away, awaySlot, duration);
      } else if (event.deltaY < 0 && y > home + EPS && y <= away + EPS) {
        event.preventDefault();
        snapTo(home, homeSlot, duration);
      }
    };

    addListener(window, "wheel", onWheel, { passive: false });

    const coastDurationFor = (speed) => gsap.utils.clamp(SNAP_DURATION_MIN, SNAP_DURATION, gsap.utils.mapRange(2, 40, SNAP_DURATION, SNAP_DURATION_MIN, speed));

    const onLenisCoast = ({ scroll, velocity }) => {
      if (!booted || snapping) return;

      const { home, away } = zonePoints();

      if (scroll <= home + EPS || scroll >= away - EPS) return;

      const speed = Math.abs(velocity);

      const goingAway = speed > 1 ? velocity > 0 : scroll - home > away - scroll;

      snapTo(goingAway ? away : home, goingAway ? awaySlot : homeSlot, coastDurationFor(speed));
    };

    lenis.on("scroll", onLenisCoast);

    /* Mobile navigation */

    const setMenu = (open) => {
      const isOpen = document.documentElement.classList.contains("nav-open");

      if (isOpen === open) return;

      document.documentElement.classList.toggle("nav-open", open);

      menuBtn?.setAttribute("aria-expanded", String(open));
      menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      if (open) {
        lenis.stop();
        document.documentElement.style.overflow = "hidden";
      } else if (booted) {
        lenis.start();
        document.documentElement.style.overflow = "";
      }
    };

    if (menuBtn) {
      addListener(menuBtn, "click", () => {
        setMenu(!document.documentElement.classList.contains("nav-open"));
      });
    }

    queryAll(`.${styles.siteHeaderNav} a`).forEach((link) => {
      addListener(link, "click", () => setMenu(false));
    });

    /* Resize */

    const onResize = () => {
      zoneCache = null;

      if (window.innerWidth > 900) setMenu(false);

      sizeGL();

      for (const plane of clothPlanes) {
        if (plane.uniforms.uRadius) {
          plane.uniforms.uRadius.value = getCardRadius(plane.el);
        }
      }

      markGLDirty();
      ScrollTrigger.refresh();
    };

    addListener(window, "resize", onResize);

    /* Three.js render loop */

    const renderTicker = (time, deltaTime) => {
      let needsRender = glDirty;
      glDirty = false;

      for (const plane of clothPlanes) {
        needsRender = plane.update(time) || needsRender;
      }

      if (!renderer || !needsRender) return;

      renderer.render(scene, camera);

      if (maxDPR > 1 && window.devicePixelRatio > 1) {
        sampleFrames++;

        if (deltaTime > 25) slowFrames++;

        if (sampleFrames >= 90) {
          if (slowFrames > sampleFrames * 0.4) {
            maxDPR = Math.max(1, maxDPR - 0.5);
            sizeGL();
            markGLDirty();
          }

          sampleFrames = 0;
          slowFrames = 0;
        }
      }
    };

    gsap.ticker.add(renderTicker);

    /* Loader setup */

    titleSplit = new SplitText(query(`.${styles.approachTitle}`), {
      type: "lines",
      mask: "lines",
    });

    textSplit = new SplitText(query(`.${styles.approachText}`), {
      type: "lines",
      mask: "lines",
    });

    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    lenis.scrollTo(0, {
      immediate: true,
      force: true,
    });

    lenis.stop();

    document.documentElement.style.overflow = "hidden";

    gsap.set(heroHeader, { opacity: 0 });

    gsap.set([...titleSplit.lines, ...textSplit.lines], {
      yPercent: 110,
    });

    gsap.set(pillBtn, {
      opacity: 0,
      y: 24,
    });

    gsap.set(metaEl, { opacity: 0 });

    gsap.set(statEls, {
      opacity: 0,
      y: 24,
    });

    loaderSlot.appendChild(mediaCard);

    heroPlane.grabCorner = "top-left";
    heroPlane.uniforms.uReveal.value = 1;

    stackCards.forEach((card, index) => {
      const plane = createClothPlane({
        el: card,
        src: card.querySelector("img").src,
        zBase: (index + 1) * 3,
        soften: 0.35,
        grabCorner: index % 2 ? "top-left" : "top-right",
        isActive: () => gsap.isTweening(card),
      });

      stackPlanes.push(plane);
    });

    stackPlanes.forEach((plane) => {
      plane.uniforms.uReveal.value = 1;
    });

    const flyers = [...stackCards, mediaCard];

    flyers.forEach((el, index) => {
      const side = index % 2 ? 1 : -1;
      gsap.set(el, { x: side * window.innerWidth });
    });

    Promise.all(clothPlanes.map((plane) => plane.ready)).then(() => {
      if (disposed) return;

      const STAGGER = 0.45;
      const FLIGHT = 0.9;

      loaderTimeline = gsap.timeline({
        onComplete: finishLoader,
      });

      flyers.forEach((el, index) => {
        const side = index % 2 ? 1 : -1;

        loaderTimeline.fromTo(
          el,
          {
            x: side * (window.innerWidth / 2 + el.getBoundingClientRect().width),
          },
          {
            x: 0,
            duration: FLIGHT,
            ease: "hardExpo",
          },
          index * STAGGER,
        );
      });

      const counter = { value: 0 };

      loaderTimeline.to(
        counter,
        {
          value: 100,
          duration: loaderTimeline.duration(),
          ease: "none",
          onUpdate: () => {
            if (loaderCount) {
              loaderCount.textContent = Math.round(counter.value) + "%";
            }
          },
        },
        0,
      );
    });

    function finishLoader() {
      if (disposed) return;

      gsap.set(mediaCard, { clearProps: "x" });

      gsap.delayedCall(0.35, () => {
        if (disposed) return;

        heroPlane.soften = 0.5;
        moveMediaTo(homeSlot, 1.6);
      });

      gsap.to(loaderEl, {
        opacity: 0,
        duration: 0.7,
        delay: 0.5,
        onComplete: () => loaderEl.remove(),
      });

      gsap.to(loaderCount, {
        opacity: 0,
        duration: 0.4,
        delay: 0.35,
        onComplete: () => loaderCount.remove(),
      });

      stackPlanes.forEach((plane) => {
        gsap.to(plane.uniforms.uAlpha, {
          value: 0,
          duration: 0.55,
          delay: 0.45,
          onUpdate: markGLDirty,
          onComplete: () => {
            if (plane.mesh) scene.remove(plane.mesh);

            const index = clothPlanes.indexOf(plane);

            if (index !== -1) {
              clothPlanes.splice(index, 1);
            }

            plane.uniforms.uTexture?.value?.dispose?.();
            plane.mesh?.material?.dispose?.();

            markGLDirty();
          },
        });
      });

      gsap
        .timeline({
          delay: 0.65,
          defaults: { ease: "hardExpo" },
        })
        .to(
          heroHeader,
          {
            opacity: 1,
            duration: 1.1,
            ease: "power2.out",
          },
          0,
        )
        .to(
          titleSplit.lines,
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.09,
          },
          0,
        )
        .to(
          textSplit.lines,
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.05,
          },
          0.2,
        )
        .to(
          pillBtn,
          {
            opacity: 1,
            y: 0,
            duration: 1,
          },
          0.55,
        )
        .to(
          metaEl,
          {
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
          },
          0.65,
        )
        .to(
          statEls,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.09,
          },
          0.7,
        );

      gsap.delayedCall(2.1, () => {
        if (disposed) return;

        heroPlane.soften = 1;
        heroPlane.grabCorner = null;

        document.documentElement.style.overflow = "";

        lenis.start();
        booted = true;
      });
    }

    /* Initial page visibility */

    document.documentElement.classList.add("app-ready");

    /* Cleanup */

    return () => {
      disposed = true;

      document.documentElement.classList.remove("nav-open");
      document.documentElement.classList.remove("app-ready");
      document.documentElement.style.overflow = "";

      cleanups.forEach((cleanup) => cleanup());

      lenis.off("scroll", onLenisScroll);
      lenis.off("scroll", onLenisCoast);
      lenis.destroy();

      gsap.ticker.remove(lenisTicker);
      gsap.ticker.remove(renderTicker);

      loaderTimeline?.kill();
      flipTween?.kill();
      revealTween?.kill();

      ScrollTrigger.getAll().forEach((trigger) => {
        if (root.contains(trigger.trigger)) trigger.kill();
      });

      gsap.killTweensOf(root.querySelectorAll("*"));

      titleSplit?.revert();
      textSplit?.revert();

      clothPlanes.forEach((plane) => {
        if (plane.mesh) {
          scene.remove(plane.mesh);
          plane.mesh.geometry?.dispose();
          plane.mesh.material?.dispose();
        }

        plane.uniforms.uTexture?.value?.dispose?.();
      });

      planeGeometry.dispose();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }

      glCanvas.remove();

      if (mediaCard && !homeSlot.contains(mediaCard)) {
        homeSlot.appendChild(mediaCard);
      }

      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className={styles.demo}
    >
      <header className={styles.siteHeader}>
        <a
          href='#'
          className={styles.siteHeaderLogo}
        >
          MADEFORAWARD<sup>®</sup>
        </a>

        <nav className={styles.siteHeaderNav}>
          <a href='#'>Work</a>
          <a href='#'>Studio</a>
          <a href='#'>Contact</a>
        </nav>

        <button
          className={styles.menuBtn}
          aria-label='Open menu'
          aria-expanded='false'
          type='button'
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <section className={styles.approach}>
        <div className={`${styles.mediaSlot} ${styles.mediaSlotHome}`}>
          <figure className={`${styles.mediaCard} ${styles.mediaCardHero}`}>
            <img
              src={HERO_IMAGE}
              alt='Macro shot of flowers in blue tones'
            />
          </figure>
        </div>

        <div className={styles.approachContent}>
          <h1 className={styles.approachTitle}>We craft digital experiences that move people</h1>

          <p className={styles.approachText}>We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.</p>

          <a
            href='#'
            className={styles.pillBtn}
          >
            <span className={styles.pillBtnDot} />
            Our Approach
          </a>

          <div className={styles.approachMeta}>
            <div className={styles.approachStat}>
              <span className={styles.approachStatNum}>50+</span>
              <span className={styles.approachStatLabel}>Projects shipped</span>
            </div>

            <div className={styles.approachStat}>
              <span className={styles.approachStatNum}>12×</span>
              <span className={styles.approachStatLabel}>Design awards</span>
            </div>

            <div className={styles.approachStat}>
              <span className={styles.approachStatNum}>2016</span>
              <span className={styles.approachStatLabel}>Studio founded</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.showcase}>
        <div className={styles.showcaseContainer}>
          <div className={`${styles.mediaSlot} ${styles.mediaSlotAway}`} />
        </div>
      </section>

      <section className={styles.spacer}>
        <p>Thanks</p>
      </section>

      <div className={styles.loader}>
        <div className={styles.loaderStack}>
          {STACK_IMAGES.map((src) => (
            <figure
              className={`${styles.mediaCard} ${styles.mediaCardStack}`}
              key={src}
            >
              <img
                src={src}
                alt=''
              />
            </figure>
          ))}

          <div className={`${styles.mediaSlot} ${styles.mediaSlotLoader}`} />
        </div>
      </div>

      <div className={styles.loaderCount}>0%</div>
    </main>
  );
}
