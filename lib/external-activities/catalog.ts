import type { ExternalActivity, ExternalActivityType } from "./types";

const activityTypeMappings: Readonly<Record<string, ExternalActivityType>> = {
  bike: "cycling",
  cycling: "cycling",
  hike: "hiking",
  hiking: "hiking",
  mobility: "mobility",
  run: "running",
  running: "running",
  strength_training: "strength",
  swim: "swimming",
  swimming: "swimming",
  walk: "walking",
  walking: "walking",
};

export function normalizeProviderActivityType(
  providerActivityType: string,
): ExternalActivityType {
  const normalizedKey = providerActivityType.trim().toLowerCase().replaceAll(" ", "_");
  return activityTypeMappings[normalizedKey] ?? "other";
}

export function getEffectiveExternalActivityType(
  activity: ExternalActivity,
): ExternalActivityType {
  return activity.enrichment?.activityTypeOverride ?? activity.activityType;
}
