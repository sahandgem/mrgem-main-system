import type { ModuleKpi } from "@master-gem/module-contracts";
import type { StatusTone } from "../StatusBadge";
import type {
  CommandCenterAttentionItem,
  CommandCenterOverallState,
  CommandCenterReliabilityState,
} from "../../integration/commandCenter/commandCenterViewModel";

export function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatDateTime(value?: string) {
  if (!value) return "زمان ثبت نشده";
  return new Date(value).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
}

export function managerTimeContext(value: string) {
  return value.includes("نیازمند تعریف") ? undefined : value;
}

export function managerDataStateLabel(reliability: CommandCenterReliabilityState, label: string) {
  return reliability === "fresh" ? "تازه و معتبر" : label;
}

export function toneForReliability(reliability: CommandCenterReliabilityState): StatusTone {
  if (reliability === "fresh") return "good";
  if (reliability === "degraded" || reliability === "stale_last_known_good") return "warn";
  if (reliability === "unavailable" || reliability === "invalid" || reliability === "unsupported_version") {
    return "critical";
  }
  if (reliability === "disabled") return "empty";
  return "info";
}

export function toneForOverallState(state: CommandCenterOverallState): StatusTone {
  if (state === "healthy") return "good";
  if (state === "attention") return "warn";
  if (state === "critical") return "critical";
  return "empty";
}

export function overallStateLabel(state: CommandCenterOverallState) {
  if (state === "healthy") return "کسب‌وکار پایدار";
  if (state === "attention") return "نیازمند توجه مدیریتی";
  if (state === "critical") return "اقدام مدیریتی مهم";
  return "تصویر کسب‌وکار نامشخص";
}

export function toneForAttention(item: CommandCenterAttentionItem): StatusTone {
  if (item.priorityTier === 1 || item.severity === "critical") return "critical";
  if (item.priorityTier === 2 || item.severity === "warning") return "warn";
  return "info";
}

export function attentionPriorityLabel(priority: CommandCenterAttentionItem["priorityTier"]) {
  if (priority === 0 || priority === 1) return "فوری";
  if (priority === 2) return "نیازمند توجه";
  return "نیازمند پیگیری";
}

export function confidenceLabel(value: CommandCenterAttentionItem["confidence"]) {
  if (value === "high") return "اطمینان بالا";
  if (value === "medium") return "اطمینان متوسط";
  if (value === "low") return "اطمینان پایین";
  return "اطمینان نامشخص";
}

export function toneForKpiStatus(status: ModuleKpi["status"]): StatusTone {
  if (status === "critical") return "critical";
  if (status === "warning") return "warn";
  if (status === "normal") return "good";
  if (status === "info") return "info";
  return "empty";
}

export function moduleAnchorId(moduleId: string) {
  return `module-${moduleId.replaceAll(".", "-")}`;
}
