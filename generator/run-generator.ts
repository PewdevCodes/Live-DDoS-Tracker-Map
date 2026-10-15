// ADDED: Import live Cloudflare Radar fetcher
import { fetchRadarSnapshot } from "../fetch-radar.js";

import {
  buildWeightedPool,
  sampleAttackPair,
} from "./sampler.js";

import { createEvent } from "./event.js";
import { getNextDelayMs } from "./timing.js";

// COMMENTED OUT: Static timestamp replaced with dynamic API snapshot timestamp
// const snapshotUpdatedAt = new Date().toISOString();

const eventsPerSecond = 2;

// ADDED: Helper function for asynchronous delay pauses
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// COMMENTED OUT: Hardcoded test pairs replaced with live Cloudflare snapshot
/*
const pairs = [
  {
    originCountryAlpha2: "BR",
    originCountryName: "Brazil",
    targetCountryName: "United States",
    targetCountryAlpha2: "US",
    value: 9.012713,
  },
  {
    originCountryAlpha2: "RO",
    originCountryName: "Romania",
    targetCountryName: "United States",
    targetCountryAlpha2: "US",
    value: 3.436308,
  },
];

const pool = buildWeightedPool(pairs);
*/

async function startGenerator() {
  // ADDED: Fetch API data and build pool dynamically
  console.log("Fetching Cloudflare Radar snapshot...");
  const snapshot = await fetchRadarSnapshot();
  const pool = buildWeightedPool(snapshot.result.top_0);
  const snapshotUpdatedAt = snapshot.result.meta.lastUpdated;

  // ADDED: Guard clause for empty datasets
  if (pool.length === 0) {
    throw new Error("Radar returned no usable attack pairs.");
  }

  // MODIFIED: Updated startup logging with snapshot metadata
  console.log(`Loaded ${pool.length} country pairs.`);
  console.log(`Source data updated: ${snapshotUpdatedAt}`);
  console.log(`Average simulated event rate: ${eventsPerSecond}/second`);
  console.log("Events are simulated, not individual observed attacks.");
  console.log("Press Ctrl+C to stop.\n");

  while (true) {
    const pair = sampleAttackPair(pool);

    const event = createEvent(
      pair,
      snapshotUpdatedAt
    );

    // MODIFIED: Compact single-line JSON output for streaming
    // OLD: console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(event));

    // MODIFIED: Replaced inline Promise/setTimeout with sleep helper
    /*
    const delayMs = getNextDelayMs(eventsPerSecond);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });
    */
    await sleep(getNextDelayMs(eventsPerSecond));
  }
}

startGenerator().catch((error: unknown) => {
  console.error("Generator failed:", error);
  process.exitCode = 1;
});