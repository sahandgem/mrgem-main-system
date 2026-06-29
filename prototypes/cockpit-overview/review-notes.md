# Cockpit Overview Prototype - Review Notes

## خلاصه prototype

نمونه نمایشی مستقل Central Cockpit Overview با هشت signal مصنوعی، کارت‌های risk/confidence/audit، پیشنهاد mock هوش مصنوعی، صف بررسی مدیر و drill-down صرفاً مفهومی.

## روش باز کردن

فایل زیر را در مرورگر باز کنید:

`prototypes/cockpit-overview/index.html`

## وضعیت review

- Static Review: `PASS`
- Human Visual Review: `PENDING`
- Main Merge: `ON_HOLD`
- Current Decision: `PENDING_HUMAN_VISUAL_REVIEW`

## checklist کوتاه انسانی

| مورد | Pass | Fail | یادداشت |
|---|---|---|---|
| banner prototype واضح است | [ ] | [ ] | |
| رابط فارسی، RTL و dark-first است | [ ] | [ ] | |
| وضعیت در کمتر از ۱۰ ثانیه فهمیده می‌شود | [ ] | [ ] | |
| هر ۸ signal قابل مشاهده‌اند | [ ] | [ ] | |
| risk و confidence مستقل و خوانا هستند | [ ] | [ ] | |
| audit indicator واضح است | [ ] | [ ] | |
| AI فقط suggestion است | [ ] | [ ] | |
| کلیک کارت فقط drill-down مفهومی باز می‌کند | [ ] | [ ] | |
| conflict/manual_only/audit_missing مسدود دیده می‌شوند | [ ] | [ ] | |
| هیچ action واقعی نمایش داده نمی‌شود | [ ] | [ ] | |
| desktop و mobile بدون overlap هستند | [ ] | [ ] | |
| rollback با حذف پوشه روشن است | [ ] | [ ] | |

## ثبت نظر انسانی

- reviewer:
- reviewDate:
- viewports:
- visualResult:
- notes:
- decision:

## outcomeهای مجاز

- `approved_for_iteration`
- `needs_revision`
- `blocked`
- `rejected`
- `frozen`
