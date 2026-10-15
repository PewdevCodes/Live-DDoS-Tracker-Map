import { radarResponseSchema  } from "../radar-schema.js";
import { buildWeightedPool, sampleAttackPair } from "./sampler.js";

async function main() {
    // Reuse the real API response from the fetcher.
    // For this initial test, paste a saved response body here.     
    const response = {
        success: true,
        result: {
        meta: {
            dateRange: [
            {
                startTime: "2026-10-14T21:00:00Z",
                endTime: "2026-10-15T21:00:00Z",
            },
            ],
            normalization: "PERCENTAGE",
            lastUpdated: "2026-10-15T20:15:00Z",
            units: [{ name: "*", value: "bytes" }],
        },
        top_0: [
            {
            originCountryAlpha2: "BR",
            originCountryName: "Brazil",
            targetCountryName: "United States",
            targetCountryAlpha2: "US",
            value: "9.012713",
            },
            {
            originCountryAlpha2: "RO",
            originCountryName: "Romania",
            targetCountryName: "United States",
            targetCountryAlpha2: "US",
            value: "3.436308",
            },
        ],
        },
    };

    const data = radarResponseSchema.parse(response);
    const pool = buildWeightedPool(data.result.top_0);
   
    console.log("Normalized pool:", pool);

    const counts = new Map<string, number>();

    for (let i = 0; i < 10_000; i++) {
        const pair = sampleAttackPair(pool);
        const key = `${pair.origin} -> ${pair.target}`;

        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    console.log("Sample results:");
    console.table(
        [...counts.entries()].map(([pair, count]) => ({
        pair,
        count,
        observedPercentage: `${((count / 10_000) * 100).toFixed(2)}%`,
        }))
    );
    }

main().catch(console.error);