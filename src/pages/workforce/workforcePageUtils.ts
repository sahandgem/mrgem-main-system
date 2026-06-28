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
  if (value === "healthy") return "ط³ط§ظ„ظ…";
  if (value === "needs_attention") return "ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡";
  if (value === "risky") return "ظ¾ط±ط±غŒط³ع©";
  return "ط¨ط­ط±ط§ظ†غŒ";
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
    none: "ط¨ط¯ظˆظ† طھط؛غŒغŒط±",
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    critical: "ط¨ط­ط±ط§ظ†غŒ",
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
    drift_report: "ع¯ط²ط§ط±ط´ Drift",
    resignoff_signed: "ط¨ط§ط²طھط£غŒغŒط¯",
    resignoff_revoked: "ظ„ط؛ظˆ ط¨ط§ط²طھط£غŒغŒط¯",
    launch_signoff_signed: "طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ",
    baseline_changed: "طھط؛غŒغŒط± Baseline",
    backup_created: "ط³ط§ط®طھ Backup",
    snapshot_created: "ط³ط§ط®طھ Snapshot",
    maintenance_fix: "ط§طµظ„ط§ط­ ظ†ع¯ظ‡ط¯ط§ط±غŒ",
    import_restored: "ط¨ط§ط²غŒط§ط¨غŒ ط¯ط§ط¯ظ‡",
    decision_batch_applied: "ط§ط¹ظ…ط§ظ„ طھطµظ…غŒظ…",
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
  const labels: Record<HistoryRetentionStatus, string> = { healthy: "ط³ط§ظ„ظ…", needs_archive: "ظ†غŒط§ط²ظ…ظ†ط¯ ط¢ط±ط´غŒظˆ", needs_review: "ظ†غŒط§ط²ظ…ظ†ط¯ ظ…ط±ظˆط±", risky: "ظ¾ط±ط±غŒط³ع©" };
  return labels[value];
}



export function retentionStatusTone(value: HistoryRetentionStatus): StatusTone {
  if (value === "risky") return "critical";
  if (value === "needs_review") return "warn";
  if (value === "needs_archive") return "info";
  return "good";
}



