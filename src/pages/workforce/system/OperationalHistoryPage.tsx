import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge";
import type {
  OperationalHistoryEvent,
  OperationalHistoryEventType,
  OperationalHistorySeverity,
} from "../../../models/workforce";
import { toPersianNumber } from "../../../models/workforce";
import { historyRetentionService } from "../../../services/historyRetentionService";
import { launchSignoffService } from "../../../services/launchSignoffService";
import { operationalHistoryService } from "../../../services/operationalHistoryService";
import { operationalResignoffService } from "../../../services/operationalResignoffService";
import {
  currentBaselineDriftReport,
  driftTone,
  historyEventTypeLabel,
  historyTrendLabel,
  retentionStatusLabel,
  retentionStatusTone,
} from "../workforcePageUtils";
export default function OperationalHistoryPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [typeFilter, setTypeFilter] = useState<OperationalHistoryEventType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<OperationalHistorySeverity | "all">("all");
  const [rangeFilter, setRangeFilter] = useState<"all" | "7" | "30" | "90">("all");
  const [message, setMessage] = useState("");
  const currentDrift = currentBaselineDriftReport();
  void refreshToken;

  useEffect(() => {
    launchSignoffService.list().forEach((report) => operationalHistoryService.recordLaunchSignoff(report));
    operationalResignoffService.list().forEach((report) => operationalHistoryService.recordResignoff(report));
    operationalHistoryService.recordDriftReport(currentDrift);
    setRefreshToken((value) => value + 1);
  }, [currentDrift.baselineChecksum, currentDrift.currentChecksum]);

  const report = operationalHistoryService.buildOperationalHistoryReport();
  const rangeDays = rangeFilter === "all" ? 0 : Number(rangeFilter);
  const dateFrom = rangeDays ? new Date(Date.now() - rangeDays * 86400000).toISOString() : undefined;
  const filteredEvents = operationalHistoryService.filterEvents({ type: typeFilter, severity: severityFilter, dateFrom });
  const latestResignoff = operationalResignoffService.latestSigned();
  const latestLaunchSignoff = launchSignoffService.latestSigned();
  const latestBaseline = latestResignoff?.newBaselineChecksum
    ? { checksum: latestResignoff.newBaselineChecksum, date: latestResignoff.signedAt ?? latestResignoff.updatedAt, actor: latestResignoff.signedBy }
    : latestLaunchSignoff
      ? { checksum: latestLaunchSignoff.baselineChecksum, date: latestLaunchSignoff.signedAt ?? latestLaunchSignoff.updatedAt, actor: latestLaunchSignoff.signedBy }
      : undefined;
  const latestHighDrift = report.events.find((event) => event.type === "drift_report" && (event.severity === "high" || event.severity === "critical"));
  const latestDriftEvent = report.events.find((event) => event.type === "drift_report");
  const latestChanges = Array.isArray(latestDriftEvent?.metadata.changes) ? latestDriftEvent.metadata.changes as Array<{ title?: string }> : [];
  const trendLabel = historyTrendLabel(report.driftTrend);
  const retentionReport = historyRetentionService.buildRetentionReport(currentDrift.driftLevel);

  const exportHistory = () => {
    const result = operationalHistoryService.exportHistoryJson();
    setMessage(`ظپط§غŒظ„ ${result.fileName} ط¢ظ…ط§ط¯ظ‡ ط´ط¯.`);
  };

  const clearHistory = () => {
    if (!window.confirm("ظپظ‚ط· طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ ظ…ط­ظ„غŒ ظ¾ط§ع© ط´ظˆط¯طں ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ workforce ظˆ baseline ط¯ط³طھâ€Œظ†ط®ظˆط±ط¯ظ‡ ظ…غŒâ€Œظ…ط§ظ†ظ†ط¯.")) return;
    operationalHistoryService.clearHistory();
    setRefreshToken((value) => value + 1);
    setMessage("طھط§ط±غŒط®ع†ظ‡ ظ…ط­ظ„غŒ ظ¾ط§ع© ط´ط¯ط› ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط§طµظ„غŒ طھط؛غŒغŒط±غŒ ظ†ع©ط±ط¯ظ†ط¯.");
  };

  const eventCard = (event: OperationalHistoryEvent) => (
    <article className={`history-event tone-${driftTone(event.severity)}`} key={event.id}>
      <div className="history-marker" />
      <div className="history-event-body">
        <div className="section-head">
          <div className="badge-row"><StatusBadge tone={driftTone(event.severity)}>{historyEventTypeLabel(event.type)}</StatusBadge><StatusBadge tone={driftTone(event.severity)}>{event.severity}</StatusBadge></div>
          <time>{toPersianNumber(new Date(event.occurredAt).toLocaleString("fa-IR"))}</time>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="finding-meta"><span>ط¹ط§ظ…ظ„: {event.actorName || "ط³غŒط³طھظ…"}</span>{event.checksum && <code>{event.checksum}</code>}{event.relatedPath && <a href={event.relatedPath}>ظ…ط´ط§ظ‡ط¯ظ‡ ظ…ط±طھط¨ط·</a>}</div>
      </div>
    </article>
  );

  return (
    <div className="page-stack operational-history-page">
      <header className="page-header no-print">
        <div><span className="eyebrow">P18 Local Audit Trail</span><h1>طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ</h1><p>ط¨ط¹ط¯ ط§ط² baseline ع†ظ‡ ط§طھظپط§ظ‚غŒ ط§ظپطھط§ط¯طŒ ع†ظ‡ ع©ط³غŒ طھط£غŒغŒط¯ ع©ط±ط¯ ظˆ ط±ظˆظ†ط¯ drift ط¨ظ‡ ع©ط¯ط§ظ… ط³ظ…طھ ظ…غŒâ€Œط±ظˆط¯.</p></div>
        <div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">ظ¾ط§غŒط´ Drift</a><a className="ghost-button" href="/organization/workforce-dashboard/data-center">ظ…ط±ع©ط² ط¯ط§ط¯ظ‡</a><button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> ع†ط§ظ¾ طھط§ط±غŒط®ع†ظ‡</button><button className="primary-button" type="button" onClick={exportHistory}>ط®ط±ظˆط¬غŒ JSON طھط§ط±غŒط®ع†ظ‡</button><button className="danger-button" type="button" onClick={clearHistory}>ظ¾ط§ع©â€Œع©ط±ط¯ظ† طھط§ط±غŒط®ع†ظ‡</button></div>
      </header>

      {message && <div className="inline-notice no-print">{message}</div>}
      <section className={`panel baseline-card tone-${retentionStatusTone(retentionReport.status)} no-print`}>
        <div className="section-head"><h2>ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
        <p>{retentionReport.summary}</p>
        <a className="primary-button" href="/organization/workforce-dashboard/history-retention">ظ…ط¯غŒط±غŒطھ archive ظˆ retention</a>
      </section>

      <section className="management-answers no-print">
        <article><small>ع†ظ‡ ط²ظ…ط§ظ†غŒ drift زیاد ط´ط¯طں</small><strong>{latestHighDrift ? toPersianNumber(new Date(latestHighDrift.occurredAt).toLocaleString("fa-IR")) : "ظ‡ظ†ظˆط² ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong></article>
        <article><small>ع†ظ‡ ع©ط³غŒ ط¨ط§ط²طھط£غŒغŒط¯ ع©ط±ط¯طں</small><strong>{latestResignoff?.signedBy || "ط¨ط§ط²طھط£غŒغŒط¯غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong></article>
        <article><small>ع†ظ‡ ع†غŒط²غŒ طھط؛غŒغŒط± ع©ط±ط¯طں</small><strong>{latestChanges.slice(0, 2).map((item) => item.title).filter(Boolean).join("طŒ ") || "طھط؛غŒغŒط± ط«ط¨طھâ€Œط´ط¯ظ‡â€Œط§غŒ ظ†غŒط³طھ"}</strong></article>
        <article><small>ع†ظ†ط¯ ط¨ط§ط± baseline ط¹ظˆط¶ ط´ط¯طں</small><strong>{toPersianNumber(report.baselineChangeCount)}</strong></article>
        <article><small>ط±ظˆظ†ط¯ drift</small><strong>{trendLabel}</strong></article>
      </section>

      <section className="kpi-strip no-print">
        <article className="kpi-card tone-focus"><div><p>ط¢ط®ط±غŒظ† Baseline</p><strong>{latestBaseline ? toPersianNumber(new Date(latestBaseline.date).toLocaleDateString("fa-IR")) : "ظ†ط¯ط§ط±ط¯"}</strong><span>{latestBaseline?.actor ?? "ط§ط¨طھط¯ط§ signoff"}</span></div></article>
        <article className="kpi-card tone-info"><div><p>ط±ظˆغŒط¯ط§ط¯ظ‡ط§</p><strong>{toPersianNumber(report.events.length)}</strong><span>ط¯ط± audit ظ…ط­ظ„غŒ</span></div></article>
        <article className={`kpi-card tone-${trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ظ‡ط¨ظˆط¯" ? "good" : "warn"}`}><div><p>ط±ظˆظ†ط¯ Drift</p><strong>{trendLabel}</strong><span>{toPersianNumber(report.driftTrend.length)} ظ†ظ‚ط·ظ‡</span></div></article>
        <article className="kpi-card tone-good"><div><p>ط¨ط§ط²طھط£غŒغŒط¯ظ‡ط§</p><strong>{toPersianNumber(report.resignoffCount)}</strong><span>ط«ط¨طھ ظ†ظ‡ط§غŒغŒ</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط±ظˆغŒط¯ط§ط¯ ظ…ظ‡ظ…</p><strong>{toPersianNumber(report.criticalEventCount)}</strong><span>زیاد غŒط§ ط¨ط­ط±ط§ظ†غŒ</span></div></article>
      </section>

      <section className="panel drift-trend-panel no-print">
        <div className="section-head"><h2>ط±ظˆظ†ط¯ ط§ظ…طھغŒط§ط² Drift</h2><StatusBadge tone={trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ظ‡ط¨ظˆط¯" ? "good" : "info"}>{trendLabel}</StatusBadge></div>
        <div className="drift-mini-chart">
          {report.driftTrend.slice(-12).map((point) => <div className="drift-bar-column" key={point.id}><div className={`drift-bar tone-${driftTone(point.driftLevel)}`} style={{ height: `${Math.max(4, point.driftScore)}%` }} /><strong>{toPersianNumber(point.driftScore)}</strong><small>{toPersianNumber(new Date(point.generatedAt).toLocaleDateString("fa-IR"))}</small></div>)}
          {!report.driftTrend.length && <p>ظ‡ظ†ظˆط² ظ†ظ‚ط·ظ‡â€Œط§غŒ ط¨ط±ط§غŒ ط±ظˆظ†ط¯ drift ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
        </div>
      </section>

      <div className="filter-bar no-print">
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as OperationalHistoryEventType | "all")} aria-label="ظپغŒظ„طھط± ظ†ظˆط¹ ط±ظˆغŒط¯ط§ط¯"><option value="all">ظ‡ظ…ظ‡ ط±ظˆغŒط¯ط§ط¯ظ‡ط§</option>{(["drift_report", "resignoff_signed", "resignoff_revoked", "launch_signoff_signed", "baseline_changed", "backup_created", "snapshot_created", "maintenance_fix", "import_restored", "decision_batch_applied"] as OperationalHistoryEventType[]).map((type) => <option value={type} key={type}>{historyEventTypeLabel(type)}</option>)}</select>
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as OperationalHistorySeverity | "all")} aria-label="ظپغŒظ„طھط± ط´ط¯طھ طھط§ط±غŒط®ع†ظ‡"><option value="all">ظ‡ظ…ظ‡ ط´ط¯طھâ€Œظ‡ط§</option><option value="critical">ط¨ط­ط±ط§ظ†غŒ</option><option value="high">زیاد</option><option value="medium">متوسط</option><option value="low">کم</option><option value="info">ط§ط·ظ„ط§ط¹</option></select>
        <select value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value as "all" | "7" | "30" | "90")} aria-label="ظپغŒظ„طھط± ط¨ط§ط²ظ‡ ط²ظ…ط§ظ†غŒ"><option value="all">ظ‡ظ…ظ‡ ط²ظ…ط§ظ†â€Œظ‡ط§</option><option value="7">غ· ط±ظˆط² ط§ط®غŒط±</option><option value="30">غ³غ° ط±ظˆط² ط§ط®غŒط±</option><option value="90">غ¹غ° ط±ظˆط² ط§ط®غŒط±</option></select>
      </div>

      <section className="history-timeline no-print">{filteredEvents.map(eventCard)}{!filteredEvents.length && <section className="panel"><h2>ط±ظˆغŒط¯ط§ط¯غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯</h2><p>ظپغŒظ„طھط±ظ‡ط§ ط±ط§ طھط؛غŒغŒط± ط¯ظ‡غŒط¯ غŒط§ غŒع© drift ط¬ط¯غŒط¯ ط«ط¨طھ ع©ظ†غŒط¯.</p></section>}</section>

      <section className="print-surface history-print">
        <div className="report-title"><span className="eyebrow">ع¯ط²ط§ط±ط´ ظ…ط­ظ„غŒ ظ¾ط³ ط§ط² baseline</span><h1>طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ Workforce</h1><StatusBadge tone={trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : "info"}>{trendLabel}</StatusBadge></div>
        <p>{report.summary}</p>
        <div className="signoff-facts"><div><small>ط¢ط®ط±غŒظ† baseline</small><code>{latestBaseline?.checksum || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</code></div><div><small>طھط¹ط¯ط§ط¯ ط¨ط§ط²طھط£غŒغŒط¯</small><strong>{toPersianNumber(report.resignoffCount)}</strong></div><div><small>طھط؛غŒغŒط± baseline</small><strong>{toPersianNumber(report.baselineChangeCount)}</strong></div><div><small>ط±ظˆغŒط¯ط§ط¯ ظ…ظ‡ظ…</small><strong>{toPersianNumber(report.criticalEventCount)}</strong></div><div><small>ط±ظˆظ†ط¯ drift</small><strong>{trendLabel}</strong></div><div><small>ط²ظ…ط§ظ† ع¯ط²ط§ط±ط´</small><strong>{toPersianNumber(new Date(report.generatedAt).toLocaleString("fa-IR"))}</strong></div></div>
        <section className="report-section"><h2>ط±ظˆظ†ط¯ Drift</h2><p>{report.driftTrend.map((point) => `${toPersianNumber(point.driftScore)} (${toPersianNumber(new Date(point.generatedAt).toLocaleDateString("fa-IR"))})`).join(" â†گ ") || "ط¯ط§ط¯ظ‡ ع©ط§ظپغŒ ظ†غŒط³طھ"}</p></section>
        <section className="report-section"><h2>ط±ظˆغŒط¯ط§ط¯ظ‡ط§غŒ ظ…ظ‡ظ…</h2>{report.events.filter((event) => event.severity === "high" || event.severity === "critical").length ? <ul>{report.events.filter((event) => event.severity === "high" || event.severity === "critical").map((event) => <li key={event.id}>{event.title}طŒ {toPersianNumber(new Date(event.occurredAt).toLocaleString("fa-IR"))}</li>)}</ul> : <p>ط±ظˆغŒط¯ط§ط¯ ظ…ظ‡ظ…غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</section>
        <section className="report-section"><h2>ط¨ط§ط²طھط£غŒغŒط¯ظ‡ط§</h2>{report.events.filter((event) => event.type === "resignoff_signed").length ? <ul>{report.events.filter((event) => event.type === "resignoff_signed").map((event) => <li key={event.id}>{event.actorName}طŒ {toPersianNumber(new Date(event.occurredAt).toLocaleString("fa-IR"))}</li>)}</ul> : <p>ط¨ط§ط²طھط£غŒغŒط¯غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</section>
        <section className="report-section"><h2>ظ¾غŒط´ظ†ظ‡ط§ط¯ ط§ظ‚ط¯ط§ظ…</h2><p>{report.recommendedAction}</p></section>
        <section className="report-section"><h2>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</h2><p>................................................................................................</p></section>
      </section>
    </div>
  );
}



