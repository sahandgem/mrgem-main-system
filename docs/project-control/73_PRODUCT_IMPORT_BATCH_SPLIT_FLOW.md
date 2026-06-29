# Product Import Batch Split Flow

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند جریان مفهومی تقسیم یک batch ورود کالا به sub-batchهای مستقل و قابل audit را تعریف می‌کند. Split برای نجات بخش سالم از batch مختلط است، نه راهی برای دورزدن Quality Gate یا حذف blockerها.

## Product Import Batch Split Flow چیست؟

فرآیندی کنترل‌شده است که itemهای یک parent batch را بر اساس validation، review، risk، confidence و Quality Gate به گروه‌های همگن تقسیم می‌کند. هر item دقیقاً در یک sub-batch عملیاتی قرار می‌گیرد و ارتباط آن با parent و audit اصلی حفظ می‌شود.

## چه زمانی Batch باید Split شود؟

- رکوردهای معتبر با رکوردهای blocked مخلوط‌اند.
- duplicate candidateهای حل‌نشده فقط بخشی از batch را درگیر کرده‌اند.
- قالب منبع برای بخشی از داده معتبر و برای بخشی نامعتبر است.
- مشکل گروه کالا فقط در subset مشخص وجود دارد.
- stone mapping فقط در subset مشخص ناسازگار است.
- pricing-impact conflict فقط برخی itemها را درگیر کرده است.
- production-impact conflict فقط برخی itemها را درگیر کرده است.
- رکوردهای manual-only با رکوردهای امن مخلوط شده‌اند.

Split نباید زمانی استفاده شود که کل منبع ناشناخته، audit ناقص یا batch در سطح ساختاری غیرقابل اعتماد است؛ در این حالت quarantine یا reject مناسب‌تر است.

## خروجی‌های Split

| sub-batch | محتوا و رفتار |
|---|---|
| `approved_sub_batch` | itemهای بدون blocker که همه شرط‌های gate را گذرانده‌اند |
| `review_sub_batch` | itemهای نیازمند reviewer/manager decision |
| `quarantine_sub_batch` | داده مشکوک، format نامطمئن یا unsafe mapping |
| `rejected_sub_batch` | itemهای ردشده و غیرقابل ورود با دلیل ثبت‌شده |
| `correction_required_sub_batch` | itemهایی که منبع باید اصلاح و دوباره ارسال کند |

## قرارداد هر Sub-batch

| فیلد | نقش |
|---|---|
| `parentBatchId` | ارجاع تغییرناپذیر به batch اصلی |
| `subBatchId` | شناسه یکتای sub-batch |
| `splitReason` | دلیل و rule تصمیم split |
| `itemCount` | تعداد itemهای sub-batch |
| `qualityGateStatus` | وضعیت gate مخصوص همان sub-batch |
| `riskSummary` | خلاصه ریسک itemهای عضو |
| `confidenceSummary` | توزیع confidence |
| `requiredActions` | review، correction، approval یا quarantine action |
| `auditReference` | پیوند به parent، item membership و تصمیم split |

اطلاعات تکمیلی پیشنهادی شامل `splitVersion`، `createdAt`، `createdBy` و checksum عضویت itemها است.

## جریان Split

1. parent batch پس از dry-run و Quality Gate نیاز به split پیدا می‌کند.
2. itemها با rule نسخه‌دار و بدون تغییر raw data دسته‌بندی می‌شوند.
3. سازگاری شمارش parent و sub-batchها کنترل می‌شود.
4. برای هر sub-batch یک Quality Gate مستقل اجرا می‌شود.
5. split حساس برای manager approval ارسال می‌شود.
6. Decision Audit و parent-child references ثبت می‌شوند.
7. فقط `approved_sub_batch` می‌تواند نامزد import آینده شود.

## قواعد سازگاری

- مجموع itemCountهای sub-batchها باید دقیقاً برابر itemهای تصمیم‌گیری‌شده parent باشد.
- هیچ item نباید همزمان عضو دو sub-batch عملیاتی باشد.
- item حذف‌شده یا بدون مقصد مجاز نیست.
- انتقال بعدی item بین sub-batchها باید correction/decision audit جدید بسازد.
- raw input و parent batch snapshot باید حفظ شوند.

## قوانین ایمنی

- split نباید باعث گم‌شدن audit trail شود.
- هر sub-batch باید به parent batch متصل بماند.
- conflict حل‌نشده وارد `approved_sub_batch` نشود.
- split حساس باید manager approval داشته باشد.
- duplicate حساس، manual-only و low-confidence critical در بخش approved قرار نگیرند.
- AI می‌تواند پیشنهاد دسته‌بندی بدهد اما split حساس را نهایی نمی‌کند.

## خروجی‌های آینده

- `ProductImportBatchSplitPlan`
- `ProductImportSubBatch`
- `ProductImportBatchMembershipAudit`
- `ProductImportBatchSplitDecision`

## محدودیت فعلی

هیچ split engine، import action، UI، database، migration، route یا localStorage key ساخته نشده است.
