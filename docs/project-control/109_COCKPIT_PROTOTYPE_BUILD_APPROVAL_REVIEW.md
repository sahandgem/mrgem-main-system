# Cockpit Prototype Build Approval Review

آخرین به‌روزرسانی: 2026-06-29

## وضعیت تصمیم

| موضوع | وضعیت |
|---|---|
| Documentation Readiness | `READY` |
| Prototype Build Approval | `PENDING_CONTROL_ROOM_DECISION` |
| Build Started | `NO` |
| Implementation Approval | `NOT_APPROVED` |

## Build Approval Review چیست؟

دروازه بررسی مرکز کنترل پیش از هر کدنویسی prototype است. این review آمادگی اسناد را گزارش می‌کند، اما به‌تنهایی خروجی `approved_for_build` تولید نمی‌کند.

## موارد آماده

- Design Lab Rulebook
- Drill-down Strategy
- First Screen Candidate
- Mock Data Protocol
- Isolation Boundary
- Test Plan
- Rollback/Exit Plan
- Overview Screen Spec Review
- Mock Signal Dataset Spec
- Layout/Card Behavior Spec
- Prototype Readiness Report
- Environment Decision
- Work Order Draft

## موارد لازم پیش از build

- exact prototype location
- file creation scope و مالک فایل‌ها
- no-main-route rule
- no-production-storage rule
- mock data fixture نهایی و approval آن
- test command و evidence format
- rollback owner
- exit criteria و rollback verification
- checkpoint پاک Git پیش از شروع
- approval صریح مرکز کنترل با خروجی `approved_for_build`

## blockerها

- prototype location هنوز ایجاد و تایید نشده است.
- build approval هنوز صادر نشده است.
- mock fixture اجرایی وجود ندارد و فقط spec آن آماده است.
- test execution owner و rollback owner تعیین نشده‌اند.

## نتیجه

- `Cockpit is ready for a future build approval decision.`
- `This batch does not approve or start the build.`
- `Prototype remains ON_HOLD.`
- `Implementation remains NOT_APPROVED.`
