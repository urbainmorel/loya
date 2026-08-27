import { z } from "zod";

export const AUTH_INTENTS = ["AGENCY", "TENANT", "OWNER"] as const;

export const authIntentSchema = z.enum(AUTH_INTENTS);

export type AuthIntent = z.infer<typeof authIntentSchema>;
