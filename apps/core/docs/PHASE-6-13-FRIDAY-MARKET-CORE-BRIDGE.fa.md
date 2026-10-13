# Phase 6.13 — اتصال جمعه‌بازار به Core

## هدف

خروجی فقط‌خواندنی جمعه‌بازار از audit-app وارد Integration Backbone فعلی Core
شود؛ بدون import بین پروژه‌ها و بدون دسترسی مستقیم Core به دیتابیس مالی.

## نگاشت مدیریتی

- Action و Attention به Alert استاندارد Core تبدیل می‌شوند و وارد «نیازمند توجه» می‌شوند.
- Insight به KPI اطلاعاتی دارای comparison تبدیل می‌شود و در «تغییرهای مهم» دیده می‌شود.
- منطق مالی، آستانه‌ها و تصمیم‌گیری همچنان در audit-app می‌مانند.
- Core فقط validate، aggregate، rank و نمایش می‌کند.

## فعال‌سازی

دو تنظیم غیرمحرمانه لازم است:
- `VITE_FRIDAY_MARKET_CORE_ENDPOINT`
- `VITE_AUDIT_APP_AUTHORIZE_URL`

تا قبل از اتصال کاربر، Core همان Mock فعلی را نگه می‌دارد و ماژول مالی جعلی نمی‌سازد.
## امنیت

دکمه «اتصال حسابداری» صفحه authorize خود audit-app را باز می‌کند.
audit-app فقط access token همان کاربر واردشده را با `postMessage` و origin دقیق
به Core برمی‌گرداند. refresh token منتقل نمی‌شود.

توکن فقط در حافظه همان صفحه Core نگه داشته می‌شود؛ در localStorage یا
sessionStorage ذخیره نمی‌شود و با Reload از بین می‌رود.

HTTP adapter فقط GET دارد. هیچ write/execute API، Service Role یا دسترسی مستقیم
به Supabase در Core اضافه نشده است.

## گیت پذیرش

1. payload معتبر وارد validator/aggregator شود.
2. خطای transport فقط همان ماژول را unavailable کند.
3. Action/Attention در Attention Queue ظاهر شوند.
4. Insight وارد Attention Queue نشود و به‌صورت تغییر مهم باقی بماند.
5. بدون توکن، هیچ درخواست شبکه‌ای از adapter ارسال نشود.