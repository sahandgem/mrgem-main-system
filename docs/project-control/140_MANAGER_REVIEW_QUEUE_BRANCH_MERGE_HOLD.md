# Manager Review Queue Branch Merge Hold

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

| موضوع | وضعیت |
|---|---|
| Branch | `prototype/cockpit-overview-isolated` |
| Prototype Commit Reviewed | `56c6075` |
| Static Review | `PASS` |
| Human Visual Review | `PENDING` |
| Main Merge | `ON_HOLD` |
| Main Integration | `NOT_APPROVED` |
| Implementation | `NOT_APPROVED` |

## دلیل Hold

- Static Review پاس شده، اما Human Visual Review هنوز انجام نشده است.
- نتیجه interaction و responsive review باید ثبت شود.
- هر merge به approval مستقل مرکز کنترل نیاز دارد.
- نتیجه prototype review به‌صورت خودکار مجوز main integration نیست.

## شرط‌های لازم برای بررسی رفع Hold

- Human Visual Review با outcome رسمی ثبت شود.
- Static Review همچنان `PASS` بماند.
- rollback path و affected file scope تایید شوند.
- هیچ production dependency، real data یا main mutation وجود نداشته باشد.
- control-room merge approval مستقل صادر شود.

## قانون

این prototype و branch تا اطلاع بعدی به main merge نشوند. وضعیت جاری `Main Merge = ON_HOLD` است.
