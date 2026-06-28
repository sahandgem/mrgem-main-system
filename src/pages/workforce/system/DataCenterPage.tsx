import { useState } from "react";
import { BaselineCompatibilityNotice } from "../../../components/workforce/BaselineCompatibilityNotice";
import { StatusBadge } from "../../../components/StatusBadge";
import type { BackupValidationResult, WorkforceBackupBundle } from "../../../models/workforce";
import { toPersianNumber } from "../../../models/workforce";
import { workforceService } from "../../../services/workforceService";
import { historyRetentionService } from "../../../services/historyRetentionService";
import { launchSignoffService } from "../../../services/launchSignoffService";
import { operationalHistoryService } from "../../../services/operationalHistoryService";
import { operationsCalendarService } from "../../../services/operationsCalendarService";
import { operationsControlSettingsService } from "../../../services/operationsControlSettingsService";
import { workforceBackupKeys, workforceBackupService, workforceSnapshotStorageKey } from "../../../services/workforceBackupService";
import { workforceMaintenanceService } from "../../../services/workforceMaintenanceService";
import {
  currentBaselineDriftReport,
  driftLevelLabel,
  driftTone,
  retentionStatusLabel,
  retentionStatusTone,
} from "../workforcePageUtils";

function defaultResetDemo() {
  workforceBackupService.createAutoSnapshotBeforeChange("before-reset-demo");
  workforceService.reset();
}
export default function DataCenterPage({ resetDemo = defaultResetDemo }: { resetDemo?: () => void }) {
  const [snapshots, setSnapshots] = useState(() => workforceBackupService.listSnapshots());
  const [validation, setValidation] = useState<BackupValidationResult | null>(null);
  const [pendingBundle, setPendingBundle] = useState<WorkforceBackupBundle | null>(null);
  const [message, setMessage] = useState("");
  const stats = workforceBackupService.getWorkforceDataStats();
  const lastSnapshot = snapshots[0];
  const maintenanceReport = workforceMaintenanceService.runReport();
  const baselineSignoff = launchSignoffService.latestSigned();
  const baselineDrift = currentBaselineDriftReport();
  const retentionReport = historyRetentionService.buildRetentionReport(baselineDrift.driftLevel);
  const historyArchives = historyRetentionService.listArchives();
  const operationsPolicy = operationsControlSettingsService.getSchedulePolicy();
  const operationsControlCount = operationsCalendarService.list().length;

  const refresh = () => {
    setSnapshots(workforceBackupService.listSnapshots());
  };

  const exportBackup = () => {
    const bundle = workforceBackupService.createBackupBundle("export manual", "manual-export");
    const result = workforceBackupService.downloadBackupFile(bundle);
    operationalHistoryService.recordBackupEvent(bundle.id, "ط®ط±ظˆط¬غŒ ظ¾ط´طھغŒط¨ط§ظ† ط¯ط³طھغŒ", bundle.checksum);
    setMessage(`ظپط§غŒظ„ ${result.fileName} ط¢ظ…ط§ط¯ظ‡ ط´ط¯.`);
  };

  const makeSnapshot = () => {
    const snapshot = workforceBackupService.createSnapshot("Snapshot ط¯ط³طھغŒ", "manual-data-center", "ط³ط§ط®طھظ‡ ط´ط¯ظ‡ ط§ط² ظ…ط±ع©ط² ط¯ط§ط¯ظ‡", false);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    refresh();
    setMessage("Snapshot ط¯ط³طھغŒ ط³ط§ط®طھظ‡ ط´ط¯.");
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorkforceBackupBundle;
      const result = workforceBackupService.validateBackupBundle(parsed);
      setValidation(result);
      setPendingBundle(parsed);
      setMessage(result.canImport ? "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ط§ط³طھ ظˆ ط¢ظ…ط§ط¯ظ‡ import ط§ط³طھ." : "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ظ†غŒط³طھ.");
    } catch {
      setValidation({ isValid: false, version: "", errors: ["ظپط§غŒظ„ JSON ظ‚ط§ط¨ظ„ ط®ظˆط§ظ†ط¯ظ† ظ†غŒط³طھ."], warnings: [], counts: {}, canImport: false });
      setPendingBundle(null);
      setMessage("ظپط§غŒظ„ ظ‚ط§ط¨ظ„ ط®ظˆط§ظ†ط¯ظ† ظ†غŒط³طھ.");
    }
  };

  const importPending = () => {
    if (!pendingBundle || !validation?.canImport) return;
    const ok = window.confirm("ظ‡ظ…ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط¨ط§ ظپط§غŒظ„ ط¨ع©ط§ظ¾ ط¬ط§غŒع¯ط²غŒظ† ط´ظˆظ†ط¯طں ظ‚ط¨ظ„ ط§ط² import غŒع© snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.");
    if (!ok) return;
    const result = workforceBackupService.importBackupBundle(pendingBundle, "replace");
    if (result.imported) operationalHistoryService.recordImportRestore(pendingBundle.id, "ط¨ع©ط§ظ¾ ط®ط§ط±ط¬غŒ ط¬ط§غŒع¯ط²غŒظ† ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط¬ط§ط±غŒ ط´ط¯.");
    refresh();
    setMessage(result.imported ? "Import ط§ظ†ط¬ط§ظ… ط´ط¯. طµظپط­ظ‡ ط±ط§ refresh ع©ظ† طھط§ ظ‡ظ…ظ‡ ط¨ط®ط´â€Œظ‡ط§ ط¯ط§ط¯ظ‡ ط¬ط¯غŒط¯ ط±ط§ ط¨ط¨غŒظ†ظ†ط¯." : "Import ط§ظ†ط¬ط§ظ… ظ†ط´ط¯.");
  };

  const restoreSnapshot = (snapshotId: string) => {
    const ok = window.confirm("ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط¨ظ‡ ظˆط¶ط¹غŒطھ ط§غŒظ† snapshot ط¨ط±ع¯ط±ط¯ظ†ط¯طں ظ‚ط¨ظ„ ط§ط² restore غŒع© snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.");
    if (!ok) return;
    const restored = workforceBackupService.restoreSnapshot(snapshotId);
    if (restored) operationalHistoryService.recordImportRestore(restored.id, `Snapshot آ«${restored.title}آ» ط¨ط§ط²غŒط§ط¨غŒ ط´ط¯.`);
    refresh();
    setMessage("Restore ط§ظ†ط¬ط§ظ… ط´ط¯. طµظپط­ظ‡ ط±ط§ refresh ع©ظ†.");
  };

  const deleteSnapshot = (snapshotId: string) => {
    const ok = window.confirm("ط§غŒظ† snapshot ط­ط°ظپ ط´ظˆط¯طں");
    if (!ok) return;
    workforceBackupService.deleteSnapshot(snapshotId);
    refresh();
  };

  const dangerousReset = () => {
    const ok = window.confirm("Reset demo ظ‡ظ…ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط±ط§ ط¬ط§غŒع¯ط²غŒظ† ظ…غŒâ€Œع©ظ†ط¯. ظ‚ط¨ظ„ ط§ط² reset snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯. ط§ط¯ط§ظ…ظ‡ ظ…غŒâ€Œط¯ظ‡غŒطں");
    if (!ok) return;
    resetDemo();
    refresh();
    setMessage("Reset demo ط§ظ†ط¬ط§ظ… ط´ط¯.");
  };

  const statCards = [
    { label: "ظپط¶ط§ظ‡ط§", value: stats.spacesCount },
    { label: "ع©ط§ط±ظ…ظ†ط¯ط§ظ†", value: stats.employeesCount },
    { label: "ظ†ظˆط¹ ع©ط§ط±ظ‡ط§", value: stats.taskTypesCount },
    { label: "ط¨ط±ظ†ط§ظ…ظ‡", value: stats.scheduleItemsCount },
    { label: "ع¯ط²ط§ط±ط´â€Œظ‡ط§", value: stats.reportsCount },
    { label: "ظ‡ط¯ظپâ€Œظ‡ط§", value: stats.goalsCount },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P12 Data Center</span>
          <h1>ط¬ط¹ط¨ظ‡ ط³غŒط§ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§</h1>
          <p>ط¨ع©ط§ظ¾ ع©ط§ظ…ظ„طŒ import ظ…ط¹طھط¨ط±طŒ snapshot ظˆ rollback ط³ط¨ع© ط¨ط±ط§غŒ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ localStorage.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">ع†ع©â€Œظ„غŒط³طھ ط¢ظ…ط§ط¯ع¯غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/maintenance">ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/history-retention">ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
          <button className="primary-button" type="button" onClick={exportBackup}>ط®ط±ظˆط¬غŒ ع¯ط±ظپطھظ† ع©ط§ظ…ظ„</button>
          <button className="ghost-button" type="button" onClick={makeSnapshot}>ط³ط§ط®طھ snapshot ط¯ط³طھغŒ</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-good"><div><p>ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡â€Œظ‡ط§</p><strong>ظ‚ط§ط¨ظ„ ط¨ط§ط²غŒط§ط¨غŒ</strong><span>{snapshots.length ? `${toPersianNumber(snapshots.length)} snapshot` : "ظ‡ظ†ظˆط² snapshot ظ†ط¯ط§ط±غŒ"}</span></div></article>
        <article className="kpi-card tone-info"><div><p>ط¢ط®ط±غŒظ† ط¨ع©ط§ظ¾</p><strong>{lastSnapshot ? toPersianNumber(new Date(lastSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong><span>{lastSnapshot?.title ?? "snapshot ط¨ط³ط§ط²"}</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط±ع©ظˆط±ط¯ظ‡ط§</p><strong>{toPersianNumber(Object.values(stats).filter((value) => typeof value === "number").reduce((sum, value) => sum + Number(value), 0))}</strong><span>ط¯ط± ع©ظ„ ط¨ط®ط´â€Œظ‡ط§</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ع©ظ„غŒط¯ظ‡ط§</p><strong>{toPersianNumber(workforceBackupKeys.length)}</strong><span>ظ¾ظˆط´ط´ export/import</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ظ†ط§ط­غŒظ‡ ط®ط·ط±</p><strong>Reset</strong><span>ط¨ط§ snapshot ط®ظˆط¯ع©ط§ط±</span></div></article>
      </section>

      {message && <section className="panel"><p>{message}</p></section>}
       {baselineSignoff && <BaselineCompatibilityNotice report={baselineDrift} />}
     <section className="panel baseline-card tone-info">
        <div className="section-head"><h2>ط®ط±ظˆط¬غŒ طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</h2><StatusBadge tone="info">{toPersianNumber(operationsPolicy.enabledControlTypes.length)} ظ†ظˆط¹ ظپط¹ط§ظ„</StatusBadge></div>
        <p>{toPersianNumber(operationsControlCount)} ع©ظ†طھط±ظ„ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡ | Snapshot ظ‡ط± {toPersianNumber(operationsPolicy.snapshotEveryDays)} ط±ظˆط²</p>
        <div className="row-actions"><a className="primary-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ظˆ ط®ط±ظˆط¬غŒ ICS/JSON</a><a className="ghost-button" href="/organization/workforce-dashboard/operations-control-settings">طھظ†ط¸غŒظ… Policy</a></div>
      </section>
      {baselineSignoff && (
        <section className="panel baseline-card tone-good">
          <div className="section-head"><h2>Baseline ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone="good">طھط£غŒغŒط¯ط´ط¯ظ‡</StatusBadge></div>
          <p>{toPersianNumber(new Date(baselineSignoff.signedAt ?? baselineSignoff.updatedAt).toLocaleString("fa-IR"))} | {baselineSignoff.signedBy}</p>
          <code>{baselineSignoff.baselineChecksum}</code>
          <div className="row-actions">
            <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">ع¯ط²ط§ط±ط´ طھط£غŒغŒط¯</a>
            <button className="primary-button" type="button" onClick={() => launchSignoffService.downloadBaseline(baselineSignoff.id)}>ط¯ط§ظ†ظ„ظˆط¯ backup baseline</button>
          </div>
        </section>
      )}
      <section className={`panel baseline-card tone-${retentionStatusTone(retentionReport.status)}`}>
        <div className="section-head"><h2>Archive طھط§ط±غŒط®ع†ظ‡</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
        <p>{toPersianNumber(historyArchives.length)} archive | ط¢ط®ط±غŒظ†: {historyArchives[0] ? toPersianNumber(new Date(historyArchives[0].createdAt).toLocaleDateString("fa-IR")) : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</p>
        <a className="primary-button" href="/organization/workforce-dashboard/history-retention">ظ…ط¯غŒط±غŒطھ retention</a>
      </section>
      {baselineSignoff && (
        <section className={`panel baseline-card tone-${driftTone(baselineDrift.driftLevel)}`}>
          <div className="section-head"><h2>Baseline drift</h2><StatusBadge tone={driftTone(baselineDrift.driftLevel)}>{driftLevelLabel(baselineDrift.driftLevel)}</StatusBadge></div>
          <p>ط§ظ…طھغŒط§ط² {toPersianNumber(baselineDrift.driftScore)} | {toPersianNumber(baselineDrift.totalChanges)} طھط؛غŒغŒط±</p>
          <a className="primary-button" href="/organization/workforce-dashboard/baseline-drift">ظ¾ط§غŒط´ طھط؛غŒغŒط±ط§طھ baseline</a>
        </section>
      )}
      {maintenanceReport.criticalCount > 0 && (
        <section className="panel">
          <h2>ظ‡ط´ط¯ط§ط± ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2>
          <p>{toPersianNumber(maintenanceReport.criticalCount)} ط®ط·ط§غŒ ط¨ط­ط±ط§ظ†غŒ ط¯ط± ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡â€Œظ‡ط§ ط¯غŒط¯ظ‡ ط´ط¯.</p>
          <a className="danger-button" href="/organization/workforce-dashboard/maintenance">ط¨ط±ط±ط³غŒ ط¯ط± ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
        </section>
      )}

      <section className="bottom-grid">
        <section className="panel">
          <h2>طھط¹ط¯ط§ط¯ ط±ع©ظˆط±ط¯ظ‡ط§</h2>
          <div className="score-grid">
            {statCards.map((item) => (
              <div className="heat-cell tone-info" key={item.label}>
                <strong>{toPersianNumber(item.value)}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>ظˆط§ط±ط¯ ع©ط±ط¯ظ† ط¨ع©ط§ظ¾</h2>
          <input type="file" accept="application/json,.json" onChange={(event) => void onImportFile(event.target.files?.[0])} />
          {validation && (
            <div className="evidence-box">
              <span>{validation.canImport ? "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ط§ط³طھ." : "ظپط§غŒظ„ ظ‚ط§ط¨ظ„ import ظ†غŒط³طھ."}</span>
              <small>{[...validation.errors, ...validation.warnings].join(" | ") || `ظ†ط³ط®ظ‡ ${validation.version}`}</small>
            </div>
          )}
          <div className="recommendation-row">
            <button className="danger-button" type="button" disabled={!validation?.canImport} onClick={importPending}>ط¬ط§غŒع¯ط²غŒظ†غŒ ع©ط§ظ…ظ„ ط¨ط§ ظپط§غŒظ„</button>
          </div>
        </section>

        <section className="panel">
          <h2>ظ†ط§ط­غŒظ‡ ط®ط·ط±</h2>
          <p>Reset demo ظ‚ط¨ظ„ ط§ط² ط§ط¬ط±ط§ snapshot ط®ظˆط¯ع©ط§ط± ظ…غŒâ€Œط³ط§ط²ط¯.</p>
          <button className="danger-button" type="button" onClick={dangerousReset}>Reset demo ط¨ط§ ظ‡ط´ط¯ط§ط± ط¬ط¯غŒ</button>
        </section>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Snapshotظ‡ط§</h2>
          <span className="inline-note">ع©ظ„غŒط¯ ط°ط®غŒط±ظ‡: {workforceSnapshotStorageKey}</span>
        </div>
        <div className="entity-table">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id}>
              <div className="entity-main">
                <div><small>ط¹ظ†ظˆط§ظ†</small><strong>{snapshot.title}</strong></div>
                <div><small>ط²ظ…ط§ظ†</small><strong>{toPersianNumber(new Date(snapshot.createdAt).toLocaleString("fa-IR"))}</strong></div>
                <div><small>ظ†ظˆط¹</small><strong>{snapshot.isAuto ? "ط®ظˆط¯ع©ط§ط±" : "ط¯ط³طھغŒ"}</strong></div>
              </div>
              <div className="row-actions">
                <StatusBadge tone={snapshot.isAuto ? "focus" : "info"}>{snapshot.reason}</StatusBadge>
                <button className="ghost-button" type="button" onClick={() => restoreSnapshot(snapshot.id)}>ط¨ط§ط²غŒط§ط¨غŒ</button>
                <button className="danger-button" type="button" onClick={() => deleteSnapshot(snapshot.id)}>ط­ط°ظپ</button>
              </div>
            </article>
          ))}
          {!snapshots.length && <p>ظ‡ظ†ظˆط² snapshot ط°ط®غŒط±ظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
        </div>
      </section>
    </div>
  );
}
