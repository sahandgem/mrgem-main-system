export type WorkforceRouteGroup = "core" | "analysis" | "operations" | "system";
export type WorkforceRouteComponentKey =
  | "dashboard" | "analysis" | "recommendations" | "decisionQueue" | "decisionReport"
  | "reportArchive" | "reportComparison" | "monthlyHealth" | "preventiveAlerts"
  | "readiness" | "launchChecklist" | "launchSignoff" | "baselineDrift"
  | "operationalHistory" | "historyRetention" | "operationsCalendar"
  | "operationsControlSettings" | "dataCenter" | "maintenance" | "simulator"
  | "compatibility" | "spaces" | "employees" | "taskTypes" | "schedule" | "rules" | "analysisSettings";

export interface WorkforceRouteManifestItem {
  path: string;
  label: string;
  group: WorkforceRouteGroup;
  componentKey: WorkforceRouteComponentKey;
  showInNavigation: boolean;
}

export const workforceRouteManifest: WorkforceRouteManifestItem[] = [
  { path: "/organization/workforce-dashboard", label: "اتاق فرمان", group: "core", componentKey: "dashboard", showInNavigation: true },
  { path: "/organization/workforce-dashboard/analysis", label: "جزئیات تحلیل", group: "analysis", componentKey: "analysis", showInNavigation: true },
  { path: "/organization/workforce-dashboard/recommendations", label: "پیشنهادها", group: "analysis", componentKey: "recommendations", showInNavigation: true },
  { path: "/organization/workforce-dashboard/decision-queue", label: "صف تصمیم", group: "operations", componentKey: "decisionQueue", showInNavigation: true },
  { path: "/organization/workforce-dashboard/decision-report", label: "گزارش تصمیم", group: "operations", componentKey: "decisionReport", showInNavigation: true },
  { path: "/organization/workforce-dashboard/decision-reports", label: "گزارش تصمیم", group: "operations", componentKey: "decisionReport", showInNavigation: false },
  { path: "/organization/workforce-dashboard/report-archive", label: "آرشیو گزارش", group: "operations", componentKey: "reportArchive", showInNavigation: true },
  { path: "/organization/workforce-dashboard/report-comparison", label: "مقایسه گزارش", group: "operations", componentKey: "reportComparison", showInNavigation: false },
  { path: "/organization/workforce-dashboard/monthly-health", label: "سلامت ماهانه", group: "operations", componentKey: "monthlyHealth", showInNavigation: true },
  { path: "/organization/workforce-dashboard/preventive-alerts", label: "هشدار پیشگیرانه", group: "operations", componentKey: "preventiveAlerts", showInNavigation: true },
  { path: "/organization/workforce-dashboard/readiness", label: "آمادگی عملیاتی", group: "system", componentKey: "readiness", showInNavigation: true },
  { path: "/organization/workforce-dashboard/launch-checklist", label: "راه‌اندازی", group: "system", componentKey: "launchChecklist", showInNavigation: true },
  { path: "/organization/workforce-dashboard/launch-signoff", label: "تأیید راه‌اندازی", group: "system", componentKey: "launchSignoff", showInNavigation: true },
  { path: "/organization/workforce-dashboard/baseline-drift", label: "پایش Drift", group: "system", componentKey: "baselineDrift", showInNavigation: true },
  { path: "/organization/workforce-dashboard/operational-history", label: "تاریخچه عملیاتی", group: "system", componentKey: "operationalHistory", showInNavigation: true },
  { path: "/organization/workforce-dashboard/history-retention", label: "نگهداری تاریخچه", group: "system", componentKey: "historyRetention", showInNavigation: true },
  { path: "/organization/workforce-dashboard/operations-calendar", label: "تقویم کنترل‌ها", group: "system", componentKey: "operationsCalendar", showInNavigation: true },
  { path: "/organization/workforce-dashboard/operations-control-settings", label: "تنظیم کنترل‌ها", group: "system", componentKey: "operationsControlSettings", showInNavigation: true },
  { path: "/organization/workforce-dashboard/data-center", label: "جعبه سیاه داده", group: "system", componentKey: "dataCenter", showInNavigation: true },
  { path: "/organization/workforce-dashboard/maintenance", label: "نگهداری سیستم", group: "system", componentKey: "maintenance", showInNavigation: true },
  { path: "/organization/workforce-dashboard/simulator", label: "شبیه‌ساز", group: "analysis", componentKey: "simulator", showInNavigation: true },
  { path: "/organization/workforce-dashboard/compatibility", label: "سازگاری", group: "analysis", componentKey: "compatibility", showInNavigation: true },
  { path: "/organization/workforce-dashboard/spaces", label: "فضاها", group: "core", componentKey: "spaces", showInNavigation: true },
  { path: "/organization/workforce-dashboard/employees", label: "کارمندان", group: "core", componentKey: "employees", showInNavigation: true },
  { path: "/organization/workforce-dashboard/tasks", label: "نوع کارها", group: "core", componentKey: "taskTypes", showInNavigation: true },
  { path: "/organization/workforce-dashboard/schedule", label: "برنامه هفتگی", group: "core", componentKey: "schedule", showInNavigation: true },
  { path: "/organization/workforce-dashboard/rules", label: "قوانین تحلیل", group: "analysis", componentKey: "rules", showInNavigation: true },
  { path: "/organization/workforce-dashboard/settings", label: "تنظیمات تحلیل", group: "analysis", componentKey: "analysisSettings", showInNavigation: true },
];

export function normalizeWorkforcePath(path: string) {
  return path.replace(/\/$/, "") || "/organization/workforce-dashboard";
}

export function findWorkforceRouteManifestItem(path: string) {
  const normalized = normalizeWorkforcePath(path);
  return workforceRouteManifest.find((route) => route.path === normalized) ?? workforceRouteManifest[0];
}
