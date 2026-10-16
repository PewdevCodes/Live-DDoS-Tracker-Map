"use client";
import dynamic from "next/dynamic";
import type { Position } from "@/components/ui/globe";

// If the export isn't called World, check the bottom of globe.tsx.
const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World),
  { ssr: false }
);

export type TestRoute = Position & {
  origin: string;
  target: string;
  layer: "L3" | "L7";
  kind: string;
  time: string;
};

export const TEST_ROUTES: TestRoute[] = [
  { order: 1, origin: "GB", target: "US", layer: "L7", kind: "Application", time: "00:42:18", startLat: 51.5, startLng: -0.1, endLat: 40.7, endLng: -74.0, arcAlt: 0.32, color: "#38bdf8" },
  { order: 2, origin: "BR", target: "US", layer: "L3", kind: "Network", time: "00:41:54", startLat: -23.5, startLng: -46.6, endLat: 37.7, endLng: -122.4, arcAlt: 0.28, color: "#a78bfa" },
  { order: 3, origin: "JP", target: "SG", layer: "L7", kind: "Application", time: "00:41:31", startLat: 35.7, startLng: 139.7, endLat: 1.3, endLng: 103.8, arcAlt: 0.3, color: "#38bdf8" },
  { order: 4, origin: "IN", target: "DE", layer: "L3", kind: "Network", time: "00:40:59", startLat: 28.6, startLng: 77.2, endLat: 52.5, endLng: 13.4, arcAlt: 0.26, color: "#a78bfa" },
  { order: 5, origin: "AU", target: "HK", layer: "L7", kind: "Application", time: "00:40:22", startLat: -33.9, startLng: 151.2, endLat: 22.3, endLng: 114.2, arcAlt: 0.34, color: "#38bdf8" },
  { order: 6, origin: "MX", target: "ES", layer: "L3", kind: "Network", time: "00:39:47", startLat: 19.4, startLng: -99.1, endLat: 40.4, endLng: -3.7, arcAlt: 0.3, color: "#a78bfa" },
];

interface GlobeTestProps {
  routes: TestRoute[];
  autoRotate: boolean;
  intensity: number;
}

export const rings = TEST_ROUTES.flatMap((arc, index) => [
  { id: `origin-${index}`, lat: arc.startLat, lng: arc.startLng, color: arc.color },
  { id: `target-${index}`, lat: arc.endLat, lng: arc.endLng, color: arc.color },
]);

const globeConfig = {
  globeColor: "#101923",
  emissive: "#07131c",
  emissiveIntensity: 0.35,
  shininess: 0.7,
  showAtmosphere: true,
  atmosphereColor: "#38bdf8",
  atmosphereAltitude: 0.09,
  polygonColor: "rgba(56,189,248,0.48)",
  ambientLight: "#64748b",
  directionalLeftLight: "#bae6fd",
  directionalTopLight: "#38bdf8",
  pointLight: "#67e8f9",
  arcTime: 2200,
  arcLength: 0.5,
  maxRings: 2,
  autoRotate: true,
  autoRotateSpeed: 0.55,
};

export default function GlobeTest({ routes = TEST_ROUTES, autoRotate = true, intensity = 0.72 }: Partial<GlobeTestProps>) {
  const visibleRings = routes.flatMap((arc, index) => [
    { id: `origin-${index}`, lat: arc.startLat, lng: arc.startLng, color: arc.color },
    { id: `target-${index}`, lat: arc.endLat, lng: arc.endLng, color: arc.color },
  ]);

  return (
    <div className="absolute inset-0">
      <World
        data={routes}
        rings={visibleRings}
        globeConfig={{
          ...globeConfig,
          autoRotate,
          arcIntensity: intensity,
        }}
      />
    </div>
  );
}