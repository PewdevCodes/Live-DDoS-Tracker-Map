
import {
  buildWeightedPool,
  sampleAttackPair,
} from "./sampler.js";

import { createEvent } from "./event.js";
import { getNextDelayMs } from "./timing.js";

const snapshotUpdatedAt = new Date().toISOString();
const eventsPerSecond = 2;

// Temporary test data.
// We will replace this with validated Cloudflare data next.
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

async function startGenerator() {
  console.log("Simulated event generator started.");
  console.log(`Average rate: ${eventsPerSecond} events/second`);
  console.log("Press Ctrl+C to stop.\n");

  while (true) {
    const pair = sampleAttackPair(pool);

    const event = createEvent(
      pair,
      snapshotUpdatedAt
    );

    console.log(JSON.stringify(event, null, 2));

    const delayMs = getNextDelayMs(eventsPerSecond);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
}

startGenerator().catch((error: unknown) => {
  console.error("Generator failed:", error);
  process.exitCode = 1;
});
