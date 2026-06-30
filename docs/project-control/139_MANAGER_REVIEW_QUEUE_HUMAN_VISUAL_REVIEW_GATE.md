# Manager Review Queue Human Visual Review Gate

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

| موضوع | وضعیت |
|---|---|
| Static Review | `PASS` |
| Human Visual Review | `PENDING` |
| Main Merge | `ON_HOLD` |
| Main Integration | `NOT_APPROVED` |
| Implementation | `NOT_APPROVED` |

## موارد بازبینی دستی Sahand

- banner prototype واضح باشد.
- رابط فارسی، RTL و dark-first باشد.
- هر ۱۰ review item قابل مشاهده باشد.
- summary تعدادها را خوانا نمایش دهد.
- filters و priority lanes واضح باشند.
- کلیک روی item فقط detail panel مفهومی را تغییر دهد.
- AI فقط suggestion باشد، نه decision.
- risk، confidence و audit مستقل و خوانا باشند.
- decisionOptions فقط concept باشند.
- decision reason فقط placeholder باشد.
- audit timeline فقط concept باشد.
- audit_missing، conflict و manual_only حالت block مفهومی نشان دهند.
- هیچ action، write یا status change واقعی دیده نشود.
- desktop و mobile خوانا و بدون overlap باشند.

## شواهد مورد انتظار

- reviewer و reviewDate
- desktopResult و mobileResult
- نتیجه summary/filter/list/detail interaction
- نتیجه block stateها
- notes و issueهای احتمالی
- decision نهایی

## Outcomeهای مجاز

- `approved_for_iteration`
- `needs_revision`
- `blocked`
- `rejected`
- `frozen`

## قانون

بدون Human Visual Review و ثبت outcome، ادامه build، iteration جدید یا merge مجاز نیست. وضعیت فعلی `PENDING` است.
