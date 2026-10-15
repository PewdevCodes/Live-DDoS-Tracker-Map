
import { randomUUID } from "node:crypto";
import type { WeightedAttackPair } from "./sampler.js";

export interface SimulatedAttackEvent {
  id: string;
  emittedAt: string;
  origin: string;
  target: string;
  layer: "L3";
  intensity: number;
  kind: "simulated";
  source: "cloudflare-radar";
  snapshotUpdatedAt: string;
}

export function createEvent(
  pair: WeightedAttackPair,
  snapshotUpdatedAt: string
): SimulatedAttackEvent {
  return {
    id: randomUUID(),
    emittedAt: new Date().toISOString(),
    origin: pair.origin,
    target: pair.target,
    layer: "L3",
    intensity: Number(
      (0.4 + Math.random() * 0.6).toFixed(2)
    ),
    kind: "simulated",
    source: "cloudflare-radar",
    snapshotUpdatedAt,
  };
}
