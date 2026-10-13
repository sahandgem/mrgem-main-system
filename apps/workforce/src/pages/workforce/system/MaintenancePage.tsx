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
    const ok = window.confirm(`این fix اجرا شود؟\n${issue.recommendation}`);
    if (!ok) return;
    const done = workforceMaintenanceService.runSafeFix(issue);
    if (done) operationalHistoryService.recordMaintenanceFix(issue.id, issue.title);
    setRefreshToken((value) => value + 1);
    window.alert(done ? "Fix انجام شد و قبل از آن snapshot ساخته شد." : "این fix قابل اجرای خودکار نیست.");
  };

  const runAllFixes = () => {
    const safeCount = report.issues.filter((issue) => issue.canAutoFix).length;
    if (!safeCount) return;
    const ok = window.confirm(`${safeCount} fix امن اجرا شود؟ قبل از هر fix snapshot ساخته می‌شود.`);
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
          <h1>کنسول نگهداری سیستم</h1>
          <p>سلامت localStorage، orphanها، ناسازگاری‌ها و snapshot دوره‌ای را بررسی کن.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">تقویم کنترل‌ها</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">چک‌لیست آمادگی</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">رفتن به data-center</a>
          <button className="ghost-button" type="button" onClick={() => { workforceMaintenanceService.createSnapshot(); setRefreshToken((value) => value + 1); }}>ساخت snapshot</button>
          <button className="primary-button" type="button" onClick={runAllFixes} disabled={!report.issues.some((issue) => issue.canAutoFix)}>اجرای پاک‌سازی امن</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className={`kpi-card tone-${maintenanceHealthTone(report.healthStatus)}`}><div><p>سلامت سیستم</p><strong>{maintenanceHealthLabel(report.healthStatus)}</strong><span>{report.summary}</span></div></article>
        <article className="kpi-card tone-critical"><div><p>بحرانی</p><strong>{toPersianNumber(report.criticalCount)}</strong><span>نیازمند اقدام</span></div></article>
        <article className="kpi-card tone-warn"><div><p>هشدارها</p><strong>{toPersianNumber(report.warningCount)}</strong><span>قابل پیگیری</span></div></article>
        <article className="kpi-card tone-focus"><div><p>آخرین snapshot</p><strong>{latestSnapshot ? toPersianNumber(new Date(latestSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ندارد"}</strong><span>{report.snapshotRecommendation}</span></div></article>
        <article className="kpi-card tone-info"><div><p>حجم داده‌ها</p><strong>{toPersianNumber(totalSize)}</strong><span>KB تقریبی</span></div></article>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>کلیدهای localStorage</h2>
          <div className="entity-table">
            {report.storageStats.map((item) => (
              <article key={item.key}>
                <div className="entity-main">
                  <div><small>کلید</small><strong>{item.key}</strong></div>
                  <div><small>تعداد</small><strong>{toPersianNumber(item.itemCount)}</strong></div>
                  <div><small>حجم</small><strong>{toPersianNumber(item.estimatedSizeKb)}KB</strong></div>
                </div>
                <div className="row-actions">
                  <StatusBadge tone={item.status === "ok" ? "good" : maintenanceSeverityTone(item.status)}>{item.status}</StatusBadge>
                  <span className="inline-note">{item.exists ? "موجود" : "ثبت نشده"} | {item.isValidJson ? "JSON سالم" : "JSON خراب"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>پیشنهادهای نگهداری</h2>
          <div className="analysis-list">
            {report.recommendations.map((item) => (
              <article className="panel-row tone-info" key={item}>
                <StatusBadge tone="info">پیشنهاد</StatusBadge>
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
              <StatusBadge tone={item.canAutoFix ? "good" : "info"}>{item.canAutoFix ? "fix امن" : "بررسی دستی"}</StatusBadge>
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="finding-meta">
              <span>نوع: {item.type}</span>
              <span>کلید: {item.storageKey ?? "ثبت نشده"}</span>
              <span>رکورد: {item.entityId ?? "-"}</span>
              <span>مرتبط: {item.relatedEntityId ?? "-"}</span>
            </div>
            <div className="evidence-box">
              <span>{item.recommendation}</span>
              <small>{item.fixAction ?? "fix خودکار ندارد"}</small>
            </div>
            {item.canAutoFix && (
              <div className="recommendation-row">
                <button className="primary-button" type="button" onClick={() => runFix(item)}>اجرای fix با snapshot</button>
              </div>
            )}
          </article>
        ))}
        {!report.issues.length && <section className="panel"><h2>همه چیز مرتب است</h2><p>مورد نگهداری فعالی دیده نشد.</p></section>}
      </section>
    </div>
  );
}




