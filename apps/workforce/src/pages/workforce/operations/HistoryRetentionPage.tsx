import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge";
import type { HistoryRetentionPolicy } from "../../../models/workforce";
import { toPersianNumber } from "../../../models/workforce";
import { historyRetentionService } from "../../../services/historyRetentionService";
import { workforceBackupService } from "../../../services/workforceBackupService";
import {
  currentBaselineDriftReport,
  driftTone,
  retentionStatusLabel,
  retentionStatusTone,
} from "../workforcePageUtils";
export default function HistoryRetentionPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [policyDraft, setPolicyDraft] = useState<HistoryRetentionPolicy>(() => historyRetentionService.getPolicy());
  const [archiveNote, setArchiveNote] = useState("");
  const [message, setMessage] = useState("");
  void refreshToken;
  const drift = currentBaselineDriftReport();
  const report = historyRetentionService.buildRetentionReport(drift.driftLevel);
  const archives = historyRetentionService.listArchives();
  const latestSnapshot = workforceBackupService.listSnapshots()[0];
  type NumberPolicyKey = "keepRecentDays" | "archiveAfterDays" | "criticalKeepDays" | "driftReviewAfterDays" | "resignoffExpiresAfterDays" | "maxEventsBeforeWarning";

  const updateNumber = (key: NumberPolicyKey, value: string) => setPolicyDraft((current) => ({ ...current, [key]: Number(value) }));
  const savePolicy = () => {
    const policy = historyRetentionService.updatePolicy(policyDraft);
    setPolicyDraft(policy);
    setRefreshToken((value) => value + 1);
    setMessage("سیاست نگهداری ذخیره شد.");
  };
  const resetPolicy = () => {
    const policy = historyRetentionService.resetPolicy();
    setPolicyDraft(policy);
    setRefreshToken((value) => value + 1);
    setMessage("سیاست پیش‌فرض بازگردانده شد.");
  };
  const createArchive = () => {
    const archive = historyRetentionService.createHistoryArchive(archiveNote);
    if (!archive) {
      setMessage("در حال حاضر event واجد شرایط archive وجود ندارد.");
      return;
    }
    setArchiveNote("");
    setRefreshToken((value) => value + 1);
    setMessage(`${toPersianNumber(archive.eventCount)} event در archive ذخیره شد.`);
  };
  const cleanup = () => {
    if (!window.confirm("فقط eventهایی که داخل archive ذخیره شده‌اند پاک شوند؟ قبل از cleanup یک snapshot ساخته می‌شود.")) return;
    const result = historyRetentionService.cleanupArchivedEvents();
    setRefreshToken((value) => value + 1);
    setMessage(result.removedCount ? `${toPersianNumber(result.removedCount)} event آرشیوشده پاک شد.` : "event آرشیوشده‌ای برای cleanup وجود ندارد.");
  };
  const deleteArchive = (id: string) => {
    if (!window.confirm("این فایل archive محلی حذف شود؟ eventهای فعال history تغییری نمی‌کنند.")) return;
    historyRetentionService.deleteArchive(id);
    setRefreshToken((value) => value + 1);
  };

  const policyFields: Array<{ key: NumberPolicyKey; label: string }> = [
    { key: "keepRecentDays", label: "نگهداری رویدادهای اخیر" },
    { key: "archiveAfterDays", label: "آرشیو پس از چند روز" },
    { key: "criticalKeepDays", label: "نگهداری رویداد مهم" },
    { key: "driftReviewAfterDays", label: "مهلت مرور Drift" },
    { key: "resignoffExpiresAfterDays", label: "انقضای بازتأیید" },
    { key: "maxEventsBeforeWarning", label: "سقف event قبل از هشدار" },
  ];

  return (
    <div className="page-stack history-retention-page">
      <header className="page-header">
        <div><span className="eyebrow">P19 History Discipline</span><h1>سیاست نگهداری تاریخچه</h1><p>Archive امن، مرور driftهای قدیمی و کنترل انقضای بازتأیید بدون حذف خودکار.</p></div>
        <div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">تقویم کنترل‌ها</a><a className="ghost-button" href="/organization/workforce-dashboard/operational-history">تاریخچه عملیاتی</a><a className="ghost-button" href="/organization/workforce-dashboard/data-center">مرکز داده</a><a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">پایش Drift</a><button className="primary-button" type="button" onClick={createArchive}>ساخت archive از history</button><button className="danger-button" type="button" onClick={cleanup}>پاک‌سازی امن آرشیوشده‌ها</button></div>
      </header>
      {message && <div className="inline-notice">{message}</div>}

      <section className="kpi-strip">
        <article className={`kpi-card tone-${retentionStatusTone(report.status)}`}><div><p>سلامت History</p><strong>{retentionStatusLabel(report.status)}</strong><span>{report.summary}</span></div></article>
        <article className="kpi-card tone-info"><div><p>کل Eventها</p><strong>{toPersianNumber(report.totalEvents)}</strong><span>{toPersianNumber(report.criticalEventCount)} مهم</span></div></article>
        <article className="kpi-card tone-focus"><div><p>قابل Archive</p><strong>{toPersianNumber(report.archiveCandidateCount)}</strong><span>آخرین archive: {report.latestArchiveAt ? toPersianNumber(new Date(report.latestArchiveAt).toLocaleDateString("fa-IR")) : "ثبت نشده"}</span></div></article>
        <article className="kpi-card tone-warn"><div><p>Drift قدیمی</p><strong>{toPersianNumber(report.staleDriftCount)}</strong><span>نیازمند مرور</span></div></article>
        <article className="kpi-card tone-critical"><div><p>بازتأیید منقضی</p><strong>{toPersianNumber(report.expiredResignoffCount)}</strong><span>آخرین snapshot: {latestSnapshot ? toPersianNumber(new Date(latestSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ندارد"}</span></div></article>
      </section>

      <section className="retention-layout">
        <section className="panel retention-policy-panel">
          <div className="section-head"><h2>سیاست فعلی</h2><StatusBadge tone={retentionStatusTone(report.status)}>{retentionStatusLabel(report.status)}</StatusBadge></div>
          <div className="field-grid">
            {policyFields.map((field) => <label className="field" key={field.key}><span>{field.label}</span><div className="number-with-unit"><input type="number" min="1" value={policyDraft[field.key]} onChange={(event) => updateNumber(field.key, event.target.value)} /><small>{field.key === "maxEventsBeforeWarning" ? "event" : "روز"}</small></div></label>)}
          </div>
          <label className="risk-acceptance retention-toggle"><input type="checkbox" checked={policyDraft.autoArchiveSuggestionEnabled} onChange={(event) => setPolicyDraft((current) => ({ ...current, autoArchiveSuggestionEnabled: event.target.checked }))} /><span>پیشنهاد خودکار archive فعال باشد.</span></label>
          <div className="form-actions"><button className="primary-button" type="button" onClick={savePolicy}>ذخیره سیاست</button><button className="ghost-button" type="button" onClick={resetPolicy}><RotateCcw size={16} /> بازگشت به پیش‌فرض</button></div>
        </section>
        <section className="panel">
          <h2>پیشنهادهای نگهداری</h2>
          <div className="analysis-list">{report.recommendations.map((recommendation) => <div className="panel-row tone-info" key={recommendation}>{recommendation}</div>)}</div>
          <label className="field"><span>یادداشت archive</span><textarea value={archiveNote} onChange={(event) => setArchiveNote(event.target.value)} placeholder="دلیل یا دوره بایگانی" /></label>
        </section>
      </section>

      <section className="panel">
        <div className="section-head"><h2>Issueهای نگهداری</h2><StatusBadge tone={retentionStatusTone(report.status)}>{toPersianNumber(report.issues.length)} مورد</StatusBadge></div>
        <div className="retention-issue-grid">{report.issues.map((item) => <article className={`drift-change tone-${driftTone(item.severity)}`} key={item.id}><div className="section-head"><StatusBadge tone={driftTone(item.severity)}>{item.severity}</StatusBadge><small>{item.type}</small></div><h3>{item.title}</h3><p>{item.description}</p><strong>{item.recommendation}</strong></article>)}{!report.issues.length && <div className="empty-launch-state"><CheckCircle2 className="tone-good" size={30} /><h2>History منظم است</h2></div>}</div>
      </section>

      <section className="panel">
        <div className="section-head"><h2>Archiveهای موجود</h2><StatusBadge tone="focus">{toPersianNumber(archives.length)}</StatusBadge></div>
        <div className="entity-table">{archives.map((archive) => <article key={archive.id}><div className="entity-main"><div><small>عنوان</small><strong>{archive.title}</strong></div><div><small>تعداد</small><strong>{toPersianNumber(archive.eventCount)}</strong></div><div><small>بازه</small><strong>{toPersianNumber(new Date(archive.fromDate).toLocaleDateString("fa-IR"))} تا {toPersianNumber(new Date(archive.toDate).toLocaleDateString("fa-IR"))}</strong></div></div><div className="row-actions"><code>{archive.checksum}</code><button className="primary-button" type="button" onClick={() => historyRetentionService.exportArchiveJson(archive.id)}>خروجی JSON</button><button className="danger-button" type="button" onClick={() => deleteArchive(archive.id)}>حذف archive</button></div></article>)}{!archives.length && <p>هنوز archive تاریخچه ساخته نشده است.</p>}</div>
      </section>
    </div>
  );
}



