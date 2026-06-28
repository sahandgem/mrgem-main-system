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
    setMessage("ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ ط°ط®غŒط±ظ‡ ط´ط¯.");
  };
  const resetPolicy = () => {
    const policy = historyRetentionService.resetPolicy();
    setPolicyDraft(policy);
    setRefreshToken((value) => value + 1);
    setMessage("ط³غŒط§ط³طھ ظ¾غŒط´â€Œظپط±ط¶ ط¨ط§ط²ع¯ط±ط¯ط§ظ†ط¯ظ‡ ط´ط¯.");
  };
  const createArchive = () => {
    const archive = historyRetentionService.createHistoryArchive(archiveNote);
    if (!archive) {
      setMessage("ط¯ط± ط­ط§ظ„ ط­ط§ط¶ط± event ظˆط§ط¬ط¯ ط´ط±ط§غŒط· archive ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.");
      return;
    }
    setArchiveNote("");
    setRefreshToken((value) => value + 1);
    setMessage(`${toPersianNumber(archive.eventCount)} event ط¯ط± archive ط°ط®غŒط±ظ‡ ط´ط¯.`);
  };
  const cleanup = () => {
    if (!window.confirm("ظپظ‚ط· eventظ‡ط§غŒغŒ ع©ظ‡ ط¯ط§ط®ظ„ archive ط°ط®غŒط±ظ‡ ط´ط¯ظ‡â€Œط§ظ†ط¯ ظ¾ط§ع© ط´ظˆظ†ط¯طں ظ‚ط¨ظ„ ط§ط² cleanup غŒع© snapshot ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.")) return;
    const result = historyRetentionService.cleanupArchivedEvents();
    setRefreshToken((value) => value + 1);
    setMessage(result.removedCount ? `${toPersianNumber(result.removedCount)} event ط¢ط±ط´غŒظˆط´ط¯ظ‡ ظ¾ط§ع© ط´ط¯.` : "event ط¢ط±ط´غŒظˆط´ط¯ظ‡â€Œط§غŒ ط¨ط±ط§غŒ cleanup ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.");
  };
  const deleteArchive = (id: string) => {
    if (!window.confirm("ط§غŒظ† ظپط§غŒظ„ archive ظ…ط­ظ„غŒ ط­ط°ظپ ط´ظˆط¯طں eventظ‡ط§غŒ ظپط¹ط§ظ„ history طھط؛غŒغŒط±غŒ ظ†ظ…غŒâ€Œع©ظ†ظ†ط¯.")) return;
    historyRetentionService.deleteArchive(id);
    setRefreshToken((value) => value + 1);
  };

  const policyFields: Array<{ key: NumberPolicyKey; label: string }> = [
    { key: "keepRecentDays", label: "ظ†ع¯ظ‡ط¯ط§ط±غŒ ط±ظˆغŒط¯ط§ط¯ظ‡ط§غŒ ط§ط®غŒط±" },
    { key: "archiveAfterDays", label: "ط¢ط±ط´غŒظˆ ظ¾ط³ ط§ط² ع†ظ†ط¯ ط±ظˆط²" },
    { key: "criticalKeepDays", label: "ظ†ع¯ظ‡ط¯ط§ط±غŒ ط±ظˆغŒط¯ط§ط¯ ظ…ظ‡ظ…" },
    { key: "driftReviewAfterDays", label: "ظ…ظ‡ظ„طھ ظ…ط±ظˆط± Drift" },
    { key: "resignoffExpiresAfterDays", label: "ط§ظ†ظ‚ط¶ط§غŒ ط¨ط§ط²طھط£غŒغŒط¯" },
    { key: "maxEventsBeforeWarning", label: "ط³ظ‚ظپ event ظ‚ط¨ظ„ ط§ط² ظ‡ط´ط¯ط§ط±" },
  ];

  return (
    <div className="page-stack history-retention-page">
      <header className="page-header">
        <div><span className="eyebrow">P19 History Discipline</span><h1>ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ طھط§ط±غŒط®ع†ظ‡</h1><p>Archive ط§ظ…ظ†طŒ ظ…ط±ظˆط± driftظ‡ط§غŒ ظ‚ط¯غŒظ…غŒ ظˆ ع©ظ†طھط±ظ„ ط§ظ†ظ‚ط¶ط§غŒ ط¨ط§ط²طھط£غŒغŒط¯ ط¨ط¯ظˆظ† ط­ط°ظپ ط®ظˆط¯ع©ط§ط±.</p></div>
        <div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a><a className="ghost-button" href="/organization/workforce-dashboard/operational-history">طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ</a><a className="ghost-button" href="/organization/workforce-dashboard/data-center">ظ…ط±ع©ط² ط¯ط§ط¯ظ‡</a><a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">ظ¾ط§غŒط´ Drift</a><button className="primary-button" type="button" onClick={createArchive}>ط³ط§ط®طھ archive ط§ط² history</button><button className="danger-button" type="button" onClick={cleanup}>ظ¾ط§ع©â€Œط³ط§ط²غŒ ط§ظ…ظ† ط¢ط±ط´غŒظˆط´ط¯ظ‡â€Œظ‡ط§</button></div>
      </header>
      {message && <div className="inline-notice">{message}</div>}

      <section className="kpi-strip">
        <article className={`kpi-card tone-${retentionStatusTone(report.status)}`}><div><p>ط³ظ„ط§ظ…طھ History</p><strong>{retentionStatusLabel(report.status)}</strong><span>{report.summary}</span></div></article>
        <article className="kpi-card tone-info"><div><p>ع©ظ„ Eventظ‡ط§</p><strong>{toPersianNumber(report.totalEvents)}</strong><span>{toPersianNumber(report.criticalEventCount)} ظ…ظ‡ظ…</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ظ‚ط§ط¨ظ„ Archive</p><strong>{toPersianNumber(report.archiveCandidateCount)}</strong><span>ط¢ط®ط±غŒظ† archive: {report.latestArchiveAt ? toPersianNumber(new Date(report.latestArchiveAt).toLocaleDateString("fa-IR")) : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span></div></article>
        <article className="kpi-card tone-warn"><div><p>Drift ظ‚ط¯غŒظ…غŒ</p><strong>{toPersianNumber(report.staleDriftCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ظ…ط±ظˆط±</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط¨ط§ط²طھط£غŒغŒط¯ ظ…ظ†ظ‚ط¶غŒ</p><strong>{toPersianNumber(report.expiredResignoffCount)}</strong><span>ط¢ط®ط±غŒظ† snapshot: {latestSnapshot ? toPersianNumber(new Date(latestSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ظ†ط¯ط§ط±ط¯"}</span></div></article>
      </section>

      <section className="retention-layout">
        <section className="panel retention-policy-panel">
          <div className="section-head"><h2>ط³غŒط§ط³طھ ظپط¹ظ„غŒ</h2><StatusBadge tone={retentionStatusTone(report.status)}>{retentionStatusLabel(report.status)}</StatusBadge></div>
          <div className="field-grid">
            {policyFields.map((field) => <label className="field" key={field.key}><span>{field.label}</span><div className="number-with-unit"><input type="number" min="1" value={policyDraft[field.key]} onChange={(event) => updateNumber(field.key, event.target.value)} /><small>{field.key === "maxEventsBeforeWarning" ? "event" : "ط±ظˆط²"}</small></div></label>)}
          </div>
          <label className="risk-acceptance retention-toggle"><input type="checkbox" checked={policyDraft.autoArchiveSuggestionEnabled} onChange={(event) => setPolicyDraft((current) => ({ ...current, autoArchiveSuggestionEnabled: event.target.checked }))} /><span>ظ¾غŒط´ظ†ظ‡ط§ط¯ ط®ظˆط¯ع©ط§ط± archive ظپط¹ط§ظ„ ط¨ط§ط´ط¯.</span></label>
          <div className="form-actions"><button className="primary-button" type="button" onClick={savePolicy}>ط°ط®غŒط±ظ‡ ط³غŒط§ط³طھ</button><button className="ghost-button" type="button" onClick={resetPolicy}><RotateCcw size={16} /> ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ ظ¾غŒط´â€Œظپط±ط¶</button></div>
        </section>
        <section className="panel">
          <h2>ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2>
          <div className="analysis-list">{report.recommendations.map((recommendation) => <div className="panel-row tone-info" key={recommendation}>{recommendation}</div>)}</div>
          <label className="field"><span>غŒط§ط¯ط¯ط§ط´طھ archive</span><textarea value={archiveNote} onChange={(event) => setArchiveNote(event.target.value)} placeholder="ط¯ظ„غŒظ„ غŒط§ ط¯ظˆط±ظ‡ ط¨ط§غŒع¯ط§ظ†غŒ" /></label>
        </section>
      </section>

      <section className="panel">
        <div className="section-head"><h2>Issueظ‡ط§غŒ ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2><StatusBadge tone={retentionStatusTone(report.status)}>{toPersianNumber(report.issues.length)} ظ…ظˆط±ط¯</StatusBadge></div>
        <div className="retention-issue-grid">{report.issues.map((item) => <article className={`drift-change tone-${driftTone(item.severity)}`} key={item.id}><div className="section-head"><StatusBadge tone={driftTone(item.severity)}>{item.severity}</StatusBadge><small>{item.type}</small></div><h3>{item.title}</h3><p>{item.description}</p><strong>{item.recommendation}</strong></article>)}{!report.issues.length && <div className="empty-launch-state"><CheckCircle2 className="tone-good" size={30} /><h2>History ظ…ظ†ط¸ظ… ط§ط³طھ</h2></div>}</div>
      </section>

      <section className="panel">
        <div className="section-head"><h2>Archiveظ‡ط§غŒ ظ…ظˆط¬ظˆط¯</h2><StatusBadge tone="focus">{toPersianNumber(archives.length)}</StatusBadge></div>
        <div className="entity-table">{archives.map((archive) => <article key={archive.id}><div className="entity-main"><div><small>ط¹ظ†ظˆط§ظ†</small><strong>{archive.title}</strong></div><div><small>طھط¹ط¯ط§ط¯</small><strong>{toPersianNumber(archive.eventCount)}</strong></div><div><small>ط¨ط§ط²ظ‡</small><strong>{toPersianNumber(new Date(archive.fromDate).toLocaleDateString("fa-IR"))} طھط§ {toPersianNumber(new Date(archive.toDate).toLocaleDateString("fa-IR"))}</strong></div></div><div className="row-actions"><code>{archive.checksum}</code><button className="primary-button" type="button" onClick={() => historyRetentionService.exportArchiveJson(archive.id)}>ط®ط±ظˆط¬غŒ JSON</button><button className="danger-button" type="button" onClick={() => deleteArchive(archive.id)}>ط­ط°ظپ archive</button></div></article>)}{!archives.length && <p>ظ‡ظ†ظˆط² archive طھط§ط±غŒط®ع†ظ‡ ط³ط§ط®طھظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</div>
      </section>
    </div>
  );
}



