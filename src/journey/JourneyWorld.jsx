import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#cdb176';
const GOLD_LIGHT = '#ead5a0';
const MINT = '#82a894';
const FOREST = '#19372e';
const DARK = '#0a1411';
const CHAPTER_SPACING = 13.5;

/* --------------------------------------------------
   SHARED WORLD STRUCTURE
-------------------------------------------------- */

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
  const portals = useMemo(
    () => Array.from({ length: 10 }, (_, i) => -i * CHAPTER_SPACING),
    [],
  );
  const floorLines = useMemo(() => Array.from({ length: 34 }, (_, i) => -i * 3.8), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, -54]} receiveShadow>
        <planeGeometry args={[25, 145]} />
        <meshStandardMaterial color="#101d18" roughness={0.88} metalness={0.12} />
      </mesh>
      <Line
        points={[
          [0, -1.43, 9], [0, -1.43, 0], [1.2, -1.43, -13.5],
          [-0.8, -1.43, -27], [0.7, -1.43, -40.5], [0, -1.43, -54],
          [0.8, -1.43, -67.5], [-0.5, -1.43, -81],
          [0, -1.43, -94.5], [0, -1.43, -108],
        ]}
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

function Limb({ from, to, radius = 0.08, color = '#315344' }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(end, start);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius * 0.86, radius, direction.length(), 8]} />
      <meshStandardMaterial color={color} roughness={0.82} flatShading />
    </mesh>
  );
}

/* --------------------------------------------------
   00 — THE BEGINNING
   A builder's workbench: plans, tools and a prototype.
-------------------------------------------------- */

function OpeningInstallation() {
  return (
    <group position={[2.5, 0, 0]}>
      {/* Workbench */}
      <mesh position={[0, -0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.18, 2.65]} />
        <meshStandardMaterial color="#354638" metalness={0.36} roughness={0.64} />
      </mesh>
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, -1.08, 0]} castShadow>
          <boxGeometry args={[0.16, 0.72, 0.16]} />
          <meshStandardMaterial color="#6a5938" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {/* Blueprint sheet */}
      <mesh position={[-0.8, -0.615, 0.02]} rotation={[-Math.PI / 2, 0, -0.12]}>
        <planeGeometry args={[2.2, 1.55]} />
        <meshBasicMaterial color="#29483b" />
      </mesh>
      {[-1.45, -0.85, -0.25].map((x, i) => (
        <mesh key={x} position={[x, -0.605, 0.06]} rotation={[-Math.PI / 2, 0, -0.12]}>
          <planeGeometry args={[0.42 + (i % 2) * 0.22, 0.028]} />
          <meshBasicMaterial color={i === 1 ? GOLD_LIGHT : '#9bb3a2'} />
        </mesh>
      ))}
      {/* Prototype on a small plinth */}
      <mesh position={[1.15, -0.32, -0.05]} castShadow>
        <boxGeometry args={[1.22, 0.55, 1.05]} />
        <meshStandardMaterial color="#172a21" metalness={0.52} roughness={0.44} />
      </mesh>
      <mesh position={[1.15, 0.55, -0.05]} rotation={[0.18, 0.35, 0.16]} castShadow>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial color="#6b927e" metalness={0.62} roughness={0.3} wireframe />
      </mesh>
      <mesh position={[1.15, 0.55, -0.05]} castShadow>
        <icosahedronGeometry args={[0.58, 1]} />
        <meshStandardMaterial color="#b49a63" metalness={0.55} roughness={0.32} />
      </mesh>
      {/* Drafting lamp */}
      <mesh position={[-1.9, 0.35, -0.65]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 20]} />
        <meshStandardMaterial color="#72613e" metalness={0.72} roughness={0.3} />
      </mesh>
      <Limb from={[-1.9, 0.38, -0.65]} to={[-1.35, 1.55, -0.65]} radius={0.065} color="#8b7950" />
      <Limb from={[-1.35, 1.55, -0.65]} to={[-0.58, 1.86, -0.42]} radius={0.055} color="#8b7950" />
      <mesh position={[-0.42, 1.77, -0.4]} rotation={[0, 0, -0.45]} castShadow>
        <coneGeometry args={[0.34, 0.48, 12, 1, true]} />
        <meshStandardMaterial color="#c5a76a" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[-0.45, 1.4, 0.15]} intensity={7} distance={4.5} color="#d6bc80" />
      {/* Open notebook and pencil */}
      <mesh position={[2.15, -0.61, 0.62]} rotation={[-Math.PI / 2, 0, -0.18]}>
        <boxGeometry args={[1.2, 0.86, 0.045]} />
        <meshStandardMaterial color="#c4b38a" roughness={0.9} />
      </mesh>
      <Limb from={[1.7, -0.57, 0.95]} to={[2.55, -0.57, 0.3]} radius={0.025} color="#272b21" />
      <mesh position={[0, 2.35, -1.3]} rotation={[0, 0, -0.04]}>
        <torusGeometry args={[2.7, 0.025, 6, 80]} />
        <meshStandardMaterial color={GOLD} metalness={0.72} roughness={0.3} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------
   01 — FOUNDATIONS
   Books, an academic arch and a connected data structure.
-------------------------------------------------- */

function Book({ position, width, height, depth, color, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      <mesh position={[0, height * 0.42, depth * 0.505]}>
        <boxGeometry args={[width * 0.72, 0.035, 0.012]} />
        <meshBasicMaterial color={GOLD_LIGHT} />
      </mesh>
      <mesh position={[0, -height * 0.42, depth * 0.505]}>
        <boxGeometry args={[width * 0.5, 0.025, 0.012]} />
        <meshBasicMaterial color="#b6c3b2" />
      </mesh>
    </group>
  );
}

function FoundationInstallation() {
  const nodes = [
    [-2.7, 2.9, 0.1], [-1.25, 2.0, 0.12], [-4.1, 2.0, 0.12],
    [-0.2, 1.0, 0.12], [-2.7, 1.0, 0.12], [-5.0, 1.0, 0.12],
    [-1.2, 0.0, 0.12], [-3.7, 0.0, 0.12],
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7]];

  return (
    <group position={[-2.35, 0, -CHAPTER_SPACING]}>
      {/* Academic arch */}
      <mesh position={[-0.2, 2.15, -0.95]} castShadow>
        <boxGeometry args={[5.5, 0.16, 0.22]} />
        <meshStandardMaterial color="#3b5645" metalness={0.62} roughness={0.42} />
      </mesh>
      {[-2.8, 2.4].map((x) => (
        <mesh key={x} position={[x - 0.2, 0.85, -0.95]} castShadow>
          <boxGeometry args={[0.18, 2.75, 0.24]} />
          <meshStandardMaterial color="#6d6748" metalness={0.62} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.2, 2.7, -0.95]}>
        <torusGeometry args={[2.0, 0.035, 8, 80, Math.PI]} />
        <meshStandardMaterial color={GOLD} metalness={0.72} roughness={0.3} />
      </mesh>
      {/* Stack of textbooks */}
      <Book position={[-4.55, -1.34, 0.35]} width={2.2} height={0.34} depth={1.15} color="#355b49" rotation={-0.05} />
      <Book position={[-4.38, -1.00, 0.32]} width={1.95} height={0.32} depth={1.05} color="#6a6244" rotation={0.035} />
      <Book position={[-4.62, -0.67, 0.3]} width={2.05} height={0.3} depth={1.0} color="#284a3b" rotation={-0.025} />
      {/* Data-structure board */}
      <mesh position={[-2.7, 1.35, 0.0]} castShadow>
        <boxGeometry args={[4.5, 3.45, 0.12]} />
        <meshStandardMaterial color="#15271f" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[-2.7, 1.35, 0.07]}>
        <planeGeometry args={[4.3, 3.25]} />
        <meshBasicMaterial color="#1d382c" />
      </mesh>
      {edges.map(([a, b], index) => (
        <Line key={`edge-${index}`} points={[nodes[a], nodes[b]]} color={index % 3 === 0 ? GOLD : '#85a28e'} lineWidth={1.5} transparent opacity={0.78} />
      ))}
      {nodes.map((node, index) => (
        <mesh key={`node-${index}`} position={node} castShadow>
          <sphereGeometry args={[index === 0 ? 0.2 : 0.15, 12, 10]} />
          <meshStandardMaterial color={index === 0 ? GOLD_LIGHT : '#86a992'} emissive={index === 0 ? '#59431c' : '#14271d'} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Small graduation-cap silhouette */}
      <mesh position={[-5.0, 1.6, -0.25]} rotation={[0, 0.2, 0.12]} castShadow>
        <boxGeometry args={[1.25, 0.12, 1.25]} />
        <meshStandardMaterial color="#b69a60" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-5.0, 1.48, -0.25]}>
        <cylinderGeometry args={[0.36, 0.44, 0.18, 4]} />
        <meshStandardMaterial color="#263d30" roughness={0.8} />
      </mesh>
      <Limb from={[-4.42, 1.61, -0.2]} to={[-4.12, 1.18, -0.2]} radius={0.025} color={GOLD_LIGHT} />
      <pointLight position={[-2.4, 4.6, 1.6]} intensity={10} distance={10} color="#b9a06a" />
    </group>
  );
}

/* --------------------------------------------------
   02 — COLLABORATION / COGNIZANT
   A six-person team's shared product discussion.
-------------------------------------------------- */

function TeamMember({
  position,
  rotation = 0,
  jacket = '#315344',
  trousers = '#202e27',
  skin = '#c99672',
  hair = '#1c211c',
  standing = false,
  presenting = false,
}) {
  const headY = standing ? 2.24 : 2.04;
  const shoulderY = standing ? 1.82 : 1.58;
  const arms = presenting
    ? [
        { from: [-0.29, shoulderY, 0], elbow: [-0.43, 1.34, 0.25], hand: [-0.27, 1.12, 0.58] },
        { from: [0.29, shoulderY, 0], elbow: [0.42, shoulderY + 0.35, 0.34], hand: [0.39, shoulderY + 0.55, 0.78] },
      ]
    : [
        { from: [-0.29, shoulderY, 0], elbow: [-0.43, 1.34, 0.25], hand: [-0.27, 1.12, 0.58] },
        { from: [0.29, shoulderY, 0], elbow: [0.43, 1.34, 0.25], hand: [0.27, 1.12, 0.58] },
      ];

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {!standing && (
        <group>
          <mesh position={[0, 0.58, -0.18]} castShadow>
            <boxGeometry args={[0.72, 0.13, 0.72]} />
            <meshStandardMaterial color="#25392f" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.0, -0.5]} castShadow>
            <boxGeometry args={[0.72, 0.82, 0.13]} />
            <meshStandardMaterial color="#2b4437" roughness={0.82} />
          </mesh>
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 0.29, -0.18]} castShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.58, 8]} />
              <meshStandardMaterial color="#62563a" metalness={0.45} roughness={0.55} />
            </mesh>
          ))}
        </group>
      )}
      {[-0.17, 0.17].map((x) => (
        <React.Fragment key={x}>
          <Limb
            from={[x, standing ? 0.96 : 0.82, standing ? 0 : -0.02]}
            to={[x * 1.12, 0.48, standing ? 0.02 : 0.33]}
            radius={0.105}
            color={trousers}
          />
          <Limb
            from={[x * 1.12, 0.48, standing ? 0.02 : 0.33]}
            to={[x * 1.12, 0.1, standing ? 0.08 : 0.48]}
            radius={0.09}
            color={trousers}
          />
          <mesh position={[x * 1.12, 0.075, standing ? 0.2 : 0.61]} castShadow>
            <boxGeometry args={[0.19, 0.12, 0.34]} />
            <meshStandardMaterial color="#171f1a" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, standing ? 1.42 : 1.31, 0]} castShadow>
        <capsuleGeometry args={[0.31, standing ? 0.76 : 0.54, 4, 9]} />
        <meshStandardMaterial color={jacket} roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0, headY - 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.19, 8]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      <mesh position={[0, headY, 0]} castShadow>
        <icosahedronGeometry args={[0.225, 2]} />
        <meshStandardMaterial color={skin} roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0, headY + 0.105, -0.015]} scale={[1.02, 0.58, 1.02]} castShadow>
        <sphereGeometry args={[0.225, 12, 8]} />
        <meshStandardMaterial color={hair} roughness={0.94} flatShading />
      </mesh>
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, headY + 0.005, 0.207]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshBasicMaterial color="#17201a" />
        </mesh>
      ))}
      {arms.map((arm, index) => (
        <React.Fragment key={index}>
          <Limb from={arm.from} to={arm.elbow} radius={0.105} color={jacket} />
          <Limb from={arm.elbow} to={arm.hand} radius={0.082} color={jacket} />
          <mesh position={arm.hand} castShadow>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color={skin} roughness={0.88} flatShading />
          </mesh>
        </React.Fragment>
      ))}
      {presenting && (
        <Limb
          from={[0.39, shoulderY + 0.55, 0.78]}
          to={[0.37, shoulderY + 0.58, 1.08]}
          radius={0.035}
          color={skin}
        />
      )}
      <mesh position={[0.1, standing ? 1.58 : 1.43, 0.285]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.035, 0.28, 0.018]} />
        <meshStandardMaterial color={GOLD} roughness={0.65} />
      </mesh>
    </group>
  );
}

function CollaborationBoard() {
  const roleColors = ['#355d4b', '#416b57', '#294c3d'];
  return (
    <group position={[2.9, 1.75, -2.25]}>
      <mesh castShadow>
        <boxGeometry args={[5.0, 2.7, 0.16]} />
        <meshStandardMaterial color="#101c16" metalness={0.52} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[4.78, 2.48]} />
        <meshBasicMaterial color="#142a20" />
      </mesh>
      <mesh position={[-1.75, 0.95, 0.105]}>
        <planeGeometry args={[0.7, 0.055]} />
        <meshBasicMaterial color={GOLD_LIGHT} />
      </mesh>
      <mesh position={[-0.88, 0.95, 0.105]}>
        <planeGeometry args={[0.82, 0.035]} />
        <meshBasicMaterial color="#668575" />
      </mesh>
      {roleColors.map((color, index) => {
        const x = -1.5 + index * 1.5;
        return (
          <group key={color} position={[x, -0.05, 0.12]}>
            <mesh>
              <boxGeometry args={[1.28, 1.48, 0.035]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.48, 0.025]}>
              <boxGeometry args={[0.76, 0.07, 0.012]} />
              <meshBasicMaterial color={GOLD_LIGHT} />
            </mesh>
            <mesh position={[-0.28, 0.2, 0.026]}>
              <boxGeometry args={[0.58, 0.035, 0.012]} />
              <meshBasicMaterial color="#b0c0b2" transparent opacity={0.82} />
            </mesh>
            <mesh position={[-0.28, 0.02, 0.026]}>
              <boxGeometry args={[0.58, 0.035, 0.012]} />
              <meshBasicMaterial color="#789181" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, -0.42, 0.03]}>
              <boxGeometry args={[0.52, 0.16, 0.018]} />
              <meshBasicMaterial color="#b99e67" />
            </mesh>
          </group>
        );
      })}
      {/* Three connecting points suggest the distinct role experiences. */}
      {[-1.5, 0, 1.5].map((x, index) => (
        <mesh key={x} position={[x, -1.34, 0.12]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color={index === 1 ? GOLD_LIGHT : MINT} emissive="#284736" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function CollaborationInstallation() {
  return (
    <group position={[2.45, 0, -CHAPTER_SPACING * 2]}>
      <CollaborationBoard />
      {/* Meeting table and pedestal */}
      <mesh position={[2.9, -0.72, -0.1]} scale={[1.2, 1, 0.78]} castShadow receiveShadow>
        <cylinderGeometry args={[1.95, 2.02, 0.16, 48]} />
        <meshStandardMaterial color="#263d31" metalness={0.42} roughness={0.52} />
      </mesh>
      <mesh position={[2.9, -1.13, -0.1]} castShadow>
        <cylinderGeometry args={[0.38, 0.56, 0.76, 12]} />
        <meshStandardMaterial color="#4b4b35" metalness={0.62} roughness={0.42} />
      </mesh>
      <mesh position={[2.9, -1.48, -0.1]} castShadow>
        <cylinderGeometry args={[0.92, 1.02, 0.12, 32]} />
        <meshStandardMaterial color="#1b2d24" metalness={0.55} roughness={0.58} />
      </mesh>
      {/* Shared laptop: a single product the team is building together. */}
      <group position={[2.9, -0.61, -0.1]}>
        <mesh position={[0, 0.055, 0.02]}>
          <boxGeometry args={[1.05, 0.055, 0.72]} />
          <meshStandardMaterial color="#a48d5b" metalness={0.72} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.36, -0.31]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[1.05, 0.72, 0.065]} />
          <meshStandardMaterial color="#101915" metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.36, -0.272]}>
          <planeGeometry args={[0.91, 0.58]} />
          <meshBasicMaterial color="#315744" />
        </mesh>
        {[-0.27, 0, 0.27].map((x, index) => (
          <mesh key={x} position={[x, 0.39, -0.264]}>
            <planeGeometry args={[0.2, 0.28]} />
            <meshBasicMaterial color={['#4c745f', '#b79b62', '#3b6550'][index]} />
          </mesh>
        ))}
      </group>
      {/* Five seated teammates and one presenter make the six-person team visible. */}
      <TeamMember position={[1.0, -1.55, -0.25]} rotation={Math.PI / 2} jacket="#345b49" trousers="#202f27" skin="#d1a17d" hair="#25251f" />
      <TeamMember position={[1.75, -1.55, 1.3]} rotation={2.35} jacket="#496858" trousers="#24342c" skin="#b98262" hair="#171c18" />
      <TeamMember position={[2.9, -1.55, 1.72]} rotation={Math.PI} jacket="#6a5a3d" trousers="#263229" skin="#e0b891" hair="#2b2922" />
      <TeamMember position={[4.05, -1.55, 1.3]} rotation={-2.35} jacket="#3c5a4a" trousers="#263229" skin="#c28c6b" hair="#22261f" />
      <TeamMember position={[4.85, -1.55, -0.25]} rotation={-Math.PI / 2} jacket="#536b58" trousers="#202f27" skin="#d5a47f" hair="#1b211b" />
      <TeamMember position={[5.1, -1.55, -1.55]} rotation={-Math.PI / 2} jacket="#29483b" trousers="#202b24" skin="#ad795d" hair="#171d19" standing presenting />
      <mesh position={[2.9, -1.49, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.65, 0.026, 6, 88]} />
        <meshStandardMaterial color={GOLD} metalness={0.76} roughness={0.34} transparent opacity={0.74} />
      </mesh>
      <pointLight position={[2.9, 4.2, -1.4]} intensity={16} distance={12} color="#c5a66b" />
    </group>
  );
}

/* --------------------------------------------------
   03 — PRODUCT ENGINEERING / MOBOXD
   A connected social-product ecosystem, not generic code panels.
-------------------------------------------------- */

function SocialCard({ position, rotation = 0, variant = 0 }) {
  const imageColors = ['#345d4a', '#695b3e', '#456c61', '#314b3d'];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.05, 3.15, 0.14]} />
        <meshStandardMaterial color="#111e17" metalness={0.66} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.076]}>
        <planeGeometry args={[1.88, 2.98]} />
        <meshBasicMaterial color="#1d3026" />
      </mesh>
      <mesh position={[-0.62, 1.2, 0.088]}>
        <circleGeometry args={[0.16, 18]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh position={[-0.23, 1.2, 0.088]}>
        <planeGeometry args={[0.48, 0.055]} />
        <meshBasicMaterial color="#b7c4b4" />
      </mesh>
      <mesh position={[0.2, 1.2, 0.088]}>
        <planeGeometry args={[0.26, 0.035]} />
        <meshBasicMaterial color="#738d7c" />
      </mesh>
      <mesh position={[0, 0.25, 0.09]}>
        <planeGeometry args={[1.55, 1.35]} />
        <meshBasicMaterial color={imageColors[variant % imageColors.length]} />
      </mesh>
      {variant % 2 === 0 ? (
        <mesh position={[0, 0.25, 0.1]}>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial color="#9ab39f" roughness={0.45} flatShading />
        </mesh>
      ) : (
        <>
          <mesh position={[-0.2, 0.25, 0.12]}>
            <torusGeometry args={[0.34, 0.09, 6, 32]} />
            <meshStandardMaterial color={GOLD_LIGHT} metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0.3, 0.25, 0.12]}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial color="#8ba997" roughness={0.55} />
          </mesh>
        </>
      )}
      <mesh position={[-0.35, -0.72, 0.09]}>
        <planeGeometry args={[0.78, 0.045]} />
        <meshBasicMaterial color="#c3cdbf" />
      </mesh>
      <mesh position={[-0.35, -0.88, 0.09]}>
        <planeGeometry args={[1.1, 0.035]} />
        <meshBasicMaterial color="#6e8878" />
      </mesh>
      {/* Like / review / save cues */}
      {[-0.55, 0, 0.55].map((x, index) => (
        <mesh key={x} position={[x, -1.24, 0.1]}>
          {index === 1 ? <circleGeometry args={[0.07, 12]} /> : <torusGeometry args={[0.07, 0.025, 6, 16]} />}
          <meshBasicMaterial color={index === 1 ? GOLD_LIGHT : MINT} />
        </mesh>
      ))}
    </group>
  );
}

function ProductInstallation() {
  const cards = [
    { position: [-5.0, 1.45, 0.1], rotation: -0.14, variant: 1 },
    { position: [-2.55, 1.7, -0.55], rotation: -0.035, variant: 0 },
    { position: [0.0, 1.5, 0.2], rotation: 0.08, variant: 2 },
  ];
  return (
    <group position={[-2.35, 0, -CHAPTER_SPACING * 3]}>
      {/* Central profile / product hub */}
      <mesh position={[-2.55, -0.7, -0.1]} castShadow>
        <cylinderGeometry args={[1.25, 1.35, 0.2, 48]} />
        <meshStandardMaterial color="#263c30" metalness={0.52} roughness={0.45} />
      </mesh>
      <mesh position={[-2.55, -1.08, -0.1]} castShadow>
        <cylinderGeometry args={[0.32, 0.44, 0.62, 12]} />
        <meshStandardMaterial color="#4a563e" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[-2.55, 0.35, -0.1]} castShadow>
        <icosahedronGeometry args={[0.82, 2]} />
        <meshStandardMaterial color="#a38d5c" metalness={0.42} roughness={0.42} />
      </mesh>
      <mesh position={[-2.55, 0.35, 0.02]}>
        <torusGeometry args={[1.15, 0.035, 8, 72]} />
        <meshStandardMaterial color={GOLD} metalness={0.76} roughness={0.28} />
      </mesh>
      {cards.map((card, index) => (
        <SocialCard key={index} {...card} />
      ))}
      {/* Connections from profile to posts */}
      <Line points={[[-2.55, 0.35, 0.05], [-4.25, 0.95, 0.1], [-5.0, 1.25, 0.1]]} color={GOLD} lineWidth={1.6} transparent opacity={0.72} />
      <Line points={[[-2.55, 0.35, 0.05], [-1.1, 0.9, 0.2], [0.0, 1.25, 0.2]]} color="#82a894" lineWidth={1.6} transparent opacity={0.72} />
      {/* Small connected profile nodes */}
      {[-5.1, -2.55, 0.0].map((x, index) => (
        <mesh key={x} position={[x, -0.9, 1.1]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color={index === 1 ? GOLD_LIGHT : '#759b84'} roughness={0.46} />
        </mesh>
      ))}
      <mesh position={[-2.55, -1.48, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.2, 0.025, 6, 96]} />
        <meshStandardMaterial color={GOLD} metalness={0.76} roughness={0.32} transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------
   04 — MUSIC FINGERPRINTING / NOTSHAZAM
   Sound is converted to a fingerprint, then matched to a library.
-------------------------------------------------- */

function AudioFingerprintInstallation() {
  const waveform = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const x = -2.6 + i * 0.155;
    const envelope = 0.25 + Math.exp(-Math.pow((i - 17) / 10, 2)) * 0.85;
    return { x, height: 0.12 + (0.18 + Math.abs(Math.sin(i * 1.71)) * 0.82) * envelope * 1.18 };
  }), []);
  const hashBars = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    x: -1.1 + (i % 5) * 0.48,
    y: -0.85 + Math.floor(i / 5) * 0.48,
    height: 0.14 + ((i * 7) % 5) * 0.12,
  })), []);

  return (
    <group position={[4.6, 0, -CHAPTER_SPACING * 4]} scale={0.82}>
      {/* Incoming audio waveform */}
      <mesh position={[-4.65, 0.65, 0]} castShadow>
        <boxGeometry args={[5.55, 2.65, 0.12]} />
        <meshStandardMaterial color="#13261d" metalness={0.5} roughness={0.42} />
      </mesh>
      <mesh position={[-4.65, 0.65, 0.07]}>
        <planeGeometry args={[5.37, 2.47]} />
        <meshBasicMaterial color="#1b382b" />
      </mesh>
      {waveform.map((bar, i) => (
        <mesh key={i} position={[-4.65 + bar.x, 0.65, 0.15]} castShadow>
          <boxGeometry args={[0.075, bar.height, 0.055]} />
          <meshStandardMaterial color={i % 5 === 0 ? GOLD_LIGHT : '#82a894'} emissive="#203e2e" emissiveIntensity={0.34} />
        </mesh>
      ))}
      {/* Conversion funnel */}
      <mesh position={[-0.65, 0.65, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[1.05, 1.05, 8, 1, true]} />
        <meshStandardMaterial color="#877348" metalness={0.5} roughness={0.42} wireframe />
      </mesh>
      <Line points={[[-1.8, 0.65, 0.2], [-0.25, 0.65, 0.2]]} color={GOLD} lineWidth={2} />
      {/* Fingerprint matrix */}
      <mesh position={[1.45, 0.65, 0]} castShadow>
        <boxGeometry args={[3.0, 3.0, 0.16]} />
        <meshStandardMaterial color="#101d17" metalness={0.62} roughness={0.34} />
      </mesh>
      <mesh position={[1.45, 0.65, 0.09]}>
        <planeGeometry args={[2.82, 2.82]} />
        <meshBasicMaterial color="#172b21" />
      </mesh>
      {hashBars.map((bar, i) => (
        <mesh key={i} position={[1.45 + bar.x, 0.65 + bar.y, 0.17]}>
          <boxGeometry args={[0.16, bar.height, 0.035]} />
          <meshBasicMaterial color={i % 4 === 0 ? GOLD_LIGHT : '#84a48f'} />
        </mesh>
      ))}
      {/* Match path to indexed library */}
      <Line points={[[2.95, 0.65, 0.1], [3.75, 0.65, 0.1], [4.3, 1.35, 0.1]]} color={GOLD} lineWidth={2} />
      <mesh position={[5.1, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 1.65, 32]} />
        <meshStandardMaterial color="#263c30" metalness={0.58} roughness={0.4} />
      </mesh>
      {[0.25, 0.75, 1.25].map((y) => (
        <mesh key={y} position={[5.1, y, 0]}>
          <torusGeometry args={[0.9, 0.035, 8, 40]} />
          <meshStandardMaterial color={GOLD} metalness={0.72} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[5.1, 1.8, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
        <meshStandardMaterial color="#6b7f68" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Matched-record indicator */}
      <mesh position={[5.1, 2.1, 0]}>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial color={GOLD_LIGHT} emissive="#a47b36" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.0, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.4, 0.025, 6, 96]} />
        <meshStandardMaterial color={GOLD} metalness={0.72} roughness={0.34} transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------
   05 — APPLIED AI/ML / STEMIFY
   A U-shaped separator maps mixed audio to two clean stems.
-------------------------------------------------- */

function StemifyInstallation() {
  const encoder = [
    { x: -4.1, y: 1.25, w: 0.78, h: 2.15, c: '#355d4b' },
    { x: -2.9, y: 1.05, w: 0.68, h: 1.75, c: '#416a55' },
    { x: -1.7, y: 0.75, w: 0.58, h: 1.25, c: '#6f8f78' },
  ];
  const decoder = [
    { x: 0.65, y: 0.75, w: 0.58, h: 1.25, c: '#6f8f78' },
    { x: 1.85, y: 1.05, w: 0.68, h: 1.75, c: '#416a55' },
    { x: 3.05, y: 1.25, w: 0.78, h: 2.15, c: '#355d4b' },
  ];

  return (
    <group position={[-3.55, 0, -CHAPTER_SPACING * 5]} scale={0.78}>
      {/* Mixed audio input */}
      <mesh position={[-5.25, 0.85, 0]} castShadow>
        <boxGeometry args={[1.65, 2.2, 0.15]} />
        <meshStandardMaterial color="#14251d" metalness={0.54} roughness={0.4} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-5.25 + (i - 4) * 0.14, 0.85 + Math.sin(i * 1.5) * 0.35, 0.1]}>
          <boxGeometry args={[0.055, 0.5 + (i % 4) * 0.24, 0.035]} />
          <meshBasicMaterial color={i % 3 === 0 ? GOLD_LIGHT : '#8aa993'} />
        </mesh>
      ))}
      {/* Encoder blocks */}
      {encoder.map((layer, i) => (
        <mesh key={`enc-${i}`} position={[layer.x, layer.y, 0]} castShadow>
          <boxGeometry args={[layer.w, layer.h, 0.42]} />
          <meshStandardMaterial color={layer.c} metalness={0.5} roughness={0.38} />
        </mesh>
      ))}
      {/* Bottleneck */}
      <mesh position={[-0.5, 0.5, -0.05]} castShadow>
        <boxGeometry args={[0.74, 0.82, 0.5]} />
        <meshStandardMaterial color="#b29a63" metalness={0.55} roughness={0.34} />
      </mesh>
      {decoder.map((layer, i) => (
        <mesh key={`dec-${i}`} position={[layer.x, layer.y, 0]} castShadow>
          <boxGeometry args={[layer.w, layer.h, 0.42]} />
          <meshStandardMaterial color={layer.c} metalness={0.5} roughness={0.38} />
        </mesh>
      ))}
      {/* U-Net skip connections */}
      <Line points={[[-4.1, 2.38, 0.24], [-4.1, 3.25, 0.24], [3.05, 3.25, 0.24], [3.05, 2.38, 0.24]]} color={GOLD} lineWidth={2} transparent opacity={0.78} />
      <Line points={[[-2.9, 1.95, 0.24], [-2.9, 2.75, 0.24], [1.85, 2.75, 0.24], [1.85, 1.95, 0.24]]} color="#82a894" lineWidth={1.8} transparent opacity={0.74} />
      <Line points={[[-1.7, 1.38, 0.24], [-1.7, 2.18, 0.24], [0.65, 2.18, 0.24], [0.65, 1.38, 0.24]]} color="#82a894" lineWidth={1.6} transparent opacity={0.7} />
      {/* Sequential processing connections */}
      <Line points={[[-4.42, 0.85, 0.15], [-4.48, 0.85, 0.15], [-4.1, 0.85, 0.15], [-2.9, 0.85, 0.15], [-1.7, 0.75, 0.15], [-0.5, 0.5, 0.15], [0.65, 0.75, 0.15], [1.85, 1.05, 0.15], [3.05, 1.25, 0.15]]} color={GOLD_LIGHT} lineWidth={1.8} />
      {/* Separated outputs: vocals and instruments */}
      <mesh position={[5.15, 1.55, 0]} castShadow>
        <boxGeometry args={[2.25, 1.35, 0.14]} />
        <meshStandardMaterial color="#13251c" metalness={0.54} roughness={0.4} />
      </mesh>
      <mesh position={[5.15, 1.55, 0.08]}>
        <planeGeometry args={[2.08, 1.18]} />
        <meshBasicMaterial color="#234536" />
      </mesh>
      <mesh position={[5.15, -0.05, 0]} castShadow>
        <boxGeometry args={[2.25, 1.35, 0.14]} />
        <meshStandardMaterial color="#13251c" metalness={0.54} roughness={0.4} />
      </mesh>
      <mesh position={[5.15, -0.05, 0.08]}>
        <planeGeometry args={[2.08, 1.18]} />
        <meshBasicMaterial color="#263d32" />
      </mesh>
      {[-0.7, -0.42, -0.14, 0.14, 0.42, 0.7].map((x, i) => (
        <React.Fragment key={x}>
          <mesh position={[5.15 + x, 1.55 + Math.sin(i * 1.8) * 0.18, 0.16]}>
            <boxGeometry args={[0.055, 0.38 + (i % 3) * 0.19, 0.025]} />
            <meshBasicMaterial color={GOLD_LIGHT} />
          </mesh>
          <mesh position={[5.15 + x, -0.05 + Math.sin(i * 1.2) * 0.2, 0.16]}>
            <boxGeometry args={[0.055, 0.26 + (i % 4) * 0.16, 0.025]} />
            <meshBasicMaterial color="#90b49a" />
          </mesh>
        </React.Fragment>
      ))}
      <Line points={[[3.45, 1.2, 0.1], [4.05, 1.55, 0.1], [4.1, 1.55, 0.1]]} color={GOLD} lineWidth={1.6} />
      <Line points={[[3.45, 0.9, 0.1], [4.05, -0.05, 0.1], [4.1, -0.05, 0.1]]} color="#82a894" lineWidth={1.6} />
      <mesh position={[-0.25, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.3, 0.025, 6, 96]} />
        <meshStandardMaterial color={GOLD} metalness={0.74} roughness={0.3} transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------
   06 — RESEARCH / OVACARE
   Ultrasound-like scan with clearly separated segmentation contours.
-------------------------------------------------- */

function ResearchInstallation() {
  const scanSpeckles = useMemo(() => Array.from({ length: 150 }, (_, i) => {
    const fract = (value) => value - Math.floor(value);
    const x = (fract(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * 4.25;
    const y = (fract(Math.sin(i * 78.233) * 19341.173) - 0.5) * 2.75;
    const z = 0.145 + (i % 3) * 0.002;
    return [x, y, z];
  }), []);
  const follicles = [
    [-1.2, 0.35, 0.34, 0.24], [-0.3, -0.35, 0.42, 0.3],
    [0.75, 0.45, 0.3, 0.23], [1.2, -0.62, 0.25, 0.19],
  ];

  return (
    <group position={[2.5, 0.2, -CHAPTER_SPACING * 6]}>
      {/* Ultrasound monitor */}
      <mesh position={[0, 1.45, -0.28]} castShadow>
        <boxGeometry args={[5.55, 3.85, 0.18]} />
        <meshStandardMaterial color="#101c16" metalness={0.7} roughness={0.26} />
      </mesh>
      <mesh position={[0, 1.45, -0.18]}>
        <planeGeometry args={[5.34, 3.64]} />
        <meshBasicMaterial color="#15271f" />
      </mesh>
      {/* Scan field */}
      <mesh position={[0, 1.43, -0.165]}>
        <planeGeometry args={[4.75, 3.0]} />
        <meshBasicMaterial color="#263a30" />
      </mesh>
      {scanSpeckles.map((point, i) => (
        <mesh key={i} position={[point[0], point[1] + 1.43, point[2]]}>
          <circleGeometry args={[0.012 + (i % 4) * 0.006, 6]} />
          <meshBasicMaterial color={i % 5 === 0 ? '#b6c5b7' : '#708777'} transparent opacity={0.35 + (i % 4) * 0.1} />
        </mesh>
      ))}
      {/* The follicle-like regions and their segmentation boundaries */}
      {follicles.map(([x, y, rx, ry], i) => (
        <group key={i} position={[x, y + 1.43, -0.125]}>
          <mesh scale={[rx, ry, 0.055]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#9ab09a' : '#789988'} transparent opacity={0.35} />
          </mesh>
          <mesh scale={[rx * 1.22, ry * 1.22, 1]}>
            <torusGeometry args={[1, 0.028, 6, 36]} />
            <meshStandardMaterial color={i % 2 === 0 ? GOLD_LIGHT : '#9bc2a6'} emissive="#1e3b2b" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* Scan guides */}
      <Line points={[[-2.25, 2.85, -0.11], [2.2, 2.85, -0.11]]} color="#9bb4a2" lineWidth={0.8} transparent opacity={0.42} />
      <Line points={[[-2.25, 0.25, -0.11], [2.2, 0.25, -0.11]]} color="#9bb4a2" lineWidth={0.8} transparent opacity={0.42} />
      {/* Data / measurement side panel */}
      <mesh position={[3.35, 1.45, 0.0]} castShadow>
        <boxGeometry args={[1.0, 3.05, 0.14]} />
        <meshStandardMaterial color="#1b3026" metalness={0.48} roughness={0.42} />
      </mesh>
      {[-0.7, -0.2, 0.3, 0.8, 1.3, 1.8, 2.25].map((y, i) => (
        <mesh key={y} position={[3.35, y, 0.09]}>
          <boxGeometry args={[0.48 + (i % 3) * 0.12, 0.035, 0.02]} />
          <meshBasicMaterial color={i % 3 === 0 ? GOLD_LIGHT : '#92ad99'} />
        </mesh>
      ))}
      {/* Monitor stand */}
      <mesh position={[0, -0.58, -0.22]} castShadow>
        <boxGeometry args={[0.24, 0.52, 0.2]} />
        <meshStandardMaterial color="#6a6142" metalness={0.58} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.78, -0.18]} castShadow>
        <boxGeometry args={[1.0, 0.22, 0.72]} />
        <meshStandardMaterial color="#6a6142" metalness={0.58} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.98, -0.18]} castShadow>
        <boxGeometry args={[2.0, 0.13, 1.0]} />
        <meshStandardMaterial color="#253b30" metalness={0.48} roughness={0.55} />
      </mesh>
      <pointLight position={[0, 3.8, 2]} intensity={12} distance={10} color="#a5b9a6" />
    </group>
  );
}

/* --------------------------------------------------
   07 — BEYOND CODE
   A small creative studio: camera, film and a 3D object.
-------------------------------------------------- */

function CreativeInstallation() {
  return (
    <group position={[-3.4, 0, -CHAPTER_SPACING * 7]} scale={0.85}>
      {/* Studio table */}
      <mesh position={[-0.4, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.9, 0.17, 2.65]} />
        <meshStandardMaterial color="#2b4033" metalness={0.38} roughness={0.62} />
      </mesh>
      {[-2.9, 2.1].map((x) => (
        <mesh key={x} position={[x - 0.4, -1.08, 0]} castShadow>
          <boxGeometry args={[0.14, 0.64, 0.14]} />
          <meshStandardMaterial color="#675a3c" metalness={0.42} roughness={0.62} />
        </mesh>
      ))}
      {/* Camera body and lens */}
      <group position={[-2.0, 0.05, 0.35]} rotation={[0, -0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.55, 1.0, 0.82]} />
          <meshStandardMaterial color="#1b2921" metalness={0.7} roughness={0.32} />
        </mesh>
        <mesh position={[0.12, 0.0, 0.57]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.5, 0.48, 24]} />
          <meshStandardMaterial color="#89754b" metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[0.12, 0.0, 0.84]}>
          <cylinderGeometry args={[0.29, 0.29, 0.05, 24]} />
          <meshStandardMaterial color="#111a15" metalness={0.35} roughness={0.2} />
        </mesh>
        <mesh position={[-0.35, 0.58, 0]}>
          <boxGeometry args={[0.62, 0.16, 0.4]} />
          <meshStandardMaterial color="#445846" metalness={0.6} roughness={0.38} />
        </mesh>
      </group>
      {/* Film reel */}
      <group position={[1.2, 0.1, -0.25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.16, 40]} />
          <meshStandardMaterial color="#5d6447" metalness={0.68} roughness={0.34} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.94, 0.055, 8, 48]} />
          <meshStandardMaterial color={GOLD} metalness={0.76} roughness={0.28} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0.09]}>
              <circleGeometry args={[0.13, 14]} />
              <meshBasicMaterial color="#17251d" />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 24]} />
          <meshStandardMaterial color="#c5ac73" metalness={0.6} roughness={0.34} />
        </mesh>
      </group>
      {/* Low-poly 3D model on a display plinth */}
      <mesh position={[3.1, -0.08, -0.12]} castShadow>
        <cylinderGeometry args={[0.84, 0.94, 0.22, 8]} />
        <meshStandardMaterial color="#1b2d23" metalness={0.55} roughness={0.48} />
      </mesh>
      <mesh position={[3.1, 0.92, -0.12]} rotation={[0.25, 0.45, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#789b84" metalness={0.52} roughness={0.34} flatShading />
      </mesh>
      <mesh position={[3.1, 0.92, -0.12]}>
        <dodecahedronGeometry args={[1.02, 0]} />
        <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.68} />
      </mesh>
      {/* A controller-like silhouette */}
      <mesh position={[0.0, -0.42, 0.78]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[1.15, 0.3, 0.55]} />
        <meshStandardMaterial color="#4e624e" metalness={0.42} roughness={0.5} />
      </mesh>
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, -0.25, 0.82]}>
          <sphereGeometry args={[0.085, 10, 8]} />
          <meshStandardMaterial color={GOLD_LIGHT} roughness={0.48} />
        </mesh>
      ))}
      <mesh position={[0.0, 2.25, -1.35]}>
        <torusGeometry args={[3.45, 0.028, 6, 88]} />
        <meshStandardMaterial color={GOLD} metalness={0.72} roughness={0.3} transparent opacity={0.58} />
      </mesh>
      <pointLight position={[0, 3.3, 2.2]} intensity={10} distance={9} color="#c4a871" />
    </group>
  );
}

/* --------------------------------------------------
   08 — WHAT'S NEXT
   Two disciplines meet at a shared intelligent-systems horizon.
-------------------------------------------------- */

function FutureInstallation() {
  const nodeRows = [
    [[-0.95, 1.05, 0.05], [-0.95, 0.15, 0.05], [-0.95, -0.75, 0.05]],
    [[0.0, 1.45, 0.05], [0.0, 0.35, 0.05], [0.0, -0.75, 0.05]],
    [[0.95, 1.05, 0.05], [0.95, 0.15, 0.05], [0.95, -0.75, 0.05]],
  ];
  return (
    <group position={[3.0, 0, -CHAPTER_SPACING * 8]}>
      {/* Two converging routes */}
      <mesh position={[0, -1.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 8.5]} />
        <meshStandardMaterial color="#17271e" roughness={0.86} metalness={0.12} />
      </mesh>
      <Line points={[[-4.2, -1.2, 1.5], [-2.2, -1.2, -0.2], [-0.2, -1.2, -2.1], [0, -1.2, -5.6]]} color={GOLD} lineWidth={2.2} />
      <Line points={[[4.2, -1.2, 1.5], [2.2, -1.2, -0.2], [0.2, -1.2, -2.1], [0, -1.2, -5.6]]} color="#7fa18b" lineWidth={2.2} />
      {/* Left: connected intelligence nodes */}
      {nodeRows.flat().map((node, i) => (
        <mesh key={i} position={[-2.0 + node[0], node[1] + 1.25, -2.1 + node[2]]}>
          <icosahedronGeometry args={[0.15 + (i % 3) * 0.025, 1]} />
          <meshStandardMaterial color={i % 2 === 0 ? GOLD_LIGHT : '#8caf98'} emissive="#1b3928" emissiveIntensity={0.4} roughness={0.32} />
        </mesh>
      ))}
      <Line points={[[-2.95, 2.3, -2.05], [-2.0, 2.7, -2.05], [-1.05, 2.3, -2.05]]} color={GOLD} lineWidth={1.3} />
      <Line points={[[-2.95, 1.4, -2.05], [-2.0, 1.6, -2.05], [-1.05, 1.4, -2.05]]} color="#88a995" lineWidth={1.3} />
      <Line points={[[-2.95, 0.5, -2.05], [-2.0, 0.5, -2.05], [-1.05, 0.5, -2.05]]} color="#88a995" lineWidth={1.3} />
      {/* Right: modular software architecture blocks */}
      {[-0.95, 0, 0.95].map((x, i) => (
        <group key={x} position={[2.3 + x, 1.35, -2.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.7 + (i % 2) * 0.28, 0.38]} />
            <meshStandardMaterial color={i === 1 ? '#806d43' : '#345646'} metalness={0.52} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.0, 0.21]}>
            <boxGeometry args={[0.34, 0.07, 0.025]} />
            <meshBasicMaterial color={GOLD_LIGHT} />
          </mesh>
        </group>
      ))}
      <Line points={[[1.35, 1.35, -1.85], [2.3, 1.85, -1.85], [3.25, 1.35, -1.85]]} color="#88a995" lineWidth={1.3} />
      {/* Shared horizon / portal */}
      <mesh position={[0, 2.5, -4.9]}>
        <torusGeometry args={[2.05, 0.075, 10, 88]} />
        <meshStandardMaterial color={GOLD} metalness={0.78} roughness={0.25} emissive="#47351a" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 2.5, -4.82]}>
        <sphereGeometry args={[0.62, 24, 18]} />
        <meshStandardMaterial color="#9db5a2" metalness={0.5} roughness={0.28} emissive="#315b40" emissiveIntensity={0.72} />
      </mesh>
      <mesh position={[0, 2.5, -4.78]}>
        <sphereGeometry args={[0.86, 24, 18]} />
        <meshBasicMaterial color={GOLD_LIGHT} wireframe transparent opacity={0.35} />
      </mesh>
      <pointLight position={[0, 2.5, -4.5]} intensity={22} distance={12} color="#d0b276" />
    </group>
  );
}

/* --------------------------------------------------
   AMBIENCE
-------------------------------------------------- */

function Dust() {
  const points = useMemo(() => {
    const positions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i += 1) {
      const fract = (value) => value - Math.floor(value);
      positions[i * 3] = (fract(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * 22;
      positions[i * 3 + 1] = fract(Math.sin(i * 78.233) * 19341.173) * 9 - 0.5;
      positions[i * 3 + 2] = -fract(Math.sin(i * 39.425) * 9271.129) * 120 + 8;
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

/* --------------------------------------------------
   WORLD + CAMERA

   IMPORTANT: each installation is placed at the same z target
   as its chapter. The old scene was shifted by one chapter, which
   made Foundations show Collaboration and Cognizant show MoBoxd.
-------------------------------------------------- */

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
      <fog attach="fog" args={[DARK, 12, 116]} />
      <ambientLight intensity={0.48} color="#9aac9b" />
      <hemisphereLight args={['#536c5d', '#111a15', 0.65]} />
      <directionalLight position={[4, 10, 8]} intensity={1.1} color="#e3c98f" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-5, 5, 3]} intensity={22} distance={18} color="#d5a95d" />
      {Array.from({ length: 8 }, (_, i) => (
        <pointLight
          key={i}
          position={[i % 2 === 0 ? -2.5 : 2.5, 4.5, -(i + 1) * CHAPTER_SPACING]}
          intensity={9}
          distance={13}
          color={i % 2 === 0 ? '#b58d4a' : '#8ca68f'}
        />
      ))}
      <Corridor />
      <OpeningInstallation />
      <FoundationInstallation />
      <CollaborationInstallation />
      <ProductInstallation />
      <AudioFingerprintInstallation />
      <StemifyInstallation />
      <ResearchInstallation />
      <CreativeInstallation />
      <FutureInstallation />
      <Dust />
    </>
  );
}
