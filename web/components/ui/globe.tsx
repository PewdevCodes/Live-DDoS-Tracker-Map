"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, no-var, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Color, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElements["mesh"] & {
      new (): ThreeGlobe;
    };
  }
}

extend({ ThreeGlobe: ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

// Stable object: react-three-fiber manages this camera and keeps its
// aspect ratio in sync with the canvas size.
const CAMERA = {
  fov: 50,
  near: 180,
  far: 1800,
  position: [0, 0, cameraZ] as [number, number, number],
};

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type RingPoint = {
  id: string;
  lat: number;
  lng: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
  rings?: RingPoint[]; // NEW: rings are now controlled by the parent
}

export function Globe({ globeConfig, data, rings }: WorldProps) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  // 1. Initialize globe only once
  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe();
      (groupRef.current as any).add(globeRef.current);
      setIsInitialized(true);
    }
  }, []);

  // 2. Material (unchanged)
  useEffect(() => {
    if (!globeRef.current || !isInitialized) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1;
    globeMaterial.shininess = globeConfig.shininess || 0.9;
  }, [
    isInitialized,
    globeConfig.globeColor,
    globeConfig.emissive,
    globeConfig.emissiveIntensity,
    globeConfig.shininess,
  ]);

  // 3. CHANGED: static setup. Runs on config changes only, never on data.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isInitialized) return;

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor);

    globe
      .arcStartLat((d) => (d as Position).startLat)
      .arcStartLng((d) => (d as Position).startLng)
      .arcEndLat((d) => (d as Position).endLat)
      .arcEndLng((d) => (d as Position).endLng)
      .arcColor((d) => (d as Position).color)
      .arcAltitude((d) => (d as Position).arcAlt)
      .arcStroke((d) => [0.32, 0.28, 0.3][(d as Position).order % 3])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap(() => 0)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globe
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(0.6);

    globe
      .ringColor((d) => {
        const rgb = hexToRgb((d as RingPoint).color) ?? { r: 255, g: 255, b: 255 };
        return (t: number) => `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - t})`;
      })
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(5000); // long on purpose: one wave per ring
  }, [
    isInitialized,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.maxRings,
  ]);

  // 4. CHANGED: arcs and endpoint markers only
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isInitialized) return;

    const points: { color: string; lat: number; lng: number }[] = [];
    for (const arc of data) {
      points.push({ color: arc.color, lat: arc.startLat, lng: arc.startLng });
      points.push({ color: arc.color, lat: arc.endLat, lng: arc.endLng });
    }
    const seen = new Set<string>();
    const unique = points.filter((p) => {
      const key = `${p.lat},${p.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    globe.arcsData(data).pointsData(unique);
  }, [isInitialized, data]);

  // 5. NEW: rings come from the parent (replaces the random-ring timer)
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isInitialized) return;
    globe.ringsData(rings ?? []);
  }, [isInitialized, rings]);

  return <group ref={groupRef} />;
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, []);

  return null;
}

export function World(props: WorldProps) {
  const { globeConfig } = props;
  return (
    <Canvas camera={CAMERA}>
      <fog attach="fog" args={[0xffffff, 400, 2000]} />
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotate={globeConfig.autoRotate ?? true}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}