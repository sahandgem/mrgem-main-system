# Do Not Touch Without Control Approval

آخرین به‌روزرسانی: 2026-06-28

این فایل فهرست چیزهایی است که بدون تأیید مرکز کنترل نباید تغییر کنند.

## فایل‌ها و نواحی حساس

- `src/models/workforce.ts`
- `src/routes/workforceRouteManifest.ts`
- `src/routes/workforceRoutes.tsx`
- `src/registry/workforceStorageKeys.ts`
- `src/services/workforceBackupService.ts`
- `src/services/workforceService.ts`
- `src/analysis/baselineDriftAnalyzer.ts`
- `src/analysis/workforceAnalyzer.ts`
- `src/WorkforcePages.tsx` برای refactorهای بزرگ یا حذف گسترده
- هر فایل مربوط به import/restore/reset/cleanup داده

## routeهایی که نباید بی‌تأیید تغییر کنند

- `/organization/workforce-dashboard`
- `/organization/workforce-dashboard/analysis`
- `/organization/workforce-dashboard/recommendations`
- `/organization/workforce-dashboard/decision-queue`
- `/organization/workforce-dashboard/decision-report`
- `/organization/workforce-dashboard/report-archive`
- `/organization/workforce-dashboard/monthly-health`
- `/organization/workforce-dashboard/preventive-alerts`
- `/organization/workforce-dashboard/readiness`
- `/organization/workforce-dashboard/launch-checklist`
- `/organization/workforce-dashboard/launch-signoff`
- `/organization/workforce-dashboard/baseline-drift`
- `/organization/workforce-dashboard/operational-history`
- `/organization/workforce-dashboard/history-retention`
- `/organization/workforce-dashboard/operations-calendar`
- `/organization/workforce-dashboard/operations-control-settings`
- `/organization/workforce-dashboard/data-center`
- `/organization/workforce-dashboard/maintenance`
- `/organization/workforce-dashboard/simulator`
- `/organization/workforce-dashboard/compatibility`
- `/organization/workforce-dashboard/spaces`
- `/organization/workforce-dashboard/employees`
- `/organization/workforce-dashboard/tasks`
- `/organization/workforce-dashboard/schedule`
- `/organization/workforce-dashboard/rules`
- `/organization/workforce-dashboard/settings`

## localStorage keyها

هر key با پیشوند `komak.workforce.` حساس است و قبل از تغییر باید در registry، backup coverage و phase log بررسی شود.

نمونه‌های حساس:

- `komak.workforce.spaces.v1`
- `komak.workforce.employees.v1`
- `komak.workforce.taskTypes.v1`
- `komak.workforce.scheduleItems.v1`
- `komak.workforce.rules.v1`
- `komak.workforce.analysisSettings.v1`
- `komak.workforce.compatibilityRules.v1`
- `komak.workforce.decisionReports.v1`
- `komak.workforce.snapshots.v1`
- `komak.workforce.launchSignoffs.v1`
- `komak.workforce.operationalResignoffs.v1`
- `komak.workforce.operationalHistory.v1`
- `komak.workforce.historyArchives.v1`
- `komak.workforce.operationsCalendar.v1`

## تصمیم‌هایی که نباید بی‌تأیید تغییر کنند

- local-first بودن پروژه تا قبل از backend مصوب
- عدم migration خودکار baselineهای legacy
- فارسی/RTL/dark mode بودن UI
- عدم hardcode داده واقعی
- عدم ساخت backend/Supabase/login/sync بدون فاز مصوب
- عدم reset یا حذف داده بدون snapshot/هشدار مناسب
