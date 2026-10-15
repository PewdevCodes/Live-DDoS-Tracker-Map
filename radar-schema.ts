// ZOD Schema Validation for Radar


import { z } from "zod";

const dateRangeSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

const attackPairSchema = z.object({
  originCountryAlpha2: z.string().length(2),
  originCountryName: z.string(),
  targetCountryName: z.string(),
  targetCountryAlpha2: z.string().length(2),
  value: z.string().transform(Number).pipe(
    z.number().finite().nonnegative()
  ),
});

export const radarResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({
    meta: z.object({
      dateRange: z.array(dateRangeSchema),
      normalization: z.string(),
      lastUpdated: z.string(),
      units: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      ),
    }),
    top_0: z.array(attackPairSchema),
  }),
});

export type AttackPair = z.infer<typeof attackPairSchema>;
export type RadarResponse = z.infer<typeof radarResponseSchema>;
