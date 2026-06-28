# تصمیم‌های معماری و محصول

این فایل تصمیم‌های پایدار مشاهده‌شده در کد را ثبت می‌کند. تغییر هر تصمیم باید با دلیل، اثر متقاطع و نتیجه test/build ثبت شود.

| ID | تصمیم | وضعیت | شاهد |
|---|---|---|---|
| D-001 | UI فارسی، RTL و Dark Mode مبنای ثابت محصول است. | فعال | `App.tsx`, `styles.css` |
| D-002 | داده‌های واقعی hardcode نمی‌شوند؛ seed فقط demo است. | فعال | `data/workforceSeed.ts` |
| D-003 | تا پیش از backend، persistence با service داخلی و localStorage انجام می‌شود. | فعال | `services/*` |
| D-004 | مدل‌های دامنه در یک فایل مرکزی TypeScript نگهداری می‌شوند. | فعال | `models/workforce.ts` |
| D-005 | منطق تحلیل تا حد ممکن pure و جدا از UI است. | فعال | `analysis/*` |
| D-006 | عملیات حساس قبل از تغییر باید snapshot یا امکان rollback داشته باشند. | فعال نسبی | `workforceBackupService.ts`, maintenance/import flows |
| D-007 | signoff یک baseline قابل مقایسه می‌سازد و drift نسبت به آن سنجیده می‌شود. | فعال | launch signoff، drift و resignoff services/analyzers |
| D-008 | تاریخچه عملیاتی و retention محلی‌اند و cleanup باید محافظه‌کارانه باشد. | فعال | operational history و history retention |
| D-009 | اعلان P21 فقط in-app است؛ push/email/SMS وجود ندارد. | فعال | `operationalNotificationService.ts` |
| D-010 | خروجی تقویم از ICS ساده با UTC و JSON نسخه‌دار استفاده می‌کند. | فعال | `operationsCalendarExportService.ts` |
| D-011 | route metadata در manifest مرکزی نگهداری می‌شود. | فعال | `routes/workforceRouteManifest.ts` |
| D-012 | routeها با React.lazy بارگذاری می‌شوند و error boundary مشترک دارند. | فعال | `routes/workforceRoutes.tsx`, `App.tsx` |
| D-013 | P22 برای کاهش ریسک، page logic را در یک lazy chunk مشترک نگه داشته است. | بدهی پذیرفته‌شده | `WorkforcePages.tsx`, `docs/workforce-performance.md` |
| D-014 | route و localStorage key بدون migration یا تصمیم صریح تغییر نمی‌کند. | قاعده کنترل پروژه | P24 |
| D-015 | همه localStorage keyها باید در registry رسمی ثبت شوند و backup/import/snapshot از همان registry تغذیه شود. | فعال | `src/registry/workforceStorageKeys.ts`, `workforceBackupService.ts` |
| D-016 | `komak.workforce.snapshots.v1` عمداً داخل backup مستقیم قرار نمی‌گیرد تا snapshot داخل snapshot بازگشتی ساخته نشود؛ rollback با snapshot خودکار قبل از import/restore حفظ می‌شود. | فعال | `workforceStorageKeys.ts`, `workforceBackupService.ts`, `tests/analysis.test.ts` |
| D-017 | backup bundleهای جدید باید coverage metadata داشته باشند تا baselineهای قدیمی از baselineهای بعد از P25 قابل تفکیک باشند. | فعال | `workforceBackupService.ts`, `models/workforce.ts` |
| D-018 | baselineهای legacy خودکار migrate یا overwrite نمی‌شوند؛ drift فقط روی keyهای مشترک مقایسه می‌شود و اختلاف keyهای جدید به warning سازگاری منتقل می‌شود. | فعال | `baselineDriftAnalyzer.ts`, `10_BASELINE_COMPATIBILITY.md` |

## تصمیم‌های باز

- آیا P23 انجام شده ولی artifact آن خارج از repository است؟
- زمان مناسب برای شکستن `WorkforcePages.tsx` به implementationهای واقعی page چه فازی است؟
