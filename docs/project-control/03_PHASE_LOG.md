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
| WF-P31 | انجام و verify شد | `DataCenterPage` از adapter به صفحه واقعی تبدیل شد؛ `WorkforcePages.tsx` از `4331` خط به `4119` خط رسید؛ test/build موفق؛ route/storage/docs تغییر نکرد. |

## جدول فازهای CONTROL

| فاز | وضعیت | خلاصه خروجی |
|---|---|---|
| CONTROL-P1 | انجام شده | ساخت/تکمیل docs/project-control به عنوان منبع حقیقت مستر جم و sync تصمیم مرکز کنترل |
| CONTROL-P2 | انجام شده | ساخت `09_SOURCE_INTEGRATION_MAP.md` و ثبت نقشه ادغام منابع بدون merge کد |
| CONTROL-P3 | انجام شده | ساخت `10_FUTURE_MODULES_ROADMAP.md` و ثبت نقشه آینده ماژول‌های مستر جم بدون کدنویسی یا ادغام کد |
| CONTROL-P4 | انجام شده | ساخت `11_CORE_PRODUCT_MODEL.md` و طراحی مستند مدل مرکزی کالا بدون کدنویسی، migration یا merge پروژه کالا |

## P فعلی قطعی

آخرین P اجرایی و کدی verify شده: **WF-P31**

آخرین P کنترل پروژه: **CONTROL-P4**

## جزئیات ثبت CONTROL-P4

فایل جدید:

- `docs/project-control/11_CORE_PRODUCT_MODEL.md`

نتیجه:

- `Core Product Model` برای کالا، بارکد، گروه کالا، سنگ، وزن، اجرت، قیمت، موجودی، تولید، خروجی محک و AI-ready export طراحی شد.
- موارد قابل استخراج آینده از `mahak-web-version` ثبت شد: مدل کالا، بارکد، بانک سنگ، کد گروه، خروجی Excel محک، کنترل تکراری و خروجی قابل تحلیل برای AI.
- موارد ممنوع ثبت شد: merge مستقیم `mahak-web-version`، تغییر database اصلی، ساخت UI کالا، migration، تغییر route و تغییر localStorage.
- ترتیب امن آینده ثبت شد: مدل مفهومی، schema پیشنهادی، adapter، تست روی داده نمونه، UI، و migration فقط با اجازه مرکز فرمان.
- کد اجرایی، route، UI، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت WF-P31

فایل صفحه:

- `src/pages/workforce/system/DataCenterPage.tsx`

فایل‌های تغییرکرده در WF-P31:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`
- `tests/analysis.test.ts`

نتیجه:

- `DataCenterPage` از adapter به صفحه واقعی تبدیل شد.
- `WorkforcePages.tsx`: `4331` خط به `4119` خط.
- کاهش تقریبی: `212` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- build warning جدی: ندارد.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر docs در زمان اجرای WF-P31: ندارد.
- تغییر رفتار UI: ندارد.
- commit اجرایی: `85d0df5 refactor: extract DataCenterPage`
- هشدار باقی‌مانده: `WorkforcePages.tsx` هنوز بزرگ است، ولی `MaintenancePage`، `HistoryRetentionPage`، `OperationalHistoryPage` و `DataCenterPage` جدا شده‌اند.

## جزئیات ثبت CONTROL-P3

فایل جدید:

- `docs/project-control/10_FUTURE_MODULES_ROADMAP.md`

نتیجه:

- نقشه آینده Workforce، Finance، Product، Production، Inventory، Receipts، Mahak Integration، Mobile App، AI Analysis و Central Cockpit ثبت شد.
- تصمیم ثبت شد که قبل از کاهش بدهی معماری WF، ماژول جدید شروع نشود.
- `audit-app` و `mahak-web-version` همچنان Subproject هستند و merge مستقیم ندارند.
- مدل‌های پایه آینده ثبت شدند: `Core Product Model`، `Core Financial Event Model`، `Core Inventory Model`، `Production Flow Model`، `Receipt Capture Flow` و `Central Cockpit Dashboard Map`.
- کد اجرایی، route، UI، migration و localStorage تغییر نکرد.

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

طراحی `Product Schema Draft` و `Product Adapter Boundary`، یا طراحی یکی از مدل‌های مرکزی آینده بدون کدنویسی، فقط پس از تأیید مرکز کنترل.

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
