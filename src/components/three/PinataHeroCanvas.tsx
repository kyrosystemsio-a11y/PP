"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep, seededRandom } from "@/lib/three-easing";

const WOOD_COLOR = "#c9974c";
const ROPE_COLOR = "#e3d3b6";
// TODO(color-match): swap these for the real ribbon hex values once the
// client's reference photos are in — currently approximate brand colors.
const RIBBON_COLORS = ["#e7b740", "#ff4fa3", "#7ec8e3"];
const LED_COLORS = ["#ff5b5b", "#ffcc00", "#4ddd6a", "#4da6ff", "#caa6ff"];
const CONFETTI_COLORS = ["#b5472b", "#e7b740", "#f6d678", "#1f8a4c", "#2459c7", "#f3a0c2"];
const CANDY_COLORS = ["#ff3b3b", "#ffd23f", "#3fa9f5", "#7ed957", "#ff7fb7", "#ff9f1c"];

const CAGE_RADIUS = 0.78;
const CAGE_HALF_HEIGHT = 1.85;
const PLATFORM_RADIUS = CAGE_RADIUS * 0.92;
const PLATFORM_THICKNESS = 0.12;
const DOWEL_RADIUS = 0.055;
// Five sticks/ribbons total, matching the real product (was 4).
const DOWEL_COUNT = 5;

const BAND_COUNT = 16;
const LED_RING_COUNT = 5;
const LEDS_PER_RING = 10;
const CONFETTI_COUNT = 40;
const CANDY_COUNT = 70;

// The wooden lantern cage (platforms + corner dowels) the ribbon is wound
// around. It's always present — the ribbon bands simply hide it until they
// unravel away.
function CageFrame() {
  const platformYs = [CAGE_HALF_HEIGHT, 0, -CAGE_HALF_HEIGHT];
  const dowelAngles = Array.from(
    { length: DOWEL_COUNT },
    (_, i) => (i / DOWEL_COUNT) * Math.PI * 2 + Math.PI / 4
  );

  return (
    <group>
      {platformYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_THICKNESS, 24]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} />
        </mesh>
      ))}
      {dowelAngles.map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(angle) * (CAGE_RADIUS - 0.07),
            0,
            Math.cos(angle) * (CAGE_RADIUS - 0.07),
          ]}
        >
          <cylinderGeometry
            args={[DOWEL_RADIUS, DOWEL_RADIUS, CAGE_HALF_HEIGHT * 2 + PLATFORM_THICKNESS, 12]}
          />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, CAGE_HALF_HEIGHT + 0.9, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
        <meshStandardMaterial color={ROPE_COLOR} roughness={0.9} />
      </mesh>
    </group>
  );
}

interface BandDatum {
  y: number;
  height: number;
  color: string;
  unravelAt: number;
  fallDistance: number;
  spin: number;
  drift: number;
}

// The continuous wound ribbon, modelled as stacked open-ended cylinder
// shells that peel off bottom-to-top as the ribbon is "pulled".
function RibbonBands({ progress }: { progress: { current: number } }) {
  const bands = useMemo<BandDatum[]>(() => {
    const totalHeight = CAGE_HALF_HEIGHT * 2 - PLATFORM_THICKNESS * 2;
    const bandHeight = totalHeight / BAND_COUNT;
    return Array.from({ length: BAND_COUNT }).map((_, i) => ({
      y: CAGE_HALF_HEIGHT - PLATFORM_THICKNESS - bandHeight * (i + 0.5),
      height: bandHeight * 0.96,
      color: RIBBON_COLORS[i % RIBBON_COLORS.length],
      unravelAt: i / BAND_COUNT,
      fallDistance: 1.6 + seededRandom(i + 0.12) * 1.2,
      spin: (seededRandom(i + 0.46) - 0.5) * 7,
      drift: 0.5 + seededRandom(i + 0.63) * 0.9,
    }));
  }, []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    bands.forEach((band, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(band.unravelAt, band.unravelAt + 1 / BAND_COUNT, p);

      const outward = localT * band.drift;
      mesh.position.set(
        Math.sin(t * 0.6 + i) * outward * 0.3,
        band.y - localT * localT * band.fallDistance,
        Math.cos(t * 0.6 + i) * outward * 0.3
      );
      mesh.rotation.x = localT * band.spin;
      mesh.rotation.z = localT * band.spin * 0.5;
      mesh.scale.setScalar(1 - 0.25 * localT);

      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 1 - smoothstep(0.75, 1, localT);
    });
  });

  return (
    <group>
      {bands.map((band, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[0, band.y, 0]}>
          <cylinderGeometry args={[CAGE_RADIUS + 0.03, CAGE_RADIUS + 0.03, band.height, 32, 1, true]} />
          <meshStandardMaterial
            color={band.color}
            transparent
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// The loose ribbon tail hanging from the bottom that "grows" as it's pulled,
// then gets used up once the cage is fully unwound.
function PullTail({ progress }: { progress: { current: number } }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const grow = smoothstep(0, 0.45, p) * (1 - smoothstep(0.85, 1, p));
    const length = 0.3 + grow * 2.4;
    mesh.current.scale.set(1, length, 1);
    mesh.current.position.set(
      Math.sin(t * 1.2) * 0.05,
      -CAGE_HALF_HEIGHT - length / 2,
      CAGE_RADIUS * 0.6
    );
    mesh.current.rotation.z = Math.sin(t * 1.2) * 0.08;
    const material = mesh.current.material as THREE.MeshStandardMaterial;
    material.opacity = grow;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.16, 1, 0.02]} />
      <meshStandardMaterial color={RIBBON_COLORS[0]} transparent roughness={0.3} />
    </mesh>
  );
}

interface LedDatum {
  angle: number;
  y: number;
  color: string;
  phase: number;
}

// Mini glowing LED points woven through the ribbon at several heights.
function GlowLights({ progress }: { progress: { current: number } }) {
  const leds = useMemo<LedDatum[]>(() => {
    const ringYs = Array.from(
      { length: LED_RING_COUNT },
      (_, i) => CAGE_HALF_HEIGHT * 0.85 - (i / (LED_RING_COUNT - 1)) * CAGE_HALF_HEIGHT * 1.7
    );
    return ringYs.flatMap((y, ringIndex) =>
      Array.from({ length: LEDS_PER_RING }).map((_, j) => {
        const seed = ringIndex * LEDS_PER_RING + j;
        return {
          angle: (j / LEDS_PER_RING) * Math.PI * 2 + ringIndex * 0.3,
          y,
          color: LED_COLORS[seed % LED_COLORS.length],
          phase: seededRandom(seed + 0.19) * Math.PI * 2,
        };
      })
    );
  }, []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const fade = 1 - smoothstep(0.85, 1, p);
    leds.forEach((led, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const pulse = 0.6 + 0.4 * Math.sin(t * 3 + led.phase);
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = fade;
      material.emissiveIntensity = pulse * fade * 1.4;
    });
  });

  return (
    <group>
      {leds.map((led, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[
            Math.sin(led.angle) * (CAGE_RADIUS + 0.05),
            led.y,
            Math.cos(led.angle) * (CAGE_RADIUS + 0.05),
          ]}
        >
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial
            color={led.color}
            emissive={led.color}
            emissiveIntensity={1}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

interface ConfettiDatum {
  direction: THREE.Vector3;
  fireAt: number;
  speed: number;
  color: string;
  spin: number;
}

function ConfettiBurst({ progress }: { progress: { current: number } }) {
  const pieces = useMemo<ConfettiDatum[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const theta = seededRandom(i + 0.13) * Math.PI * 2;
        const phi = Math.acos(2 * seededRandom(i + 0.49) - 1);
        return {
          direction: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.abs(Math.sin(phi) * Math.sin(theta)) * 0.6 + 0.2,
            Math.cos(phi)
          ),
          fireAt: seededRandom(i + 0.82) * 0.85,
          speed: 1.5 + seededRandom(i + 0.27) * 2,
          color:
            CONFETTI_COLORS[
              Math.floor(seededRandom(i + 0.65) * CONFETTI_COLORS.length)
            ],
          spin: (seededRandom(i + 0.91) - 0.5) * 10,
        };
      }),
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const p = progress.current;
    pieces.forEach((piece, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.3), p);
      const travel = localT * piece.speed;
      mesh.position.set(
        piece.direction.x * travel,
        piece.direction.y * travel - localT * localT * 1.6,
        piece.direction.z * travel
      );
      mesh.rotation.x = travel * piece.spin;
      mesh.rotation.y = travel * piece.spin * 0.5;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = localT <= 0 ? 0 : 1 - smoothstep(0.6, 1, localT);
    });
  });

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <tetrahedronGeometry args={[0.06]} />
          <meshStandardMaterial color={piece.color} transparent />
        </mesh>
      ))}
    </group>
  );
}

interface CandyDatum {
  angle: number;
  outRadius: number;
  fireAt: number;
  fallSpeed: number;
  color: string;
  spin: number;
  scale: number;
}

// Candy raining out 360° once the ribbon wall has opened enough to let it
// escape, like the real dispenser mechanic.
function CandySpill({ progress }: { progress: { current: number } }) {
  const pieces = useMemo<CandyDatum[]>(
    () =>
      Array.from({ length: CANDY_COUNT }).map((_, i) => ({
        angle: seededRandom(i + 0.21) * Math.PI * 2,
        outRadius: 0.12 + seededRandom(i + 0.77) * 0.85,
        fireAt: 0.3 + seededRandom(i + 0.44) * 0.6,
        fallSpeed: 1.3 + seededRandom(i + 0.61) * 1.7,
        color:
          CANDY_COLORS[Math.floor(seededRandom(i + 0.33) * CANDY_COLORS.length)],
        spin: (seededRandom(i + 0.88) - 0.5) * 8,
        scale: 0.55 + seededRandom(i + 0.5) * 0.55,
      })),
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const p = progress.current;
    pieces.forEach((piece, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.4), p);
      const spread = localT * piece.outRadius;
      const fall = localT * localT * piece.fallSpeed * 3.4;
      mesh.position.set(
        Math.sin(piece.angle) * spread,
        -CAGE_HALF_HEIGHT * 0.15 - fall,
        Math.cos(piece.angle) * spread
      );
      mesh.rotation.x = fall * piece.spin;
      mesh.rotation.z = fall * piece.spin * 0.7;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = localT <= 0 ? 0 : 1 - smoothstep(0.85, 1, localT);
    });
  });

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          scale={piece.scale}
        >
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={piece.color} transparent roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function PinataBody({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y = state.clock.elapsedTime * 0.15 + p * Math.PI * 1.4;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08 - p * 0.5;
  });

  return (
    <group ref={group}>
      <CageFrame />
      <GlowLights progress={progress} />
      <RibbonBands progress={progress} />
      <PullTail progress={progress} />
      <ConfettiBurst progress={progress} />
      <CandySpill progress={progress} />
    </group>
  );
}

export default function PinataHeroCanvas({
  progress,
}: {
  progress: { current: number };
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 6.6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color="#e7b740" />
      <PinataBody progress={progress} />
    </Canvas>
  );
}
