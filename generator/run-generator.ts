import { fetchRadarSnapshot } from "../fetch-radar.js";
import {
  buildWeightedPool,
  sampleAttackPair,
} from "./sampler.js";
import { createEvent } from "./event.js";
import { getNextDelayMs } from "./timing.js";
// ADDED: Import WebSocket server factory
import { createWsServer } from "../realtime/wsServer.js";

// MODIFIED: Converted to uppercase constants and added server port
const EVENTS_PER_SECOND = 2;
const PORT = 8080;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// MODIFIED: Renamed function to main()
// OLD: async function startGenerator() {
async function main() {
  console.log("Fetching Cloudflare Radar snapshot...");

  const snapshot = await fetchRadarSnapshot();
  const pool = buildWeightedPool(snapshot.result.top_0);
  const snapshotUpdatedAt = snapshot.result.meta.lastUpdated;

  if (pool.length === 0) {
    throw new Error("Radar returned no usable attack pairs.");
  }

  // ADDED: Initialize WebSocket server on port 8080
  const server = createWsServer(PORT);

  // ADDED: Flag and signal handlers for graceful process shutdown
  let stopping = false;
  const stop = () => {
    stopping = true;
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  console.log(`Loaded ${pool.length} country pairs.`);
  console.log("Events are simulated, not individual observed attacks.");

  // ADDED: Wrap execution loop in try...finally to ensure cleanup on exit
  try {
    // MODIFIED: Replaced infinite loop `while (true)` with flag check
    while (!stopping) {
      const pair = sampleAttackPair(pool);
      const event = createEvent(pair, snapshotUpdatedAt);

      // MODIFIED: Broadcast event over WebSocket server and log concise origin -> target line
      // OLD: console.log(JSON.stringify(event));
      server.broadcast(event);
      console.log(`${event.origin} -> ${event.target}`);

      await sleep(getNextDelayMs(EVENTS_PER_SECOND));
    }
  } finally {
    // ADDED: Clean up signal listeners and close WebSocket server gracefully
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    await server.close();
    console.log("DdosAttackmap stopped.");
  }
}

// MODIFIED: Executing main() instead of startGenerator()
// OLD: startGenerator().catch((error: unknown) => {
main().catch((error: unknown) => {
  console.error("Application failed:", error);
  process.exitCode = 1;
});