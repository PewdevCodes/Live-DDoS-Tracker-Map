"use client";
import dynamic from "next/dynamic";

// If the export isn't called World, check the bottom of globe.tsx.
const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World),
  { ssr: false }
);

const arcs = [
  { order: 1, startLat: 51.5, startLng: -0.1, endLat: 40.7, endLng: -74.0, arcAlt: 0.3, color: "#38bdf8" },
  { order: 2, startLat: -23.5, startLng: -46.6, endLat: 37.7, endLng: -122.4, arcAlt: 0.3, color: "#f472b6" },
];

const globeConfig = {
  globeColor: "#0b1017",
  showAtmosphere: true,
  atmosphereColor: "#3b82f6",
  atmosphereAltitude: 0.12,
  polygonColor: "rgba(140,160,175,0.35)",
  arcTime: 1500,
  arcLength: 0.5,
  autoRotate: true,
  autoRotateSpeed: 0.4,
};

export default function GlobeTest() {
  return (
    <div className="relative h-screen w-full bg-black">
      <World data={arcs} globeConfig={globeConfig} />
    </div>
  );
}