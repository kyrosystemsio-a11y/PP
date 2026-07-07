'use client';

/**
 * BaptismSpinnerHero — scroll-driven interactive 3D hero (React Three Fiber)
 * ---------------------------------------------------------------------------
 * The 12-second hero film rebuilt as real-time 3D: scroll position IS the
 * timeline. Same seven beats as the Seedance master, spec-exact to the
 * BAPTISM reference sheet:
 *
 *   1. IDLE SPIN        spinner rotates, ribbon tail hangs
 *   2. TAIL LOOSENS     satin tail loosens and drops
 *   3. FIRST UNWRAP     top ribbon layer peels away
 *   4. LAYERS CONTINUE  all 11 layers unwrap in top-to-bottom order
 *   5. FINAL REVEAL     interior structure + warm glow revealed
 *   6. MONEY RELEASE    graceful slow-motion prop-money cascade
 *   7. MONEY FLOATS     bills drift, settle; camera pulls back
 *
 * Everything is a pure function of (scrollProgress, time), so scrubbing
 * backwards re-wraps the spinner. Deterministic, 60fps, instanced.
 *
 * Deps: react, three, @react-three/fiber  (no drei, no external assets —
 * all textures are generated on a <canvas> at mount).
 *
 * Usage (Next.js App Router):
 *   import BaptismSpinnerHero from '@/components/BaptismSpinnerHero';
 *   export default function Page(){ return <><BaptismSpinnerHero /> ...rest of page </>; }
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

/* ============================================================
 * SPEC CONSTANTS — BAPTISM reference sheet
 * ============================================================ */
const LAYERS = 11;              // exactly 11 ribbon layers
const POSTS = 5;                // 5 square birch posts, 72° apart
const MEDALLION_REPEAT = 2;     // pattern repeated front/back for 360° orbit (1 = strict 18 medallions)
const BODY_H = 2.55;
const BODY_R = 0.82;
const PLATFORM_R = 0.95;
const PLATFORM_H = 0.075;
const BILL_COUNT = 132;

/* Scroll phase map (progress 0→1) — mirrors the film's beat timing */
const P = {
  fadeIn: [0.0, 0.07] as const,
  tail:   [0.16, 0.26] as const,
  unwrap: [0.26, 0.62] as const,
  money:  [0.56, 0.9] as const,
  settle: [0.86, 1.0] as const,
};
const span = (s: number, [a, b]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (s - a) / (b - a)));
const ease = (t: number) => t * t * (3 - 2 * t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/* ============================================================
 * CANVAS TEXTURES — birch, satin, medallion, prop bills, shadow
 * ============================================================ */
function makeTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function birchTexture() {
  const t = makeTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#d9b98c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      const y = Math.random() * h, len = 60 + Math.random() * 300, a = 0.05 + Math.random() * 0.1;
      g.strokeStyle = `rgba(${120 + (Math.random() * 40 | 0)},${86 + (Math.random() * 30 | 0)},${50 + (Math.random() * 20 | 0)},${a})`;
      g.lineWidth = 0.6 + Math.random() * 1.6;
      g.beginPath(); g.moveTo(Math.random() * w, y);
      g.bezierCurveTo(Math.random() * w, y + Math.random() * 8 - 4, Math.random() * w, y + Math.random() * 8 - 4, Math.random() * w + len, y + Math.random() * 10 - 5);
      g.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 4 + Math.random() * 7;
      g.fillStyle = 'rgba(110,78,44,.25)';
      g.beginPath(); g.ellipse(x, y, r * 1.6, r, Math.random(), 0, 7); g.fill();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function satinTexture() {
  return makeTexture(256, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.28, '#efece6');
    grad.addColorStop(0.5, '#fbfaf7'); grad.addColorStop(0.74, '#e7e2da'); grad.addColorStop(1, '#f4f1ea');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, h * 0.42, w, 3);
  });
}

/* Ornate chrome cross medallion — spec §3 */
function medallionTexture() {
  return makeTexture(256, 256, (g, w, h) => {
    const cx = w / 2, cy = h / 2;
    g.clearRect(0, 0, w, h);
    const disc = g.createRadialGradient(cx - 30, cy - 34, 10, cx, cy, 120);
    disc.addColorStop(0, '#ffffff'); disc.addColorStop(0.45, '#dfe3ea');
    disc.addColorStop(0.8, '#aab0bc'); disc.addColorStop(1, '#7d8492');
    g.fillStyle = disc; g.beginPath(); g.arc(cx, cy, 118, 0, 7); g.fill();
    g.strokeStyle = '#b9954f'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, 104, 0, 7); g.stroke();
    g.strokeStyle = '#6d737f'; g.lineWidth = 10; g.setLineDash([5, 7]);
    g.beginPath(); g.arc(cx, cy, 90, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#585f6c'; g.strokeStyle = '#3f4550'; g.lineWidth = 2;
    const arm = (x: number, y: number, ww: number, hh: number) => {
      g.beginPath();
      g.moveTo(x - ww * 0.32, y - hh / 2); g.lineTo(x + ww * 0.32, y - hh / 2);
      g.lineTo(x + ww / 2, y + hh / 2); g.lineTo(x - ww / 2, y + hh / 2);
      g.closePath(); g.fill(); g.stroke();
    };
    g.save(); g.translate(cx, cy);
    arm(0, -38, 34, 44);
    g.save(); g.rotate(Math.PI); arm(0, -42, 34, 52); g.restore();
    g.save(); g.rotate(Math.PI / 2); arm(0, -38, 34, 44); g.restore();
    g.save(); g.rotate(-Math.PI / 2); arm(0, -38, 34, 44); g.restore();
    g.fillStyle = '#8d94a2'; g.beginPath(); g.arc(0, 0, 15, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(-5, -6, 5, 0, 7); g.fill();
    g.restore();
  });
}

/* Clearly-fictional SpinnerPiñata prop notes — spec §6 (40/30/30 mix) */
function billTexture(denom: string, tint: string) {
  return makeTexture(512, 224, (g, w, h) => {
    g.fillStyle = tint; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(30,50,38,.8)'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    g.strokeStyle = 'rgba(30,50,38,.35)'; g.lineWidth = 2; g.strokeRect(20, 20, w - 40, h - 40);
    g.strokeStyle = 'rgba(30,50,38,.18)';
    for (let i = 0; i < 10; i++) {
      g.beginPath();
      for (let x = 24; x < w - 24; x += 8) g.lineTo(x, 30 + i * 17 + Math.sin(x * 0.06 + i) * 6);
      g.stroke();
    }
    g.fillStyle = 'rgba(240,244,238,.9)'; g.beginPath(); g.arc(w / 2, h / 2, 56, 0, 7); g.fill();
    g.strokeStyle = 'rgba(30,50,38,.7)'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, 56, 0, 7); g.stroke();
    g.setLineDash([4, 5]); g.beginPath(); g.arc(w / 2, h / 2, 46, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(30,50,38,.85)';
    g.fillRect(w / 2 - 5, h / 2 - 30, 10, 60); g.fillRect(w / 2 - 22, h / 2 - 12, 44, 10);
    g.fillStyle = 'rgba(24,42,32,.92)';
    g.font = '700 52px Georgia, serif';
    g.textAlign = 'left'; g.fillText(denom, 26, 78);
    g.textAlign = 'right'; g.fillText(denom, w - 26, h - 34);
    g.font = '600 17px Georgia, serif'; g.textAlign = 'center';
    g.fillText('SPINNERPIÑATA PROP NOTE', w / 2, 42);
    g.font = '500 11px Georgia, serif';
    g.fillText('FOR CELEBRATION ONLY · NOT LEGAL TENDER', w / 2, h - 24);
  });
}

function shadowTexture() {
  return makeTexture(256, 256, (g, w, h) => {
    const rad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    rad.addColorStop(0, 'rgba(0,0,0,.5)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rad; g.fillRect(0, 0, w, h);
  });
}

/* ============================================================
 * SHARED MUTABLE STATE (refs, no re-renders on the hot path)
 * ============================================================ */
type HeroState = {
  target: number; smooth: number;
  mouseX: number; mouseY: number;
  dragging: boolean; lastX: number; dragVel: number; dragRot: number;
  reduced: boolean;
};

type CopyRefs = {
  eyebrow: React.RefObject<HTMLDivElement | null>;
  h1: React.RefObject<HTMLHeadingElement | null>;
  sub: React.RefObject<HTMLParagraphElement | null>;
  ctas: React.RefObject<HTMLDivElement | null>;
  hint: React.RefObject<HTMLDivElement | null>;
};

/* ============================================================
 * WORLD — built imperatively once, driven per-frame
 * ============================================================ */
type LayerData = { group: THREE.Group; baseY: number; dir: number; mats: THREE.Material[] };
type BillSeed = { a: number; vr: number; vy: number; delay: number; s1: number; s2: number; w1: number; w2: number; flut: number; cam: boolean };

function buildWorld() {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  const spinner = new THREE.Group();
  rig.add(spinner); root.add(rig);

  const birch = new THREE.MeshStandardMaterial({ map: birchTexture(), roughness: 0.62, metalness: 0.05 });
  const satinMap = satinTexture();
  const medallionMap = medallionTexture();
  const satin = () => new THREE.MeshPhysicalMaterial({
    map: satinMap, color: 0xffffff, roughness: 0.32, metalness: 0.02,
    clearcoat: 0.55, clearcoatRoughness: 0.42, transparent: true,
  });
  const chrome = () => new THREE.MeshStandardMaterial({
    map: medallionMap, roughness: 0.22, metalness: 0.85, transparent: true,
    emissive: 0x222233, emissiveIntensity: 0.25,
  });

  /* internal structure — platforms + 5 posts (revealed at unwrap) */
  const platTop = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_R, PLATFORM_R, PLATFORM_H, 48), birch);
  platTop.position.y = BODY_H / 2 + PLATFORM_H / 2;
  const platBot = platTop.clone();
  platBot.position.y = -BODY_H / 2 - PLATFORM_H / 2;
  spinner.add(platTop, platBot);
  for (let i = 0; i < POSTS; i++) {
    const a = i * (Math.PI * 2 / POSTS);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, BODY_H, 0.11), birch);
    post.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62);
    post.rotation.y = -a;
    spinner.add(post);
  }

  /* 11 independently animatable ribbon layers */
  const layerH = BODY_H / LAYERS;
  const layers: LayerData[] = [];
  for (let i = 0; i < LAYERS; i++) {
    const g = new THREE.Group();
    const mat = satin();
    const band = new THREE.Mesh(new THREE.CylinderGeometry(BODY_R, BODY_R * 1.012, layerH * 0.96, 64, 1, true), mat);
    const foldMat = mat.clone();
    const fold = new THREE.Mesh(new THREE.TorusGeometry(BODY_R * 1.008, layerH * 0.09, 10, 64), foldMat);
    fold.rotation.x = Math.PI / 2; fold.position.y = -layerH * 0.46;
    g.add(band, fold);

    /* medallion rule — odd layers 1 centered · even layers 2 evenly L/R */
    const layerNum = i + 1;
    const angles: number[] = [];
    for (let r = 0; r < MEDALLION_REPEAT; r++) {
      const base = r * Math.PI;
      if (layerNum % 2 === 1) angles.push(base);
      else angles.push(base - 0.62, base + 0.62);
    }
    const mats: THREE.Material[] = [mat, foldMat];
    angles.forEach((a) => {
      const mm = chrome(); mats.push(mm);
      const med = new THREE.Mesh(new THREE.CircleGeometry(layerH * 0.42, 32), mm);
      const rr = BODY_R * 1.03;
      med.position.set(Math.sin(a) * rr, 0, Math.cos(a) * rr);
      med.lookAt(Math.sin(a) * rr * 2, 0, Math.cos(a) * rr * 2);
      g.add(med);
    });

    g.position.y = BODY_H / 2 - layerH / 2 - i * layerH;
    spinner.add(g);
    layers.push({ group: g, baseY: g.position.y, dir: i * 2.39996, mats });
  }

  /* ribbon tail (phase 2) */
  const tailMat = satin();
  const tailGeo = new THREE.PlaneGeometry(0.22, 1.7, 1, 24);
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(BODY_R * 0.92, -BODY_H / 2 - 0.55, 0.28);
  spinner.add(tail);
  const tailBase = (tailGeo.attributes.position.array as Float32Array).slice();

  /* gathered satin pool at base */
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_R * 1.15, PLATFORM_R * 1.32, 0.16, 48), satin());
  pool.position.y = -BODY_H / 2 - PLATFORM_H - 0.06;
  spinner.add(pool);

  /* soft contact shadow */
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -BODY_H / 2 - 0.55;
  root.add(shadow);

  /* lighting — warm key / cool fill / purple rims (spec §8) */
  const key = new THREE.DirectionalLight(0xffd9a6, 1.35); key.position.set(3.2, 4.2, 2.6);
  const fill = new THREE.DirectionalLight(0x8ea6ff, 0.42); fill.position.set(-3.4, 1.2, 1.8);
  const rimA = new THREE.DirectionalLight(0xb070ff, 0.85); rimA.position.set(-2.4, 2.6, -3.4);
  const rimB = new THREE.DirectionalLight(0x7a3bd6, 0.5); rimB.position.set(2.6, -0.6, -3.0);
  const amb = new THREE.AmbientLight(0x3d1a66, 0.75);
  const revealGlow = new THREE.PointLight(0xffd9a6, 0, 4.5, 2); revealGlow.position.set(0, 0.2, 0);
  const spot = new THREE.SpotLight(0xfff2dd, 0, 20, Math.PI / 7, 0.55, 1.2);
  spot.position.set(0, 7.5, 1.5); spot.target.position.set(0, 0, 0);
  root.add(key, fill, rimA, rimB, amb, revealGlow, spot, spot.target);

  /* god rays */
  for (let i = 0; i < 3; i++) {
    const ray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25 + i * 0.2, 1.9 + i * 0.7, 11, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x8f5ad1, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    ray.position.set((i - 1) * 0.8, 4.2, -0.6 - i * 0.4);
    ray.rotation.z = (i - 1) * 0.1;
    root.add(ray);
  }

  /* particle clouds */
  const cloud = (n: number, size: number, color: number, opacity: number, spread: number, ybase: number) => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = ybase + Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    root.add(p);
    return p;
  };
  const dust = cloud(220, 0.02, 0xd8c8ff, 0.35, 9, -3);
  const confetti = cloud(90, 0.05, 0xd4af6a, 0.22, 12, -4);
  const sparkles = cloud(180, 0.045, 0xffe9b8, 0, 0.1, 0);
  const sparkleSeeds = Array.from({ length: 180 }, () => ({
    a: Math.random() * 7, r: 0.4 + Math.random() * 0.9, v: 0.4 + Math.random() * 0.8, y: Math.random() * 0.5,
  }));

  /* prop money — 3 instanced batches, 40/30/30 */
  const billGeo = new THREE.PlaneGeometry(0.34, 0.148);
  const mkBatch = (tex: THREE.Texture, count: number) => {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, transparent: true });
    const im = new THREE.InstancedMesh(billGeo, m, count);
    im.frustumCulled = false;
    root.add(im);
    return im;
  };
  const bills = [
    mkBatch(billTexture('20', '#c9d4bd'), Math.round(BILL_COUNT * 0.4)),
    mkBatch(billTexture('50', '#d6cfc0'), Math.round(BILL_COUNT * 0.3)),
    mkBatch(billTexture('100', '#bccfc4'), Math.round(BILL_COUNT * 0.3)),
  ];
  const billSeeds: BillSeed[][] = bills.map((b) =>
    Array.from({ length: b.count }, () => ({
      a: Math.random() * Math.PI * 2,
      vr: 0.9 + Math.random() * 1.9,
      vy: 1.4 + Math.random() * 2.2,
      delay: Math.random() * 0.38,
      s1: Math.random() * 7, s2: Math.random() * 7,
      w1: 2 + Math.random() * 6, w2: 2 + Math.random() * 6,
      flut: 0.4 + Math.random() * 0.9,
      cam: Math.random() < 0.12,
    }))
  );

  return { root, rig, spinner, layers, layerH, tail: { geo: tailGeo, base: tailBase, mat: tailMat }, revealGlow, spot, dust, confetti, sparkles, sparkleSeeds, bills, billSeeds };
}

/* ============================================================
 * SCENE — per-frame choreography (pure fn of progress + time)
 * ============================================================ */
function SpinnerScene({ stateRef, copy }: { stateRef: React.MutableRefObject<HeroState>; copy: CopyRefs }) {
  const world = useMemo(buildWorld, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { gl, camera, size } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width / size.height < 0.8 ? 42 : 34; // mobile: fit full spinner
    cam.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => () => {
    world.root.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
  }, [world]);

  const setCopy = (el: HTMLElement | null, t: number) => {
    if (!el) return;
    el.style.opacity = String(t);
    el.style.transform = `translateY(${(1 - t) * 16}px)`;
  };

  useFrame((st) => {
    const S = stateRef.current;
    const t = st.clock.getElapsedTime();
    S.smooth += (S.target - S.smooth) * 0.075;
    const s = S.reduced ? 0 : S.smooth;
    const W = world;

    /* intro fade / spotlight */
    const fin = ease(span(s, P.fadeIn));
    gl.toneMappingExposure = S.reduced ? 1.12 : 0.25 + fin * 0.87 + ease(span(s, P.money)) * 0.08;
    W.spot.intensity = (1 - fin) * 1.6;

    /* idle spin + drag inertia */
    if (!S.dragging) { S.dragVel *= 0.94; S.dragRot += S.dragVel; }
    W.spinner.rotation.y = t * 0.22 + s * 2.4 + S.dragRot;

    /* subtle pointer parallax */
    W.rig.rotation.y += (S.mouseX * 0.16 - W.rig.rotation.y) * 0.05;
    W.rig.rotation.x += (S.mouseY * 0.06 - W.rig.rotation.x) * 0.05;

    /* phase 2 — tail loosens */
    const tl = ease(span(s, P.tail));
    const pos = W.tail.geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const y0 = W.tail.base[i + 1];
      const k = 0.85 - y0;
      pos[i] = W.tail.base[i] + Math.sin(t * 1.4 + k * 2.2) * 0.05 * k * (0.4 + tl) + tl * k * 0.34;
      pos[i + 1] = y0 - tl * k * 0.42;
      pos[i + 2] = W.tail.base[i + 2] + Math.cos(t * 1.1 + k * 1.8) * 0.045 * k * (0.4 + tl) + tl * k * 0.2;
    }
    W.tail.geo.attributes.position.needsUpdate = true;
    (W.tail.mat as THREE.MeshPhysicalMaterial).opacity = 1 - ease(span(s, [P.unwrap[0] + 0.04, P.unwrap[0] + 0.12]));

    /* phases 3–5 — sequential unwrap, top → bottom */
    const per = (P.unwrap[1] - P.unwrap[0]) / LAYERS;
    W.layers.forEach((L, i) => {
      const st0 = P.unwrap[0] + i * per;
      const p = Math.min(1, Math.max(0, (s - st0) / (per * 1.9)));
      const e1 = easeOutCubic(p);
      L.group.position.x = Math.cos(L.dir) * e1 * 2.9;
      L.group.position.z = Math.sin(L.dir) * e1 * 2.9;
      L.group.position.y = L.baseY + Math.sin(p * Math.PI) * 0.34 - p * p * 1.7;
      L.group.rotation.y = e1 * e1 * 9;
      L.group.rotation.z = Math.cos(L.dir) * e1 * 0.8;
      L.group.rotation.x = Math.sin(L.dir) * e1 * 0.6;
      const op = 1 - ease(Math.max(0, (p - 0.55) / 0.45));
      L.mats.forEach((m) => { (m as THREE.Material & { opacity: number }).opacity = op; });
      L.group.visible = op > 0.01;
    });

    /* interior reveal glow */
    W.revealGlow.intensity = ease(span(s, [0.5, 0.66])) * 1.3 * (1 - ease(span(s, [0.92, 1])) * 0.5);

    /* sparkles keyed to unwrap windows */
    const sp = W.sparkles.geometry.attributes.position.array as Float32Array;
    let sparkleAlpha = 0;
    for (let i = 0; i < W.sparkleSeeds.length; i++) {
      const seed = W.sparkleSeeds[i];
      const li = i % LAYERS;
      const st0 = P.unwrap[0] + li * per;
      const p = Math.min(1, Math.max(0, (s - st0) / (per * 2.2)));
      const y = BODY_H / 2 - (li + 0.5) * W.layerH;
      sp[i * 3] = Math.cos(seed.a) * (0.6 + seed.r * p * 2.2);
      sp[i * 3 + 1] = y + seed.y + p * seed.v - p * p * 0.8;
      sp[i * 3 + 2] = Math.sin(seed.a) * (0.6 + seed.r * p * 2.2);
      if (p > 0 && p < 1) sparkleAlpha = Math.max(sparkleAlpha, Math.sin(p * Math.PI));
    }
    W.sparkles.geometry.attributes.position.needsUpdate = true;
    (W.sparkles.material as THREE.PointsMaterial).opacity = sparkleAlpha * 0.85;

    /* phases 6–7 — money cascade + settle */
    const m = ease(span(s, P.money));
    const settle = ease(span(s, P.settle));
    W.bills.forEach((batch, bi) => {
      const seeds = W.billSeeds[bi];
      for (let i = 0; i < batch.count; i++) {
        const sd = seeds[i];
        const tj = Math.min(1, Math.max(0, (m - sd.delay) / (1 - sd.delay)));
        if (tj <= 0) {
          dummy.position.set(0, -40, 0); dummy.updateMatrix(); batch.setMatrixAt(i, dummy.matrix);
          continue;
        }
        const tt = tj * 1.35;
        let x = Math.cos(sd.a) * sd.vr * tt + Math.sin(t * sd.flut * 2 + sd.s1) * 0.12 * tj;
        let z = Math.sin(sd.a) * sd.vr * tt + Math.cos(t * sd.flut * 1.7 + sd.s2) * 0.12 * tj;
        let y = -0.2 + sd.vy * tt - 1.55 * tt * tt + Math.sin(t * 1.2 + sd.s1) * 0.05 * tj;
        if (sd.cam) { z += tj * 3.4; y += 0.5 * tj; }
        y -= settle * 1.6 * tj;
        dummy.position.set(x, y, z);
        dummy.rotation.set(sd.s1 + t * 0.4 + tt * sd.w1, sd.s2 + tt * sd.w2, Math.sin(t * 0.9 + sd.s2) * 0.5);
        const sc = 1 - settle * 0.25;
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        batch.setMatrixAt(i, dummy.matrix);
      }
      batch.instanceMatrix.needsUpdate = true;
      (batch.material as THREE.MeshStandardMaterial).opacity = Math.min(1, m * 3) * (1 - settle * 0.75);
    });

    /* ambient drift */
    W.dust.rotation.y = t * 0.015;
    W.confetti.rotation.y = -t * 0.011;
    W.confetti.position.y = Math.sin(t * 0.2) * 0.3;

    /* camera — orbit → push-in on release → elegant pull-back */
    const orbitA = -0.5 + s * Math.PI * 1.05 + Math.sin(t * 0.05) * 0.02;
    const push = ease(span(s, [P.money[0], P.money[0] + 0.14]));
    const pull = ease(span(s, P.settle));
    const dist = 6.4 - fin * 0.9 - push * 1.1 + pull * 1.9;
    const camY = 0.35 + Math.sin(s * Math.PI) * 0.35 - push * 0.15 + pull * 0.5;
    camera.position.set(Math.sin(orbitA) * dist, camY, Math.cos(orbitA) * dist);
    camera.lookAt(0, 0.05 - push * 0.1, 0);

    /* copy choreography — fades in as the ribbon opens */
    if (!S.reduced) {
      setCopy(copy.eyebrow.current, ease(span(s, [0.22, 0.3])));
      setCopy(copy.h1.current, ease(span(s, [0.25, 0.35])));
      setCopy(copy.sub.current, ease(span(s, [0.36, 0.46])));
      const ct = ease(span(s, [0.52, 0.62]));
      setCopy(copy.ctas.current, ct);
      if (copy.ctas.current) copy.ctas.current.style.pointerEvents = ct > 0.6 ? 'auto' : 'none';
      if (copy.hint.current) copy.hint.current.style.opacity = s > 0.03 ? '0' : '1';
    }
  });

  return <primitive object={world.root} />;
}

/* ============================================================
 * PUBLIC COMPONENT
 * ============================================================ */
export interface BaptismSpinnerHeroProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  /** total scroll track height in vh (the animation timeline length) */
  trackVh?: number;
  displayFont?: string;
  bodyFont?: string;
}

export default function BaptismSpinnerHero({
  eyebrow = 'SpinnerPiñata · Baptism Collection',
  headline = 'Celebrate Every Moment',
  subheadline = 'Handcrafted SpinnerPiñatas that turn every celebration into an unforgettable experience. Beautifully wrapped. Wonderfully revealed. Built to be remembered.',
  primaryLabel = 'Build Your Spinner',
  primaryHref = '#build',
  secondaryLabel = 'Watch It Unwrap',
  trackVh = 640,
  displayFont = "'Cormorant Garamond', Georgia, serif",
  bodyFont = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}: BaptismSpinnerHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HeroState>({
    target: 0, smooth: 0, mouseX: 0, mouseY: 0,
    dragging: false, lastX: 0, dragVel: 0, dragRot: 0, reduced: false,
  });
  const [reduced, setReduced] = useState(false);

  const copy: CopyRefs = {
    eyebrow: useRef<HTMLDivElement>(null),
    h1: useRef<HTMLHeadingElement>(null),
    sub: useRef<HTMLParagraphElement>(null),
    ctas: useRef<HTMLDivElement>(null),
    hint: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => { setReduced(mq.matches); stateRef.current.reduced = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const read = () => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      stateRef.current.target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => { window.removeEventListener('scroll', read); window.removeEventListener('resize', read); };
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const S = stateRef.current;
    S.mouseX = e.clientX / window.innerWidth - 0.5;
    S.mouseY = e.clientY / window.innerHeight - 0.5;
    if (S.dragging) {
      const dx = e.clientX - S.lastX;
      S.lastX = e.clientX;
      S.dragVel = dx * 0.006;
      S.dragRot += S.dragVel;
    }
  };

  const replay = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = trackRef.current; if (!el) return;
    const top = el.offsetTop;
    window.scrollTo({ top, behavior: 'auto' });
    window.scrollTo({ top: top + el.offsetHeight * 0.88 - window.innerHeight, behavior: 'smooth' });
  };

  const copyBlock: React.CSSProperties = { opacity: reduced ? 1 : 0, transform: reduced ? 'none' : 'translateY(16px)' };

  return (
    <div ref={trackRef} style={{ height: reduced ? '100vh' : `${trackVh}vh`, position: 'relative', background: '#160427' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
        {/* royal purple studio gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 30%, #3d0a72 0%, #160427 62%, #0d0218 100%)' }} />

        <div
          onPointerMove={onPointerMove}
          onPointerDown={(e) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; }}
          onPointerUp={() => { stateRef.current.dragging = false; }}
          onPointerLeave={() => { stateRef.current.dragging = false; }}
          style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
        >
          <Canvas
            camera={{ fov: 34, near: 0.1, far: 60, position: [0, 0.35, 6.4] }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
            style={{ position: 'absolute', inset: 0 }}
          >
            <fogExp2 attach="fog" args={[0x1a0630, 0.045]} />
            <SpinnerScene stateRef={stateRef} copy={copy} />
          </Canvas>
        </div>

        {/* vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(85% 70% at 50% 45%, transparent 55%, rgba(5,1,10,.55) 100%)' }} />

        {/* hero copy — timed to the ribbon opening */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6vw 9vh', textAlign: 'center', pointerEvents: 'none', zIndex: 3, color: '#f7f5f1', fontFamily: bodyFont, fontWeight: 300 }}>
          <div ref={copy.eyebrow} style={{ ...copyBlock, fontSize: '.72rem', letterSpacing: '.42em', textTransform: 'uppercase', color: '#d4af6a', fontWeight: 500, marginBottom: '1.1rem', transition: 'none' }}>
            {eyebrow}
          </div>
          <h1 ref={copy.h1} style={{ ...copyBlock, fontFamily: displayFont, fontWeight: 500, fontSize: 'clamp(2.6rem, 7.5vw, 5.4rem)', lineHeight: 1.04, margin: 0, textShadow: '0 2px 40px rgba(10,2,20,.6)' }}>
            {headline}
          </h1>
          <p ref={copy.sub} style={{ ...copyBlock, maxWidth: '34em', marginTop: '1.2rem', fontSize: 'clamp(.92rem, 1.6vw, 1.08rem)', lineHeight: 1.65, color: 'rgba(247,245,241,.82)' }}>
            {subheadline}
          </p>
          <div ref={copy.ctas} style={{ ...copyBlock, display: 'flex', gap: '.9rem', marginTop: '1.9rem', flexWrap: 'wrap', justifyContent: 'center', pointerEvents: reduced ? 'auto' : 'none' }}>
            <a href={primaryHref} style={{ fontFamily: bodyFont, fontSize: '.82rem', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', padding: '.95rem 1.9rem', borderRadius: 100, color: '#241033', background: '#f7f5f1', boxShadow: '0 6px 30px rgba(212,175,106,.25)' }}>
              {primaryLabel}
            </a>
            <a href="#" onClick={replay} style={{ fontFamily: bodyFont, fontSize: '.82rem', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', padding: '.95rem 1.9rem', borderRadius: 100, color: '#f7f5f1', border: '1px solid rgba(212,175,106,.55)' }}>
              {secondaryLabel}
            </a>
          </div>
        </div>

        {/* scroll hint */}
        {!reduced && (
          <div ref={copy.hint} style={{ position: 'absolute', bottom: '3.2vh', left: '50%', transform: 'translateX(-50%)', zIndex: 3, fontSize: '.68rem', letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(247,245,241,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem', fontFamily: bodyFont, transition: 'opacity .6s' }}>
            <span>Scroll to unwrap</span>
            <span style={{ width: 1, height: 34, background: 'linear-gradient(rgba(212,175,106,.9), transparent)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
