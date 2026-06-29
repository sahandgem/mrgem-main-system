# Import Dry-run Report Standard

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند استاندارد گزارش dry-run قبل از import واقعی را برای مستر جم تعریف می‌کند. هدف این است که اثر ورود داده، ریسک‌ها، نیاز به تایید و آمادگی rollback قبل از تغییر main روشن شود.

این سند فقط طراحی استاندارد است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Import Dry-run Report چیست؟

`Import Dry-run Report` گزارشی است که import را بدون اعمال تغییر واقعی شبیه‌سازی می‌کند. این گزارش نشان می‌دهد اگر import اجرا شود چه رکوردهایی ساخته، اصلاح، رد، مسدود یا نیازمند review می‌شوند.

## چرا قبل از import واقعی لازم است؟

- اثر import روی main قبل از اجرا دیده می‌شود.
- duplicate، conflict و missing field پیش از تغییر داده آشکار می‌شود.
- مدیر می‌تواند ریسک و نیاز به approval را ببیند.
- rollback readiness قبل از import سنجیده می‌شود.
- import batch قابل audit و قابل تصمیم‌گیری می‌شود.

## گزارش dry-run باید چه چیزهایی نشان دهد؟

| بخش | توضیح |
|---|---|
| import batch id | شناسه batch شبیه‌سازی‌شده. |
| source type | نوع منبع مثل Bank Excel، Mobile receipt، Product Excel یا Inventory import. |
| source file/name | نام فایل یا منبع ورودی. |
| parsed rows/items | تعداد ردیف‌ها یا آیتم‌های خوانده‌شده. |
| valid items | آیتم‌های آماده ادامه مسیر. |
| invalid items | آیتم‌های دارای خطای validation یا parse. |
| duplicate candidates | موارد احتمالی تکراری. |
| conflicts | موارد دارای تعارض حل‌نشده. |
| auto-fix suggestions | اصلاح‌های پیشنهادی. |
| needs review items | مواردی که نیاز به reviewer یا manager دارند. |
| approved candidates | مواردی که می‌توانند کاندید approved import باشند. |
| blocked items | موارد مسدودشده. |
| confidence summary | توزیع high، medium، low، conflict و manual only. |
| risk flags | ریسک‌های اصلی batch. |
| estimated affected records | رکوردهای احتمالی تحت اثر import. |
| rollback readiness | وضعیت آمادگی rollback یا correction. |
| manager approval requirement | آیا تایید مدیر لازم است یا نه. |

## خروجی‌های مورد انتظار

| خروجی | کاربرد |
|---|---|
| `ImportDryRunReport` | گزارش کلی batch و اثر import. |
| `ImportDryRunItem` | نتیجه dry-run برای هر ردیف یا آیتم. |
| `ImportDryRunSummary` | خلاصه شمارشی و تصمیمی batch. |
| `ImportRiskSummary` | خلاصه ریسک‌های duplicate، conflict، low confidence و sensitive action. |
| `ImportApprovalRequirement` | نیاز یا عدم نیاز به تایید manager/reviewer. |

## تصمیم پس از dry-run

| نتیجه | اقدام |
|---|---|
| clean dry-run | آماده رفتن به Import Gate. |
| warnings only | review سبک یا تایید manager بسته به ریسک. |
| blocking errors | اصلاح یا rejection قبل از import. |
| conflicts | blocked تا تصمیم manager. |
| rollback not ready | import نباید اجرا شود. |

## محدودیت فعلی

این سند فقط استاندارد گزارش است. هیچ dry-run engine، parser، UI، database، migration یا localStorage key ساخته نمی‌شود.
