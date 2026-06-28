# Parallel Workstream And Repo Strategy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند استراتژی تقسیم کار آینده مستر جم بین چند workstream، چند repo و چند Codex را ثبت می‌کند. این کار فقط مستندسازی و برنامه‌ریزی است و هیچ repo جدید، کد اجرایی، route، UI، localStorage key، database یا migration ایجاد نمی‌کند.

## چرا باید پروژه به چند workstream تقسیم شود؟

پروژه مستر جم در حال تبدیل شدن به یک سیستم‌عامل عملیاتی چندشاخه است. اگر همه شاخه‌ها همزمان در repo اصلی و روی فایل‌های مشترک کار کنند، خطرهای زیر بالا می‌رود:

- خراب شدن پروژه اصلی
- conflict روی فایل‌های مشترک
- قاطی شدن مدل‌های کالا، مالی، نیروی انسانی و UI
- ورود زودهنگام migration یا auth/database change
- merge مستقیم زیرپروژه‌ها
- دشوار شدن rollback

بنابراین repo اصلی باید پایدار بماند و workstreamهای آزمایشی در labهای جدا طراحی و آزمایش شوند.

## نقش repo اصلی

| repo | نقش |
|---|---|
| `mrgem-main-system` | پروژه اصلی و پایدار مستر جم؛ فقط خروجی‌های تأییدشده، کوچک، قابل rollback و دارای docs وارد آن می‌شوند. |

قانون repo اصلی:

- مرکز حقیقت اجرایی فعلی است.
- route، localStorage، database، auth و مدل‌های اصلی فقط با تأیید مرکز فرمان تغییر می‌کنند.
- زیرپروژه‌ها مستقیم merge نمی‌شوند.
- هر تغییر باید کوچک، قابل فهم و قابل بازگشت باشد.

## نقش repoهای آینده

| repo آینده | نقش پیشنهادی | وضعیت |
|---|---|---|
| `mrgem-product-lab` | آزمایش مدل کالا، validator، duplicate detector، Mahak export و AI product snapshot | آینده / lab |
| `mrgem-finance-lab` | آزمایش مدل مالی، liquidity، approval workflow، receipt flow و bank mapping | آینده / lab |
| `mrgem-design-lab` | آزمایش UI/UX، cockpit، dashboard cards، design tokens و component patterns | آینده / lab |
| `mrgem-mobile-lab` | آزمایش app موبایل، receipt capture، mobile screens و sync concepts | آینده / lab |
| `mrgem-production-inventory-lab` | آزمایش production flow، inventory model، stock events و warehouse screens | آینده / lab |

هیچ‌کدام از repoهای lab نباید مستقیم و کامل وارد `mrgem-main-system` شوند. فقط ایده، schema، model، pattern یا component تأییدشده بعداً با فاز کنترل‌شده وارد main می‌شود.

## نقش هر Codex

| Codex | محدوده مجاز |
|---|---|
| Codex - کد اصلی | نگهداری repo اصلی، refactorهای کوچک، docs/project-control، verify، commit و push کنترل‌شده |
| Codex - کالا | طراحی و آزمایش Product lab؛ schema، validator، duplicate، Mahak export و AI snapshot در محدوده lab |
| Codex - پول | طراحی و آزمایش Finance lab؛ financial event، liquidity، approval، receipt و bank mapping در محدوده lab |
| Codex - دیزاین | طراحی Design lab؛ UX patterns، cockpit، cards، tokens و component patterns بدون دست زدن به main |
| Codex - موبایل در آینده | طراحی Mobile lab؛ receipt capture، mobile screens و sync concepts پس از مشخص شدن مدل‌ها |

## قانون اصلی کار همزمان

هیچ دو Codex نباید همزمان یک فایل مشترک را تغییر دهند.

قواعد عملی:

- هر Codex قبل از شروع باید محدوده فایل‌های مجاز را اعلام یا از دستور مرکز فرمان بگیرد.
- اگر یک فایل در حال تغییر توسط Codex دیگر است، کار باید متوقف شود.
- تغییرات docs و کد اجرایی نباید بدون ضرورت در یک commit مخلوط شوند.
- هر workstream باید خروجی قابل review بدهد، نه merge بزرگ.
- main فقط از مسیر commitهای کوچک و تأییدشده به‌روزرسانی شود.

## Design Lab

`mrgem-design-lab` باید جدا از main باشد.

هدف Design Lab طراحی UI/UX و کشف الگوهاست، نه تغییر مستقیم محصول اصلی.

محدوده Design Lab:

- cockpit
- dashboard cards
- product pages
- finance pages
- production/inventory pages
- mobile screens
- design tokens
- component patterns

قواعد Design Lab:

- خروجی Design Lab مستقیم merge نشود.
- فقط pattern یا component تأییدشده بعداً وارد main شود.
- قبل از ورود به main باید با RTL، dark mode، dashboard cockpit و محدودیت‌های معماری اصلی سازگار شود.
- اگر component نیاز به route/storage/model جدید دارد، باید فاز جدا با تأیید مرکز فرمان داشته باشد.

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی `Product Import Decision Flow` یا `Financial Schema Draft` است. اگر قرار است labها ساخته شوند، ابتدا باید repo creation و ownership با تصمیم مرکز فرمان انجام شود، نه توسط Codex در این فاز.
