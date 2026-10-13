import type { StatusTone } from "../StatusBadge";
import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";

export interface CockpitDataTrust {
  label: string;
  tone: StatusTone;
}
export function resolveCockpitDataTrust(
  view: Pick<CommandCenterViewModel, "modules" | "reliability" | "managementSummary">,
  historical = false,
): CockpitDataTrust {
  if (historical) return { label: "نمای قبلی؛ جاری نیست", tone: "critical" };
  if (view.reliability.failedModuleCount > 0) return { label: "خطای داده", tone: "critical" };
  if (view.reliability.hasPartialData || view.reliability.partialModuleCount > 0) {
    return { label: "داده ناقص", tone: "warn" };
  }
  if (view.managementSummary.staleModuleCount > 0) return { label: "داده قدیمی", tone: "warn" };
  const enabled = view.modules.filter(m => m.reliability !== "disabled");
  if (enabled.some(m => m.reliability === "invalid" || m.reliability === "unsupported_version" || m.reliability === "unavailable")) {
    return { label: "خطای داده", tone: "critical" };
  }
  if (enabled.some(m => m.reliability === "stale_last_known_good")) return { label: "داده قدیمی", tone: "warn" };
  if (enabled.some(m => m.reliability === "degraded" || m.isPartialData)) return { label: "داده همراه هشدار", tone: "warn" };
  if (!enabled.length || enabled.some(m => ["unknown", "no_data"].includes(m.reliability))) {
    return { label: "اعتبار نامشخص", tone: "empty" };
  }
  if (enabled.every(m => m.reliability === "fresh")) return { label: "تازه و معتبر", tone: "good" };
  return { label: "اعتبار نامشخص", tone: "empty" };
}
