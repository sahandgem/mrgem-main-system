# Cockpit Overview Prototype - Review Notes

## خلاصه prototype

نمونه نمایشی مستقل Central Cockpit Overview با هشت signal مصنوعی، کارت‌های risk/confidence/audit، پیشنهاد mock هوش مصنوعی، صف بررسی مدیر و drill-down صرفاً مفهومی.

## روش باز کردن

فایل زیر را در مرورگر باز کنید:

`prototypes/cockpit-overview/index.html`

## وضعیت review

- Static Review: `PASS`
- Human Visual Review: `approved_for_iteration`
- Main Merge: `ON_HOLD`
- Main Integration: `NOT_APPROVED`
- Implementation: `NOT_APPROVED`
- Current Decision: `approved_for_iteration`

## checklist کوتاه انسانی

| مورد | Pass | Fail | یادداشت |
|---|---|---|---|
| banner prototype واضح است | [x] | [ ] | تایید شد |
| رابط فارسی، RTL و dark-first است | [x] | [ ] | تایید شد |
| وضعیت در کمتر از ۱۰ ثانیه فهمیده می‌شود | [x] | [ ] | تایید شد |
| هر ۸ signal قابل مشاهده‌اند | [x] | [ ] | تایید شد |
| risk و confidence مستقل و خوانا هستند | [x] | [ ] | تایید شد |
| audit indicator واضح است | [x] | [ ] | تایید شد |
| AI فقط suggestion است | [x] | [ ] | تایید شد |
| کلیک کارت فقط drill-down مفهومی باز می‌کند | [x] | [ ] | تایید شد |
| conflict/manual_only/audit_missing مسدود دیده می‌شوند | [x] | [ ] | تایید شد |
| هیچ action واقعی نمایش داده نمی‌شود | [x] | [ ] | تایید شد |
| desktop و mobile بدون overlap هستند | [x] | [ ] | mobile کمی بزرگ است؛ blocker نیست |
| rollback با حذف پوشه روشن است | [x] | [ ] | تایید شد |

## ثبت نظر انسانی

- reviewer: Sahand
- reviewDate: 2026-06-30
- viewports: Desktop, Mobile
- visualResult: `approved_for_iteration`
- desktopResult: `pass`
- desktopIssue: ندارد
- mobileResult: `pass_with_minor_note`
- mobileNote: اندازه‌ها کمی بزرگ هستند، اما blocker نیست.
- notes: prototype برای iteration بعدی تایید می‌شود، اما قبل از merge به بازبینی و approval مستقل نیاز دارد.
- decision: `approved_for_iteration`
- mergeDecision: `ON_HOLD`
- implementationDecision: `NOT_APPROVED`

## outcomeهای مجاز

- `approved_for_iteration`
- `needs_revision`
- `blocked`
- `rejected`
- `frozen`
