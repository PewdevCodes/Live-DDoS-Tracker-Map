import 'dotenv/config';
import { radarResponseSchema } from "./radar-schema.js";

async function fetchRadarData() {
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

    const data = radarResponseSchema.parse(body);

    console.log('\n--- Response metadata ---');
    console.log(JSON.stringify(data.result?.meta, null, 2));

    console.log('\n--- Attack data ---');
    console.log(JSON.stringify(data.result?.top_0, null, 2));
    }

fetchRadarData().catch((error: unknown) => {
  console.error('Request failed:', error);
  process.exitCode = 1;
});
