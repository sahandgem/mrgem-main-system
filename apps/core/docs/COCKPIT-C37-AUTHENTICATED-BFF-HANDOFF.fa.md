# C37 — قرارداد درخواست احرازشده به BFF

تاریخ: 2026-10-09

## هدف

آماده‌کردن مسیر امن درخواست فقط‌خواندنی از Core به BFF با توکن دسترسی کاربر، بدون راه‌اندازی شبکه واقعی، Supabase، BFF یا داده زنده.

این فاز فقط قرارداد Executor تزریقی، adapter و تست‌های مصنوعی را اضافه می‌کند.

## وضعیت پیش‌فرض

- مسیر اصلی Core همچنان بدون Auth واقعی است.
- `main.tsx` هیچ provider یا Runtime واقعی تزریق نمی‌کند.
- مسیر توسعه Mock از مسیر مدیر جدا می‌ماند.
- هیچ fetch، XMLHttpRequest یا WebSocket به Core اضافه نشده است.
- هیچ اتصال واقعی به Mahak، Production Runtime، Supabase یا BFF انجام نشده است.

## لایه‌ها

1. `CoreAuthProvider.getAccessToken()` از C36: فقط Access Token نشست موجود را می‌دهد.
2. `createAuthenticatedBffJsonReader()`: درخواست فقط GET و هدرهای مجاز را می‌سازد.
3. `BffRequestExecutor.execute(request)`: مرز تزریقی اجرای درخواست، بدون implementation شبکه در C37.
4. `createAuthenticatedProductionOperationsReader()`: خواننده مسیر ثابت Production BFF.
5. `ProductionOperationsSanitizedTransport`: تبدیل Snapshot معتبر به Observation تولید.

## مسیر مجاز

`GET /api/command-center/production-operations`

مسیر باید نسبی و از خانواده `/api/` باشد.

موارد زیر رد می‌شوند:
- URL با host یا protocol
- protocol-relative URL
- traversal و بخش `..`
- query و fragment
- مسیر خارج از `/api/`

مسیر واقعی Production برای reader ثابت است؛ ورودی متغیر از کاربر دریافت نمی‌کند.

## هدرهای خروجی

فقط:

`Accept: application/json`

`Authorization: Bearer <access_token>`

به شکل عمدی وجود ندارند:
- Refresh Token
- Cookie ساختگی
- x-role
- x-capability
- x-organization-id
- شناسه دسترسی ادعایی از مرورگر

اگر Access Token موجود یا معتبر از نظر قالب نباشد، Executor فراخوانی نمی‌شود.

## وضعیت پاسخ

- 200: payload ناشناس به اعتبارسنجی قرارداد Snapshot تحویل می‌شود.
- 401: unauthorized؛ اگر درخواست هنوز متعلق به توکن فعال باشد، signOut برای بازگشت به صفحه ورود اجرا می‌شود.
- 403: forbidden؛ نشست کاربر حذف نمی‌شود؛ فقدان مجوز با فقدان هویت یکی نیست.
- 404: not_found
- 409: contract_mismatch
- 400/422: validation
- 504: timeout
- 5xx: unavailable
- سایر پاسخ‌ها: unknown

خطای خام executor یا upstream به UI منتقل نمی‌شود.

## محافظت در برابر 401 دیرهنگام

اگر حین یک درخواست، توکن C36 عوض شود و پاسخ 401 متعلق به توکن قدیمی برسد، توکن جدید با signOut اشتباهی لغو نمی‌شود.

نتیجه همان درخواست قدیمی همچنان unauthorized است و داده آن نمایش داده نمی‌شود.

## مرز Snapshot

`authenticatedProductionOperationsReader` تنها مسیر از پیش تعریف‌شده Production BFF را می‌خواند.

`ProductionOperationsSanitizedTransport`:
- برای شناسه‌ای غیر از `production.operations` خطای contract_mismatch می‌دهد.
- Snapshot را قبل از نمایش به Observation استاندارد تبدیل می‌کند.
- Snapshot خراب را به‌عنوان داده معتبر نشان نمی‌دهد.
- unauthorized و سایر دسته خطاهای امن را حفظ می‌کند.

## تست

`apps/core/tests/authenticatedBffRequest.test.ts`

تست‌های C37 شامل:
- بدون توکن: صفر Executor call
- درخواست GET با دو هدر مجاز
- عدم ارسال Refresh Token و header مجوز ساختگی
- 401: signOut و برگشت به وضعیت unauthenticated
- 401 دیرهنگام: نشست با توکن جدید محفوظ
- 403: بدون signOut
- خطاهای HTTP به دسته‌های مشخص
- خطای Executor و AuthProvider بدون نشت جزئیات
- رد مسیرهای خارجی و آلوده
- snapshot معتبر و Observation
- propagation خطا در transport
- سازگاری با Workspace Boundary

## مواردی که عمداً انجام نشده‌اند

- implementation شبکه‌ای `BffRequestExecutor`
- ساخت Supabase browser client واقعی
- نصب credential در Core
- فعال‌سازی Auth یا Live Runtime
- migration، role assignment یا فعال‌کردن Supabase Production
- push، merge یا deploy

## گام بعد

C38 — Authenticated Live Runtime Gate:

اتصال قراردادهای آماده C36 و C37 به Runtime تزریقی در سطح Composition، با تست مستقل اینکه runtime آزمایشی هرگز روی مسیر مدیر بالا نمی‌آید و Auth/Live/BFF gateها پیش‌فرض بسته می‌مانند.

هر اتصال شبکه‌ای یا استفاده از داده Production باید جداگانه بررسی و تأیید شود.
