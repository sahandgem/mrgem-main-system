# Product Import Manager Decision Report

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند گزارش مدیریتی تصمیم import کالا را تعریف می‌کند تا مدیر بتواند خلاصه batch، کیفیت، blockerها، پیشنهادها و approvalهای لازم را بدون ورود به جزئیات فنی همه itemها بررسی کند.

## Product Import Manager Decision Report چیست؟

گزارشی read-only و قابل drill-down است که شواهد Product Import Batch Decision، Quality Gate، Review Queue، Auto-fix و Decision Audit را در یک نمای تصمیم‌محور جمع می‌کند. گزارش پیشنهاد می‌دهد اما هیچ import یا override را اجرا نمی‌کند.

## محتوای گزارش

| بخش | محتوای مورد انتظار |
|---|---|
| Import source | sourceType، sourceName، batchId و receivedAt |
| Batch summary | parsed، valid، warning، review و blocked counts |
| Quality Gate result | status، شرط‌های پاس‌شده و شرط‌های ناموفق |
| Blocked reasons | blockerها با تعداد و severity |
| Review Queue summary | pending، escalated، resolved و correction requested |
| Duplicate/conflict summary | نوع، تعداد، وضعیت حل و اثر batch |
| Auto-fix summary | accepted، rejected، pending و موارد حساس |
| AI suggestions summary | پیشنهادها همراه با confidence، reason و reference |
| Risk flags | pricing، production، inventory، duplicate، source و AI risk |
| Confidence distribution | توزیع high/medium/low/conflict/manual only |
| Recommended decision | پیشنهاد rule/AI با شواهد و محدودیت‌ها |
| Required manager actions | approval، override، correction یا split لازم |
| Audit references | پیوند به dry-run، gate، review و decision audit |

## تصمیم‌های مدیریتی

- `approve_import`: تایید batch واجد شرایط.
- `approve_valid_only`: تایید itemهای معتبر و مستثناکردن بقیه با audit.
- `hold_for_review`: توقف تا تکمیل review یا correction.
- `reject_batch`: رد batch با دلیل.
- `split_batch`: تایید طرح تقسیم و child batchها.
- `request_data_correction`: درخواست اصلاح منبع و dry-run مجدد.
- `override_with_reason`: عبور استثنایی فقط در مرز مجاز و با دلیل کامل.

## شرایط Override

- override نباید conflict حل‌نشده، duplicate حساس، manual-only یا blocker امنیتی را پنهان کند.
- reason، actor، role، timestamp، risk acceptance و auditReference اجباری‌اند.
- override باید دامنه دقیق itemها را مشخص کند، نه کل batch به صورت مبهم.
- featureهای اثرگذار بر قیمت، وزن حساس، barcode و production formula approval تخصصی لازم دارند.
- override یک Decision Audit جدید ایجاد می‌کند و تاریخچه قبلی را بازنویسی نمی‌کند.

## نقش AI

- AI می‌تواند pattern، ریسک و recommended decision را پیشنهاد دهد.
- پیشنهاد AI باید confidence، reason، related data و source reference داشته باشد.
- AI تصمیم‌گیر نهایی موارد حساس نیست.
- مدیر باید بتواند پیشنهاد AI را بپذیرد یا رد کند و دلیل خود را ثبت کند.

## قواعد گزارش

- گزارش فقط خواندنی است و main data را mutate نمی‌کند.
- هر عدد باید قابلیت drill-down به item/source/audit داشته باشد.
- blocked reason و manager action نباید فقط در متن آزاد پنهان شوند.
- گزارش باید generatedAt، reportVersion و auditReference داشته باشد.
- تصمیم مدیر باید از گزارش جدا و در Decision Audit ثبت شود.

## خروجی‌های آینده

- `ProductImportManagerDecisionReport`
- `ProductImportManagerActionRequirement`
- `ProductImportOverrideAudit`
- `ProductImportDecisionRecommendation`

## محدودیت فعلی

هیچ UI، cockpit card، reporting engine، import action، auth، database، migration، route یا localStorage key ساخته نشده است.
