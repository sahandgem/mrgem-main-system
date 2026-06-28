# Phase Log

آخرین به‌روزرسانی: 2026-06-28

## جدول فازهای WF

| فاز | وضعیت | خلاصه خروجی |
|---|---|---|
| WF-P0 | انجام شده | اسکلت داشبورد، مسیرهای اصلی، RTL، dark mode و UI اولیه WF |
| WF-P1 | انجام شده | مدل داده، CRUD، localStorage و data service داخلی |
| WF-P2 | انجام شده | موتور تحلیل واقعی اولیه برای ظرفیت، تمرکز، ایمنی، فروشگاه و تداخل‌ها |
| WF-P3 | انجام شده | صفحه جزئیات تحلیل و تنظیمات تحلیل |
| WF-P4 | انجام شده | سازگاری کار/فضا و قوانین compatibility |
| WF-P5 | انجام شده | simulator سبک برنامه |
| WF-P6 | انجام شده | recommendation engine |
| WF-P7 | انجام شده | decision queue |
| WF-P8 | انجام شده | decision reports |
| WF-P9 | انجام شده | report archive/comparison |
| WF-P10 | انجام شده | monthly health |
| WF-P11 | انجام شده | preventive alerts |
| WF-P12 | انجام شده | data center، backup، import/restore و snapshot |
| WF-P13 | انجام شده | maintenance analyzer/service/page |
| WF-P14 | انجام شده | operational readiness |
| WF-P15 | انجام شده | launch checklist |
| WF-P16 | انجام شده | launch signoff و baseline bundle |
| WF-P17 | انجام شده | baseline drift و operational resignoff |
| WF-P18 | انجام شده | operational history |
| WF-P19 | انجام شده | history retention/archive |
| WF-P20 | انجام شده | operations calendar |
| WF-P21 | انجام شده | control policy، export و in-app notification |
| WF-P22 | انجام شده | route registry، lazy routes، loading/error boundary |
| WF-P23 | نیاز به تأیید دستی | شواهد مستقیم کافی در repo ثبت نشده است |
| WF-P24 | انجام شده | project control docs و current state audit اولیه |
| WF-P25 | انجام شده | backup coverage و recovery audit |
| WF-P26 | انجام شده | baseline compatibility و migration notes |
| WF-P27 | انجام شده | operator guidance برای legacy baseline |
| WF-P28 | انجام شده | page entry split برای صفحات سیستم و component extraction سبک |
| WF-P29 | انجام و verify شد | `MaintenancePage` و `HistoryRetentionPage` قبلاً از `WorkforcePages.tsx` جدا شده بودند؛ فایل‌های مستقل موجودند؛ test/build موفق؛ route/storage/UI تغییر نکرد. |
| WF-P30 | انجام و verify شد | `OperationalHistoryPage` واقعاً از `WorkforcePages.tsx` خارج شد؛ `WorkforcePages.tsx` از `4733` خط به `4614` خط رسید؛ test/build موفق؛ route/storage/UI تغییر نکرد. |

## جدول فازهای CONTROL

| فاز | وضعیت | خلاصه خروجی |
|---|---|---|
| CONTROL-P1 | انجام شده | ساخت/تکمیل docs/project-control به عنوان منبع حقیقت مستر جم و sync تصمیم مرکز کنترل |

## P فعلی قطعی

آخرین P اجرایی و کدی verify شده: **WF-P30**

آخرین P کنترل پروژه: **CONTROL-P1**

## جزئیات ثبت WF-P30

فایل صفحه:

- `src/pages/workforce/system/OperationalHistoryPage.tsx`

فایل‌های تغییرکرده در WF-P30:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/OperationalHistoryPage.tsx`
- `tests/analysis.test.ts`

نتیجه:

- `WorkforcePages.tsx`: `4733` خط به `4614` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- build warning: ندارد.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر رفتار UI: ندارد.
- هشدار باقی‌مانده: `WorkforcePages.tsx` هنوز بزرگ است و `DataCenterPage` هنوز adapter/compat دارد.

## جزئیات ثبت WF-P29

فایل‌های موجود:

- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`

نتیجه:

- `WorkforcePages.tsx`: حدود `5028` خط به `4733` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر رفتار UI: ندارد.

## P پیشنهادی بعدی

**Source Integration Map**، بدون ادغام کد.

## قالب ثبت فاز بعدی

برای هر P جدید، این موارد ثبت شود:

- تاریخ اجرا
- شاخه و کد فاز
- هدف
- فایل‌های تغییرکرده
- route impact
- localStorage impact
- model/service/analyzer impact
- تست‌ها
- نتیجه build
- warningها
- ریسک باقی‌مانده
- پیشنهاد P بعدی
