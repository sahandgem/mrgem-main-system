# Master Gem Core V1 Integration Candidate Report

## 1. Candidate Identity

| مورد | مقدار |
|---|---|
| Phase | `CORE-INTEGRATE-P01` |
| Candidate branch | `integration/master-gem-core-v1-candidate` |
| Exact base | `aa153672ab6e29345082a5aedbe1c954435563b9` |
| Stable main | `b16b1a0`؛ بدون تغییر |
| P55A source commit | `a1416bf` |
| P55A candidate commit | `487d74a8875b04bcd9fa786110546d162c789a98` |
| Candidate status | `CREATED_BUT_FAILED_TEST_GATE` |

این candidate از exact base مرحله CORE-P11 ساخته شد. هیچ merge به `main`، push، rebase یا ادغام subproject انجام نشد.

## 2. Included History

- تاریخچه مستندات Project Core تا CORE-P11 در base موجود است.
- تاریخچه Workforce موردنیاز candidate تا P55 در ancestry موجود است.
- تغییر P55A با cherry-pick مستقل و بدون conflict وارد candidate شد.
- فاصله candidate با `main` پس از ورود P55A برابر ۳۱ commit بود و `main` هیچ commit اضافه‌ای نسبت به candidate نداشت.

## 3. Source Delta

مقایسه `main..candidate` در محدوده `src` و `tests` فقط این چهار مسیر را نشان داد:

- `src/WorkforcePages.tsx`
- انتقال کامل `src/pages/workforce/system/OperationalHistoryPage.tsx` به `src/pages/workforce/operations/OperationalHistoryPage.tsx`
- `src/routes/workforceRoutes.tsx`
- `tests/analysis.test.ts`

آمار delta: ۴ فایل، ۲۲ insertion و ۳ deletion. هیچ source delta نامرتبط مشاهده نشد.

## 4. P55A Integration Result

- cherry-pick commit `a1416bf` بدون conflict انجام شد.
- commit متناظر روی candidate برابر `487d74a` است.
- patch-id مبدا و candidate هر دو `580aaee3fe88a9beeab104b59932b3577d21a05a` هستند.
- تغییر P55A فقط assertionهای verification در `tests/analysis.test.ts` را اضافه می‌کند.
- `OperationalHistoryPage` مستقل است، از `WorkforceRouteAdapter` یا `WorkforcePages` re-export نمی‌شود و بدنه قدیمی آن در `WorkforcePages.tsx` باقی نمانده است.

## 5. Route Verification

- مسیر `/organization/workforce-dashboard/operational-history` موجود است.
- lazy import به `pages/workforce/operations/OperationalHistoryPage` اشاره می‌کند.
- ۲۸ route و ۲۸ path یکتا ثبت شد؛ duplicate route برابر صفر است.
- تمام ۲۷ lazy import فایل مقصد معتبر دارند؛ یک route alias از component مشترک استفاده می‌کند.
- هیچ route جدید یا تغییر ناخواسته route در این مرحله ایجاد نشد.

## 6. Prototype Isolation

- `prototypes/cockpit-overview/` و `prototypes/cockpit-manager-review-queue/` در runtime اصلی wire نشده‌اند.
- هیچ import یا dependency اجرایی از `src` یا package به prototypeها مشاهده نشد.
- عبارت‌های مربوط به API/storage در prototypeها فقط در متن README و checklistهای ایمنی دیده شدند، نه در کد اجرایی.
- prototypeها mock-only و isolated باقی مانده‌اند.

## 7. Subproject Isolation

- هیچ اتصال اجرایی از `src` یا package به `audit-app`، `mahak-web-version`، Production Center یا n8n مشاهده نشد.
- قراردادهای Product/Mahak و Finance/Audit فقط در اسناد کنترل پروژه باقی مانده‌اند.
- هیچ merge، connector اجرایی، database، auth یا migration اضافه نشد.

## 8. Storage Registry

| کنترل | نتیجه |
|---|---|
| Registry entries | ۲۴ |
| Unique keys | ۲۴ |
| Duplicate keys | ۰ |
| Included in backup | ۲۳ |
| Excluded from backup | فقط `komak.workforce.snapshots.v1` |
| Storage literals used by runtime | ۲۴ |
| Runtime keys outside registry | ۰ |
| Unused registry literals | ۰ |

Backup service از آرایه‌های registry استفاده می‌کند و localStorage key جدیدی در candidate ساخته نشده است.

## 9. Encoding Audit

Encoding debt در چند فایل قدیمی همچنان فعال است. بیشترین نشانه‌های mojibake در این مسیرها دیده شد:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/operations/OperationalHistoryPage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`
- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`

کاراکتر replacement استاندارد `�` مشاهده نشد، اما رشته‌های فارسی خراب در preview قابل مشاهده بودند. این بدهی build را متوقف نمی‌کند، ولی برای خوانایی UI و merge به `main` یک blocker است. هیچ encoding repair در CORE-INTEGRATE-P01 انجام نشد.

## 10. Test Result

فرمان `npm.cmd test` ناموفق بود.

- نتیجه: `FAILED`
- assertion: `tests/analysis.test.ts:333`
- actual: `overdue`
- expected: `snoozed`
- محدوده: تست بازسازی Operations Calendar پس از snooze

علت مشاهده‌شده زمان‌وابستگی تست است: تست `snoozedUntil` را روی `2026-07-15T12:00:00.000Z` ثابت کرده، ولی `operationsCalendarService.snooze` اعتبار آن را با ساعت واقعی سیستم می‌سنجد. در تاریخ ممیزی `2026-07-29` این زمان گذشته است و هنگام rebuild وضعیت به `overdue` برمی‌گردد. این مرحله هیچ source یا test fix انجام نداد.

هشدار غیرمسدودکننده Node درباره `--experimental-loader` نیز نمایش داده شد.

## 11. Build Result

فرمان `npm.cmd run build` موفق بود.

- نتیجه: `PASS`
- Vite: ۱۷۵۱ module
- build time گزارش‌شده توسط Vite: حدود ۲۱.۱۵ ثانیه
- warning جدی: ندارد
- تغییر tracked ناشی از build: ندارد

موفقیت build جایگزین test gate ناموفق نیست.

## 12. Preview Result

preview محلی با پاسخ HTTP 200 بررسی و سپس متوقف شد. مسیرهای زیر باز شدند:

- `/organization/workforce-dashboard`
- `/organization/workforce-dashboard/operational-history`
- `/organization/workforce-dashboard/employees`

در هر سه مسیر app shell و محتوای اصلی load شد، RTL فعال بود و console error یا error boundary مشاهده نشد. با این حال عنوان‌های فارسی در هر سه مسیر mojibake داشتند. preview server پس از بررسی متوقف شد.

## 13. Candidate Verdict

`FAILED_TEST_GATE`

Candidate ساخته شده و history/source boundary آن معتبر است، اما برای merge به `main` آماده نیست. دو blocker فعال‌اند:

1. شکست تست زمان‌وابسته Operations Calendar snooze.
2. encoding debt قابل مشاهده در UI.

## 14. Frozen Work

تا approval مستقل بعدی این موارد frozen هستند:

- merge یا تغییر `main`
- P56 و extraction جدید
- encoding repair
- feature جدید
- تغییر route، storage registry، database، auth، API یا backend
- ادغام Product/Mahak، Finance/Audit، Production، Mobile یا Automation
- تغییر prototypeهای frozen

## 15. Exact Recommended Next Phase

`CORE-STABILIZE-P01 — Operations Calendar Snooze Status Test Gate`

دامنه این فاز باید فقط بازتولید deterministic شکست، تعیین قرارداد صحیح زمان برای `snooze` و `rebuild`، و ارائه patch محدود همراه با test/build باشد. هر تغییر source یا test باید در دستور مستقل Project Core صریحاً مجاز شود. Encoding repair باید فاز جداگانه و پس از سبز شدن test gate باشد.

## 16. Final Lock Statement

CORE-INTEGRATE-P01 فقط integration candidate را روی branch ایزوله ساخت و ممیزی کرد. `main` روی `b16b1a0` بدون تغییر مانده، push و merge انجام نشده، و candidate تا رفع test gate و encoding blocker مجوز ورود به `main` ندارد.
