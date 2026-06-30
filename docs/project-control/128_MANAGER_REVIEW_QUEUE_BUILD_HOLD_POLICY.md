# Manager Review Queue Build Hold Policy

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

| موضوع | وضعیت |
|---|---|
| Manager Review Queue Prototype | `ON_HOLD` |
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

Test Plan، Rollback Plan و Future File Scope Draft آماده‌اند، اما approval نهایی file scope، mock dataset، test execution، rollback owner و build approval مستقل هنوز صادر نشده‌اند. بنابراین hold بدون تغییر باقی می‌ماند.

## قانون نهایی

تا صدور تصمیم مستقل، Manager Review Queue Prototype برابر `ON_HOLD` است. Overview prototype نیز frozen باقی می‌ماند و main merge همچنان مجاز نیست.
