# Product Import Batch Decision Contract

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند قرارداد مفهومی تصمیم‌گیری برای یک batch ورود کالا را تعریف می‌کند. قرارداد، شواهد item-level و Quality Gate را به یک تصمیم batch-level قابل review و audit تبدیل می‌کند؛ هیچ import واقعی، UI، database یا migration در این فاز ساخته نمی‌شود.

## Product Import Batch Decision Contract چیست؟

قراردادی نسخه‌دار برای خلاصه‌کردن منبع، کیفیت، ریسک، confidence، تصمیم‌های review و نیاز به approval یک batch است. این قرارداد مشخص می‌کند batch کامل وارد شود، فقط itemهای معتبر عبور کنند، batch تقسیم یا quarantined شود، اصلاح بخواهد یا صرفاً dry-run باقی بماند.

## اطلاعات الزامی Batch

| فیلد | نقش |
|---|---|
| `batchId` | شناسه یکتای batch |
| `sourceType` | نوع منبع مانند Product Excel یا staging source |
| `sourceName` | نام قابل ردیابی فایل یا منبع |
| `receivedAt` | زمان دریافت batch |
| `parsedItemCount` | تعداد itemهای parse شده |
| `validItemCount` | itemهای معتبر و بدون مانع |
| `warningItemCount` | itemهای دارای هشدار غیرمسدودکننده |
| `reviewItemCount` | itemهای نیازمند تصمیم انسانی |
| `blockedItemCount` | itemهای مسدودشده |
| `duplicateCandidateCount` | duplicate candidateهای شناسایی‌شده |
| `conflictCount` | conflictهای حل‌نشده یا ثبت‌شده |
| `autoFixCandidateCount` | اصلاح‌های پیشنهادی |
| `qualityGateStatus` | نتیجه Product Import Quality Gate |
| `confidenceSummary` | توزیع confidence در batch |
| `riskSummary` | خلاصه riskFlags و blockerها |
| `reviewerDecisionSummary` | جمع‌بندی تصمیم‌های review |
| `managerApprovalStatus` | وضعیت approval مدیر، در صورت نیاز |
| `auditReference` | ارجاع به dry-run، gate، review و تصمیم‌ها |

## تصمیم‌های Batch

| تصمیم | کاربرد |
|---|---|
| `import_all` | همه itemها gate را با شرایط لازم گذرانده‌اند |
| `import_valid_only` | فقط itemهای معتبر و مستقل از blockerها نامزد import هستند |
| `import_after_review` | ورود تا تکمیل reviewهای لازم متوقف می‌ماند |
| `quarantine_batch` | batch به دلیل منبع، قالب یا ریسک مشکوک جدا نگه‌داری می‌شود |
| `reject_batch` | batch ناامن، ناسازگار یا غیرقابل اصلاح است |
| `split_batch` | بخش معتبر از بخش review/blocked با audit مستقل جدا می‌شود |
| `request_correction` | منبع یا importer باید داده را اصلاح و دوباره ارائه کند |
| `dry_run_only` | گزارش ساخته می‌شود اما هیچ نامزد import اجرایی تولید نمی‌شود |

## قواعد انتخاب تصمیم

- `import_all` فقط با Quality Gate برابر `pass` و نبود review، conflict یا duplicate حل‌نشده مجاز است.
- `import_valid_only` باید itemهای excluded و علت exclusion را دقیق ثبت کند.
- `split_batch` باید child batch reference، parent batch reference و مجموع itemهای سازگار داشته باشد.
- `import_after_review` بدون Review Decisionهای تکمیل‌شده به import تبدیل نمی‌شود.
- `quarantine_batch` برای unknown format، source مشکوک یا unsafe mapping است.
- `reject_batch` نیازمند دلیل و audit است و داده خام را حذف نمی‌کند.
- `dry_run_only` هیچ write یا mutation در main ایجاد نمی‌کند.

## مرزهای ایمنی

- batch دارای conflict حل‌نشده نباید import شود.
- batch دارای duplicate حساس نباید auto import شود.
- batch با confidence کلی پایین باید review شود.
- batch حساس باید manager approval داشته باشد.
- AI فقط recommended decision تولید می‌کند و تصمیم نهایی حساس نیست.
- هر تصمیم باید ruleVersion، actor، timestamp، reason و auditReference داشته باشد.

## سازگاری شمارش‌ها

- جمع itemهای valid، warning، review و blocked باید با تعریف وضعیت‌ها و parsedItemCount قابل آشتی باشد.
- duplicate/conflict/auto-fix count می‌توانند بر همان itemها هم‌پوشانی داشته باشند و نباید به عنوان partition مستقل جمع شوند.
- هر اختلاف شمارش باید batch را به `needs_review` یا خطای گزارش هدایت کند.

## خروجی‌های آینده

- `ProductImportBatchDecision`
- `ProductImportBatchSummary`
- `ProductImportBatchSplitPlan`
- `ProductImportBatchApprovalRequirement`

## محدودیت فعلی

این سند قرارداد مستند است. هیچ import engine، queue، UI، component، route، localStorage key، database یا migration ساخته نشده است.
