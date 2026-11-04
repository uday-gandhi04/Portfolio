import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#cdb176';
const GOLD_LIGHT = '#ead5a0';
const FOREST = '#19372e';
const STEEL = '#49665c';
const DARK = '#0a1411';

function Portal({ z, scale = 1 }) {
  return (
    <group position={[0, 0, z]} scale={scale}>
      <mesh position={[-5.3, 2.55, 0]} castShadow>
        <boxGeometry args={[0.22, 5.1, 0.34]} />
        <meshStandardMaterial color="#263e34" metalness={0.72} roughness={0.36} />
      </mesh>
      <mesh position={[5.3, 2.55, 0]} castShadow>
        <boxGeometry args={[0.22, 5.1, 0.34]} />
        <meshStandardMaterial color="#263e34" metalness={0.72} roughness={0.36} />
      </mesh>
      <mesh position={[0, 5.1, 0]} castShadow>
        <boxGeometry args={[10.8, 0.2, 0.34]} />
        <meshStandardMaterial color="#354d40" metalness={0.7} roughness={0.38} />
      </mesh>
      <mesh position={[0, 2.56, -0.2]}>
        <torusGeometry args={[4.55, 0.035, 8, 72]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, -1.45, 0]} receiveShadow>
        <boxGeometry args={[13.5, 0.12, 2.2]} />
        <meshStandardMaterial color="#18271f" roughness={0.82} />
      </mesh>
    </group>
  );
}

function Corridor() {
  const portals = useMemo(() => Array.from({ length: 10 }, (_, i) => -i * 13.5), []);
  const floorLines = useMemo(() => Array.from({ length: 34 }, (_, i) => -i * 3.8), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, -54]} receiveShadow>
        <planeGeometry args={[25, 145]} />
        <meshStandardMaterial color="#101d18" roughness={0.88} metalness={0.12} />
      </mesh>
      <Line
        points={[[0, -1.43, 9], [0, -1.43, 0], [1.2, -1.43, -13.5], [-0.8, -1.43, -27], [0.7, -1.43, -40.5], [0, -1.43, -54], [0.8, -1.43, -67.5], [-0.5, -1.43, -81], [0, -1.43, -94.5], [0, -1.43, -108]]}
        color={GOLD}
        lineWidth={1.4}
        transparent
        opacity={0.48}
      />
      {floorLines.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, z]}>
          <planeGeometry args={[15.5, 0.018]} />
          <meshBasicMaterial color="#9c8a5d" transparent opacity={0.2} />
        </mesh>
      ))}
      {portals.map((z, i) => <Portal key={z} z={z} scale={i === 0 ? 1.06 : 1} />)}
      {Array.from({ length: 20 }, (_, i) => {
        const z = 4 - i * 6.8;
        return [-1, 1].map((side) => (
          <group key={`${i}-${side}`} position={[side * 8.4, 0, z]}>
            <mesh position={[0, 2.9, 0]} castShadow>
              <boxGeometry args={[0.34, 5.8, 0.34]} />
              <meshStandardMaterial color="#1a2b23" metalness={0.65} roughness={0.4} />
            </mesh>
            <mesh position={[0, 5.9, 0]}>
              <boxGeometry args={[0.75, 0.08, 0.75]} />
              <meshStandardMaterial color={GOLD} emissive="#6b4d1a" emissiveIntensity={0.18} />
            </mesh>
          </group>
        ));
      })}
    </group>
  );
}

function FoundationInstallation() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[4.7, 5.1, 0.38, 8]} />
        <meshStandardMaterial color="#1c3228" metalness={0.52} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[4.4, 3.2, 0.08]} />
        <meshStandardMaterial color="#29483a" metalness={0.78} roughness={0.28} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4.4, 3.2, 0.08]} />
        <meshStandardMaterial color="#49665c" metalness={0.75} roughness={0.3} transparent opacity={0.28} />
      </mesh>
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, 1.8, -0.8]} castShadow>
          <boxGeometry args={[0.18, 3.8, 0.18]} />
          <meshStandardMaterial color={GOLD} metalness={0.82} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 3.55, -0.8]}>
        <boxGeometry args={[5.8, 0.14, 0.18]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.5, 0.08]}>
        <torusGeometry args={[1.05, 0.035, 8, 72]} />
        <meshStandardMaterial color={GOLD_LIGHT} emissive="#4e3713" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function Screen({ position, rotation = [0, 0, 0], width = 2.25, height = 1.42, variant = 0 }) {
  const lineWidths = variant === 1 ? [0.62, 0.83, 0.48, 0.72] : [0.78, 0.58, 0.9, 0.43];
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.11]} />
        <meshStandardMaterial color="#18251e" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.061]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#29483b" />
      </mesh>
      <mesh position={[-width * 0.25, height * 0.2, 0.068]}>
        <planeGeometry args={[width * 0.28, height * 0.12]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      {lineWidths.map((factor, i) => (
        <mesh key={i} position={[-width * 0.15 + (i % 2) * 0.12, height * 0.02 - i * 0.2, 0.069]}>
          <planeGeometry args={[width * factor, 0.035]} />
          <meshBasicMaterial color={i === 0 ? '#b5c7b8' : '#6f8b7c'} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CollaborationInstallation() {
  return (
    <group position={[0, 0, -13.5]}>
      {[-1, 0, 1].map((x, i) => (
        <group key={x} position={[x * 3.1, 0, i === 1 ? -0.4 : 0.4]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[2.45, 0.12, 1.65]} />
            <meshStandardMaterial color="#283a2f" metalness={0.5} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.28, -0.45]}>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
            <meshStandardMaterial color="#6a5b3a" metalness={0.8} />
          </mesh>
          <Screen position={[0, 1.85, -0.2]} width={2.1} height={1.32} variant={i % 2} />
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 5.4, 0.18, Math.sin(angle) * 2.8]}>
            <cylinderGeometry args={[0.16, 0.2, 0.36, 12]} />
            <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function ProductInstallation() {
  const cards = [
    { x: -4.5, y: 2.2, z: -0.2, r: -0.12, w: 2.4, h: 3.1 },
    { x: -1.5, y: 2.4, z: 0.7, r: 0.05, w: 2.5, h: 3.5 },
    { x: 1.6, y: 2.5, z: -0.1, r: -0.04, w: 2.65, h: 3.7 },
    { x: 4.6, y: 2.1, z: 0.65, r: 0.12, w: 2.25, h: 3.1 },
  ];
  return (
    <group position={[0, 0, -27]}>
      {cards.map((card, i) => (
        <group key={i} position={[card.x, card.y, card.z]} rotation={[0, card.r, 0]}>
          <mesh castShadow>
            <boxGeometry args={[card.w, card.h, 0.12]} />
            <meshStandardMaterial color="#1c3027" metalness={0.68} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.066]}>
            <planeGeometry args={[card.w - 0.18, card.h - 0.18]} />
            <meshBasicMaterial color={i % 2 ? '#345647' : '#263e33'} />
          </mesh>
          <mesh position={[0, card.h * 0.28, 0.075]}>
            <planeGeometry args={[card.w * 0.65, 0.09]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[-card.w * 0.22, card.h * 0.08 - j * 0.27, 0.076]}>
              <planeGeometry args={[card.w * (0.42 + ((j + i) % 2) * 0.12), 0.045]} />
              <meshBasicMaterial color="#a9b9a9" transparent opacity={0.58} />
            </mesh>
          ))}
          <mesh position={[0, -card.h * 0.32, 0.078]}>
            <planeGeometry args={[card.w * 0.38, 0.22]} />
            <meshBasicMaterial color="#b39a62" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.8, 0]}>
        <torusGeometry args={[5.3, 0.025, 6, 100]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function AudioInstallation() {
  const bars = useMemo(() => Array.from({ length: 66 }, (_, i) => {
    const x = (i - 32.5) * 0.19;
    const envelope = Math.exp(-Math.pow(x / 5.1, 2));
    const wave = 0.32 + Math.abs(Math.sin(i * 1.73)) * 0.68;
    return { x, h: 0.32 + envelope * wave * 3.9, z: Math.cos(i * 0.21) * 0.36 };
  }), []);
  return (
    <group position={[0, 0, -40.5]}>
      {bars.map((bar, i) => (
        <mesh key={i} position={[bar.x, -0.2 + bar.h / 2, bar.z]} castShadow>
          <boxGeometry args={[0.085, bar.h, 0.13]} />
          <meshStandardMaterial
            color={i % 5 === 0 ? GOLD_LIGHT : i % 3 === 0 ? '#668a78' : '#344d40'}
            metalness={0.6}
            roughness={0.32}
            emissive={i % 5 === 0 ? '#59421b' : '#0d1d16'}
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.7, 0.026, 6, 100]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.32} />
      </mesh>
    </group>
  );
}

function NeuralInstallation() {
  const nodes = useMemo(() => {
    const layers = [
      [-4.3, 0.5, -1.1], [-4.3, 2.2, 0.5], [-4.3, -1.2, 0.8],
      [-2.1, 2.7, -0.8], [-2.1, 0.8, 0.9], [-2.1, -1.2, -0.5],
      [0, 2.4, 0.1], [0, 0.5, -1.2], [0, -1.3, 0.8],
      [2.1, 2.4, -0.7], [2.1, 0.5, 0.9], [2.1, -1.4, -0.4],
    ];
    const edges = [];
    [[0, 3], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [3, 7], [4, 6], [4, 7], [4, 8], [5, 7], [5, 8], [6, 9], [6, 10], [7, 9], [7, 10], [8, 10], [8, 11]].forEach(([a, b]) => edges.push([layers[a], layers[b]]));
    return { layers, edges };
  }, []);
  const outputA = [[2.2, 1.9, 0], [3.4, 2.7, -0.2], [4.6, 3.1, -0.4], [5.7, 3.5, -0.8]];
  const outputB = [[2.2, -1, 0], [3.4, -1.8, 0.2], [4.6, -2.5, 0.5], [5.7, -3.1, 0.6]];
  return (
    <group position={[0, 0.3, -54]}>
      {nodes.edges.map((edge, i) => (
        <Line key={i} points={edge} color="#b79a61" lineWidth={1.15} transparent opacity={0.5} />
      ))}
      {nodes.layers.map((node, i) => (
        <mesh key={i} position={node}>
          <icosahedronGeometry args={[0.18 + (i % 3) * 0.035, 1]} />
          <meshStandardMaterial color={i % 3 === 0 ? GOLD_LIGHT : '#6e9280'} metalness={0.7} roughness={0.25} emissive={i % 3 === 0 ? '#57421d' : '#12251c'} emissiveIntensity={0.35} />
        </mesh>
      ))}
      <Line points={outputA} color="#d7bd7c" lineWidth={2.4} />
      <Line points={outputB} color="#789e8b" lineWidth={2.4} />
      <mesh position={[-6.1, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.15, 0.045, 8, 64]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[6.05, 3.55, -0.8]}>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial color={GOLD_LIGHT} emissive="#9b6d27" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[6.05, -3.15, 0.6]}>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial color="#9cbaa8" emissive="#234d38" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function ResearchInstallation() {
  return (
    <group position={[0, 0, -67.5]}>
      <mesh position={[0, 1.6, 0]} rotation={[0, -0.16, 0]}>
        <boxGeometry args={[7.2, 4.6, 0.16]} />
        <meshStandardMaterial color="#20392f" metalness={0.65} roughness={0.25} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, 1.6, 0.095]} rotation={[0, -0.16, 0]}>
        <planeGeometry args={[6.9, 4.3]} />
        <meshBasicMaterial color="#172b25" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.3 + i * 1.25, 1.65 + Math.sin(i * 2) * 0.35, 0.12]} rotation={[0, 0, 0.15 * (i - 1)]}>
          <torusGeometry args={[0.64 + i * 0.16, 0.026, 6, 80]} />
          <meshStandardMaterial color={i === 1 ? GOLD_LIGHT : '#8da99a'} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[-3.8, 1.6, -0.3]}>
        <cylinderGeometry args={[0.12, 0.12, 4.4, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} />
      </mesh>
      <mesh position={[3.8, 1.6, -0.3]}>
        <cylinderGeometry args={[0.12, 0.12, 4.4, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} />
      </mesh>
    </group>
  );
}

function AtelierClosing() {
  return (
    <group position={[0, 0, -81]}>
      <mesh position={[0, 3.1, 0]}>
        <torusGeometry args={[4.8, 0.12, 12, 100]} />
        <meshStandardMaterial color={GOLD} metalness={0.78} roughness={0.25} />
      </mesh>
      <mesh position={[0, 3.1, -1.6]}>
        <torusGeometry args={[3.65, 0.035, 8, 100]} />
        <meshStandardMaterial color="#6e9482" metalness={0.72} roughness={0.3} />
      </mesh>
      {[-5.8, -3.6, 3.6, 5.8].map((x, i) => (
        <mesh key={i} position={[x, 2.1, -1.4]} castShadow>
          <boxGeometry args={[0.18, 4.2 + (i % 2) * 1.2, 0.22]} />
          <meshStandardMaterial color="#284236" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.2, 64]} />
        <meshStandardMaterial color="#1d3329" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, -3.5]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color={GOLD_LIGHT} emissive="#a87b35" emissiveIntensity={0.42} />
      </mesh>
    </group>
  );
}

function Dust() {
  const points = useMemo(() => {
    const positions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i += 1) {
      const fract = (value) => value - Math.floor(value);
      positions[i * 3] = (fract(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * 22;
      positions[i * 3 + 1] = fract(Math.sin(i * 78.233) * 19341.173) * 9 - 0.5;
      positions[i * 3 + 2] = -fract(Math.sin(i * 39.425) * 9271.129) * 112 + 8;
    }
    return positions;
  }, []);
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.003;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#c4b17b" size={0.035} transparent opacity={0.42} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function JourneyWorld({ progressRef }) {
  const cameraCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.6, 13),
    new THREE.Vector3(-1.2, 3.1, -1.5),
    new THREE.Vector3(1.2, 3.3, -15),
    new THREE.Vector3(-1.3, 3.2, -28.5),
    new THREE.Vector3(0.8, 3.2, -42),
    new THREE.Vector3(0, 3.8, -55.5),
    new THREE.Vector3(1.1, 3.25, -69),
    new THREE.Vector3(-0.8, 3.1, -82.5),
    new THREE.Vector3(0, 3.4, -96),
  ], false, 'catmullrom', 0.42), []);
  const targetCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.7, 0),
    new THREE.Vector3(0, 2.0, -13.5),
    new THREE.Vector3(0, 1.7, -27),
    new THREE.Vector3(0, 1.7, -40.5),
    new THREE.Vector3(0, 1.8, -54),
    new THREE.Vector3(0, 1.7, -67.5),
    new THREE.Vector3(0, 1.8, -81),
    new THREE.Vector3(0, 1.9, -94.5),
    new THREE.Vector3(0, 2.0, -108),
  ], false, 'catmullrom', 0.42), []);
  const smoothProgress = useRef(0);

  useFrame(({ camera }, delta) => {
    const targetProgress = THREE.MathUtils.clamp(progressRef.current.value || 0, 0, 1);
    smoothProgress.current = THREE.MathUtils.damp(smoothProgress.current, targetProgress, 3.4, delta);
    const position = cameraCurve.getPoint(smoothProgress.current);
    const target = targetCurve.getPoint(smoothProgress.current);
    camera.position.copy(position);
    camera.lookAt(target);
  });

  return (
    <>
      <color attach="background" args={[DARK]} />
      <fog attach="fog" args={[DARK, 12, 108]} />
      <ambientLight intensity={0.48} color="#9aac9b" />
      <hemisphereLight args={['#536c5d', '#111a15', 0.65]} />
      <directionalLight position={[4, 10, 8]} intensity={1.1} color="#e3c98f" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-5, 5, 3]} intensity={22} distance={18} color="#d5a95d" />
      {[-13.5, -27, -40.5, -54, -67.5, -81, -94.5].map((z) => (
        <pointLight key={z} position={[0, 4.5, z]} intensity={8} distance={12} color="#b58d4a" />
      ))}
      <Corridor />
      <FoundationInstallation />
      <CollaborationInstallation />
      <ProductInstallation />
      <AudioInstallation />
      <NeuralInstallation />
      <ResearchInstallation />
      <AtelierClosing />
      <Dust />
    </>
  );
}
