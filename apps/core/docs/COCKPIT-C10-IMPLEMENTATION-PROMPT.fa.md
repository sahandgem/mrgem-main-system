# C10 — متن آماده برای پیاده‌سازی Codex

این متن فقط handoff پیاده‌سازی است. تا زمانی که اجرای C10 صریحاً شروع نشده، کد را تغییر نده.

## مأموریت

طراحی نهایی Cockpit را از Penpot به Core منتقل کن؛ بدون بازنویسی منطق داده و بدون تغییر دامنه‌های خارج از `apps/core`.

مرجع اصلی طراحی:
- `COCKPIT-C10-FINAL-DESIGN-HANDOFF.fa.md`

بردهای نهایی Penpot:
- `Cockpit Final — Reference Match`
- `Cockpit Final — Detail Drawer`
- `Cockpit Final — Mobile Scroll`
- `Cockpit Final — Mobile Viewport 420x800`
- `Cockpit Final — Critical State`

## نقطه شروع

Repo:
`C:\Users\danesh\Documents\MasterGem-Dev\Core`

Branch:
`codex/dev-core`

Baseline HEAD:
`cc3c3fb`

قبل از هر تغییر:
1. `git status --short`
2. `git diff -- apps/core/src/components/commandCenter/CommandCenterAttentionQueue.tsx apps/core/src/styles.css`
3. تغییرات موجود را حفظ کن؛ reset / checkout / overwrite نکن.

تغییرات از قبل موجود:
- `apps/core/src/components/commandCenter/CommandCenterAttentionQueue.tsx`
- `apps/core/src/styles.css`
- `apps/core/docs/COCKPIT-C9-VALIDATION-REPORT.fa.md`

## محدوده مجاز

فقط:
- `apps/core/src/**`
- تست‌های مرتبط Core در صورت نیاز
- مستندات `apps/core/docs/**`

ممنوع:
- `apps/workforce`
- `packages/module-contracts`
- P06
- MAHAK-GATE
- Mahak واقعی
- Production API / DB / localStorage
- adapter واقعی
- destructive migration
- تغییر route یا contract بدون نیاز مستقیم و مستند

## اصول غیرقابل مذاکره

- UI فارسی
- Core فقط inspect / navigate، نه اجرای عملیات
- Business Health مستقل از Data Health
- Unknown / Stale / Partial / Error / Not Connected / Zero از هم متمایز
- Production همچنان «آزمایشی»
- Dev mock controls فقط در `/__dev/command-center`
- Manager view در `/`
- Click / Enter / Space / Esc و بازگشت focus سالم
- Drawer واحد، بدون nested drawer
- Mobile = Commander Feed، نه desktop کوچک‌شده

## ترتیب اجرا

1. tokenهای Visual C10 و surfaceها
2. Desktop shell دقیق 1365×768
3. KPIهای مرکزی و Command Center
4. Attention rows
5. Workforce / Production
6. Vital + Important Changes
7. Detail Drawer
8. Mobile 420
9. Critical / Stale / Partial / Error
10. accessibility + responsive regression

در هر مرحله منطق ViewModel فعلی را تا حد ممکن دست‌نخورده نگه دار.

## معیار ظاهری

- dark premium command-center
- Cyan برای Workforce
- Purple برای Production
- Red برای Critical
- Amber برای Warning
- Green برای Healthy / trust
- Glow کنترل‌شده روی ring / edge / signal / CTA مهم
- mini bars / instrument graphics مجاز و مطلوب
- no generic SaaS card wall
- no giant website hero
- متن اصلی را برای جا شدن بی‌رویه کوچک نکن

رنگ‌های مرجع:
`#29AFFF`, `#B26BFF`, `#43E394`, `#FF5D6D`, `#FF7A5D`, `#FFB84F`.

## تست اجباری

پس از هر checkpoint معنادار:
- `npm run test:core`
- `npm run build:core`
- `git diff --check`

و بررسی دستی viewport:
- 1365×768
- 1440×800
- 1920×960
- 1920×1080
- 720
- 420×800

Gate:
- desktop page scroll = 0 در target
- Vital کامل
- 3 Attention کامل در 1365×768
- mobile nested scroll = 0
- drawer reflow = 0
- هیچ label فنی انگلیسی ناخواسته در UI
- focus-visible واضح
- no TypeScript/build regression

## خروجی

در پایان هر مرحله گزارش کوتاه بده:
- فایل‌های تغییرکرده
- نتیجه تست
- وضعیت viewport
- موارد باقیمانده

بدون push / merge مگر با اجازه جداگانه.
