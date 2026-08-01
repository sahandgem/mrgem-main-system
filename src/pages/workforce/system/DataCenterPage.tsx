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
    operationalHistoryService.recordBackupEvent(bundle.id, "خروجی پشتیبان دستی", bundle.checksum);
    setMessage(`فایل ${result.fileName} آماده شد.`);
  };

  const makeSnapshot = () => {
    const snapshot = workforceBackupService.createSnapshot("Snapshot دستی", "manual-data-center", "ساخته شده از مرکز داده", false);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    refresh();
    setMessage("Snapshot دستی ساخته شد.");
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorkforceBackupBundle;
      const result = workforceBackupService.validateBackupBundle(parsed);
      setValidation(result);
      setPendingBundle(parsed);
      setMessage(result.canImport ? "فایل معتبر است و آماده import است." : "فایل معتبر نیست.");
    } catch {
      setValidation({ isValid: false, version: "", errors: ["فایل JSON قابل خواندن نیست."], warnings: [], counts: {}, canImport: false });
      setPendingBundle(null);
      setMessage("فایل قابل خواندن نیست.");
    }
  };

  const importPending = () => {
    if (!pendingBundle || !validation?.canImport) return;
    const ok = window.confirm("همه داده‌های فعلی با فایل بکاپ جایگزین شوند؟ قبل از import یک snapshot خودکار ساخته می‌شود.");
    if (!ok) return;
    const result = workforceBackupService.importBackupBundle(pendingBundle, "replace");
    if (result.imported) operationalHistoryService.recordImportRestore(pendingBundle.id, "بکاپ خارجی جایگزین داده‌های جاری شد.");
    refresh();
    setMessage(result.imported ? "Import انجام شد. صفحه را refresh کن تا همه بخش‌ها داده جدید را ببینند." : "Import انجام نشد.");
  };

  const restoreSnapshot = (snapshotId: string) => {
    const ok = window.confirm("داده‌های فعلی به وضعیت این snapshot برگردند؟ قبل از restore یک snapshot خودکار ساخته می‌شود.");
    if (!ok) return;
    const restored = workforceBackupService.restoreSnapshot(snapshotId);
    if (restored) operationalHistoryService.recordImportRestore(restored.id, `Snapshot «${restored.title}» بازیابی شد.`);
    refresh();
    setMessage("Restore انجام شد. صفحه را refresh کن.");
  };

  const deleteSnapshot = (snapshotId: string) => {
    const ok = window.confirm("این snapshot حذف شود؟");
    if (!ok) return;
    workforceBackupService.deleteSnapshot(snapshotId);
    refresh();
  };

  const dangerousReset = () => {
    const ok = window.confirm("Reset demo همه داده‌های فعلی را جایگزین می‌کند. قبل از reset snapshot خودکار ساخته می‌شود. ادامه می‌دهی؟");
    if (!ok) return;
    resetDemo();
    refresh();
    setMessage("Reset demo انجام شد.");
  };

  const statCards = [
    { label: "فضاها", value: stats.spacesCount },
    { label: "کارمندان", value: stats.employeesCount },
    { label: "نوع کارها", value: stats.taskTypesCount },
    { label: "برنامه", value: stats.scheduleItemsCount },
    { label: "گزارش‌ها", value: stats.reportsCount },
    { label: "هدف‌ها", value: stats.goalsCount },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P12 Data Center</span>
          <h1>جعبه سیاه داده‌ها</h1>
          <p>بکاپ کامل، import معتبر، snapshot و rollback سبک برای داده‌های localStorage.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">تقویم کنترل‌ها</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">چک‌لیست آمادگی</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/maintenance">کنسول نگهداری</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">تاریخچه عملیاتی</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/history-retention">سیاست نگهداری</a>
          <button className="primary-button" type="button" onClick={exportBackup}>خروجی گرفتن کامل</button>
          <button className="ghost-button" type="button" onClick={makeSnapshot}>ساخت snapshot دستی</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-good"><div><p>سلامت داده‌ها</p><strong>قابل بازیابی</strong><span>{snapshots.length ? `${toPersianNumber(snapshots.length)} snapshot` : "هنوز snapshot نداری"}</span></div></article>
        <article className="kpi-card tone-info"><div><p>آخرین بکاپ</p><strong>{lastSnapshot ? toPersianNumber(new Date(lastSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ثبت نشده"}</strong><span>{lastSnapshot?.title ?? "snapshot بساز"}</span></div></article>
        <article className="kpi-card tone-focus"><div><p>رکوردها</p><strong>{toPersianNumber(Object.values(stats).filter((value) => typeof value === "number").reduce((sum, value) => sum + Number(value), 0))}</strong><span>در کل بخش‌ها</span></div></article>
        <article className="kpi-card tone-warn"><div><p>کلیدها</p><strong>{toPersianNumber(workforceBackupKeys.length)}</strong><span>پوشش export/import</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ناحیه خطر</p><strong>Reset</strong><span>با snapshot خودکار</span></div></article>
      </section>

      {message && <section className="panel"><p>{message}</p></section>}
       {baselineSignoff && <BaselineCompatibilityNotice report={baselineDrift} />}
     <section className="panel baseline-card tone-info">
        <div className="section-head"><h2>خروجی تقویم کنترل‌ها</h2><StatusBadge tone="info">{toPersianNumber(operationsPolicy.enabledControlTypes.length)} نوع فعال</StatusBadge></div>
        <p>{toPersianNumber(operationsControlCount)} کنترل ذخیره‌شده | Snapshot هر {toPersianNumber(operationsPolicy.snapshotEveryDays)} روز</p>
        <div className="row-actions"><a className="primary-button" href="/organization/workforce-dashboard/operations-calendar">تقویم و خروجی ICS/JSON</a><a className="ghost-button" href="/organization/workforce-dashboard/operations-control-settings">تنظیم Policy</a></div>
      </section>
      {baselineSignoff && (
        <section className="panel baseline-card tone-good">
          <div className="section-head"><h2>Baseline عملیاتی</h2><StatusBadge tone="good">تأییدشده</StatusBadge></div>
          <p>{toPersianNumber(new Date(baselineSignoff.signedAt ?? baselineSignoff.updatedAt).toLocaleString("fa-IR"))} | {baselineSignoff.signedBy}</p>
          <code>{baselineSignoff.baselineChecksum}</code>
          <div className="row-actions">
            <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">گزارش تأیید</a>
            <button className="primary-button" type="button" onClick={() => launchSignoffService.downloadBaseline(baselineSignoff.id)}>دانلود backup baseline</button>
          </div>
        </section>
      )}
      <section className={`panel baseline-card tone-${retentionStatusTone(retentionReport.status)}`}>
        <div className="section-head"><h2>Archive تاریخچه</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
        <p>{toPersianNumber(historyArchives.length)} archive | آخرین: {historyArchives[0] ? toPersianNumber(new Date(historyArchives[0].createdAt).toLocaleDateString("fa-IR")) : "ثبت نشده"}</p>
        <a className="primary-button" href="/organization/workforce-dashboard/history-retention">مدیریت retention</a>
      </section>
      {baselineSignoff && (
        <section className={`panel baseline-card tone-${driftTone(baselineDrift.driftLevel)}`}>
          <div className="section-head"><h2>Baseline drift</h2><StatusBadge tone={driftTone(baselineDrift.driftLevel)}>{driftLevelLabel(baselineDrift.driftLevel)}</StatusBadge></div>
          <p>امتیاز {toPersianNumber(baselineDrift.driftScore)} | {toPersianNumber(baselineDrift.totalChanges)} تغییر</p>
          <a className="primary-button" href="/organization/workforce-dashboard/baseline-drift">پایش تغییرات baseline</a>
        </section>
      )}
      {maintenanceReport.criticalCount > 0 && (
        <section className="panel">
          <h2>هشدار نگهداری</h2>
          <p>{toPersianNumber(maintenanceReport.criticalCount)} خطای بحرانی در سلامت داده‌ها دیده شد.</p>
          <a className="danger-button" href="/organization/workforce-dashboard/maintenance">بررسی در کنسول نگهداری</a>
        </section>
      )}

      <section className="bottom-grid">
        <section className="panel">
          <h2>تعداد رکوردها</h2>
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
          <h2>وارد کردن بکاپ</h2>
          <input type="file" accept="application/json,.json" onChange={(event) => void onImportFile(event.target.files?.[0])} />
          {validation && (
            <div className="evidence-box">
              <span>{validation.canImport ? "فایل معتبر است." : "فایل قابل import نیست."}</span>
              <small>{[...validation.errors, ...validation.warnings].join(" | ") || `نسخه ${validation.version}`}</small>
            </div>
          )}
          <div className="recommendation-row">
            <button className="danger-button" type="button" disabled={!validation?.canImport} onClick={importPending}>جایگزینی کامل با فایل</button>
          </div>
        </section>

        <section className="panel">
          <h2>ناحیه خطر</h2>
          <p>Reset demo قبل از اجرا snapshot خودکار می‌سازد.</p>
          <button className="danger-button" type="button" onClick={dangerousReset}>Reset demo با هشدار جدی</button>
        </section>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Snapshotها</h2>
          <span className="inline-note">کلید ذخیره: {workforceSnapshotStorageKey}</span>
        </div>
        <div className="entity-table">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id}>
              <div className="entity-main">
                <div><small>عنوان</small><strong>{snapshot.title}</strong></div>
                <div><small>زمان</small><strong>{toPersianNumber(new Date(snapshot.createdAt).toLocaleString("fa-IR"))}</strong></div>
                <div><small>نوع</small><strong>{snapshot.isAuto ? "خودکار" : "دستی"}</strong></div>
              </div>
              <div className="row-actions">
                <StatusBadge tone={snapshot.isAuto ? "focus" : "info"}>{snapshot.reason}</StatusBadge>
                <button className="ghost-button" type="button" onClick={() => restoreSnapshot(snapshot.id)}>بازیابی</button>
                <button className="danger-button" type="button" onClick={() => deleteSnapshot(snapshot.id)}>حذف</button>
              </div>
            </article>
          ))}
          {!snapshots.length && <p>هنوز snapshot ذخیره نشده است.</p>}
        </div>
      </section>
    </div>
  );
}
