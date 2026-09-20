import { useEffect, useRef } from "react";
import { ArrowLeft, X } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { changeImpact, reliabilityText } from "./density";
import {
  drawerSelectionKey,
  relatedAttentionForKpi,
  signalFromHighlight,
  type CockpitDrawerSelection,
} from "./drawerModel";
import {
  attentionPriorityLabel,
  confidenceLabel,
  formatDateTime,
  toneForAttention,
  toneForKpiStatus,
  toneForReliability,
} from "./presentation";

function DrawerNavigation({ label, reference }: { label?: string; reference?: string }) {
  if (!reference) {
    return <p className="drawer-route-missing">مسیر ورود به ماژول هنوز متصل نیست.</p>;
  }
  return (
    <a className="drawer-navigation" href={reference}>
      <span>{label ? `رفتن به ${label}` : "رفتن به مقصد ثبت‌شده"}</span>
      <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
    </a>
  );
}

function AttentionDetail({
  onSelect,
  selection,
}: {
  onSelect: (selection: CockpitDrawerSelection) => void;
  selection: Extract<CockpitDrawerSelection, { kind: "attention" }>;
}) {
  const { item, module, relatedKpi } = selection;
  return (
    <>
      <div className="drawer-heading">
        <span>{item.moduleName}</span>
        <h3>{item.title}</h3>
        <div>
          {item.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
          <StatusBadge tone={toneForAttention(item)}>{attentionPriorityLabel(item.priorityTier)}</StatusBadge>
          <StatusBadge tone={toneForReliability(item.reliability)}>{module?.dataStateLabel ?? reliabilityText(item.reliability)}</StatusBadge>
        </div>
      </div>
      <dl className="drawer-facts">
        <div><dt>اثر کسب‌وکاری</dt><dd>{item.businessImpact}</dd></div>
        <div>
          <dt>شواهد موجود</dt>
          <dd>{item.summary}</dd>
          {item.sourceRef && <dd className="drawer-reference" dir="ltr">{item.sourceRef}</dd>}
        </div>
        <div>
          <dt>اعتماد به داده</dt>
          <dd><StatusBadge tone={toneForReliability(item.reliability)}>{reliabilityText(item.reliability)} · {confidenceLabel(item.confidence)}</StatusBadge></dd>
          {module?.isPartialData && <dd className="drawer-secondary">پوشش داده ناقص است و فقط بخش معتبر نمایش داده می‌شود.</dd>}
        </div>
        <div><dt>زمان و تازگی</dt><dd>{item.timeContext}</dd><dd className="drawer-secondary">زمان تشخیص: {formatDateTime(item.detectedAt)}</dd></div>
        {relatedKpi && (
          <div>
            <dt>مورد مرتبط</dt>
            <dd><button className="drawer-related-button" onClick={() => onSelect({ kind: "kpi", signal: signalFromHighlight(relatedKpi, module, [item]) })} type="button">مشاهده شاخص «{relatedKpi.label}» در همین پنل</button></dd>
          </div>
        )}
        <div><dt>مقصد بررسی</dt><dd>{item.destinationLabel}</dd></div>
      </dl>
      <DrawerNavigation label={item.destinationLabel} reference={item.drillDownRef} />
      <div className="drawer-placeholder"><strong>فقط مشاهده و بررسی</strong><p>{item.isExperimental ? "تولید آزمایشی است؛ منطق نهایی و اتصال واقعی تعریف نشده‌اند." : "اقدام اجرایی در ماژول مالک انجام می‌شود و Core چیزی را تغییر نمی‌دهد."}</p></div>
    </>
  );
}

function ModuleDetail({
  onSelect,
  selection,
}: {
  onSelect: (selection: CockpitDrawerSelection) => void;
  selection: Extract<CockpitDrawerSelection, { kind: "module" }>;
}) {
  const { attentions, kpis, latestChange, module } = selection;
  return (
    <>
      <div className="drawer-heading">
        <span>تصویر مدیریتی ماژول</span>
        <h3>{module.displayName}</h3>
        <div>
          {module.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
          <StatusBadge tone={toneForReliability(module.reliability)}>{module.dataStateLabel}</StatusBadge>
        </div>
      </div>
      <dl className="drawer-facts">
        <div><dt>وضعیت و دامنه</dt><dd>{module.summaryText}</dd><dd className="drawer-secondary">{module.moduleDescription}</dd></div>
        <div><dt>اعتماد به داده</dt><dd>{module.reliabilityLabel}</dd>{module.isPartialData && <dd className="drawer-secondary">بخشی از داده در دسترس نیست.</dd>}</div>
        <div><dt>{module.hasLastKnownGood ? "زمان آخرین داده سالم" : "زمان مشاهده"}</dt><dd>{formatDateTime(module.observedAt ?? module.lastSuccessfulAt)}</dd></div>
        <div>
          <dt>شاخص‌های موجود</dt>
          <dd className="drawer-inline-list">
            {kpis.length ? kpis.slice(0, 4).map((kpi) => (
              <button key={kpi.highlightId} onClick={() => onSelect({ kind: "kpi", signal: signalFromHighlight(kpi, module, attentions) })} type="button">
                <span>{kpi.label}</span><strong>{kpi.displayValue}</strong>
              </button>
            )) : <span>شاخص معتبری در داده موجود نیست.</span>}
          </dd>
        </div>
        <div>
          <dt>موضوع‌های مرتبط</dt>
          <dd className="drawer-related-list">
            {attentions.length ? attentions.slice(0, 4).map((attention) => (
              <button key={attention.attentionId} onClick={() => onSelect({
                kind: "attention",
                item: attention,
                module,
                relatedKpi: kpis.find((kpi) => kpi.kpiKey === attention.sourceRef),
              })} type="button">{attention.title}</button>
            )) : <span>موضوع بازی برای این ماژول وجود ندارد.</span>}
          </dd>
        </div>
        {latestChange && (
          <div><dt>آخرین تغییر مهم موجود</dt><dd><button className="drawer-related-button" onClick={() => onSelect({ kind: "change", item: latestChange, module, relatedAttention: relatedAttentionForKpi(latestChange, attentions) })} type="button">{latestChange.label} · {latestChange.trendText}</button></dd></div>
        )}
      </dl>
      <DrawerNavigation label={module.destinationLabel} reference={module.detailRouteRef} />
      {module.isExperimental && <div className="drawer-placeholder"><strong>تولید آزمایشی است</strong><p>این نمای مدیریتی فقط معماری رابط را نشان می‌دهد؛ اتصال و منطق نهایی تولید فعال نیست.</p></div>}
    </>
  );
}

function KpiDetail({
  onSelect,
  selection,
}: {
  onSelect: (selection: CockpitDrawerSelection) => void;
  selection: Extract<CockpitDrawerSelection, { kind: "kpi" }>;
}) {
  const { signal } = selection;
  const relatedAttention = signal.relatedAttention;
  const isHistorical = signal.reliability === "stale_last_known_good" || signal.module?.reliability === "unavailable";
  return (
    <>
      <div className="drawer-heading">
        <span>{signal.ownerLabel}</span>
        <h3>{signal.label}</h3>
        <div>
          {signal.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
          <StatusBadge tone={toneForReliability(signal.reliability ?? "unknown")}>{signal.dataStateLabel}</StatusBadge>
        </div>
      </div>
      <dl className="drawer-facts">
        <div>
          <dt>{isHistorical ? "آخرین مقدار سالم؛ تاریخی" : "مقدار موجود"}</dt>
          <dd className="drawer-metric-value">{signal.value ?? "داده موجود نیست"}</dd>
          {signal.module?.reliability === "unavailable" && <dd className="drawer-secondary">داده زنده در دسترس نیست؛ این مقدار جاری محسوب نمی‌شود.</dd>}
        </div>
        <div><dt>بازه و زمینه</dt><dd>{signal.context}</dd></div>
        {signal.trendText && <div><dt>مقایسه موجود</dt><dd>{signal.trendText}</dd></div>}
        {signal.explanation && <div><dt>معنای مدیریتی</dt><dd>{signal.explanation}</dd></div>}
        <div><dt>منبع و وضعیت داده</dt><dd>{signal.ownerLabel} · {signal.dataStateLabel}</dd><dd className="drawer-secondary">زمان مشاهده: {formatDateTime(signal.observedAt)}</dd></div>
        {relatedAttention && (
          <div><dt>موضوع مرتبط</dt><dd><button className="drawer-related-button" onClick={() => onSelect({ kind: "attention", item: relatedAttention, module: signal.module })} type="button">مشاهده «{relatedAttention.title}» در همین پنل</button></dd></div>
        )}
      </dl>
      <DrawerNavigation label={signal.destinationLabel} reference={signal.destinationRef} />
      {!signal.value && <div className="drawer-placeholder"><strong>نامشخص برابر صفر نیست</strong><p>تا وقتی منبع معتبر متصل یا مقدار واقعی موجود نباشد، عددی برای این سیگنال نمایش داده نمی‌شود.</p></div>}
    </>
  );
}

function ChangeDetail({
  onSelect,
  selection,
}: {
  onSelect: (selection: CockpitDrawerSelection) => void;
  selection: Extract<CockpitDrawerSelection, { kind: "change" }>;
}) {
  const { item, module, relatedAttention } = selection;
  return (
    <>
      <div className="drawer-heading">
        <span>{item.moduleName}</span>
        <h3>{item.label}</h3>
        <div>
          {item.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
          <StatusBadge tone={toneForKpiStatus(item.status)}>تغییر مهم</StatusBadge>
          <StatusBadge tone={toneForReliability(item.reliability)}>{item.reliabilityLabel}</StatusBadge>
        </div>
      </div>
      <dl className="drawer-facts">
        <div><dt>چه چیزی تغییر کرده است</dt><dd>{item.trendText ?? "جزئیات تغییر در داده موجود نیست."}</dd></div>
        <div><dt>مقدار ثبت‌شده</dt><dd className="drawer-metric-value">{item.displayValue}</dd><dd className="drawer-secondary">مقادیر قبل و بعد به‌صورت مستقل در داده موجود نیست.</dd></div>
        <div><dt>اثر کسب‌وکاری</dt><dd>{changeImpact(item.kpiKey)}</dd></div>
        <div><dt>زمان مشاهده تغییر</dt><dd>{formatDateTime(item.observedAt)}</dd></div>
        {relatedAttention && (
          <div><dt>موضوع مرتبط</dt><dd><button className="drawer-related-button" onClick={() => onSelect({ kind: "attention", item: relatedAttention, module, relatedKpi: item })} type="button">مشاهده موضوع مرتبط در همین پنل</button></dd></div>
        )}
      </dl>
      <DrawerNavigation label={module?.destinationLabel} reference={item.drillDownRef ?? module?.detailRouteRef} />
    </>
  );
}

export function CockpitDrawerShell({
  onClose,
  onSelect,
  selection,
  showInitialFocusRing,
}: {
  onClose: () => void;
  onSelect: (selection: CockpitDrawerSelection) => void;
  selection?: CockpitDrawerSelection;
  showInitialFocusRing: boolean;
}) {
  const drawerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const selectionKey = selection ? drawerSelectionKey(selection) : undefined;

  useEffect(() => {
    if (!selection) return;
    if (drawerRef.current) drawerRef.current.scrollTop = 0;
    titleRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, selection, selectionKey]);

  if (!selection) return null;

  const sectionLabel = selection.kind === "attention"
    ? "جزئیات موضوع مدیریتی"
    : selection.kind === "module"
      ? "نمای مدیریتی ماژول"
      : selection.kind === "kpi"
        ? "جزئیات شاخص"
        : "جزئیات تغییر";

  return (
    <aside aria-labelledby="cockpit-drawer-title" className="cockpit-drawer" ref={drawerRef} role="dialog">
      <header>
        <div><span className="section-label">مشاهده و بررسی</span><h2 className={showInitialFocusRing ? "drawer-title drawer-title--keyboard" : "drawer-title"} id="cockpit-drawer-title" ref={titleRef} tabIndex={-1}>{sectionLabel}</h2></div>
        <button aria-label="بستن جزئیات و بازگشت به عنصر انتخاب‌شده" className="drawer-close" onClick={onClose} type="button">
          <X aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>بستن</span>
        </button>
      </header>
      {selection.kind === "attention" && <AttentionDetail onSelect={onSelect} selection={selection} />}
      {selection.kind === "module" && <ModuleDetail onSelect={onSelect} selection={selection} />}
      {selection.kind === "kpi" && <KpiDetail onSelect={onSelect} selection={selection} />}
      {selection.kind === "change" && <ChangeDetail onSelect={onSelect} selection={selection} />}
    </aside>
  );
}
