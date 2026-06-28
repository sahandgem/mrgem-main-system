# Architecture Decisions

آخرین به‌روزرسانی: 2026-06-29

## تصمیم‌های معماری گرفته‌شده

| ID | تصمیم | وضعیت |
|---|---|---|
| ADR-001 | UI اصلی فارسی، RTL و dark mode است. | فعال |
| ADR-002 | داده واقعی در کد hardcode نمی‌شود؛ seed فقط demo است. | فعال |
| ADR-003 | تا قبل از backend، persistence با localStorage و service داخلی انجام می‌شود. | فعال |
| ADR-004 | مدل‌های WF در TypeScript نگه‌داری می‌شوند و تغییر مدل باید کنترل‌شده باشد. | فعال |
| ADR-005 | منطق تحلیل باید تا حد امکان از UI جدا بماند. | فعال |
| ADR-006 | routeها از manifest/registry مرکزی تغذیه می‌شوند. | فعال |
| ADR-007 | routeها با lazy import بارگذاری می‌شوند. | فعال |
| ADR-008 | localStorage key جدید بدون ثبت در registry و بررسی backup coverage مجاز نیست. | فعال |
| ADR-009 | baselineهای قدیمی خودکار rewrite یا migrate نمی‌شوند؛ فقط با warning سازگاری توضیح داده می‌شوند. | فعال |
| ADR-010 | عملیات حساس مثل import/restore/cleanup باید محافظه‌کارانه و همراه snapshot یا امکان rollback باشد. | فعال |
| ADR-011 | notification فعلی فقط local/in-app است؛ push/email/SMS واقعی هنوز ساخته نشده است. | فعال |
| ADR-012 | `WorkforcePages.tsx` باید تدریجی کوچک شود؛ استخراج یک‌باره پرریسک است. | فعال |
| ADR-013 | `audit-app` فعلاً زیرپروژه `FIN-AUDIT` است و نباید مستقیم merge شود. | فعال |
| ADR-014 | `mahak-web-version` فعلاً زیرپروژه `DATA-MAHAK` است و نباید مستقیم merge شود. | فعال |
| ADR-015 | از زیرپروژه‌ها فقط ایده‌ها، schemaها، مدل‌ها و منطق‌های مفید، آن هم بعداً با تأیید مرکز کنترل، قابل استخراج هستند. | فعال |
| ADR-016 | Source Integration Map مرجع تصمیم‌های ادغام آینده است و CONTROL-P2 هیچ ادغام کدی انجام نمی‌دهد. | فعال |
| ADR-017 | پروژه اصلی فعلاً روی سبک‌سازی WF و کاهش بدهی `WorkforcePages.tsx` متمرکز می‌ماند؛ ماژول جدید بدون تأیید مرکز کنترل شروع نمی‌شود. | فعال |
| ADR-018 | Future Modules Roadmap مرجع ترتیب آینده ماژول‌ها است؛ Finance/Product/Mobile/Production/Inventory قبل از مدل‌های مرکزی و کاهش بدهی WF شروع نمی‌شوند. | فعال |
| ADR-019 | Core Product Model قبل از هر UI، migration، adapter اجرایی یا اتصال محک باید به صورت مستند طراحی و تأیید شود. | فعال |
| ADR-020 | Core Financial Event Model قبل از هر UI مالی، migration، auth/database change، adapter اجرایی یا اتصال پروژه پول باید به صورت مستند طراحی و تأیید شود. | فعال |
| ADR-021 | Product Adapter Boundary باید قبل از هر import، UI کالا یا migration اجرا شود؛ داده خام پروژه کالا نباید مستقیم وارد database اصلی شود. | فعال |
| ADR-022 | Product Import Validator و Duplicate Detector باید قبل از هر import واقعی، merge/update کالا، UI کالا یا Mahak Export Adapter طراحی و تأیید شوند. | فعال |

## چیزهایی که بدون تأیید مرکز کنترل نباید عوض شوند

- مسیرهای موجود در route manifest
- localStorage keyهای موجود
- schema مدل‌های اصلی WF
- سیاست backup/import/restore
- baseline checksum و رفتار legacy baseline
- قرارداد analyzerها و serviceها
- ساختار RTL/dark mode اصلی
- حذف یا reset داده کاربر
- اضافه کردن backend، Supabase، login یا sync واقعی
- تغییر auth اصلی
- تغییر database اصلی
- merge مستقیم `audit-app`
- merge مستقیم `mahak-web-version`
- ساخت UI مالی قبل از تأیید Core Financial Event Model و schema
- ساخت migration مالی قبل از اجازه مرکز فرمان
- تغییر auth یا RLS به بهانه اتصال مالی
- ساخت UI کالا قبل از تأیید Core Product Model و schema
- ساخت migration کالا قبل از اجازه مرکز فرمان
- import مستقیم داده کالا بدون normalize، validation و duplicate report
- merge یا update خودکار کالا بدون review و تصمیم مرکز فرمان
- ساخت Mahak Export Adapter قبل از validator و duplicate detector
- dependency مستقیم برنامه اصلی به فایل‌های قدیمی `mahak-web-version`
- تغییر نام شاخه‌های مادر یا کدهای branch registry

## قانون ثبت تصمیم جدید

هر تصمیم معماری جدید باید این موارد را داشته باشد:

1. شناسه ADR
2. تاریخ
3. مسئله
4. تصمیم
5. اثر روی route/storage/model/service/analyzer/UI
6. ریسک
7. تست یا build مرتبط
