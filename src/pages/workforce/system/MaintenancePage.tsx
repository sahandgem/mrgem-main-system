import { useState } from "react";
import { buildMonthlyHealthDashboard } from "../../../analysis/monthlyHealthAnalyzer";
import { buildPreventiveAlerts } from "../../../analysis/preventiveAlertAnalyzer";
import { StatusBadge } from "../../../components/StatusBadge";
import type { MaintenanceIssue } from "../../../models/workforce";
import { toPersianNumber } from "../../../models/workforce";
import { decisionReportService } from "../../../services/decisionReportService";
import { monthlyGoalService } from "../../../services/monthlyGoalService";
import { operationalHistoryService } from "../../../services/operationalHistoryService";
import { preventiveAlertKey } from "../../../services/preventiveAlertStateService";
import { workforceBackupService } from "../../../services/workforceBackupService";
import { workforceMaintenanceService } from "../../../services/workforceMaintenanceService";
import {
  maintenanceHealthLabel,
  maintenanceHealthTone,
  maintenanceSeverityTone,
} from "../workforcePageUtils";
export default function MaintenancePage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const reports = decisionReportService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const alerts = buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals: monthlyGoalService.list(true) });
  const report = workforceMaintenanceService.runReport(alerts.map(preventiveAlertKey));
  void refreshToken;

  const runFix = (issue: MaintenanceIssue) => {
    const ok = window.confirm(`ط§غŒظ† fix ط§ط¬ط±ط§ ط´ظˆط¯طں\n${issue.recommendation}`);
    if (!ok) return;
    const done = workforceMaintenanceService.runSafeFix(issue);
    if (done) operationalHistoryService.recordMaintenanceFix(issue.id, issue.title);
    setRefreshToken((value) => value + 1);
    window.alert(done ? "Fix ط§ظ†ط¬ط§ظ… ط´ط¯ ظˆ ظ‚ط¨ظ„ ط§ط² ط¢ظ† snapshot ط³ط§ط®طھظ‡ ط´ط¯." : "ط§غŒظ† fix ظ‚ط§ط¨ظ„ ط§ط¬ط±ط§غŒ ط®ظˆط¯ع©ط§ط± ظ†غŒط³طھ.");
  };

  const runAllFixes = () => {
    const safeCount = report.issues.filter((issue) => issue.canAutoFix).length;
    if (!safeCount) return;
    const ok = window.confirm(`${safeCount} fix ط§ظ…ظ† ط§ط¬ط±ط§ ط´ظˆط¯طں ظ‚ط¨ظ„ ط§ط² ظ‡ط± fix snapshot ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.`);
    if (!ok) return;
    const fixedIssues = report.issues.filter((issue) => issue.canAutoFix);
    workforceMaintenanceService.runAllSafeFixes(report);
    fixedIssues.forEach((issue) => operationalHistoryService.recordMaintenanceFix(issue.id, issue.title));
    setRefreshToken((value) => value + 1);
  };

  const totalSize = report.storageStats.reduce((sum, item) => sum + item.estimatedSizeKb, 0);
  const latestSnapshot = workforceBackupService.listSnapshots()[0];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P13 Maintenance</span>
          <h1>ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ ط³غŒط³طھظ…</h1>
          <p>ط³ظ„ط§ظ…طھ localStorageطŒ orphanظ‡ط§طŒ ظ†ط§ط³ط§ط²ع¯ط§ط±غŒâ€Œظ‡ط§ ظˆ snapshot ط¯ظˆط±ظ‡â€Œط§غŒ ط±ط§ ط¨ط±ط±ط³غŒ ع©ظ†.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">ع†ع©â€Œظ„غŒط³طھ ط¢ظ…ط§ط¯ع¯غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">ط±ظپطھظ† ط¨ظ‡ data-center</a>
          <button className="ghost-button" type="button" onClick={() => { workforceMaintenanceService.createSnapshot(); setRefreshToken((value) => value + 1); }}>ط³ط§ط®طھ snapshot</button>
          <button className="primary-button" type="button" onClick={runAllFixes} disabled={!report.issues.some((issue) => issue.canAutoFix)}>ط§ط¬ط±ط§غŒ ظ¾ط§ع©â€Œط³ط§ط²غŒ ط§ظ…ظ†</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className={`kpi-card tone-${maintenanceHealthTone(report.healthStatus)}`}><div><p>ط³ظ„ط§ظ…طھ ط³غŒط³طھظ…</p><strong>{maintenanceHealthLabel(report.healthStatus)}</strong><span>{report.summary}</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط¨ط­ط±ط§ظ†غŒ</p><strong>{toPersianNumber(report.criticalCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ط§ظ‚ط¯ط§ظ…</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ‡ط´ط¯ط§ط±ظ‡ط§</p><strong>{toPersianNumber(report.warningCount)}</strong><span>ظ‚ط§ط¨ظ„ ظ¾غŒع¯غŒط±غŒ</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط¢ط®ط±غŒظ† snapshot</p><strong>{latestSnapshot ? toPersianNumber(new Date(latestSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ظ†ط¯ط§ط±ط¯"}</strong><span>{report.snapshotRecommendation}</span></div></article>
        <article className="kpi-card tone-info"><div><p>ط­ط¬ظ… ط¯ط§ط¯ظ‡â€Œظ‡ط§</p><strong>{toPersianNumber(totalSize)}</strong><span>KB طھظ‚ط±غŒط¨غŒ</span></div></article>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>ع©ظ„غŒط¯ظ‡ط§غŒ localStorage</h2>
          <div className="entity-table">
            {report.storageStats.map((item) => (
              <article key={item.key}>
                <div className="entity-main">
                  <div><small>ع©ظ„غŒط¯</small><strong>{item.key}</strong></div>
                  <div><small>طھط¹ط¯ط§ط¯</small><strong>{toPersianNumber(item.itemCount)}</strong></div>
                  <div><small>ط­ط¬ظ…</small><strong>{toPersianNumber(item.estimatedSizeKb)}KB</strong></div>
                </div>
                <div className="row-actions">
                  <StatusBadge tone={item.status === "ok" ? "good" : maintenanceSeverityTone(item.status)}>{item.status}</StatusBadge>
                  <span className="inline-note">{item.exists ? "ظ…ظˆط¬ظˆط¯" : "ط«ط¨طھ ظ†ط´ط¯ظ‡"} | {item.isValidJson ? "JSON ط³ط§ظ„ظ…" : "JSON ط®ط±ط§ط¨"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2>
          <div className="analysis-list">
            {report.recommendations.map((item) => (
              <article className="panel-row tone-info" key={item}>
                <StatusBadge tone="info">ظ¾غŒط´ظ†ظ‡ط§ط¯</StatusBadge>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="analysis-card-grid">
        {report.issues.map((item) => (
          <article className={`analysis-card tone-${maintenanceSeverityTone(item.severity)}`} key={item.id}>
            <div className="analysis-card-head">
              <StatusBadge tone={maintenanceSeverityTone(item.severity)}>{item.severity}</StatusBadge>
              <StatusBadge tone={item.canAutoFix ? "good" : "info"}>{item.canAutoFix ? "fix ط§ظ…ظ†" : "ط¨ط±ط±ط³غŒ ط¯ط³طھغŒ"}</StatusBadge>
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="finding-meta">
              <span>ظ†ظˆط¹: {item.type}</span>
              <span>ع©ظ„غŒط¯: {item.storageKey ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
              <span>ط±ع©ظˆط±ط¯: {item.entityId ?? "-"}</span>
              <span>ظ…ط±طھط¨ط·: {item.relatedEntityId ?? "-"}</span>
            </div>
            <div className="evidence-box">
              <span>{item.recommendation}</span>
              <small>{item.fixAction ?? "fix ط®ظˆط¯ع©ط§ط± ظ†ط¯ط§ط±ط¯"}</small>
            </div>
            {item.canAutoFix && (
              <div className="recommendation-row">
                <button className="primary-button" type="button" onClick={() => runFix(item)}>ط§ط¬ط±ط§غŒ fix ط¨ط§ snapshot</button>
              </div>
            )}
          </article>
        ))}
        {!report.issues.length && <section className="panel"><h2>ظ‡ظ…ظ‡ ع†غŒط² ظ…ط±طھط¨ ط§ط³طھ</h2><p>ظ…ظˆط±ط¯ ظ†ع¯ظ‡ط¯ط§ط±غŒ ظپط¹ط§ظ„غŒ ط¯غŒط¯ظ‡ ظ†ط´ط¯.</p></section>}
      </section>
    </div>
  );
}




