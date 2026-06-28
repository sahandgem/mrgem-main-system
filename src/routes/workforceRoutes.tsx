import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  Activity, AlertTriangle, Building2, CalendarDays, CheckCircle2, ClipboardCheck,
  Clock3, FileCheck2, ShieldCheck, Sparkles, Users,
  type LucideIcon,
} from "lucide-react";
import {
  findWorkforceRouteManifestItem,
  normalizeWorkforcePath,
  workforceRouteManifest,
  type WorkforceRouteComponentKey,
  type WorkforceRouteGroup,
} from "./workforceRouteManifest";

export interface WorkforceRouteDefinition {
  path: string;
  label: string;
  group: WorkforceRouteGroup;
  component: LazyExoticComponent<ComponentType>;
  icon: LucideIcon;
  showInNavigation: boolean;
  description?: string;
}

const WorkforceDashboardPage = lazy(() => import("../pages/workforce/core/WorkforceDashboardPage"));
const SpacesPage = lazy(() => import("../pages/workforce/core/SpacesPage"));
const EmployeesPage = lazy(() => import("../pages/workforce/core/EmployeesPage"));
const TaskTypesPage = lazy(() => import("../pages/workforce/core/TaskTypesPage"));
const SchedulePage = lazy(() => import("../pages/workforce/core/SchedulePage"));
const RulesPage = lazy(() => import("../pages/workforce/analysis/RulesPage"));
const AnalysisPage = lazy(() => import("../pages/workforce/analysis/AnalysisPage"));
const AnalysisSettingsPage = lazy(() => import("../pages/workforce/analysis/AnalysisSettingsPage"));
const CompatibilityPage = lazy(() => import("../pages/workforce/analysis/CompatibilityPage"));
const SimulatorPage = lazy(() => import("../pages/workforce/analysis/SimulatorPage"));
const RecommendationsPage = lazy(() => import("../pages/workforce/analysis/RecommendationsPage"));
const DecisionQueuePage = lazy(() => import("../pages/workforce/operations/DecisionQueuePage"));
const DecisionReportPage = lazy(() => import("../pages/workforce/operations/DecisionReportPage"));
const ReportArchivePage = lazy(() => import("../pages/workforce/operations/ReportArchivePage"));
const ReportComparisonPage = lazy(() => import("../pages/workforce/operations/ReportComparisonPage"));
const MonthlyHealthPage = lazy(() => import("../pages/workforce/operations/MonthlyHealthPage"));
const PreventiveAlertsPage = lazy(() => import("../pages/workforce/operations/PreventiveAlertsPage"));
const DataCenterPage = lazy(() => import("../pages/workforce/system/DataCenterPage"));
const MaintenancePage = lazy(() => import("../pages/workforce/system/MaintenancePage"));
const ReadinessPage = lazy(() => import("../pages/workforce/system/ReadinessPage"));
const LaunchChecklistPage = lazy(() => import("../pages/workforce/system/LaunchChecklistPage"));
const LaunchSignoffPage = lazy(() => import("../pages/workforce/system/LaunchSignoffPage"));
const BaselineDriftPage = lazy(() => import("../pages/workforce/system/BaselineDriftPage"));
const OperationalHistoryPage = lazy(() => import("../pages/workforce/system/OperationalHistoryPage"));
const HistoryRetentionPage = lazy(() => import("../pages/workforce/operations/HistoryRetentionPage"));
const OperationsCalendarPage = lazy(() => import("../pages/workforce/system/OperationsCalendarPage"));
const OperationsControlSettingsPage = lazy(() => import("../pages/workforce/system/OperationsControlSettingsPage"));

const routeComponents: Record<WorkforceRouteComponentKey, LazyExoticComponent<ComponentType>> = {
  dashboard: WorkforceDashboardPage, analysis: AnalysisPage, recommendations: RecommendationsPage,
  decisionQueue: DecisionQueuePage, decisionReport: DecisionReportPage, reportArchive: ReportArchivePage,
  reportComparison: ReportComparisonPage, monthlyHealth: MonthlyHealthPage, preventiveAlerts: PreventiveAlertsPage,
  readiness: ReadinessPage, launchChecklist: LaunchChecklistPage, launchSignoff: LaunchSignoffPage,
  baselineDrift: BaselineDriftPage, operationalHistory: OperationalHistoryPage, historyRetention: HistoryRetentionPage,
  operationsCalendar: OperationsCalendarPage, operationsControlSettings: OperationsControlSettingsPage,
  dataCenter: DataCenterPage, maintenance: MaintenancePage, simulator: SimulatorPage,
  compatibility: CompatibilityPage, spaces: SpacesPage, employees: EmployeesPage, taskTypes: TaskTypesPage,
  schedule: SchedulePage, rules: RulesPage, analysisSettings: AnalysisSettingsPage,
};

const routeIcons: Record<WorkforceRouteComponentKey, LucideIcon> = {
  dashboard: CalendarDays, analysis: AlertTriangle, recommendations: Sparkles, decisionQueue: CheckCircle2,
  decisionReport: Activity, reportArchive: CalendarDays, reportComparison: Activity, monthlyHealth: Activity,
  preventiveAlerts: AlertTriangle, readiness: ShieldCheck, launchChecklist: ClipboardCheck,
  launchSignoff: FileCheck2, baselineDrift: Activity, operationalHistory: Clock3, historyRetention: ShieldCheck,
  operationsCalendar: CalendarDays, operationsControlSettings: ShieldCheck, dataCenter: ShieldCheck,
  maintenance: ShieldCheck, simulator: Sparkles, compatibility: ShieldCheck, spaces: Building2,
  employees: Users, taskTypes: Clock3, schedule: CalendarDays, rules: ShieldCheck, analysisSettings: Sparkles,
};

export const workforceRoutes: WorkforceRouteDefinition[] = workforceRouteManifest.map(({ componentKey, ...route }) => ({ ...route, component: routeComponents[componentKey], icon: routeIcons[componentKey] }));

export const workforceNavigationRoutes = workforceRoutes.filter((route) => route.showInNavigation);

export { normalizeWorkforcePath };

export function findWorkforceRoute(path: string) {
  const manifestRoute = findWorkforceRouteManifestItem(path);
  return workforceRoutes.find((route) => route.path === manifestRoute.path) ?? workforceRoutes[0];
}
