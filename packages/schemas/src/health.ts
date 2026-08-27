import { z } from "zod";

export const healthResponseSchema = z
  .object({
    status: z.literal("ok"),
    service: z.literal("loya-worker"),
    version: z.literal("s0-poc"),
    correlationId: z.uuid(),
  })
  .strict();

export type HealthResponse = z.infer<typeof healthResponseSchema>;
