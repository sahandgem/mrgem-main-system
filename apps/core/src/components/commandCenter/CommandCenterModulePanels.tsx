import { ArrowLeft, DatabaseZap, Factory, RadioTower, UsersRound } from "lucide-react";
import type { CommandCenterModuleSummary } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  formatDateTime,
  moduleAnchorId,
  toPersianNumber,
  toneForReliability,
} from "./presentation";

function ModuleIcon({ moduleId }: { moduleId: string }) {
  return moduleId.startsWith("workforce")
    ? <UsersRound aria-hidden="true" size={21} />
    : <Factory aria-hidden="true" size={21} />;
}

export function CommandCenterModuleHealth({ modules }: { modules: readonly CommandCenterModuleSummary[] }) {
  return (
    <section className="content-section" aria-labelledby="module-health-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker"><RadioTower aria-hidden="true" size={17} />اعتماد به ورودی‌ها</span>
          <h3 id="module-health-title">سلامت و تازگی ماژول‌ها</h3>
          <p>این بخش کیفیت داده را نشان می‌دهد؛ نه اولویت اقدام کسب‌وکاری را.</p>
        </div>
      </div>
      <div className="module-health-grid">
        {modules.map((module) => (
          <article className="module-health-card" id={moduleAnchorId(module.moduleId)} key={module.moduleId}>
            <div className="module-health-card__heading">
              <span className="module-icon"><ModuleIcon moduleId={module.moduleId} /></span>
              <div><h4>{module.displayName}</h4><p>{module.moduleDescription}</p></div>
              {module.isExperimental && <StatusBadge tone="focus">Mock / آزمایشی</StatusBadge>}
            </div>
            <div className="module-health-card__state">
              <div><span>سلامت داده</span><StatusBadge tone={toneForReliability(module.reliability)}>{module.reliabilityLabel}</StatusBadge></div>
              <div><span>وضعیت فعلی</span><strong>{module.dataStateLabel}</strong></div>
              <div><span>زمان مشاهده</span><strong>{formatDateTime(module.observedAt)}</strong></div>
            </div>
            {module.hasLastKnownGood && (
              <div className="last-known-good-note"><DatabaseZap aria-hidden="true" size={17} /><span><strong>مرجع تاریخی:</strong> آخرین داده سالم مربوط به {formatDateTime(module.observedAt)} است و داده فعلی محسوب نمی‌شود.</span></div>
            )}
            <div className="module-health-card__counts">
              <span>{toPersianNumber(module.alertCounts.critical + module.alertCounts.warning)} هشدار کسب‌وکاری</span>
              <span>{toPersianNumber(module.highlightedKpiCount)} شاخص نیازمند توجه</span>
              {module.isPartialData && <span className="tone-warn">نمایش فقط بخش‌های معتبر</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CommandCenterModuleEntry({ modules }: { modules: readonly CommandCenterModuleSummary[] }) {
  return (
    <section className="content-section module-directory" aria-labelledby="module-entry-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker">مسیر بررسی</span>
          <h3 id="module-entry-title">ورود به جزئیات ماژول‌ها</h3>
          <p>در نسخه فعلی، مسیرها فقط به خلاصه نمایشی داخل Core می‌رسند و اتصال عملیاتی ندارند.</p>
        </div>
      </div>
      <div className="module-entry-grid">
        {modules.map((module) => (
          <article className="module-entry-card" key={module.moduleId}>
            <span className="module-icon"><ModuleIcon moduleId={module.moduleId} /></span>
            <div>
              <div className="module-entry-card__title"><h4>{module.displayName}</h4>{module.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}</div>
              <p>{module.moduleDescription}</p>
              {module.isExperimental && <small>منطق نهایی Production و مسیر عملیاتی آن هنوز نیازمند تعریف است.</small>}
            </div>
            {module.detailRouteRef
              ? <a className="module-entry-card__link" href={module.detailRouteRef}>{module.destinationLabel}<ArrowLeft aria-hidden="true" size={16} /></a>
              : <span className="muted-action">مسیر جزئیات تعریف نشده است</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
