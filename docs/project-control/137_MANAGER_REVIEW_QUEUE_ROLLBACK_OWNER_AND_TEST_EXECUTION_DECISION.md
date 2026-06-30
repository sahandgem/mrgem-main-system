# Manager Review Queue Rollback Owner and Test Execution Decision

آخرین به‌روزرسانی: 2026-06-30

## نقش‌ها

| مسئولیت | Owner |
|---|---|
| Rollback Owner | `Control Room` |
| Test Owner | `Sahand / Control Room Review` |
| Build Scope Approval | `Control Room` |
| Human Visual Review | `Sahand / Control Room Review` |

## Test Execution Decision

- تست اجرایی فقط بعد از build آینده انجام می‌شود.
- CONTROL-P46 هیچ تست prototype اجرایی انجام نمی‌دهد.
- Test Plan مصوب سند 129 مبنای اجرا خواهد بود.
- evidence، pass/fail و blockerها باید در گزارش مستقل ثبت شوند.

## Rollback Decision

Rollback با حذف کامل مسیر زیر انجام می‌شود:

`prototypes/cockpit-manager-review-queue/`

پس از حذف باید git status، نبود dependency و دست‌نخوردن Overview/main تایید شوند.

## Outcomeهای مجاز پس از Build

- `approved_for_iteration`
- `needs_revision`
- `blocked`
- `rejected`
- `frozen`

## مرز Merge

هیچ‌یک از outcomeهای بالا به‌صورت خودکار مجوز merge نیستند. Main Merge فقط با approval مستقل آینده ممکن است.
