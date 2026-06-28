# نقشه ماژول‌ها

## لایه اجرا و route

| ماژول | Route/کاربرد | فایل‌های اصلی | وابستگی مهم |
|---|---|---|---|
| Shell و dispatch | همه routeها | `src/App.tsx` | route registry، Suspense، Error Boundary |
| Route manifest | ۲۸ مسیر | `src/routes/workforceRouteManifest.ts` | metadata pure و تست‌پذیر |
| Lazy registry | همه مسیرها | `src/routes/workforceRoutes.tsx` | React.lazy، lucide icons |
| Page entryها | ۲۷ entry | `src/pages/workforce/**` | re-export از `WorkforcePages.tsx` |
| Page implementation مشترک | همه صفحه‌ها | `src/WorkforcePages.tsx` | hooks، services، analyzers، components |

## Core data management

| ماژول | Routeها | فایل‌های اصلی | وابستگی |
|---|---|---|---|
| Dashboard | `/organization/workforce-dashboard` | WorkforceDashboard entry، `WorkforcePages.tsx` | تقریباً همه analyzer/serviceهای مدیریتی |
| Spaces | `/spaces` | Spaces entry، EntityPanel | workforce store/service |
| Employees | `/employees` | Employees entry، EntityPanel | spaces، workforce store/service |
| Task Types | `/tasks` | TaskTypes entry، EntityPanel | spaces، workforce store/service |
| Weekly Schedule | `/schedule` | Schedule entry، WeeklyGrid | employee/space/task، workforce store |
| Rules | `/rules` | Rules entry | AnalysisRule، workforce store |

## Analysis and decision support

| ماژول | Routeها | فایل‌های اصلی | وابستگی |
|---|---|---|---|
| Analysis | `/analysis` | `workforceAnalyzer.ts`, `timeUtils.ts` | core entities، rules، settings، compatibility |
| Analysis Settings | `/settings` | `analysisSettingsService.ts` | analyzer thresholds |
| Compatibility | `/compatibility` | `compatibilityService.ts` | task types، spaces |
| Simulator | `/simulator` | `workforceSimulator.ts` | analyzer، schedule |
| Recommendations | `/recommendations` | `workforceRecommendationEngine.ts` | analyzer، simulator |
| Decision Queue | `/decision-queue` | `workforceDecisionQueue.ts` | recommendation scenarios، simulator |
| Decision Reports | `/decision-report`, `/decision-reports` | `decisionReportService.ts`, `decisionReportAnalytics.ts` | batch result |
| Archive/Comparison | `/report-archive`, `/report-comparison` | report analytics/service | decision reports |
| Monthly Health | `/monthly-health` | `monthlyHealthAnalyzer.ts`, `monthlyGoalService.ts` | decision reports |
| Preventive Alerts | `/preventive-alerts` | `preventiveAlertAnalyzer.ts`, `preventiveAlertStateService.ts` | reports، monthly health/goals |

## Operational safety and launch

| ماژول | Routeها | فایل‌های اصلی | وابستگی |
|---|---|---|---|
| Data Center | `/data-center` | `workforceBackupService.ts`, `src/registry/workforceStorageKeys.ts` | storage registry، backup coverage، snapshots |
| Maintenance | `/maintenance` | maintenance analyzer/service | storage snapshot، backup |
| Readiness | `/readiness` | `operationalReadinessAnalyzer.ts` | core data، maintenance، reports، alerts، snapshots |
| Launch Checklist | `/launch-checklist` | checklist builder/service | readiness |
| Launch Signoff | `/launch-signoff` | signoff builder/service | readiness، checklist، backup baseline |
| Baseline Drift | `/baseline-drift` | drift analyzer، resignoff service | signed baseline، current backup data |
| Operational History | `/operational-history` | history service/analytics | snapshot، drift، resignoff، maintenance events |
| History Retention | `/history-retention` | retention analyzer/service | history، archives، snapshots، drift |

## Operational controls

| ماژول | Routeها | فایل‌های اصلی | وابستگی |
|---|---|---|---|
| Operations Calendar | `/operations-calendar` | calendar analyzer/service | retention، readiness، drift، maintenance، alerts، checklist |
| Control Settings | `/operations-control-settings` | settings service | policy، export options، notification preferences |
| Calendar Export | دکمه‌های calendar | `operationsCalendarExportService.ts` | controls، policy؛ ICS UTC و JSON |
| Local Notifications | dashboard/calendar | `operationalNotificationService.ts` | controls، notification preference |

## Shared UI

- `EntityPanel.tsx`: CRUD panel و فیلدهای مشترک
- `WeeklyGrid.tsx`: جدول برنامه هفتگی
- `InfoPanel.tsx`, `StatusBadge.tsx`: نمایش خلاصه و وضعیت
- `RouteLoading.tsx`: fallback فارسی route
- `RouteErrorBoundary.tsx`: جلوگیری از سفیدشدن کل برنامه
- `styles.css`: layout، page، print و responsive در یک فایل

## Shared state

- `useWorkforceStore.ts`: دسترسی React به core collections
- `useAnalysisSettings.ts`: state تنظیمات analyzer
- `useCompatibilityRules.ts`: state قوانین سازگاری
- `workforceSeed.ts`: داده demo اولیه
- `models/workforce.ts`: قرارداد تمام لایه‌ها
- `docs/project-control/10_BASELINE_COMPATIBILITY.md`: سیاست legacy baseline، comparable checksum و migration note بعد از P25/P26

## P28 page entry split

در P28 لایه entry صفحه‌های سیستم از re-export مستقیم `WorkforceRoutePage` جدا شد. این فایل‌ها اکنون از `src/pages/workforce/WorkforceRouteAdapter.tsx` استفاده می‌کنند و مسیر خود را صریح به `WorkforceRoutePageByPath` می‌دهند:

- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/system/BaselineDriftPage.tsx`
- `src/pages/workforce/system/LaunchSignoffPage.tsx`
- `src/pages/workforce/system/ReadinessPage.tsx`
- `src/pages/workforce/system/LaunchChecklistPage.tsx`
- `src/pages/workforce/system/OperationsCalendarPage.tsx`
- `src/pages/workforce/system/OperationsControlSettingsPage.tsx`
- `src/pages/workforce/system/OperationalHistoryPage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`

بدنه implementation این صفحه‌ها هنوز برای سازگاری داخل `src/WorkforcePages.tsx` است. component مشترک `BaselineCompatibilityNotice` به `src/components/workforce/BaselineCompatibilityNotice.tsx` منتقل شد.

## WF-P29 proposed real page body extraction

طبق تصمیم مرکز کنترل، WF-P29 هنوز فاز اجرایی تأییدشده نیست و فعلاً فقط پیشنهاد بعدی است.

هدف پیشنهادی WF-P29: استخراج واقعی 2 تا 4 صفحه کم‌ریسک از `src/WorkforcePages.tsx`، بدون تغییر route، localStorage key، مدل داده، analyzer/service یا UI behavior.

کاندیداهای پیشنهادی:

- `MaintenancePage`
- `HistoryRetentionPage`
- `OperationalHistoryPage`
- `DataCenterPage`

تا قبل از اجرای رسمی WF-P29، این بخش نباید به عنوان وضعیت انجام‌شده گزارش شود.