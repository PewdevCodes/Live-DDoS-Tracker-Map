import 'dotenv/config';
import { radarResponseSchema } from "./radar-schema.js";
//comment: Import the static type inferred from your Zod schema for explicit return typing
import type { RadarResponse } from "./radar-schema.js";

//comment: Renamed function to `fetchRadarSnapshot`, added `export` so other modules can import it,
// and added explicit `: Promise<RadarResponse>` return type annotation.
// OLD: async function fetchRadarData() {
export async function fetchRadarSnapshot(): Promise<RadarResponse> {
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!token) {
    throw new Error(
      'CLOUDFLARE_API_TOKEN is not set in the environment variables.',
    );
  }

  const url = new URL(
    'https://api.cloudflare.com/client/v4/radar/attacks/layer3/top/attacks',
  );

  url.searchParams.set('dateRange', '1d');
  url.searchParams.set('limit', '10');
  url.searchParams.set('format', 'JSON');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      `Cloudflare API error (${response.status}): ${JSON.stringify(body)}`
    );
  }

  // commentted out : Logging inside this function is removed so it acts purely as a data fetcher.
  // const data = radarResponseSchema.parse(body);
  // console.log('\n--- Response metadata ---');
  // console.log(JSON.stringify(data.result?.meta, null, 2));
  // console.log('\n--- Attack data ---');
  // console.log(JSON.stringify(data.result?.top_0, null, 2));

  // ADDED: Return validated data directly to caller instead of just logging it to terminal
  return radarResponseSchema.parse(body);
}

// ADDED: Main function created specifically for CLI logging and testing
async function main() {
  const snapshot = await fetchRadarSnapshot();

  console.log("--- Response metadata ---");
  console.log(JSON.stringify(snapshot.result.meta, null, 2));

  console.log("--- Attack data ---");
  console.log(JSON.stringify(snapshot.result.top_0, null, 2));
}

// COMMENTED OUT: Direct function invocation removed so importing this file elsewhere won't automatically fire API requests.
// fetchRadarData().catch((error: unknown) => {
//   console.error('Request failed:', error);
//   process.exitCode = 1;
// });

// ADDED: Conditional execution check. Runs `main()` ONLY when file is executed directly via CLI (e.g. `npx tsx fetch-radar.ts`)
if (process.argv[1]?.endsWith("fetch-radar.ts")) {
  main().catch((error: unknown) => {
    console.error("Radar fetch failed:", error);
    process.exitCode = 1;
  });
}