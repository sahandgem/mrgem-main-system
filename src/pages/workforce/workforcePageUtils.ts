import { buildBaselineDriftReport } from "../../analysis/baselineDriftAnalyzer";
import { detectIncreasingDriftTrend } from "../../analysis/operationalHistoryAnalytics";
import type {
  BaselineDriftLevel,
  BaselineDriftSeverity,
  HistoryRetentionStatus,
  MaintenanceHealthStatus,
  MaintenanceIssueSeverity,
  OperationalHistoryEventType,
  StatusTone,
} from "../../models/workforce";
import { launchSignoffService } from "../../services/launchSignoffService";
import { operationalHistoryService } from "../../services/operationalHistoryService";
import { operationalResignoffService } from "../../services/operationalResignoffService";
import { workforceBackupService } from "../../services/workforceBackupService";
export function currentBaselineDriftReport() {
  const currentBundle = workforceBackupService.createBackupBundle("Baseline drift check", "baseline-drift-check");
  const resignoff = operationalResignoffService.latestSigned();
  const launchSignoff = launchSignoffService.latestSigned();
  const baselineBundle = resignoff?.newBaselineBundle ?? launchSignoff?.baselineBundle;
  const baselineId = resignoff?.id ?? launchSignoff?.id ?? "";
  const ignoredKeys = new Set(["komak.workforce.operationalHistory.v1"]);
  const withoutAuditKeys = (data: Record<string, unknown>) => Object.fromEntries(Object.entries(data).filter(([key]) => !ignoredKeys.has(key)));
  const baselineData = withoutAuditKeys(baselineBundle?.data ?? {});
  const currentData = withoutAuditKeys(currentBundle.data);
  const baselineChecksum = baselineId ? workforceBackupService.calculateBackupChecksum(baselineData) : "";
  const currentChecksum = workforceBackupService.calculateBackupChecksum(currentData);
  return buildBaselineDriftReport({
    baselineSignoffId: baselineId,
    baselineChecksum,
    currentChecksum,
    baselineData,
    currentData,
    baselineBundle,
    currentBundle,
  });
}



export function maintenanceHealthLabel(value: MaintenanceHealthStatus) {
  if (value === "healthy") return "سالم";
  if (value === "needs_attention") return "نیازمند توجه";
  if (value === "risky") return "پرریسک";
  return "بحرانی";
}



export function maintenanceHealthTone(value: MaintenanceHealthStatus): StatusTone {
  if (value === "healthy") return "good";
  if (value === "needs_attention") return "warn";
  return "critical";
}



export function maintenanceSeverityTone(value: MaintenanceIssueSeverity): StatusTone {
  if (value === "critical") return "critical";
  if (value === "warning") return "warn";
  return "info";
}




export function driftLevelLabel(value: BaselineDriftLevel) {
  const labels: Record<BaselineDriftLevel, string> = {
    none: "بدون تغییر",
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    critical: "بحرانی",
  };
  return labels[value];
}
export function driftTone(value: BaselineDriftLevel | BaselineDriftSeverity): StatusTone {
  if (value === "critical" || value === "high") return "critical";
  if (value === "medium") return "warn";
  if (value === "low") return "info";
  if (value === "none") return "good";
  return "empty";
}



export function historyEventTypeLabel(value: OperationalHistoryEventType) {
  const labels: Record<OperationalHistoryEventType, string> = {
    drift_report: "گزارش Drift",
    resignoff_signed: "بازتأیید",
    resignoff_revoked: "لغو بازتأیید",
    launch_signoff_signed: "تأیید راه‌اندازی",
    baseline_changed: "تغییر Baseline",
    backup_created: "ساخت Backup",
    snapshot_created: "ساخت Snapshot",
    maintenance_fix: "اصلاح نگهداری",
    import_restored: "بازیابی داده",
    decision_batch_applied: "اعمال تصمیم",
  };
  return labels[value];
}



export function historyTrendLabel(trend: ReturnType<typeof operationalHistoryService.buildOperationalHistoryReport>["driftTrend"]) {
  if (trend.length < 2) return "ط¯ط§ط¯ظ‡ ط±ظˆظ†ط¯ ع©ط§ظپغŒ ظ†غŒط³طھ";
  if (detectIncreasingDriftTrend(trend)) return "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†";
  if (trend[trend.length - 1].driftScore < trend[0].driftScore) return "ط±ظˆ ط¨ظ‡ ط¨ظ‡ط¨ظˆط¯";
  return "ظ¾ط§غŒط¯ط§ط±";
}



export function retentionStatusLabel(value: HistoryRetentionStatus) {
  const labels: Record<HistoryRetentionStatus, string> = { healthy: "سالم", needs_archive: "نیازمند آرشیو", needs_review: "نیازمند مرور", risky: "پرریسک" };
  return labels[value];
}



export function retentionStatusTone(value: HistoryRetentionStatus): StatusTone {
  if (value === "risky") return "critical";
  if (value === "needs_review") return "warn";
  if (value === "needs_archive") return "info";
  return "good";
}



