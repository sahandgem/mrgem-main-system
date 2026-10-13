import type {
  CommandCenterAttentionItem,
  CommandCenterKpiHighlight,
  CommandCenterModuleSummary,
  CommandCenterReliabilityState,
} from "../../integration/commandCenter/commandCenterViewModel";

export interface CockpitKpiSignal {
  signalId: string;
  label: string;
  value?: string;
  context: string;
  ownerLabel: string;
  dataStateLabel: string;
  reliability?: CommandCenterReliabilityState;
  observedAt?: string;
  trendText?: string;
  explanation?: string;
  destinationLabel?: string;
  destinationRef?: string;
  isExperimental: boolean;
  relatedAttention?: CommandCenterAttentionItem;
  module?: CommandCenterModuleSummary;
}

export type CockpitDrawerSelection =
  | {
      kind: "attention";
      item: CommandCenterAttentionItem;
      module?: CommandCenterModuleSummary;
      relatedKpi?: CommandCenterKpiHighlight;
    }
  | {
      kind: "module";
      module: CommandCenterModuleSummary;
      kpis: readonly CommandCenterKpiHighlight[];
      attentions: readonly CommandCenterAttentionItem[];
      latestChange?: CommandCenterKpiHighlight;
    }
  | { kind: "kpi"; signal: CockpitKpiSignal }
  | {
      kind: "change";
      item: CommandCenterKpiHighlight;
      module?: CommandCenterModuleSummary;
      relatedAttention?: CommandCenterAttentionItem;
    };

export type CockpitDrawerEvent =
  | { type: "open"; selection: CockpitDrawerSelection }
  | { type: "close" };

// C4 has one host and one payload. Replacing the payload can never create a nested stack.
export function reduceCockpitDrawer(
  _current: CockpitDrawerSelection | undefined,
  event: CockpitDrawerEvent,
) {
  return event.type === "open" ? event.selection : undefined;
}

export function drawerSelectionKey(selection: CockpitDrawerSelection) {
  if (selection.kind === "attention") return `attention:${selection.item.attentionId}`;
  if (selection.kind === "module") return `module:${selection.module.moduleId}`;
  if (selection.kind === "change") return `change:${selection.item.highlightId}`;
  return `kpi:${selection.signal.signalId}`;
}

export function relatedAttentionForKpi(
  highlight: CommandCenterKpiHighlight,
  attentions: readonly CommandCenterAttentionItem[],
) {
  return attentions.find((item) => (
    item.moduleId === highlight.moduleId
    && item.sourceType === "kpi"
    && item.sourceRef === highlight.kpiKey
  ));
}

export function signalFromHighlight(
  highlight: CommandCenterKpiHighlight,
  module: CommandCenterModuleSummary | undefined,
  attentions: readonly CommandCenterAttentionItem[],
): CockpitKpiSignal {
  return {
    signalId: highlight.highlightId,
    label: highlight.label,
    value: highlight.displayValue,
    context: highlight.contextLabel,
    ownerLabel: highlight.moduleName,
    dataStateLabel: module?.dataStateLabel ?? highlight.reliabilityLabel,
    reliability: highlight.reliability,
    observedAt: highlight.observedAt,
    trendText: highlight.trendText,
    explanation: highlight.explanation,
    destinationLabel: module?.destinationLabel,
    destinationRef: highlight.drillDownRef ?? module?.detailRouteRef,
    isExperimental: highlight.isExperimental,
    relatedAttention: relatedAttentionForKpi(highlight, attentions),
    module,
  };
}
