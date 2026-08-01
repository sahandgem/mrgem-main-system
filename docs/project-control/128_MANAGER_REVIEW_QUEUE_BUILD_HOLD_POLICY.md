# Manager Review Queue Build Hold Policy

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

| موضوع | وضعیت |
|---|---|
| Manager Review Queue Prototype | `APPROVED_FOR_ISOLATED_BUILD_NEXT_STEP` |
| Build Hold | `LIFTED_FOR_APPROVED_ISOLATED_NEXT_STEP` |
| Manager Review Queue Implementation | `NOT_APPROVED` |
| Overview Prototype | `FROZEN_AFTER_APPROVED_ITERATION` |
| Main Merge | `ON_HOLD` |
| Main Integration | `NOT_APPROVED` |

## Build Hold Policy چیست؟

سیاست توقف ساخت تا زمانی است که file scope، mock fixture، test plan، rollback plan و approval مستقل مرکز کنترل کامل شوند.

## فعالیت‌های مجاز در Hold

- concept review
- flow map و storyboard refinement
- Screen Spec refinement
- mock dataset refinement در سطح مستندات
- Interaction/Safety Rules refinement
- Test Plan و Rollback Plan مستنداتی

## فعالیت‌های ممنوع

- ساخت prototype جدید
- ساخت UI یا component واقعی
- ساخت route یا navigation
- تغییر Overview prototype
- تغییر CSS، HTML، JavaScript یا mock signals فعلی
- اتصال داده واقعی
- storage، database، migration، auth، API یا backend
- production dependency یا decision mutation
- merge یا integration با main

## شرایط رفع Hold

- Prototype Approval Gate passed
- exact file scope approved
- mock dataset/fixture approved
- Test Plan approved
- Rollback/Exit Plan approved
- rollback owner مشخص
- control-room build approval issued

## وضعیت پس از CONTROL-P45

Test Plan، Rollback Plan، Final File Scope، Mock Fixture Contract، Guardrails، Rollback Owner و Test Owner تایید شده‌اند. Hold فقط برای یک build ایزوله و مستقل آینده برداشته شده است. Implementation، main integration و merge همچنان روی hold باقی می‌مانند.

## قانون نهایی

ساخت ایزوله مرحله بعد مجاز شده، اما هنوز شروع نشده است. Overview prototype frozen باقی می‌ماند و main merge همچنان مجاز نیست.
