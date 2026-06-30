# Manager Review Queue Prototype - Review Notes

## روش باز کردن

فایل زیر را در مرورگر باز کنید:

`prototypes/cockpit-manager-review-queue/index.html`

## وضعیت فعلی

- Static Review: `PASS`
- Human Visual Review: `PENDING`
- Main Merge: `ON_HOLD`
- Current Decision: `PENDING_HUMAN_VISUAL_REVIEW`

## Checklist کوتاه انسانی

| مورد | Pass | Fail | یادداشت |
|---|---|---|---|
| banner داده ساختگی واضح است | [ ] | [ ] | |
| فارسی، RTL و dark-first درست است | [ ] | [ ] | |
| ۱۰ review item دیده می‌شود | [ ] | [ ] | |
| summary و priority lanes خوانا هستند | [ ] | [ ] | |
| فیلترهای priority/risk/audit کار می‌کنند | [ ] | [ ] | |
| کلیک item فقط detail مفهومی را تغییر می‌دهد | [ ] | [ ] | |
| AI فقط suggestion است | [ ] | [ ] | |
| risk/confidence/audit واضح هستند | [ ] | [ ] | |
| decisionOptions فقط concept هستند | [ ] | [ ] | |
| audit_missing/conflict/manual_only مسدود دیده می‌شوند | [ ] | [ ] | |
| هیچ action واقعی دیده نمی‌شود | [ ] | [ ] | |
| mobile و desktop بدون overlap هستند | [ ] | [ ] | |
| rollback با حذف پوشه روشن است | [ ] | [ ] | |

## ثبت نتیجه انسانی

- reviewer:
- reviewDate:
- desktopResult:
- mobileResult:
- visualResult:
- notes:
- decision:

## Outcomeهای مجاز

- `approved_for_iteration`
- `needs_revision`
- `blocked`
- `rejected`
- `frozen`
