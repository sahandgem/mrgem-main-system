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
    setMessage(`فایل ${result.fileName} آماده شد.`);
  };

  const clearHistory = () => {
    if (!window.confirm("فقط تاریخچه عملیاتی محلی پاک شود؟ داده‌های workforce و baseline دست‌نخورده می‌مانند.")) return;
    operationalHistoryService.clearHistory();
    setRefreshToken((value) => value + 1);
    setMessage("تاریخچه محلی پاک شد؛ داده‌های اصلی تغییری نکردند.");
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
        <div className="finding-meta"><span>عامل: {event.actorName || "سیستم"}</span>{event.checksum && <code>{event.checksum}</code>}{event.relatedPath && <a href={event.relatedPath}>مشاهده مرتبط</a>}</div>
      </div>
    </article>
  );

  return (
    <div className="page-stack operational-history-page">
      <header className="page-header no-print">
        <div><span className="eyebrow">P18 Local Audit Trail</span><h1>تاریخچه عملیاتی</h1><p>بعد از baseline چه اتفاقی افتاد، چه کسی تأیید کرد و روند drift به کدام سمت می‌رود.</p></div>
        <div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">پایش Drift</a><a className="ghost-button" href="/organization/workforce-dashboard/data-center">مرکز داده</a><button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> چاپ تاریخچه</button><button className="primary-button" type="button" onClick={exportHistory}>خروجی JSON تاریخچه</button><button className="danger-button" type="button" onClick={clearHistory}>پاک‌کردن تاریخچه</button></div>
      </header>

      {message && <div className="inline-notice no-print">{message}</div>}
      <section className={`panel baseline-card tone-${retentionStatusTone(retentionReport.status)} no-print`}>
        <div className="section-head"><h2>سیاست نگهداری</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
        <p>{retentionReport.summary}</p>
        <a className="primary-button" href="/organization/workforce-dashboard/history-retention">مدیریت archive و retention</a>
      </section>

      <section className="management-answers no-print">
        <article><small>چه زمانی drift زیاد شد؟</small><strong>{latestHighDrift ? toPersianNumber(new Date(latestHighDrift.occurredAt).toLocaleString("fa-IR")) : "هنوز ثبت نشده"}</strong></article>
        <article><small>چه کسی بازتأیید کرد؟</small><strong>{latestResignoff?.signedBy || "بازتأییدی ثبت نشده"}</strong></article>
        <article><small>چه چیزی تغییر کرد؟</small><strong>{latestChanges.slice(0, 2).map((item) => item.title).filter(Boolean).join("، ") || "تغییر ثبت‌شده‌ای نیست"}</strong></article>
        <article><small>چند بار baseline عوض شد؟</small><strong>{toPersianNumber(report.baselineChangeCount)}</strong></article>
        <article><small>روند drift</small><strong>{trendLabel}</strong></article>
      </section>

      <section className="kpi-strip no-print">
        <article className="kpi-card tone-focus"><div><p>آخرین Baseline</p><strong>{latestBaseline ? toPersianNumber(new Date(latestBaseline.date).toLocaleDateString("fa-IR")) : "ندارد"}</strong><span>{latestBaseline?.actor ?? "ابتدا signoff"}</span></div></article>
        <article className="kpi-card tone-info"><div><p>رویدادها</p><strong>{toPersianNumber(report.events.length)}</strong><span>در audit محلی</span></div></article>
        <article className={`kpi-card tone-${trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ظ‡ط¨ظˆط¯" ? "good" : "warn"}`}><div><p>روند Drift</p><strong>{trendLabel}</strong><span>{toPersianNumber(report.driftTrend.length)} نقطه</span></div></article>
        <article className="kpi-card tone-good"><div><p>بازتأییدها</p><strong>{toPersianNumber(report.resignoffCount)}</strong><span>ثبت نهایی</span></div></article>
        <article className="kpi-card tone-critical"><div><p>رویداد مهم</p><strong>{toPersianNumber(report.criticalEventCount)}</strong><span>زیاد یا بحرانی</span></div></article>
      </section>

      <section className="panel drift-trend-panel no-print">
        <div className="section-head"><h2>روند امتیاز Drift</h2><StatusBadge tone={trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ظ‡ط¨ظˆط¯" ? "good" : "info"}>{trendLabel}</StatusBadge></div>
        <div className="drift-mini-chart">
          {report.driftTrend.slice(-12).map((point) => <div className="drift-bar-column" key={point.id}><div className={`drift-bar tone-${driftTone(point.driftLevel)}`} style={{ height: `${Math.max(4, point.driftScore)}%` }} /><strong>{toPersianNumber(point.driftScore)}</strong><small>{toPersianNumber(new Date(point.generatedAt).toLocaleDateString("fa-IR"))}</small></div>)}
          {!report.driftTrend.length && <p>هنوز نقطه‌ای برای روند drift ثبت نشده است.</p>}
        </div>
      </section>

      <div className="filter-bar no-print">
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as OperationalHistoryEventType | "all")} aria-label="فیلتر نوع رویداد"><option value="all">همه رویدادها</option>{(["drift_report", "resignoff_signed", "resignoff_revoked", "launch_signoff_signed", "baseline_changed", "backup_created", "snapshot_created", "maintenance_fix", "import_restored", "decision_batch_applied"] as OperationalHistoryEventType[]).map((type) => <option value={type} key={type}>{historyEventTypeLabel(type)}</option>)}</select>
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as OperationalHistorySeverity | "all")} aria-label="فیلتر شدت تاریخچه"><option value="all">همه شدت‌ها</option><option value="critical">بحرانی</option><option value="high">زیاد</option><option value="medium">متوسط</option><option value="low">کم</option><option value="info">اطلاع</option></select>
        <select value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value as "all" | "7" | "30" | "90")} aria-label="فیلتر بازه زمانی"><option value="all">همه زمان‌ها</option><option value="7">۷ روز اخیر</option><option value="30">۳۰ روز اخیر</option><option value="90">۹۰ روز اخیر</option></select>
      </div>

      <section className="history-timeline no-print">{filteredEvents.map(eventCard)}{!filteredEvents.length && <section className="panel"><h2>رویدادی پیدا نشد</h2><p>فیلترها را تغییر دهید یا یک drift جدید ثبت کنید.</p></section>}</section>

      <section className="print-surface history-print">
        <div className="report-title"><span className="eyebrow">گزارش محلی پس از baseline</span><h1>تاریخچه عملیاتی Workforce</h1><StatusBadge tone={trendLabel === "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" ? "critical" : "info"}>{trendLabel}</StatusBadge></div>
        <p>{report.summary}</p>
        <div className="signoff-facts"><div><small>آخرین baseline</small><code>{latestBaseline?.checksum || "ثبت نشده"}</code></div><div><small>تعداد بازتأیید</small><strong>{toPersianNumber(report.resignoffCount)}</strong></div><div><small>تغییر baseline</small><strong>{toPersianNumber(report.baselineChangeCount)}</strong></div><div><small>رویداد مهم</small><strong>{toPersianNumber(report.criticalEventCount)}</strong></div><div><small>روند drift</small><strong>{trendLabel}</strong></div><div><small>زمان گزارش</small><strong>{toPersianNumber(new Date(report.generatedAt).toLocaleString("fa-IR"))}</strong></div></div>
        <section className="report-section"><h2>روند Drift</h2><p>{report.driftTrend.map((point) => `${toPersianNumber(point.driftScore)} (${toPersianNumber(new Date(point.generatedAt).toLocaleDateString("fa-IR"))})`).join(" ← ") || "داده کافی نیست"}</p></section>
        <section className="report-section"><h2>رویدادهای مهم</h2>{report.events.filter((event) => event.severity === "high" || event.severity === "critical").length ? <ul>{report.events.filter((event) => event.severity === "high" || event.severity === "critical").map((event) => <li key={event.id}>{event.title}، {toPersianNumber(new Date(event.occurredAt).toLocaleString("fa-IR"))}</li>)}</ul> : <p>رویداد مهمی ثبت نشده است.</p>}</section>
        <section className="report-section"><h2>بازتأییدها</h2>{report.events.filter((event) => event.type === "resignoff_signed").length ? <ul>{report.events.filter((event) => event.type === "resignoff_signed").map((event) => <li key={event.id}>{event.actorName}، {toPersianNumber(new Date(event.occurredAt).toLocaleString("fa-IR"))}</li>)}</ul> : <p>بازتأییدی ثبت نشده است.</p>}</section>
        <section className="report-section"><h2>پیشنهاد اقدام</h2><p>{report.recommendedAction}</p></section>
        <section className="report-section"><h2>یادداشت مدیر</h2><p>................................................................................................</p></section>
      </section>
    </div>
  );
}



