# Master Gem Operations Calendar Snooze Test Stabilization

## 1. Purpose

این سند نتیجه `CORE-STABILIZE-P01` را ثبت می‌کند: رفع Test Gate مربوط به snooze در integration candidate، با کوچک‌ترین تغییر ممکن و بدون تغییر رفتار production، route، UI، storage، encoding یا `main`.

## 2. Failure Reproduction

| مورد | مقدار |
|---|---|
| Branch | `integration/master-gem-core-v1-candidate` |
| Starting commit | `79d6682b9cf15994aa534ab49df3aa71fc76a547` |
| Command | `npm.cmd test` |
| Result before stabilization | `FAILED` |
| Failing location | `tests/analysis.test.ts:333` |
| Expected | `snoozed` |
| Actual | `overdue` |
| System date at reproduction | `2026-07-30` |
| Fixture clock | `2026-06-27T12:00:00.000Z` |
| Fixture snoozedUntil | `2026-07-15T12:00:00.000Z` |

Test runner یک فایل assertion-based را اجرا می‌کند و شمارش granular تست‌ها یا عنوان مستقل ارائه نمی‌دهد. اجرا روی نخستین assertion ناموفق متوقف شد؛ failure دیگری پیش از آن مشاهده نشد.

## 3. Root Cause

Classification: `MISSING_FIXED_CLOCK`

Fixture یک `systemState.now` ثابت داشت، اما `operationsCalendarService.snooze` برای اعتبارسنجی تاریخ آینده از ساعت واقعی `new Date()` استفاده می‌کرد. تاریخ `2026-07-15` در زمان نگارش تست آینده بود، ولی هنگام بازتولید در `2026-07-30` گذشته محسوب شد؛ بنابراین درخواست snooze پذیرفته نشد و rebuild وضعیت مبتنی بر due date را به `overdue` برگرداند.

منطق production با قرارداد موجود سازگار بود. مشکل از مخلوط‌شدن ساعت fixture و ساعت واقعی در تست بود، نه از محاسبه status در runtime.

## 4. Contract Decision

- درخواست snooze فقط وقتی معتبر است که `snoozedUntil` نسبت به ساعت عملیات در آینده باشد.
- تا وقتی ساعت عملیات از `snoozedUntil` عبور نکرده، status برابر `snoozed` باقی می‌ماند.
- پس از انقضای snooze، status دوباره از due date محاسبه می‌شود و می‌تواند `overdue`، `due_today` یا `upcoming` باشد.
- وضعیت‌های terminal یا explicit مانند `completed` و `dismissed` طبق merge contract خودشان بررسی می‌شوند.
- snooze فعال بر status زمان‌بندی‌شده اولویت دارد؛ snooze منقضی‌شده این اولویت را ندارد.

Expected تست از `snoozed` به `overdue` تغییر نکرد، زیرا در clock ثابت fixture تاریخ snooze هنوز معتبر و فعال است.

## 5. Changed Files

| فایل | دلیل | اثر رفتاری |
|---|---|---|
| `tests/analysis.test.ts` | ثابت‌کردن Date برای block مربوط به Operations Calendar و cleanup در `finally` | فقط deterministic شدن تست؛ بدون تغییر production |
| `docs/project-control/157_MASTER_GEM_OPERATIONS_CALENDAR_SNOOZE_TEST_STABILIZATION.md` | ثبت تشخیص، قرارداد و verification | مستنداتی |
| `docs/project-control/01_CURRENT_STATE.md` | به‌روزرسانی Canonical Current Snapshot | مستنداتی |

هیچ source file تغییر نکرد.

## 6. Determinism Safeguard

تست از `mock.timers` استاندارد Node استفاده می‌کند و Date را روی همان timestamp صریح fixture ثابت می‌گذارد. timer در block `finally` reset می‌شود؛ بنابراین assertion ناموفق نیز clock جعلی را به تست‌های بعدی نشت نمی‌دهد.

این راهکار به تاریخ واقعی امروز، انتخاب یک سال دور یا تغییر expected وابسته نیست.

## 7. Verification

| کنترل | فرمان | نتیجه |
|---|---|---|
| Focused test file | `node --loader ./scripts/ts-extension-loader.mjs tests/analysis.test.ts` | `PASS` |
| Full project test | `npm.cmd test` | `PASS` |
| Production build | `npm.cmd run build` | `PASS` |
| Modules transformed | Vite output | ۱۷۵۱ |
| Vite build time | Vite output | حدود ۱۹.۱۰ ثانیه |
| Unexpected tracked build changes | `git status --short` | ندارد |

هشدار قدیمی و غیرمسدودکننده Node درباره `--experimental-loader` در test باقی است. runner شمارش granular assertionها را گزارش نمی‌کند.

## 8. Candidate Status

`TEST_GATE_RECOVERED`

Test Gate candidate بازیابی شد. این نتیجه مجوز merge به `main` نیست.

## 9. Remaining Main Blocker

Encoding/mojibake همچنان `blocking_main_merge` است و در این فاز اصلاح نشد.

## 10. Recommended Next Phase

`CORE-RESUME-ENCODING-P01 — Persian UI Encoding Audit and Repair`

این فاز باید با دستور مستقل، scope محدود، rollback روشن و test/build gate اجرا شود.

## 11. Final Lock

- `main` روی `b16b1a0` بدون تغییر است.
- push یا merge انجام نشد.
- P56 frozen باقی ماند.
- encoding دست‌نخورده باقی ماند.
- prototypeها و subprojectها isolated باقی ماندند.
- هیچ route، UI، package، model، service، analyzer، storage، database، auth، API یا backend تغییر نکرد.
