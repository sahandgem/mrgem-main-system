# Master Gem Persian UI Encoding Repair — Batch 1

## 1. Purpose

این سند نتیجه `CORE-RESUME-ENCODING-P01A` را ثبت می‌کند. هدف فقط بازیابی reversible و پر اطمینان متن‌های فارسی UI در سه فایل منتخب Workforce بود؛ هیچ منطق، ساختار JSX، route، storage، style، prototype یا subproject تغییر نکرد.

## 2. Baseline

| مورد | نتیجه |
|---|---|
| Branch | `integration/master-gem-core-v1-candidate` |
| Starting commit | `0e7006d7632c28cc485b118d3fb4c2f59564da48` |
| Stable main | `b16b1a0`؛ بدون تغییر |
| Preflight | clean |
| Baseline test | `npm.cmd test` — PASS |
| Baseline build | `npm.cmd run build` — PASS |
| Warning | هشدار قدیمی Node درباره `--experimental-loader` |

## 3. Complete Ten-File Inventory

ممیزی اولیه ۱٬۴۲۶ literal کاملاً reversible و ۱۲ node ترکیبی healthy/mojibake را شناسایی کرد؛ مجموع issueهای تاییدشده ۱٬۴۳۸ است.

| فایل | issue تاییدشده اولیه | Batch پیشنهادی |
|---|---:|---|
| `src/WorkforcePages.tsx` | ۱٬۱۳۸ شامل ۱۰ node ترکیبی | Batch 1 |
| `src/pages/workforce/system/DataCenterPage.tsx` | ۸۶ | Batch 1 |
| `src/pages/workforce/operations/OperationalHistoryPage.tsx` | ۷۵ شامل ۲ node ترکیبی | Batch 1 |
| `src/pages/workforce/operations/HistoryRetentionPage.tsx` | ۵۲ | Batch 2 |
| `src/pages/workforce/system/MaintenancePage.tsx` | ۴۱ | Batch 2 |
| `src/pages/workforce/workforcePageUtils.ts` | ۲۴ | Batch 2 |
| `src/services/compatibilityService.ts` | ۷ | Batch 3 |
| `src/analysis/preventiveAlertAnalyzer.ts` | ۵ | Batch 3 |
| `src/analysis/workforceAnalyzer.ts` | ۵ | Batch 3 |
| `src/analysis/workforceRecommendationEngine.ts` | ۵ | Batch 3 |

## 4. Batch 1 Whitelist

فقط فایل‌های زیر مجاز و اصلاح شدند:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/operations/OperationalHistoryPage.tsx`

تعداد issue اولیه Batch 1 برابر ۱٬۲۹۹ بود. هیچ فایل source دیگری وارد Batch 1 نشد.

## 5. Conversion Proof

روش تبدیل:

1. متن mojibake به‌صورت byteهای Windows-1256 بازسازی شد.
2. byteها به UTF-8 decode شدند.
3. round-trip معکوس برای اثبات reversible بودن اجرا شد.
4. فقط string، template text و JSX text پر اطمینان تغییر کردند.
5. موردهای machine-readable در comparison و `includes` عمداً دست‌نخورده ماندند.

نمونه‌های اثبات:

| قبل | بعد | فایل |
|---|---|---|
| `ط§ظ†ط®ط§ط¨ ع©ظ†غŒط¯` | `انتخاب کنید` | `WorkforcePages.tsx` |
| `ظˆط¶ط¹غŒطھ ظ‡ظپطھظ‡` | `وضعیت هفته` | `WorkforcePages.tsx` |
| `ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡` | `نیازمند توجه` | `WorkforcePages.tsx` |
| `ظ…ظ†ط§ط³ط¨ ط¨ط±ط§غŒ دیجیتال` | `مناسب برای دیجیتال` | `WorkforcePages.tsx` |
| `ط®ط±ظˆط¬غŒ ظ¾ط´طھغŒط¨ط§ظ† ط¯ط³طھغŒ` | `خروجی پشتیبان دستی` | `DataCenterPage.tsx` |
| `Snapshot ط¯ط³طھغŒ` | `Snapshot دستی` | `DataCenterPage.tsx` |
| `ع†ظ‡ ط²ظ…ط§ظ†غŒ drift زیاد ط´ط¯طں` | `چه زمانی drift زیاد شد؟` | `OperationalHistoryPage.tsx` |
| `ط¹ط§ظ…ظ„: ` | `عامل: ` | `OperationalHistoryPage.tsx` |
| `â†گ` | `←` | `WorkforcePages.tsx` و `OperationalHistoryPage.tsx` |

`WorkforcePages.tsx` شامل candidateهای double-pass بود. تبدیل دو مرحله‌ای فقط برای موارد نمایشی reversible اثبات شد؛ double-passهای machine-readable تغییر نکردند.

## 6. Changed Files

Source:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/operations/OperationalHistoryPage.tsx`

Project control:

- `docs/project-control/158_MASTER_GEM_PERSIAN_UI_ENCODING_REPAIR_BATCH_1.md`
- `docs/project-control/01_CURRENT_STATE.md`

هیچ test file، CSS، route registry، storage key، prototype، package یا subproject تغییر نکرد.

## 7. Rescan

| فایل Batch 1 | issue اولیه | repaired | unresolved |
|---|---:|---:|---:|
| `WorkforcePages.tsx` | ۱٬۱۳۸ | ۱٬۱۳۲ | ۶ |
| `DataCenterPage.tsx` | ۸۶ | ۸۶ | ۰ |
| `OperationalHistoryPage.tsx` | ۷۵ | ۷۰ | ۵ |
| **جمع** | **۱٬۲۹۹** | **۱٬۲۸۸** | **۱۱** |

۱۱ مورد unresolved ثابت‌های machine-readable در comparison یا جست‌وجوی متنی‌اند. تغییر مستقل آن‌ها بدون بررسی producer/consumer می‌تواند رفتار سیستم را عوض کند، بنابراین مطابق stop rule فقط به‌عنوان risk ثبت شدند.

با احتساب ۱۳۹ مورد برنامه‌ریزی‌شده در هفت فایل خارج Batch 1، مجموع issue باقی‌مانده ۱۵۰ است.

## 8. Test And Build

- Full test: `npm.cmd test` — PASS
- Build: `npm.cmd run build` — PASS
- TypeScript/Vite: PASS؛ ۱٬۷۵۱ module transformed
- Serious build warning: ندارد
- Existing warning: هشدار Node درباره `--experimental-loader`

این دو فرمان پس از آخرین اصلاح نمایشی نیز دوباره و با موفقیت اجرا شدند.

## 9. Preview

Preview محلی روی build نهایی برای مسیرهای زیر بررسی شد:

- `/organization/workforce-dashboard`
- `/organization/workforce-dashboard/operational-history`
- `/organization/workforce-dashboard/employees`
- `/organization/workforce-dashboard/data-center`
- `/organization/workforce-dashboard/analysis`

عنوان‌های اصلی و متن‌های اصلاح‌شده Batch 1 سالم و RTL بودند. مسیرهای employees و analysis در snapshot نهایی marker مشکوک نداشتند. mojibake قابل مشاهده در dashboard، operational-history و data-center هنوز وجود دارد، اما از helperها و labelهای خارج whitelist مانند `workforcePageUtils.ts` می‌آید و برای Batch 2 باقی مانده است.

## 10. Scope Verification

- AST structure fingerprint برای هر سه فایل source: `MATCH`
- Logic changed: NO
- JSX structure changed: NO
- CSS changed: NO
- Route changed: NO
- localStorage/sessionStorage changed: NO
- Prototype changed: NO
- Subproject changed: NO
- P56 started: NO
- Main changed or merged: NO
- Push performed: NO

## 11. Batch Verdict

`BATCH_1_PARTIAL`

متن‌های نمایشی پر اطمینان Batch 1 بازیابی شدند، اما ۱۱ ثابت machine-readable عمداً unresolved مانده‌اند و متن‌های خراب خارج whitelist هنوز در برخی routeها دیده می‌شوند.

## 12. Overall Encoding Gate

`ENCODING_GATE_PARTIALLY_RECOVERED`

Main merge readiness همچنان `NOT_READY_ENCODING_BLOCKER` است.

## 13. Recommended Next Phase

`CORE-RESUME-ENCODING-P01B`:

- repair کنترل‌شده `HistoryRetentionPage.tsx`
- repair کنترل‌شده `MaintenancePage.tsx`
- repair کنترل‌شده `workforcePageUtils.ts`
- بررسی جداگانه قرارداد producer/consumer برای ثابت‌های machine-readable پیش از هر تغییر

## 14. Final Lock

این commit فقط Batch 1 را ثبت می‌کند. هیچ مجوزی برای P56، merge به main، push، تغییر storage، route، analyzer logic یا توسعه feature ایجاد نمی‌کند.
