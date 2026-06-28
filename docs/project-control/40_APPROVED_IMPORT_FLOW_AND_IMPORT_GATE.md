# Approved Import Flow and Import Gate

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند جریان import تاییدشده و مفهوم `Import Gate` را برای ورود امن داده به مستر جم تعریف می‌کند. هدف این است که ورود داده به main فقط پس از عبور از کنترل‌های مشخص و داشتن rollback plan انجام شود.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Approved Import Flow چیست؟

`Approved Import Flow` مسیر مرحله‌ای ورود داده از raw input تا main است. این مسیر تضمین می‌کند داده قبل از ورود، parse، normalize، validate، بررسی تکراری/تعارض، امتیازدهی confidence، review و approval شده باشد.

## Import Gate چیست؟

`Import Gate` نقطه کنترل نهایی قبل از ورود به main است. این gate باید بررسی کند همه شرط‌های ورود تاییدشده برقرار هستند و import batch دارای audit reference و rollback plan است.

## مسیر امن

1. raw input
2. staging
3. parse
4. normalize
5. validate
6. duplicate/conflict check
7. confidence score
8. AI/rule suggestion
9. review if needed
10. approval
11. dry-run report
12. approved import
13. audit trail

## شرط‌های ورود تاییدشده

| شرط | توضیح |
|---|---|
| validation passed | هیچ خطای blocking باقی نمانده باشد. |
| no unresolved conflict | conflict حل‌نشده وجود نداشته باشد. |
| no blocking duplicate | duplicate مهم یا merge conflict باز نمانده باشد. |
| confidence level acceptable | سطح اطمینان با نوع import سازگار باشد. |
| required fields complete | فیلدهای اجباری کامل باشند. |
| manager approval if sensitive | import حساس تایید مدیر داشته باشد. |
| audit reference exists | reference قابل ردیابی برای source، rule، validation و decision وجود داشته باشد. |
| rollback plan exists | مسیر برگشت یا correction برای import مشخص باشد. |

## خروجی‌های مورد انتظار

| خروجی | کاربرد |
|---|---|
| `ImportBatch` | بسته import شامل source، status، تعداد رکوردها و metadata. |
| `ImportGateReport` | نتیجه کنترل gate قبل از ورود به main. |
| `ApprovedImportDecision` | تصمیم نهایی allow، block، review یا reject. |
| `ImportAuditReference` | شناسه audit برای ردیابی source، actor، validation، approval و import. |
| `ImportDryRunReport` | گزارش اثر import قبل از اجرای واقعی. |

## dry-run report باید چه نشان دهد؟

- چند رکورد ایجاد می‌شود.
- چند رکورد update یا attach می‌شود.
- چه رکوردهایی skipped یا rejected هستند.
- چه duplicate یا conflictهایی حل شده‌اند.
- چه موجودیت‌هایی تحت اثر قرار می‌گیرند.
- rollback چه داده‌ای لازم دارد.

## قوانین gate

- gate نباید با warningهای مسدودکننده عبور کند.
- gate نباید missing required field را نادیده بگیرد.
- gate برای import حساس باید manager approval بخواهد.
- gate باید قبل از approved import، dry-run report و rollback plan داشته باشد.

## محدودیت فعلی

این سند فقط flow و gate مفهومی است. هیچ implementation، API، database table، migration، localStorage key یا UI ساخته نمی‌شود.
