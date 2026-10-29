import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Html, OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MATERIALS = {
  road: new THREE.MeshStandardMaterial({ color: '#303a40', roughness: 0.96 }),
  curb: new THREE.MeshStandardMaterial({ color: '#c9c1ad', roughness: 1 }),
  lane: new THREE.MeshStandardMaterial({ color: '#f2d98b', roughness: 1 }),
  white: new THREE.MeshStandardMaterial({ color: '#f6f3e8', roughness: 1 }),
  grass: new THREE.MeshStandardMaterial({ color: '#8fbd7e', roughness: 1, flatShading: true }),
  darkGlass: new THREE.MeshStandardMaterial({ color: '#29434a', roughness: 0.35, metalness: 0.08 }),
  glass: new THREE.MeshStandardMaterial({ color: '#a8dfe2', emissive: '#4a929a', emissiveIntensity: 0.12, roughness: 0.28 }),
  wood: new THREE.MeshStandardMaterial({ color: '#845b42', roughness: 1 }),
};

const LOT_SIZES = {
  north: [8.0, 4.45],
  middle: [8.0, 4.45],
  south: [8.0, 4.45],
  hq: [6.0, 4.45],
};

// Footprints used by the driving collision system. The footprint is a little
// larger than the visible building to account for the car's bumper and mirrors.
const COLLISION_SIZES = {
  family: [3.8, 3.2],
  cinema: [4.8, 3.8],
  arcade: [4.8, 3.7],
  music: [4.6, 3.45],
  social: [4.8, 3.45],
  petrol: [6.25, 4.15],
  studio: [4.7, 3.45],
  hospital: [4.65, 3.35],
  lab: [4.45, 3.3],
  blender: [4.75, 3.5],
  library: [4.55, 3.35],
  hq: [4.5, 4.15],
};

function getRow(project) {
  if (project.id === 'about') return 'hq';
  const z = project.position?.[1] ?? 0;
  if (z < -8) return 'north';
  if (z < 0) return 'middle';
  return 'south';
}

function Road({ position, size, horizontal = true }) {
  const [width, depth] = size;
  const count = Math.floor((horizontal ? width : depth) / 2.2);
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.015, 0]} material={MATERIALS.road}>
        <boxGeometry args={[width, 0.08, depth]} />
      </mesh>
      {Array.from({ length: count }, (_, index) => {
        const offset = -((horizontal ? width : depth) / 2) + 1.1 + index * 2.2;
        return (
          <mesh key={index} position={horizontal ? [offset, 0.063, 0] : [0, 0.063, offset]} material={MATERIALS.lane}>
            <boxGeometry args={horizontal ? [0.82, 0.018, 0.065] : [0.065, 0.018, 0.82]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Crosswalk({ position, acrossX = false }) {
  return (
    <group position={position}>
      {Array.from({ length: 6 }, (_, index) => {
        const offset = (index - 2.5) * 0.34;
        return (
          <mesh key={index} position={acrossX ? [0, 0.075, offset] : [offset, 0.075, 0]} material={MATERIALS.white}>
            <boxGeometry args={acrossX ? [1.25, 0.018, 0.18] : [0.18, 0.018, 1.25]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Tree({ position, scale = 1, variant = 0 }) {
  const greens = variant % 3 === 0
    ? ['#4c9956', '#72b76b', '#317b48']
    : variant % 3 === 1
      ? ['#458b54', '#81bd69', '#2e7446']
      : ['#579f5b', '#a0c875', '#3a804a'];
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.55, 0]} material={MATERIALS.wood}>
        <cylinderGeometry args={[0.14, 0.22, 1.1, 5]} />
      </mesh>
      <mesh castShadow position={[0, 1.18, 0]}>
        <dodecahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color={greens[0]} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[-0.28, 1.48, 0.06]}>
        <dodecahedronGeometry args={[0.43, 0]} />
        <meshStandardMaterial color={greens[1]} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.3, 1.52, -0.1]}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={greens[2]} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function StreetLamp({ position, nightFactorRef }) {
  const bulbMaterialRef = useRef(null);
  const bulbHaloMaterialRef = useRef(null);
  const pointLightRef = useRef(null);
  const poolMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uNight: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uNight;
      void main() {
        float d = distance(vUv, vec2(0.5)) * 2.0;
        float falloff = 1.0 - smoothstep(0.02, 1.0, d);
        float alpha = pow(max(falloff, 0.0), 2.15) * uNight * 0.58;
        gl_FragColor = vec4(vec3(1.0, 0.34, 0.075), alpha);
        #include <colorspace_fragment>
      }
    `,
  }), []);

  useFrame(() => {
    const night = nightFactorRef?.current ?? 0;
    if (bulbMaterialRef.current) {
      bulbMaterialRef.current.emissiveIntensity = 0.08 + night * 3.8;
      bulbMaterialRef.current.color.set(night > 0.25 ? '#ffb960' : '#c7c4a9');
    }
    if (bulbHaloMaterialRef.current) {
      bulbHaloMaterialRef.current.opacity = night * 0.48;
    }
    if (pointLightRef.current) {
      // A small, warm, local pool of light instead of lighting the whole map.
      pointLightRef.current.intensity = night * 3.0;
    }
    poolMaterial.uniforms.uNight.value = night;
  });

  return (
    <group position={position}>
      {/* Soft radial light pool on the ground. */}
      <mesh
        position={[0, 0.026, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-1}
      >
        <circleGeometry args={[2.15, 36]} />
        <primitive object={poolMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 1.55, 6]} />
        <meshStandardMaterial color="#3c4848" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.59, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.24]} />
        <meshStandardMaterial
          ref={bulbMaterialRef}
          color="#c7c4a9"
          emissive="#ff9e43"
          emissiveIntensity={0.08}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshBasicMaterial
          ref={bulbHaloMaterialRef}
          color="#ff9c42"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={pointLightRef}
        position={[0, 1.48, 0]}
        color="#ff9c42"
        intensity={0}
        distance={6.1}
        decay={2}
      />
    </group>
  );
}

// Lamps are placed on landscaped plot edges, not in the carriageway.
// The previous coordinates were within the horizontal roads centred at
// z = -16, -8, 0, 8 and 16, which made the collision system stop the car.
const STREET_LAMP_POSITIONS = [
  [-16.45, 12], [16.45, 12],
  [-16.45, 4], [16.45, 4],
  [-16.45, -4], [16.45, -4],
  [-16.45, -12], [16.45, -12],
  [-3.55, 4], [3.55, 4],
  [-3.55, -4], [3.55, -4],
];

function createTreePlacements(projectCenters) {
  const result = [];
  for (let z = -21; z <= 21; z += 2.5) {
    for (let x = -17; x <= 17; x += 2.7) {
      const nearHorizontalRoad = [-16, -8, 0, 8, 16]
        .some((roadZ) => Math.abs(z - roadZ) < 1.95);
      const nearVerticalRoad = [-7, 7]
        .some((roadX) => Math.abs(x - roadX) < 1.9);
      const nearEntryRoad = Math.abs(x) < 2.5 && z > 16;
      const nearLot = projectCenters.some(([bx, bz]) =>
        Math.abs(x - bx) < 4.55 && Math.abs(z - bz) < 3.25
      );
      const nearCurvedRoad = Math.abs(x) > 16.7;
      const nearEdge = Math.abs(x) > 17.0 || Math.abs(z) > 19.0;

      if (
        !nearHorizontalRoad &&
        !nearVerticalRoad &&
        !nearEntryRoad &&
        !nearLot &&
        !nearCurvedRoad &&
        (nearEdge || (Math.round(x * 2 + z * 3) % 4 !== 0))
      ) {
        result.push([
          x,
          0,
          z,
          0.65 + ((Math.abs(Math.round(x + z)) % 4) * 0.12),
        ]);
      }
    }
  }
  return result;
}

function smoothstep(edge0, edge1, value) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function DayNightEnvironment({ nightFactorRef }) {
  const { scene, size } = useThree();
  const ambientRef = useRef(null);
  const hemisphereRef = useRef(null);
  const sunLightRef = useRef(null);
  const moonLightRef = useRef(null);
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const starsRef = useRef(null);

  const palette = useMemo(() => ({
    // The top is intentionally not pure black. A blue-violet night sky
    // preserves the calm mood while keeping the scene and labels legible.
    nightSky: new THREE.Color('#1a2744'),
    daySky: new THREE.Color('#84bfd3'),
    twilightTop: new THREE.Color('#8e6d91'),
    nightHorizon: new THREE.Color('#4b6d87'),
    dayHorizon: new THREE.Color('#c0e4e2'),
    twilightSky: new THREE.Color('#f0a08a'),
    nightGround: new THREE.Color('#26344a'),
    dayGround: new THREE.Color('#7f986d'),
    dayLight: new THREE.Color('#fff0d2'),
    sunsetLight: new THREE.Color('#ffad75'),
    windowDay: new THREE.Color('#4a929a'),
    windowNight: new THREE.Color('#ffbd69'),
    outputSky: new THREE.Color(),
    outputTop: new THREE.Color(),
    outputSun: new THREE.Color(),
    outputGround: new THREE.Color(),
    outputWindow: new THREE.Color(),
  }), []);

  const skyUniforms = useMemo(() => ({
    uTopColor: { value: new THREE.Color('#1a2744') },
    uHorizonColor: { value: new THREE.Color('#4b6d87') },
  }), []);

  const skyMaterial = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 uTopColor;
      uniform vec3 uHorizonColor;
      void main() {
        vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
        float elevation = clamp(viewDirection.y, -0.12, 1.0);
        float gradient = smoothstep(-0.075, 0.58, elevation);
        vec3 color = mix(uHorizonColor, uTopColor, gradient);
        // A restrained glow just above the horizon makes dawn and dusk
        // read as atmospheric gradients instead of a flat colour band.
        float horizonGlow = exp(-pow((elevation - 0.035) * 9.0, 2.0));
        float warmAmount = clamp(uHorizonColor.r - uHorizonColor.b, 0.0, 0.65);
        vec3 warmColor = vec3(0.95, 0.49, 0.36);
        color = mix(color, warmColor, horizonGlow * warmAmount * 0.48);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  }), [skyUniforms]);

  const starPositions = useMemo(() => {
    const count = 360;
    const positions = new Float32Array(count * 3);
    let seed = 24681357;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    // Distribute stars over an upper hemisphere, rather than a thin band
    // near the horizon. The stars remain behind the town as the camera moves.
    const radius = 82;
    for (let i = 0; i < count; i += 1) {
      const azimuth = random() * Math.PI * 2;
      const elevation = 0.055 + random() * 1.32;
      const horizontal = Math.cos(elevation) * radius;
      positions[i * 3] = Math.cos(azimuth) * horizontal;
      positions[i * 3 + 1] = Math.sin(elevation) * radius;
      positions[i * 3 + 2] = Math.sin(azimuth) * horizontal;
    }

    return positions;
  }, []);

  useEffect(() => {
    const previousBackground = scene.background;
    scene.background = null;
    return () => {
      scene.background = previousBackground;
    };
  }, [scene]);

  useFrame(() => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const solarAngle = ((hours - 6) / 12) * Math.PI;
    const solarAltitude = Math.sin(solarAngle);
    const daylight = smoothstep(-0.12, 0.30, solarAltitude);
    const night = 1 - daylight;

    const sunriseGlow = Math.exp(-Math.pow((hours - 6) / 1.7, 2));
    const sunsetGlow = Math.exp(-Math.pow((hours - 18) / 1.7, 2));
    const twilight = Math.min(1, Math.max(sunriseGlow, sunsetGlow) * 0.96);
    const twilightBlend = twilight * (0.88 - daylight * 0.30);

    nightFactorRef.current = night;

    palette.outputTop
      .copy(palette.nightSky)
      .lerp(palette.daySky, daylight)
      .lerp(palette.twilightTop, twilightBlend);

    palette.outputSky
      .copy(palette.nightHorizon)
      .lerp(palette.dayHorizon, daylight)
      .lerp(palette.twilightSky, twilightBlend);

    palette.outputGround
      .copy(palette.nightGround)
      .lerp(palette.dayGround, daylight);

    skyUniforms.uTopColor.value.copy(palette.outputTop);
    skyUniforms.uHorizonColor.value.copy(palette.outputSky);

    if (scene.fog) {
      scene.fog.color.copy(palette.outputSky);
      scene.fog.near = 34 - night * 4;
      scene.fog.far = 92 - night * 12;
    }

    if (ambientRef.current) {
      // Keep night details readable while preserving a clear night look.
      ambientRef.current.intensity = 0.32 + daylight * 0.91;
    }
    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = 0.27 + daylight * 0.62;
      hemisphereRef.current.color.copy(palette.outputSky);
      hemisphereRef.current.groundColor.copy(palette.outputGround);
    }

    // Stylised sun arc: clock-driven and smoothly transitioning at dawn/dusk.
    const celestialXRange = Math.min(
      23,
      Math.max(7, (size.width / Math.max(size.height, 1)) * 12),
    );
    const sunX = Math.cos(solarAngle) * celestialXRange;
    const sunY = 0.5 + solarAltitude * 5.0;
    const sunZ = -20.5;

    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunX, sunY, sunZ);
      palette.outputSun
        .copy(palette.dayLight)
        .lerp(palette.sunsetLight, twilight);
      sunLightRef.current.color.copy(palette.outputSun);
      sunLightRef.current.intensity = 0.035 + daylight * 1.95;
    }

    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, sunZ);
      sunRef.current.visible = solarAltitude > -0.035;
    }

    const moonHour = (hours + 12) % 24;
    const moonAngle = ((moonHour - 6) / 12) * Math.PI;
    const moonAltitude = Math.sin(moonAngle);
    const moonX = Math.cos(moonAngle) * celestialXRange;
    const moonY = 0.5 + moonAltitude * 5.0;

    if (moonRef.current) {
      moonRef.current.position.set(moonX, moonY, -20.5);
      moonRef.current.visible = moonAltitude > -0.035 && night > 0.46;
    }
    if (moonLightRef.current) {
      moonLightRef.current.position.set(moonX, moonY, -20.5);
      moonLightRef.current.intensity = night * 0.46;
    }

    if (starsRef.current) {
      starsRef.current.visible = night > 0.025;
      starsRef.current.material.opacity = night * 0.96;
    }

    // Building windows become gently warm after dusk.
    MATERIALS.glass.emissiveIntensity = 0.10 + night * 0.76;
    palette.outputWindow.copy(palette.windowDay).lerp(palette.windowNight, night);
    MATERIALS.glass.emissive.copy(palette.outputWindow);
  });

  return (
    <>
      <mesh scale={[90, 90, 90]} renderOrder={-100}>
        <sphereGeometry args={[1, 48, 32]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>
      <fog attach="fog" args={['#4b6d87', 34, 92]} />
      <ambientLight ref={ambientRef} intensity={1.0} />
      <hemisphereLight
        ref={hemisphereRef}
        skyColor="#84bfd3"
        groundColor="#7f986d"
        intensity={0.8}
      />
      <directionalLight
        ref={sunLightRef}
        position={[0, 35, -30]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={29}
        shadow-camera-bottom={-29}
      />
      <directionalLight
        ref={moonLightRef}
        position={[0, 30, -29]}
        color="#b4caff"
        intensity={0}
      />
      <group ref={sunRef}>
        <mesh>
          <sphereGeometry args={[1.45, 24, 24]} />
          <meshBasicMaterial color="#ffd184" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.15, 20, 20]} />
          <meshBasicMaterial color="#ffc57b" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[1.9, 20, 20]} />
          <meshBasicMaterial color="#b6cfff" transparent opacity={0.12} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.08, 24, 24]} />
          <meshBasicMaterial color="#fff5dc" toneMapped={false} />
        </mesh>
        <mesh position={[-0.27, 0.28, 0.45]}>
          <sphereGeometry args={[0.17, 12, 12]} />
          <meshBasicMaterial color="#d4def1" toneMapped={false} />
        </mesh>
        <mesh position={[0.31, -0.16, 0.36]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#d4def1" toneMapped={false} />
        </mesh>
      </group>
      <points ref={starsRef} frustumCulled={false} renderOrder={-90}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#f5f7ff"
          size={1.8}
          sizeAttenuation={false}
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>
    </>
  );
}

function ProjectLot({ project, selected, hovered }) {
  const row = getRow(project);
  const [width, depth] = LOT_SIZES[row];
  const accent = project.accent || '#e8ca83';
  return (
    <group>
      {/* The tan border gives each building a fixed plot and a clear edge from the road. */}
      <mesh receiveShadow position={[0, 0.065, 0]}>
        <boxGeometry args={[width + 0.3, 0.13, depth + 0.3]} />
        <meshStandardMaterial color={selected || hovered ? '#d8c99e' : '#c8bea6'} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.145, 0]}>
        <boxGeometry args={[width, 0.07, depth]} />
        <meshStandardMaterial color="#8fbd7e" roughness={1} flatShading />
      </mesh>
      {/* Short paving strips at the plot edge make it read as a planned lot. */}
      <mesh receiveShadow position={[0, 0.184, -depth / 2 + 0.13]}>
        <boxGeometry args={[width - 0.16, 0.025, 0.16]} />
        <meshStandardMaterial color="#d6cfb9" roughness={1} />
      </mesh>
      {selected && <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[width - 0.08, 0.025, depth - 0.08]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} />
      </mesh>}
    </group>
  );
}

function Window({ x, y = 1.25, z, width = 0.62, height = 0.58 }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[width + 0.14, height + 0.14, 0.08]} />
        <meshStandardMaterial color="#f0e4c8" roughness={0.8} />
      </mesh>
      <mesh>
        <boxGeometry args={[width, height, 0.085]} />
        <primitive object={MATERIALS.glass} attach="material" />
      </mesh>
      <mesh>
        <boxGeometry args={[0.045, height, 0.095]} />
        <meshStandardMaterial color="#e5d8bd" />
      </mesh>
      <mesh>
        <boxGeometry args={[width, 0.045, 0.095]} />
        <meshStandardMaterial color="#e5d8bd" />
      </mesh>
    </group>
  );
}

function FrontSign({ text, color = '#2d3d3b', textColor = '#fff0c6', width = 2.5, y = 2.36, z = 2.06 }) {
  return (
    <group position={[0, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[width, 0.42, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <Text position={[0, 0, 0.095]} fontSize={0.23} color={textColor} anchorX="center" anchorY="middle" maxWidth={width - 0.15}>
        {text}
      </Text>
    </group>
  );
}

function Label({ project, onSelect, visible }) {
  if (!visible) return null;
  const height = project.id === 'petroleum' ? 4.05 : project.id === 'about' ? 4.15 : project.type === 'family' ? 4.0 : 3.75;
  return (
    <Html position={[0, height, 0]} center distanceFactor={17} occlude={false} zIndexRange={[2, 0]}>
      <button
        className="world-label"
        onClick={(event) => { event.stopPropagation(); onSelect(project); }}
        aria-label={`Explore ${project.name}`}
      >
        <span className="label-icon" style={{ color: project.accent || '#e8ca83' }}>{project.icon || '✦'}</span>
        <span className="label-copy"><strong>{project.name}</strong><small>{project.subtitle}</small></span>
      </button>
    </Html>
  );
}

function Building({ project, onSelect, selectedProject, labelsVisible = true }) {
  const [hovered, setHovered] = useState(false);
  const { type, color = '#c5b58d', accent = '#e8ca83' } = project;
  const dimensions = {
    family: [3.8, 3.2], cinema: [4.8, 3.8], arcade: [4.8, 3.7],
    music: [4.6, 3.45], social: [4.8, 3.45], petrol: [5.6, 3.0],
    studio: [4.7, 3.45], hospital: [4.65, 3.35], lab: [4.45, 3.3],
    blender: [4.75, 3.5], library: [4.55, 3.35], hq: [4.2, 2.9],
  };
  const [baseWidth, baseDepth] = dimensions[type] || [4.5, 3.5];
  const isSelected = selectedProject?.id === project.id;
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.86, flatShading: true }), [color]);
  const accentMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.68, flatShading: true }), [accent]);
  const roofColor = type === 'arcade' ? '#433758'
    : type === 'hq' ? '#46758f'
      : type === 'music' ? '#41464a'
        : type === 'family' ? '#b95f43'
          : type === 'studio' ? '#326d91'
            : type === 'social' ? '#586a66'
              : type === 'cinema' ? '#9a4d43'
                : type === 'hospital' ? '#e8e5dc'
                  : type === 'lab' ? '#477f73'
                    : type === 'blender' ? '#747d91'
                      : type === 'library' ? '#75563f'
                        : '#f0cf72';
  const roofMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.82, flatShading: true }), [roofColor]);
  const entranceZ = baseDepth / 2 + 0.045;

  return (
    <group
      position={[project.position?.[0] ?? 0, 0, project.position?.[1] ?? 0]}
      onClick={(event) => { event.stopPropagation(); onSelect(project); }}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <ProjectLot project={project} selected={isSelected} hovered={hovered} />

      {/* Foundation and main structure */}
      <RoundedBox castShadow receiveShadow position={[0, 0.285, 0]} args={[baseWidth + 0.3, 0.18, baseDepth + 0.3]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color="#e6dac0" roughness={0.76} />
      </RoundedBox>
      <RoundedBox castShadow receiveShadow position={[0, 1.27, 0]} args={[baseWidth, 1.8, baseDepth]} radius={0.09} smoothness={3}>
        <primitive object={wallMaterial} attach="material" />
      </RoundedBox>

      {/* Common front facade: entrance, windows, trim, and a small step. */}
      <mesh castShadow position={[0, 0.9, entranceZ]}>
        <boxGeometry args={[0.78, 1.12, 0.095]} />
        <primitive object={MATERIALS.darkGlass} attach="material" />
      </mesh>
      <mesh position={[0, 0.34, baseDepth / 2 + 0.22]}>
        <boxGeometry args={[1.12, 0.14, 0.42]} />
        <meshStandardMaterial color="#e4d4b4" roughness={1} />
      </mesh>
      {[-1.25, 1.25].map((x) => <Window key={x} x={x} y={1.34} z={baseDepth / 2 + 0.055} width={0.62} height={0.62} />)}

      {type === 'petrol' && <>
        {/* Broad branded canopy with four supports, kept fully inside the grass plot. */}
        <mesh castShadow position={[0, 2.4, 0.03]}>
          <boxGeometry args={[baseWidth + 0.62, 0.24, 4.06]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 2.25, 0.03]}>
          <boxGeometry args={[baseWidth + 0.58, 0.08, 3.98]} />
          <meshStandardMaterial color="#f4e4ac" roughness={0.72} />
        </mesh>
        {[-2.48, -0.82, 0.82, 2.48].map((x) => <React.Fragment key={x}>
          {[-1.55, 1.55].map((z) => <mesh key={z} castShadow position={[x, 1.25, z]}>
            <boxGeometry args={[0.18, 2.25, 0.18]} />
            <meshStandardMaterial color="#f4ead5" roughness={0.72} />
          </mesh>)}
        </React.Fragment>)}
        {[-1.42, 0, 1.42].map((x) => <group key={x} position={[x, 0.18, 1.8]}>
          <mesh castShadow position={[0, 0.62, 0]}>
            <boxGeometry args={[0.48, 1.18, 0.38]} />
            <meshStandardMaterial color="#f2eee4" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.88, 0.205]}>
            <boxGeometry args={[0.31, 0.28, 0.04]} />
            <meshStandardMaterial color="#cf4f42" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.51, 0.207]}>
            <boxGeometry args={[0.27, 0.22, 0.04]} />
            <meshStandardMaterial color="#28383c" roughness={0.4} />
          </mesh>
          <mesh position={[0.28, 0.45, 0.09]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.045, 0.42, 0.045]} />
            <meshStandardMaterial color="#343d3f" />
          </mesh>
        </group>)}
        <FrontSign text="PETROLEUM" color="#d94f3e" width={2.8} y={2.58} z={2.13} />
      </>}

      {type === 'family' && <>
        {/* Raised, four-sided roof and warm front gable trim. */}
        <mesh castShadow position={[0, 2.22, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.02, 1.42, 4]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 1.83, baseDepth / 2 + 0.06]}>
          <boxGeometry args={[1.25, 0.12, 0.1]} />
          <meshStandardMaterial color="#f0d6a0" />
        </mesh>
        {/* A family tree is the landmark, not merely another roof. */}
        <group position={[-2.65, 0.18, -0.15]}>
          <mesh castShadow position={[0, 0.76, 0]}>
            <cylinderGeometry args={[0.18, 0.28, 1.52, 5]} />
            <primitive object={MATERIALS.wood} attach="material" />
          </mesh>
          <mesh castShadow position={[0, 1.75, 0]}><dodecahedronGeometry args={[1.02, 0]} /><meshStandardMaterial color="#347d47" flatShading /></mesh>
          <mesh castShadow position={[-0.36, 2.15, 0.08]}><dodecahedronGeometry args={[0.65, 0]} /><meshStandardMaterial color="#69ad5f" flatShading /></mesh>
          <mesh castShadow position={[0.42, 2.18, -0.12]}><dodecahedronGeometry args={[0.58, 0]} /><meshStandardMaterial color="#4a9651" flatShading /></mesh>
        </group>
        <mesh position={[2.65, 0.24, -1.65]}><boxGeometry args={[1.05, 0.12, 0.52]} /><meshStandardMaterial color="#d2b183" /></mesh>
        <mesh position={[2.65, 0.5, -1.82]}><boxGeometry args={[0.12, 0.48, 0.12]} /><meshStandardMaterial color="#805d42" /></mesh>
      </>}

      {type === 'cinema' && <>
        <mesh castShadow position={[0, 2.15, 0]}>
          <boxGeometry args={[baseWidth + 0.24, 0.25, baseDepth + 0.2]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        <mesh castShadow position={[0, 2.55, entranceZ + 0.02]}>
          <boxGeometry args={[2.8, 0.46, 0.18]} />
          <meshStandardMaterial color="#c64e3e" roughness={0.48} />
        </mesh>
        <Text position={[0, 2.56, entranceZ + 0.13]} fontSize={0.28} color="#fff0b8" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#71372d">CINEMA</Text>
        {[-1.72, 1.72].map((x) => <mesh key={x} position={[x, 1.72, entranceZ + 0.05]}>
          <boxGeometry args={[0.62, 0.86, 0.1]} />
          <meshStandardMaterial color={x < 0 ? '#edc778' : '#a4cbd0'} roughness={0.65} />
        </mesh>)}
        <mesh position={[0, 2.42, -0.3]}><boxGeometry args={[0.66, 0.08, 0.58]} /><meshStandardMaterial color="#f2d48a" emissive="#f2b74a" emissiveIntensity={0.25} /></mesh>
      </>}

      {type === 'arcade' && <>
        <mesh castShadow position={[0, 2.12, 0]}>
          <boxGeometry args={[baseWidth + 0.28, 0.3, baseDepth + 0.18]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        <mesh castShadow position={[0, 2.48, entranceZ + 0.06]}>
          <boxGeometry args={[2.55, 0.46, 0.18]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
        <Text position={[0, 2.49, entranceZ + 0.17]} fontSize={0.24} color="#fff0bf" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#2d2540">ARCADE</Text>
        {[-1.35, 0, 1.35].map((x, index) => <mesh key={x} position={[x, 2.25, -0.08]}>
          <boxGeometry args={[0.42, 0.1, 0.42]} />
          <meshStandardMaterial color={['#ec6bca', '#f6d16f', '#6bdbce'][index]} emissive={['#a82c8a', '#986c19', '#1f8b85'][index]} emissiveIntensity={0.23} />
        </mesh>)}
      </>}

      {type === 'music' && <>
        <mesh castShadow position={[0, 2.12, 0]}>
          <boxGeometry args={[baseWidth + 0.22, 0.27, baseDepth + 0.2]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        {/* Oversized record disc on the roof, clearly visible from the overview. */}
        <mesh castShadow position={[0, 2.36, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 0.13, 28]} />
          <meshStandardMaterial color="#22292b" roughness={0.42} metalness={0.12} />
        </mesh>
        <mesh position={[0, 2.37, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.15, 20]} />
          <meshStandardMaterial color="#ed694b" roughness={0.5} />
        </mesh>
        <FrontSign text="NOTSHAZAM" color="#2e3a3b" width={2.65} y={2.36} z={entranceZ + 0.035} />
      </>}

      {type === 'social' && <>
        <mesh castShadow position={[0, 2.12, 0]}>
          <boxGeometry args={[baseWidth + 0.24, 0.28, baseDepth + 0.18]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        {/* Front canopy and glassy social-club facade. */}
        <mesh castShadow position={[0, 2.13, entranceZ + 0.18]}>
          <boxGeometry args={[3.3, 0.15, 0.72]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 1.28, entranceZ + 0.04]}>
          <boxGeometry args={[3.25, 0.92, 0.08]} />
          <meshStandardMaterial color="#8dc5c4" transparent opacity={0.8} roughness={0.25} />
        </mesh>
        <FrontSign text="MOBOXD" color="#314640" width={2.25} y={2.52} z={entranceZ + 0.08} />
        {[-1.55, 1.55].map((x) => <mesh key={x} position={[x, 0.22, baseDepth / 2 + 0.55]}>
          <boxGeometry args={[0.6, 0.13, 0.36]} />
          <meshStandardMaterial color="#cf9260" />
        </mesh>)}
      </>}

      {type === 'studio' && <>
        <mesh castShadow position={[0, 2.13, 0]}>
          <boxGeometry args={[baseWidth + 0.22, 0.26, baseDepth + 0.2]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 2.31, 0]}>
          <boxGeometry args={[1.65, 0.05, 0.22]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
        {[-0.54, -0.18, 0.18, 0.54].map((x, index) => <mesh key={x} position={[x, 2.43 + (index % 2) * 0.08, 0]}>
          <boxGeometry args={[0.11, 0.26 + (index % 2) * 0.16, 0.12]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>)}
        <FrontSign text="STEMIFY" color="#275b7d" width={2.15} y={2.42} z={entranceZ + 0.035} />
      </>}

      {type === 'hospital' && <>
        {/* OvaCare: a calm clinic facade, medical cross and teal roof trim. */}
        <RoundedBox castShadow position={[0, 2.18, 0]} args={[baseWidth + 0.18, 0.24, baseDepth + 0.16]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color="#e9e6df" roughness={0.62} />
        </RoundedBox>
        <mesh position={[0, 2.33, 0]}>
          <boxGeometry args={[baseWidth + 0.03, 0.07, 0.22]} />
          <meshStandardMaterial color="#68b5b2" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 2.78, 0]}>
          <boxGeometry args={[0.34, 0.95, 0.14]} />
          <meshStandardMaterial color="#d96678" roughness={0.48} />
        </mesh>
        <mesh castShadow position={[0, 2.78, 0]}>
          <boxGeometry args={[0.95, 0.34, 0.14]} />
          <meshStandardMaterial color="#d96678" roughness={0.48} />
        </mesh>
        <FrontSign text="OVACARE" color="#3e7977" textColor="#f4fff6" width={2.25} y={2.48} z={entranceZ + 0.05} />
        {[-1.75, 1.75].map((x) => <mesh key={x} position={[x, 1.28, entranceZ + 0.065]}>
          <boxGeometry args={[0.72, 0.66, 0.06]} />
          <meshStandardMaterial color="#94d8d7" roughness={0.28} metalness={0.05} />
        </mesh>)}
      </>}

      {type === 'lab' && <>
        {/* Maths gesture lab: interactive display, mint accent and camera sensor. */}
        <RoundedBox castShadow position={[0, 2.16, 0]} args={[baseWidth + 0.2, 0.24, baseDepth + 0.16]} radius={0.07} smoothness={3}>
          <meshStandardMaterial color="#4c766c" roughness={0.62} />
        </RoundedBox>
        <mesh castShadow position={[0, 1.4, entranceZ + 0.075]}>
          <boxGeometry args={[1.65, 0.95, 0.12]} />
          <meshStandardMaterial color="#203c3e" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.4, entranceZ + 0.145]}>
          <boxGeometry args={[1.42, 0.73, 0.025]} />
          <meshStandardMaterial color="#9ce1d5" emissive="#3a8f82" emissiveIntensity={0.3} roughness={0.25} />
        </mesh>
        <Text position={[0, 1.4, entranceZ + 0.17]} fontSize={0.34} color="#234944" anchorX="center" anchorY="middle">∑</Text>
        <FrontSign text="MATH LAB" color="#264b43" textColor="#dcfff1" width={2.2} y={2.46} z={entranceZ + 0.11} />
        <mesh castShadow position={[1.78, 2.48, -0.45]}>
          <cylinderGeometry args={[0.21, 0.21, 0.13, 16]} />
          <meshStandardMaterial color="#dce9e0" metalness={0.35} roughness={0.3} />
        </mesh>
      </>}

      {type === 'blender' && <>
        {/* Blender studio: gallery-like facade and a sculptural roof display. */}
        <RoundedBox castShadow position={[0, 2.15, 0]} args={[baseWidth + 0.2, 0.25, baseDepth + 0.16]} radius={0.09} smoothness={4}>
          <meshStandardMaterial color="#6a7285" roughness={0.55} />
        </RoundedBox>
        <mesh castShadow position={[0, 2.38, -0.12]} rotation={[0.18, 0.12, -0.1]}>
          <boxGeometry args={[2.0, 0.12, 1.45]} />
          <meshStandardMaterial color="#f1d5a7" roughness={0.45} />
        </mesh>
        <mesh position={[0, 2.47, -0.12]} rotation={[0.18, 0.12, -0.1]}>
          <boxGeometry args={[1.76, 0.045, 1.2]} />
          <meshStandardMaterial color="#9fb2ca" roughness={0.3} metalness={0.04} />
        </mesh>
        <mesh castShadow position={[0, 1.35, entranceZ + 0.07]}>
          <boxGeometry args={[1.75, 0.95, 0.12]} />
          <meshStandardMaterial color="#35404b" roughness={0.34} />
        </mesh>
        <mesh position={[0, 1.35, entranceZ + 0.145]}>
          <boxGeometry args={[1.52, 0.72, 0.025]} />
          <meshStandardMaterial color="#b8c8de" roughness={0.3} />
        </mesh>
        <FrontSign text="3D STUDIO" color="#424b5e" textColor="#f2e6d0" width={2.3} y={2.48} z={entranceZ + 0.11} />
      </>}

      {type === 'library' && <>
        {/* Shakespeare.GPT: classic miniature library with warm book-spine accents. */}
        <mesh castShadow position={[0, 2.23, 0]}>
          <coneGeometry args={[3.02, 0.78, 4]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        {[-1.45, -0.5, 0.5, 1.45].map((x, index) => <mesh key={x} position={[x, 1.18, entranceZ + 0.02]}>
          <boxGeometry args={[0.13, 1.55, 0.15]} />
          <meshStandardMaterial color={index % 2 ? '#f0dbb2' : '#b99566'} roughness={0.75} />
        </mesh>)}
        <mesh position={[0, 1.95, entranceZ + 0.07]}>
          <boxGeometry args={[3.7, 0.12, 0.16]} />
          <meshStandardMaterial color="#ead8b6" roughness={0.7} />
        </mesh>
        <FrontSign text="AI LIBRARY" color="#604736" textColor="#fff0d3" width={2.35} y={2.45} z={entranceZ + 0.09} />
        {[-1.8, 1.8].map((x) => <mesh key={x} position={[x, 1.28, entranceZ + 0.07]}>
          <boxGeometry args={[0.54, 0.72, 0.07]} />
          <meshStandardMaterial color={x < 0 ? '#bd6350' : '#628f7e'} roughness={0.8} />
        </mesh>)}
      </>}

      {type === 'hq' && <>
        <mesh castShadow position={[0, 2.12, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.05, 0.95, 4]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        <mesh castShadow position={[0, 2.72, 0]}>
          <coneGeometry args={[0.68, 0.72, 4]} />
          <meshStandardMaterial color="#70a8c3" flatShading />
        </mesh>
        {[-1.45, -0.5, 0.5, 1.45].map((x) => <mesh key={x} castShadow position={[x, 1.15, entranceZ + 0.02]}>
          <boxGeometry args={[0.14, 1.62, 0.16]} />
          <meshStandardMaterial color="#f0dfbd" />
        </mesh>)}
        <mesh position={[0, 1.95, entranceZ + 0.07]}>
          <boxGeometry args={[3.55, 0.12, 0.16]} />
          <meshStandardMaterial color="#f0dfbd" />
        </mesh>
        <mesh position={[0, 0.29, entranceZ + 0.54]}>
          <boxGeometry args={[1.35, 0.18, 0.78]} />
          <meshStandardMaterial color="#c8c2b1" />
        </mesh>
      </>}

      {hovered && <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[baseWidth + 0.52, 0.025, baseDepth + 0.52]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} />
      </mesh>}
      <Label project={project} onSelect={onSelect} visible={labelsVisible} />
    </group>
  );
}

function Fountain({ position }) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.12, 0]}><cylinderGeometry args={[0.28, 0.36, 0.12, 10]} /><meshStandardMaterial color="#c8c1ad" /></mesh>
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.21, 0.27, 0.2, 10]} /><meshStandardMaterial color="#78aebd" roughness={0.24} /></mesh>
      <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.09, 8, 6]} /><meshStandardMaterial color="#d5f3ee" roughness={0.18} /></mesh>
    </group>
  );
}

const LEFT_BOULEVARD = [
  [-18.35, -18.2],
  [-18.9, -14.0],
  [-18.35, -8.5],
  [-18.75, -2.8],
  [-18.3, 2.5],
  [-18.75, 8.2],
  [-18.35, 14.0],
  [-17.9, 18.2],
];
const RIGHT_BOULEVARD = LEFT_BOULEVARD.map(([x, z]) => [-x, z]);
const ENTRY_CURVE = [
  [0, 26.2],
  [0.15, 24.6],
  [0.72, 22.7],
  [0.68, 20.5],
  [0.18, 18.4],
  [0, 17.5],
];

function makeRoadRibbon(curve, width) {
  const segments = 160;
  const halfWidth = width / 2;
  const positions = [];
  const indices = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const nx = -tangent.z;
    const nz = tangent.x;

    positions.push(
      point.x + nx * halfWidth, 0.045, point.z + nz * halfWidth,
      point.x - nx * halfWidth, 0.045, point.z - nz * halfWidth,
    );

    if (i < segments) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function CurvedRoad({ points, width = 2.35, dashCount = 14 }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(
      points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      'centripetal',
    ),
    [points],
  );
  const geometry = useMemo(() => makeRoadRibbon(curve, width), [curve, width]);
  const dashes = useMemo(() => Array.from({ length: dashCount }, (_, index) => {
    const t = (index + 0.65) / (dashCount + 1.3);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    return {
      key: index,
      position: [point.x, 0.073, point.z],
      rotation: Math.atan2(tangent.x, tangent.z),
    };
  }), [curve, dashCount]);


  return (
    <group>
      <mesh geometry={geometry} receiveShadow material={MATERIALS.road} />
      {dashes.map((dash) => (
        <mesh
          key={dash.key}
          position={dash.position}
          rotation={[0, dash.rotation, 0]}
          material={MATERIALS.lane}
        >
          <boxGeometry args={[0.64, 0.018, 0.075]} />
        </mesh>
      ))}
    </group>
  );
}

function TownGround({ projects = [], hqProject, nightFactorRef }) {
  const projectCenters = useMemo(
    () => [...projects, hqProject]
      .filter(Boolean)
      .map((project) => project.position || [0, 12]),
    [projects, hqProject],
  );

  const trees = useMemo(() => createTreePlacements(projectCenters), [projectCenters]);
  const lamps = STREET_LAMP_POSITIONS;

  return (
    <>
      <mesh receiveShadow position={[0, -0.4, 0]}>
        <boxGeometry args={[42, 0.8, 54]} />
        <meshStandardMaterial color="#78a96c" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[44, 0.7, 56]} />
        <meshStandardMaterial color="#857965" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#2f879f" roughness={0.32} metalness={0.08} />
      </mesh>

      {/* Softly curved outer roads break up the strict rectangular grid. */}
      <CurvedRoad points={LEFT_BOULEVARD} width={2.25} dashCount={17} />
      <CurvedRoad points={RIGHT_BOULEVARD} width={2.25} dashCount={17} />
      <CurvedRoad points={ENTRY_CURVE} width={3.1} dashCount={5} />

      {/* Shoreline rocks, leaving the curved entrance road clear. */}
      {Array.from({ length: 36 }, (_, index) => {
        const t = index / 35;
        const x = -20.0 + t * 40.0;
        return (
          <mesh
            key={`south-rock-${index}`}
            castShadow
            position={[x, -0.14 + (index % 3) * 0.045, 27.4 + Math.sin(index * 2.5) * 0.2]}
            rotation={[0, index * 0.62, 0]}
          >
            <dodecahedronGeometry args={[0.48 + (index % 3) * 0.1, 0]} />
            <meshStandardMaterial color={index % 2 ? '#77796e' : '#928f80'} flatShading />
          </mesh>
        );
      })}
      {Array.from({ length: 27 }, (_, index) => {
        const z = -25 + (index / 26) * 50;
        return (
          <mesh
            key={`left-rock-${index}`}
            castShadow
            position={[-21.4, -0.12, z]}
            rotation={[0, index * 0.63, 0]}
          >
            <dodecahedronGeometry args={[0.5 + (index % 4) * 0.08, 0]} />
            <meshStandardMaterial color="#77796e" flatShading />
          </mesh>
        );
      })}
      {Array.from({ length: 27 }, (_, index) => {
        const z = -25 + (index / 26) * 50;
        return (
          <mesh
            key={`right-rock-${index}`}
            castShadow
            position={[21.4, -0.12, z]}
            rotation={[0, index * 0.63, 0]}
          >
            <dodecahedronGeometry args={[0.5 + (index % 4) * 0.08, 0]} />
            <meshStandardMaterial color="#77796e" flatShading />
          </mesh>
        );
      })}

      {/* Main road grid. Project plots occupy the spaces between these roads. */}
      {[-16, -8, 0, 8, 16].map((z) => (
        <Road key={`horizontal-${z}`} position={[0, 0, z]} size={[40, 3.1]} />
      ))}
      {[-7, 7].map((x) => (
        <Road key={`vertical-${x}`} position={[x, 0, 0]} size={[3.1, 48]} horizontal={false} />
      ))}

      {[-16, -8, 0, 8, 16].map((z) => (
        <React.Fragment key={`crosswalk-${z}`}>
          <Crosswalk position={[-7, -0.01, z]} acrossX />
          <Crosswalk position={[7, -0.01, z]} acrossX />
        </React.Fragment>
      ))}

      {trees.map(([x, y, z, scale], index) => (
        <Tree key={index} position={[x, y, z]} scale={scale} variant={index} />
      ))}
      {lamps.map((point, index) => (
        <StreetLamp
          key={index}
          position={[point[0], 0, point[1]]}
          nightFactorRef={nightFactorRef}
        />
      ))}
    </>
  );
}

/*
 * Sample the car footprint instead of inflating a big axis-aligned box.
 * The old box was overly conservative near trees and lamps, so several
 * otherwise clear paths behaved like invisible walls.
 */
const CAR_CONTACT_POINTS = [
  [0, 0],
  [0, -0.98], [0, 0.98],
  [-0.45, -0.78], [0.45, -0.78],
  [-0.45, 0.78], [0.45, 0.78],
  [-0.55, 0], [0.55, 0],
];
const CAR_CONTACT_RADIUS = 0.19;

function carIsBlocked(x, z, yaw, colliders) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const samples = CAR_CONTACT_POINTS.map(([localX, localZ]) => ({
    x: x + cosYaw * localX + sinYaw * localZ,
    z: z - sinYaw * localX + cosYaw * localZ,
  }));

  return colliders.some((obstacle) => samples.some((sample) => {
    if (Number.isFinite(obstacle.radius)) {
      return Math.hypot(
        sample.x - obstacle.x,
        sample.z - obstacle.z,
      ) < obstacle.radius + CAR_CONTACT_RADIUS;
    }

    return (
      Math.abs(sample.x - obstacle.x) < obstacle.halfWidth + CAR_CONTACT_RADIUS &&
      Math.abs(sample.z - obstacle.z) < obstacle.halfDepth + CAR_CONTACT_RADIUS
    );
  }));
}

function Car({
  carRef,
  keysRef,
  viewMode,
  colliders = [],
  onNearbyProject,
  onSpeedChange,
  paused = false,
}) {
  const speedRef = useRef(0);
  const wheelRefs = useRef([]);
  const lastNearbyId = useRef(null);
  const lastSpeedPublish = useRef(0);

  useEffect(() => {
    if (viewMode !== 'drive' || paused) {
      speedRef.current = 0;
      onSpeedChange?.(0);
      onNearbyProject?.(null);
      lastNearbyId.current = null;
    }
  }, [
    viewMode,
    paused,
    onSpeedChange,
    onNearbyProject,
  ]);

  useFrame((state, delta) => {
    const car = carRef.current;
    if (!car) return;

    if (viewMode !== 'drive' || paused) {
      return;
    }

    const dt = Math.min(delta, 0.04);
    const keys = keysRef.current;
    const forward = keys.has('w') || keys.has('arrowup');
    const reverse = keys.has('s') || keys.has('arrowdown');
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const brake = keys.has(' ');

    // Accelerator, reverse, brake, and natural rolling resistance.
    if (brake) {
      if (speedRef.current > 0) {
        speedRef.current = Math.max(
          0,
          speedRef.current - 12 * dt,
        );
      } else {
        speedRef.current = Math.min(
          0,
          speedRef.current + 12 * dt,
        );
      }
    } else if (forward) {
      const acceleration =
        speedRef.current < 0 ? 11 : 5.3;

      speedRef.current = Math.min(
        speedRef.current + acceleration * dt,
        6.5,
      );
    } else if (reverse) {
      const deceleration =
        speedRef.current > 0 ? 11 : 5.5;

      speedRef.current = Math.max(
        speedRef.current - deceleration * dt,
        -2.8,
      );
    } else {
      speedRef.current *= Math.pow(0.955, dt * 60);
    }

    const steer =
      (left ? 1 : 0) + (right ? -1 : 0);

    const oldX = car.position.x;
    const oldZ = car.position.z;

    // Steering must still respond when the car is nearly stationary at a
    // wall. Otherwise each blocked frame resets speed and the steering input
    // can never build enough yaw to turn away from the obstacle.
    if (steer !== 0 && (Math.abs(speedRef.current) > 0.04 || forward || reverse)) {
      const signedDirection = speedRef.current < -0.05 || (speedRef.current <= 0.05 && reverse) ? -1 : 1;
      const turnStrength = Math.max(
        0.32,
        Math.min(Math.abs(speedRef.current) / 2.6, 1),
      );
      car.rotation.y += steer * dt * 1.35 * turnStrength * signedDirection;
    }

    const yaw = car.rotation.y;
    const nextX =
      oldX - Math.sin(yaw) * speedRef.current * dt;
    const nextZ =
      oldZ - Math.cos(yaw) * speedRef.current * dt;

    // Roam freely across roads and grass. Only the playable island edge
    // and physical obstacle colliders constrain movement.
    const canMoveTo = (x, z) =>
      x >= -20.25 &&
      x <= 20.25 &&
      z >= -26.1 &&
      z <= 26.25 &&
      !carIsBlocked(x, z, yaw, colliders);

    if (canMoveTo(nextX, nextZ)) {
      car.position.x = nextX;
      car.position.z = nextZ;
    } else {
      // Try sliding along the road beside the obstacle.
      let moved = false;

      if (canMoveTo(nextX, oldZ)) {
        car.position.x = nextX;
        moved = true;
      }

      if (canMoveTo(car.position.x, nextZ)) {
        car.position.z = nextZ;
        moved = true;
      }

      if (moved) {
        speedRef.current *= 0.72;
      } else {
        // A collision kills forward motion, but the low-speed steering logic
        // above still lets the player rotate away, or reverse out.
        speedRef.current = 0;
      }
    }

    // Front wheels steer; all wheels rotate with vehicle movement.
    wheelRefs.current.forEach((wheel, index) => {
      if (!wheel) return;

      wheel.rotation.x += speedRef.current * dt * 2.6;

      if (index < 2) {
        wheel.rotation.y = THREE.MathUtils.damp(
          wheel.rotation.y,
          steer * 0.28,
          10,
          dt,
        );
      }
    });

    // Find the closest project that is within inspection range.
    let nearestProject = null;
    let nearestDistance = Infinity;

    for (const obstacle of colliders) {
      if (!obstacle.project) continue;

      const distance = Math.hypot(
        car.position.x - obstacle.x,
        car.position.z - obstacle.z,
      );

      if (distance < 7.8 && distance < nearestDistance) {
        nearestDistance = distance;
        nearestProject = obstacle.project;
      }
    }

    const nearbyId = nearestProject?.id ?? null;

    // Don't trigger a React state update on every animation frame.
    if (nearbyId !== lastNearbyId.current) {
      lastNearbyId.current = nearbyId;
      onNearbyProject?.(nearestProject);
    }

    // Publish speed at a limited rate to avoid excessive re-renders.
    if (state.clock.elapsedTime - lastSpeedPublish.current > 0.15) {
      lastSpeedPublish.current = state.clock.elapsedTime;

      // Arcade-style approximate km/h display.
      onSpeedChange?.(
        Math.round(Math.abs(speedRef.current) * 8),
      );
    }
  });

  const wheelPositions = [
    [-0.59, 0.2, -0.68],
    [0.59, 0.2, -0.68],
    [-0.59, 0.2, 0.68],
    [0.59, 0.2, 0.68],
  ];

  return (
    <group ref={carRef} position={[-3.25, 0.02, 23.7]} rotation={[0, 0.24, 0]}>
      {/* Lower chassis */}
      <RoundedBox castShadow receiveShadow position={[0, 0.29, 0]} args={[1.22, 0.34, 2.12]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#e4a33f" metalness={0.12} roughness={0.34} />
      </RoundedBox>

      {/* Hood and rear deck give the car a recognisable silhouette. */}
      <RoundedBox castShadow position={[0, 0.43, -0.69]} args={[1.08, 0.16, 0.64]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color="#f1b94f" metalness={0.1} roughness={0.33} />
      </RoundedBox>
      <RoundedBox castShadow position={[0, 0.42, 0.72]} args={[1.05, 0.14, 0.43]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color="#d98b30" metalness={0.1} roughness={0.36} />
      </RoundedBox>

      {/* Cabin and roof */}
      <RoundedBox castShadow position={[0, 0.57, -0.05]} args={[0.82, 0.39, 0.98]} radius={0.13} smoothness={4}>
        <meshStandardMaterial color="#397b89" metalness={0.16} roughness={0.25} />
      </RoundedBox>
      <RoundedBox castShadow position={[0, 0.79, -0.06]} args={[0.70, 0.10, 0.65]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color="#f2d9a0" roughness={0.4} />
      </RoundedBox>

      {/* Windscreens and side windows */}
      <mesh position={[0, 0.62, -0.56]} rotation={[0.16, 0, 0]}>
        <boxGeometry args={[0.68, 0.23, 0.035]} />
        <meshStandardMaterial color="#bfe8ed" metalness={0.08} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.61, 0.47]} rotation={[-0.16, 0, 0]}>
        <boxGeometry args={[0.65, 0.21, 0.035]} />
        <meshStandardMaterial color="#a9dce2" metalness={0.08} roughness={0.2} />
      </mesh>
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <mesh position={[side * 0.416, 0.59, -0.24]}>
            <boxGeometry args={[0.025, 0.22, 0.33]} />
            <meshStandardMaterial color="#b8e1e4" roughness={0.2} />
          </mesh>
          <mesh position={[side * 0.416, 0.59, 0.17]}>
            <boxGeometry args={[0.025, 0.22, 0.28]} />
            <meshStandardMaterial color="#b8e1e4" roughness={0.2} />
          </mesh>
          <RoundedBox position={[side * 0.69, 0.53, -0.43]} args={[0.16, 0.09, 0.14]} radius={0.035} smoothness={2}>
            <meshStandardMaterial color="#e4a33f" roughness={0.35} />
          </RoundedBox>
        </React.Fragment>
      ))}

      {/* Bumpers, headlights, rear lights and number plate */}
      <RoundedBox position={[0, 0.22, -1.08]} args={[1.02, 0.11, 0.13]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color="#f4e8c7" metalness={0.1} roughness={0.3} />
      </RoundedBox>
      <RoundedBox position={[0, 0.23, 1.08]} args={[1.02, 0.10, 0.12]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color="#40494b" metalness={0.14} roughness={0.34} />
      </RoundedBox>
      {[-0.39, 0.39].map((x) => (
        <React.Fragment key={x}>
          <RoundedBox position={[x, 0.40, -1.055]} args={[0.22, 0.12, 0.055]} radius={0.035} smoothness={3}>
            <meshStandardMaterial color="#fff5cf" emissive="#ffdf82" emissiveIntensity={0.55} roughness={0.25} />
          </RoundedBox>
          <RoundedBox position={[x, 0.40, 1.055]} args={[0.20, 0.11, 0.055]} radius={0.025} smoothness={2}>
            <meshStandardMaterial color="#c84943" emissive="#8d2722" emissiveIntensity={0.25} roughness={0.3} />
          </RoundedBox>
        </React.Fragment>
      ))}
      <mesh position={[0, 0.29, -1.15]}>
        <boxGeometry args={[0.32, 0.065, 0.025]} />
        <meshStandardMaterial color="#f8edcf" roughness={0.35} />
      </mesh>

      {/* Four rubber wheels with hubs */}
      {wheelPositions.map(([x, y, z], index) => (
        <group
          key={index}
          ref={(node) => { wheelRefs.current[index] = node; }}
          position={[x, y, z]}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.205, 0.205, 0.145, 18]} />
            <meshStandardMaterial color="#25292a" roughness={0.9} />
          </mesh>
          <mesh position={[x < 0 ? -0.077 : 0.077, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.105, 0.105, 0.018, 16]} />
            <meshStandardMaterial color="#d5d6cf" metalness={0.45} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraRig({ viewMode, carRef, selectedProject, transitioning, setTransitioning }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const transitionWasHandled = useRef(false);
  const isoPosition = useMemo(() => new THREE.Vector3(0, 31, 37), []);

  const focus = useMemo(() => {
    if (!selectedProject) return null;
    const position = selectedProject.position || (selectedProject.id === 'about' ? [0, -4] : [0, 0]);
    const x = position[0] ?? 0;
    const z = position[1] ?? 0;
    // The panel occupies the right side, so frame the selected landmark left of centre.
    const framedX = x + 4.0;
    return {
      target: new THREE.Vector3(framedX, 1.05, z),
      camera: new THREE.Vector3(framedX, 10.0, z + 10.5),
    };
  }, [selectedProject]);

  useEffect(() => {
    transitionWasHandled.current = false;
  }, [viewMode, selectedProject?.id]);

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-3.5 * Math.min(delta, 0.05));

    if (viewMode === 'drive' && carRef.current) {
      const car = carRef.current;
      const yaw = car.rotation.y;
      const desired = new THREE.Vector3(
        car.position.x + Math.sin(yaw) * 4.8,
        car.position.y + 2.8,
        car.position.z + Math.cos(yaw) * 4.4,
      );
      const look = new THREE.Vector3(
        car.position.x - Math.sin(yaw) * 5.0,
        car.position.y + 0.9,
        car.position.z - Math.cos(yaw) * 5.0,
      );
      camera.position.lerp(desired, ease);
      lookTarget.current.lerp(look, ease);
      camera.lookAt(lookTarget.current);
      if (transitioning && camera.position.distanceTo(desired) < 0.22 && !transitionWasHandled.current) {
        transitionWasHandled.current = true;
        setTransitioning(false);
      }
      return;
    }

    if (viewMode === 'iso' && transitioning) {
      const destinationCamera = focus?.camera || isoPosition;
      const destinationTarget = focus?.target || new THREE.Vector3(0, 0, 0);
      camera.position.lerp(destinationCamera, ease);
      lookTarget.current.lerp(destinationTarget, ease);
      camera.lookAt(lookTarget.current);
      if (controlsRef.current) controlsRef.current.target.copy(lookTarget.current);
      const closeToCamera = camera.position.distanceTo(destinationCamera) < 0.12;
      const closeToTarget = lookTarget.current.distanceTo(destinationTarget) < 0.12;
      if (closeToCamera && closeToTarget && !transitionWasHandled.current) {
        transitionWasHandled.current = true;
        camera.position.copy(destinationCamera);
        lookTarget.current.copy(destinationTarget);
        camera.lookAt(destinationTarget);
        if (controlsRef.current) controlsRef.current.target.copy(destinationTarget);
        setTransitioning(false);
      }
      return;
    }

    if (viewMode === 'iso' && controlsRef.current) {
      lookTarget.current.copy(controlsRef.current.target);
    }
  });

  return <OrbitControls
    ref={controlsRef}
    enabled={viewMode === 'iso' && !transitioning}
    enableDamping
    dampingFactor={0.08}
    minDistance={8}
    maxDistance={38}
    maxPolarAngle={Math.PI / 2.08}
    target={[0, 0, 0]}
  />;
}

function EntrySign() {
  return <group position={[0, 0, 21.3]}>
    <mesh castShadow position={[0, 1.75, 0]}><boxGeometry args={[4.7, 1.05, 0.28]} /><meshStandardMaterial color="#3b382c" roughness={0.7} /></mesh>
    <Text position={[0, 1.9, 0.17]} fontSize={0.22} color="#f5d58b" anchorX="center" anchorY="middle">WELCOME TO</Text>
    <Text position={[0, 1.58, 0.17]} fontSize={0.31} color="#fff0c9" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#3b382c">UDAY'S STACK</Text>
    {[-2.1, 2.1].map((x) => <mesh key={x} castShadow position={[x, 0.83, 0]}><boxGeometry args={[0.13, 1.7, 0.16]} /><meshStandardMaterial color="#8b7860" /></mesh>)}
  </group>;
}

export default function World({
  projects,
  hqProject,
  onSelect,
  onNearbyProject,
  onSpeedChange,
  drivePaused = false,
  viewMode,
  carRef,
  keysRef,
  selectedProject,
  transitioning,
  setTransitioning,
  labelsVisible = true,
}) {
  const hqWithPosition = useMemo(() => ({
    ...hqProject,
    position: hqProject.position || [0, 12],
    color: '#d6c7a1',
    accent: '#82cce4',
    icon: '●',
    type: 'hq',
  }), [hqProject]);

  const allProjects = useMemo(
    () => [...projects, hqWithPosition],
    [projects, hqWithPosition],
  );
  const nightFactorRef = useRef(0);
  const projectCenters = useMemo(
    () => allProjects.map((project) => project.position || [0, 12]),
    [allProjects],
  );
  const treePlacements = useMemo(
    () => createTreePlacements(projectCenters),
    [projectCenters],
  );

  const carColliders = useMemo(() => {
    const buildingColliders = allProjects.map((project) => {
      const [width, depth] =
        COLLISION_SIZES[project.type] || [4.5, 3.5];

      return {
        id: project.id,
        project,
        x: project.position?.[0] ?? 0,
        z: project.position?.[1] ?? 0,
        halfWidth: width / 2 + 0.12,
        halfDepth: depth / 2 + 0.12,
      };
    });

    // The four parked vehicles already rendered in TownGround's
    // surrounding scene are also treated as solid obstacles.
    const parkedCars = [
      {
        id: 'parked-blue-car',
        x: -9.45,
        z: -7.8,
        halfWidth: 0.55,
        halfDepth: 0.8,
      },
      {
        id: 'parked-red-car',
        x: 9.45,
        z: 0.5,
        halfWidth: 0.55,
        halfDepth: 0.8,
      },
      {
        id: 'parked-white-car',
        x: -9.55,
        z: 8.7,
        halfWidth: 0.55,
        halfDepth: 0.8,
      },
      {
        id: 'parked-green-car',
        x: 9.55,
        z: -8.9,
        halfWidth: 0.55,
        halfDepth: 0.8,
      },
    ];

    const treeColliders = treePlacements.map(([x, , z, scale], index) => ({
      id: `tree-${index}`,
      kind: 'tree',
      x,
      z,
      radius: 0.38 * scale + 0.08,
    }));

    const lampColliders = STREET_LAMP_POSITIONS.map(([x, z], index) => ({
      id: `lamp-${index}`,
      kind: 'lamp',
      x,
      z,
      radius: 0.16,
    }));

    const fixedObjects = [
      { id: 'courtyard-fountain', x: 2.55, z: 10.75, halfWidth: 0.42, halfDepth: 0.42 },
      // Welcome sign and supporting posts at the entrance.
      { id: 'welcome-sign', x: 0, z: 21.3, halfWidth: 2.35, halfDepth: 0.17 },
      ...parkedCars,
    ];

    return [...buildingColliders, ...treeColliders, ...lampColliders, ...fixedObjects];
  }, [allProjects, treePlacements]);

  return (
    <>
      <DayNightEnvironment nightFactorRef={nightFactorRef} />
      <TownGround
        projects={projects}
        hqProject={hqWithPosition}
        nightFactorRef={nightFactorRef}
      />

      {projects.map((project) => (
        <Building
          key={project.id}
          project={project}
          onSelect={onSelect}
          selectedProject={selectedProject}
          labelsVisible={labelsVisible}
        />
      ))}

      <Fountain position={[2.55, 0.02, 10.75]} />

      <Building
        project={hqWithPosition}
        onSelect={onSelect}
        selectedProject={selectedProject}
        labelsVisible={labelsVisible}
      />

      <EntrySign />
      <Car
        carRef={carRef}
        keysRef={keysRef}
        viewMode={viewMode}
        colliders={carColliders}
        onNearbyProject={onNearbyProject}
        onSpeedChange={onSpeedChange}
        paused={drivePaused || Boolean(selectedProject)}
      />

      {/* Parked cars remain on roadside shoulders, clear of building plots. */}
      {[
        [-9.45, -7.8, 1.25, '#4f91c6'],
        [9.45, 0.5, -1.15, '#d55c48'],
        [-9.55, 8.7, 0.7, '#e7e4d8'],
        [9.55, -8.9, 0.2, '#6c9f74'],
      ].map(([x, z, rotation, carColor], index) => (
        <group key={index} position={[x, 0.11, z]} rotation={[0, rotation, 0]}>
          <RoundedBox castShadow args={[0.68, 0.28, 1.22]} radius={0.07} smoothness={3}>
            <meshStandardMaterial color={carColor} roughness={0.42} />
          </RoundedBox>
          <RoundedBox position={[0, 0.2, -0.06]} args={[0.48, 0.2, 0.6]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color="#8bbdc7" roughness={0.25} />
          </RoundedBox>
        </group>
      ))}

      <CameraRig
        viewMode={viewMode}
        carRef={carRef}
        selectedProject={selectedProject}
        transitioning={transitioning}
        setTransitioning={setTransitioning}
      />
    </>
  );
}
