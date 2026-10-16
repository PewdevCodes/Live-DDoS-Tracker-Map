# DdosAttackmap

A live-looking global DDoS map. Cloudflare Radar publishes AGGREGATED attack
statistics, not individual attacks. The backend samples simulated events from
those aggregates and streams them over WebSocket. The frontend draws them on
a globe.

## Repo layout
- Backend (Node, TypeScript, ws): generator/, realtime/, fetch-radar.ts,
  radar-schema.ts at the repo root.
  DO NOT MODIFY any backend file or the root package.json / tsconfig.json.
- Frontend: web/ (Next.js App Router, TypeScript, Tailwind, shadcn,
  Aceternity globe component). ALL frontend work happens inside web/.
- Dev environment: Windows, PowerShell, VS Code.

## Hard rules (honesty)
- Every event is SIMULATED from Cloudflare Radar aggregates. Never describe
  events as real, live, or individual attacks anywhere in the UI or code
  comments.
- The "Simulated live view" banner must always be visible. Do not remove,
  hide, shorten, or soften its text.
- Counters show simulated events this session, never attack totals.
- Arc brightness and size are decorative, not measured attack volume.
- Do not add fake statistics, invented country data, or made-up numbers
  anywhere. Mock data is allowed only when clearly marked as placeholder in
  the code and not shown as real in the UI.
- Origin country can be misleading (spoofed sources). Never present it as
  the attacker's location.

## Protected files (ask me before changing)
- web/lib/useAttackStream.ts
- web/lib/ArcStore.ts
- web/lib/arcs.ts
If a task seems to require changing one of these, stop and explain why first.

## Event contract (WebSocket at ws://localhost:8080)
- Welcome message: { type: "welcome", notice, recentEvents }
- Event message: { type: "attack-event", data: { id, origin, target, layer,
  kind: "simulated", visualIntensity?, snapshotTime? } }
- origin and target are ISO alpha-2 country codes.
- layer may arrive as 3, "3", or "L3" (same for 7). Normalise it.
- origin === target means a domestic event: draw a pulse, not an arc.

## Frontend rules
- Next.js has cacheComponents and partialPrefetching enabled in
  web/next.config.ts. Do not remove them. Keep the existing turbopack
  settings in that file.
- The globe must load with dynamic import and ssr: false. Put that call
  inside a file that starts with "use client", not directly in a server
  component.
- Never use localStorage-style hacks to fake data; the only data source is
  the WebSocket stream.
- Cap active arcs at about 80 and expire them after a few seconds.
- Every WebSocket, timer, and listener must clean up on unmount.
- Reconnect automatically with backoff when the socket drops.
- Server address comes from NEXT_PUBLIC_WS_URL in web/.env.local. Never
  hardcode it.
- TypeScript strict. No "any" unless unavoidable, with a comment why.
- The Aceternity globe props come from its docs: GlobeConfig (pointSize,
  globeColor, showAtmosphere, atmosphereColor, atmosphereAltitude, emissive,
  emissiveIntensity, shininess, polygonColor, ambientLight,
  directionalLeftLight, directionalTopLight, pointLight, arcTime, arcLength,
  rings, maxRings, initialPosition, autoRotate, autoRotateSpeed) and
  Position (order, startLat, startLng, endLat, endLng, arcAlt, color).
  Do not invent props that are not in this list.

## Style
- Dark, minimal, cyber-monitoring look.
- Own branding. Do not copy any existing product's name, logo, or labels.
- Layer 3 and Layer 7 use different colors for now. Final attack-vector
  colors will be decided later from real data.

## How to work
- Make ONE change at a time and tell me exactly which files you edited.
- Do not refactor unrelated code or rename things I did not ask about.
- Run the TypeScript check or build after changes and report errors.
- If something is ambiguous, ask instead of guessing.
