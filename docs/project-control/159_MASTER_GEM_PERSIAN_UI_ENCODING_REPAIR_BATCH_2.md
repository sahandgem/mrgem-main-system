# Master Gem Persian UI Encoding Repair — Batch 2

## 1. Purpose

این سند نتیجه `CORE-RESUME-ENCODING-P01B` را ثبت می‌کند: دومین Batch کنترل‌شده بازیابی متن فارسی UI در Workforce، بدون تغییر logic، ساختار JSX، CSS، route، storage، package، prototype یا subproject.

## 2. Baseline

| مورد | نتیجه |
|---|---|
| Branch | `integration/master-gem-core-v1-candidate` |
| Starting commit | `19ac9e46d5303b55271e93f79da7dccd590b3658` |
| Rollback reference | `19ac9e4` |
| Stable main | `b16b1a0`؛ بدون تغییر |
| Preflight | clean |
| Baseline test | `npm.cmd test` — PASS |
| Baseline build | `npm.cmd run build` — PASS |
| Batch 1 | ۱٬۲۸۸ repair؛ verdict برابر `BATCH_1_PARTIAL` |

## 3. Remaining Inventory Before Batch 2

AST rescan علاوه بر literalهای عادی، `TemplateHead` و `TemplateTail` را نیز بررسی کرد. این rescan یک fragment نمایشی در `DataCenterPage.tsx` پیدا کرد که در سند ۱۵۸ ثبت نشده بود؛ بنابراین موجودی واقعی قبل از Batch 2 برابر ۱۵۱ مورد است، نه ۱۵۰.

| File | Remaining count | Corruption depth | Runtime role | Directly user-visible? | Active route/component | Machine-readable findings | Proposed batch | Reason |
|---|---:|---|---|---|---|---:|---|---|
| `src/WorkforcePages.tsx` | ۶ | mixed/double_pass | صفحه‌های اصلی Workforce | NO؛ ثابت رفتاری | active | ۶ | machine_readable_do_not_touch | `includes` و matching contract |
| `src/pages/workforce/system/DataCenterPage.tsx` | ۱ | single_pass template fragment | Data Center page | YES | data-center | ۰ | batch_3 | مورد جاافتاده Batch 1؛ در P01B ممنوع از تغییر |
| `src/pages/workforce/operations/OperationalHistoryPage.tsx` | ۵ | single_pass | Operational History page | NO؛ comparison | operational-history | ۵ | machine_readable_do_not_touch | وابسته به خروجی trend helper |
| `src/pages/workforce/operations/HistoryRetentionPage.tsx` | ۵۲ | single_pass | History Retention page | YES | history-retention | ۰ | batch_2 | متن مستقیم UI و پیام‌ها |
| `src/pages/workforce/system/MaintenancePage.tsx` | ۴۱ | single_pass | Maintenance page | YES | maintenance | ۰ | batch_2 | متن مستقیم UI و پیام‌ها |
| `src/pages/workforce/workforcePageUtils.ts` | ۲۴ | single_pass/mixed contract | UI label helper | YES | dashboard، data-center، operational-history و صفحات مرتبط | ۴ | batch_2 | ۲۰ label نمایشی safe؛ چهار trend label machine-coupled |
| `src/services/compatibilityService.ts` | ۷ | single_pass | compatibility matching | NO | service | ۷ | machine_readable_do_not_touch | ورودی matching |
| `src/analysis/preventiveAlertAnalyzer.ts` | ۵ | single_pass | analyzer matching | NO | analyzer | ۵ | machine_readable_do_not_touch | tokenهای تشخیص |
| `src/analysis/workforceAnalyzer.ts` | ۵ | single_pass | analyzer matching | NO | analyzer | ۵ | machine_readable_do_not_touch | شرط‌های تحلیل |
| `src/analysis/workforceRecommendationEngine.ts` | ۵ | mixed/double_pass | recommendation matching | NO | analyzer | ۵ | machine_readable_do_not_touch | شرط‌های پیشنهاد |

## 4. Batch 2 Whitelist

| File | Initial issues | User-visible routes | Selection reason | Conversion |
|---|---:|---|---|---|
| `src/pages/workforce/operations/HistoryRetentionPage.tsx` | ۵۲ | history-retention | متن صفحه و پیام‌های مستقیم | single-pass |
| `src/pages/workforce/system/MaintenancePage.tsx` | ۴۱ | maintenance | متن صفحه، confirm و پیام‌های مستقیم | single-pass |
| `src/pages/workforce/workforcePageUtils.ts` | ۲۴ | dashboard، data-center، operational-history و صفحات مرتبط | helper مرکزی labelهای قابل مشاهده | single-pass؛ ۴ مورد machine-readable untouched |

تعداد source file برابر سه است. هیچ فایل Batch 1 تغییر نکرد.

## 5. Conversion Proof

برای هر مورد، byteهای Windows-1256 بازسازی، به UTF-8 decode و با round-trip معکوس تایید شدند. confidence همه repairها `high` است.

### HistoryRetentionPage

| Broken | Recovered | Pass | Context |
|---|---|---:|---|
| `ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ ط°ط®غŒط±ظ‡ ط´ط¯.` | `سیاست نگهداری ذخیره شد.` | ۱ | پیام |
| `ط³غŒط§ط³طھ ظ¾غŒط´â€Œظپط±ط¶ ط¨ط§ط²ع¯ط±ط¯ط§ظ†ط¯ظ‡ ط´ط¯.` | `سیاست پیش‌فرض بازگردانده شد.` | ۱ | پیام |
| `ظ†ع¯ظ‡ط¯ط§ط±غŒ ط±ظˆغŒط¯ط§ط¯ظ‡ط§غŒ ط§ط®غŒط±` | `نگهداری رویدادهای اخیر` | ۱ | label |
| `ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ طھط§ط±غŒط®ع†ظ‡` | `سیاست نگهداری تاریخچه` | ۱ | heading |
| `event ط¯ط± archive ط°ط®غŒط±ظ‡ ط´ط¯.` | `event در archive ذخیره شد.` | ۱ | template message |

### MaintenancePage

| Broken | Recovered | Pass | Context |
|---|---|---:|---|
| `Fix ط§ظ†ط¬ط§ظ… ط´ط¯...` | `Fix انجام شد و قبل از آن snapshot ساخته شد.` | ۱ | پیام |
| `ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ ط³غŒط³طھظ…` | `کنسول نگهداری سیستم` | ۱ | heading |
| `ط³ظ„ط§ظ…طھ ط³غŒط³طھظ…` | `سلامت سیستم` | ۱ | KPI |
| `ع©ظ„غŒط¯ظ‡ط§غŒ localStorage` | `کلیدهای localStorage` | ۱ | heading |
| `ط§غŒظ† fix ط§ط¬ط±ط§ ط´ظˆط¯طں` | `این fix اجرا شود؟` | ۱ | confirm template |

### workforcePageUtils

| Broken | Recovered | Pass | Context |
|---|---|---:|---|
| `ط³ط§ظ„ظ…` | `سالم` | ۱ | health label |
| `ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡` | `نیازمند توجه` | ۱ | health label |
| `ظ¾ط±ط±غŒط³ع©` | `پرریسک` | ۱ | risk label |
| `ط¨ط¯ظˆظ† طھط؛غŒغŒط±` | `بدون تغییر` | ۱ | drift label |
| `ع¯ط²ط§ط±ط´ Drift` | `گزارش Drift` | ۱ | event type label |

چهار خروجی `historyTrendLabel` تغییر نکردند، زیرا comparisonهای `OperationalHistoryPage.tsx` هنوز به همان ثابت‌های خراب وابسته‌اند. اصلاح یک‌طرفه رفتار tone/decision را تغییر می‌داد.

## 6. Changed Files

Source:

- `src/pages/workforce/operations/HistoryRetentionPage.tsx`: ۵۲ repair، unresolved صفر
- `src/pages/workforce/system/MaintenancePage.tsx`: ۴۱ repair، unresolved صفر
- `src/pages/workforce/workforcePageUtils.ts`: ۲۰ repair، چهار machine-readable untouched

Project control:

- `docs/project-control/159_MASTER_GEM_PERSIAN_UI_ENCODING_REPAIR_BATCH_2.md`
- `docs/project-control/01_CURRENT_STATE.md`

مجموع Batch 2: ۱۱۷ issue، ۱۱۳ repaired، چهار unresolved.

Structural fingerprint هر سه source file برابر `MATCH` است. Logic changed: NO.

## 7. Global Rescan

| معیار | نتیجه |
|---|---:|
| Initial confirmed inventory | ۱٬۴۳۸ |
| Batch 1 repaired | ۱٬۲۸۸ |
| Inventory correction discovered in P01B | ۱ TemplateHead |
| Batch 2 repaired | ۱۱۳ |
| Total remaining source issues | ۳۸ |
| Visible source issues remaining | ۵ |
| Machine-readable issues remaining | ۳۷ |
| False positives | ۱؛ واژه سالم `بکاپ` در `WorkforcePages.tsx` |

چهار trend label هم visible و هم machine-readable هستند؛ به همین دلیل مجموع دو دسته مستقل جمع‌پذیر نیست. پنجمین مورد visible، fragment جاافتاده `Snapshot «` در `DataCenterPage.tsx` است.

فایل‌های باقی‌مانده برای Batch 3 یا audit قراردادی:

- `src/pages/workforce/system/DataCenterPage.tsx`: یک مورد نمایشی
- `src/pages/workforce/workforcePageUtils.ts`: چهار trend label
- `src/pages/workforce/operations/OperationalHistoryPage.tsx`: پنج comparison متناظر
- `src/WorkforcePages.tsx`: شش ثابت matching
- چهار analyzer/service با مجموع ۲۲ ثابت matching

## 8. Test And Build

- Baseline test: `npm.cmd test` — PASS
- Baseline build: `npm.cmd run build` — PASS
- Final test: `npm.cmd test` — PASS
- Final build: `npm.cmd run build` — PASS
- Vite: ۱٬۷۵۱ modules transformed
- Serious warning: ندارد
- Existing warning: هشدار Node درباره `--experimental-loader`

## 9. Preview

مسیرهای بررسی‌شده:

- `/organization/workforce-dashboard`
- `/organization/workforce-dashboard/employees`
- `/organization/workforce-dashboard/analysis`
- `/organization/workforce-dashboard/history-retention`
- `/organization/workforce-dashboard/maintenance`
- `/organization/workforce-dashboard/operational-history`

dashboard، employees، analysis، history-retention و maintenance بدون marker قابل مشاهده mojibake load شدند. RTL، layout و headingها سالم بودند. operational-history همچنان label خراب `پایدار` را به شکل mojibake نشان می‌دهد؛ این همان مورد machine-coupled و عمداً unresolved است. regression از Batch 1 مشاهده نشد.

## 10. Scope Verification

- Source files changed: ۳
- Batch 1 files changed: NO
- Test files changed: NO
- Logic changed: NO
- JSX structure changed: NO
- CSS changed: NO
- Route changed: NO
- Storage changed: NO
- Package/lock changed: NO
- Prototype changed: NO
- Subproject changed: NO
- P56 started: NO
- Main changed: NO
- Push performed: NO

## 11. Batch Verdict

`BATCH_2_PARTIAL`

هر ۱۱۳ مورد نمایشی safe در whitelist بازیابی شد، ولی چهار label visible به‌دلیل coupling رفتاری و یک fragment جاافتاده در فایل Batch 1 باقی مانده است.

## 12. Overall Encoding Verdict

`ENCODING_GATE_PARTIALLY_RECOVERED`

visible mojibake هنوز در active runtime وجود دارد؛ بنابراین gate نمایشی بسته نشده است.

## 13. Main Merge Readiness

`NOT_READY_ENCODING_BLOCKER`

این verdict مجوز merge نیست.

## 14. Recommended Next Phase

`CORE-RESUME-ENCODING-P01C — Workforce UI Encoding Repair Batch 3`

P01C باید مجوز صریح برای:

- اصلاح fragment جاافتاده DataCenter
- اصلاح هماهنگ producer/consumer مربوط به trend label بدون تغییر رفتار
- audit ثابت‌های machine-readable باقی‌مانده

داشته باشد.

## 15. Final Lock

- main unchanged
- no merge
- no push
- P56 frozen
- subprojects isolated
- هیچ تغییر بعدی بدون دستور مستقل Project Core مجاز نیست
