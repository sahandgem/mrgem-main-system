# Product Import Implementation Hold Policy

آخرین به‌روزرسانی: 2026-06-29

## وضعیت Hold

اجرای واقعی Product Import تا اطلاع بعدی **ممنوع** است. وضعیت فعلی فقط `architecture/design-ready` و `Design Lab planning approved` است؛ prototype build و implementation تایید نشده‌اند.

## Implementation Hold Policy چیست؟

سیاستی رسمی برای جلوگیری از تبدیل زودهنگام اسناد و mockهای طراحی به کد، storage، route یا import واقعی است. Hold فقط با تصمیم صریح و ثبت‌شده مرکز کنترل آزاد می‌شود.

## فعالیت‌های تحت Hold

- ساخت prototype واقعی یا اپ نمایشی اجرایی.
- نوشتن parser، mapper، validator، gate یا import runtime.
- ساخت UI/component اجرایی.
- ایجاد route، localStorage key، API یا database.
- ساخت migration یا تغییر auth.
- استفاده از داده واقعی کالا، مشتری، مالی یا محک.
- اتصال به main app یا production storage.
- ساخت repo جدید برای prototype بدون مجوز.

## شرایط لازم برای آزادشدن Implementation

| شرط | وضعیت لازم |
|---|---|
| Design Lab concept | approved |
| Synthetic flow | approved |
| Isolated prototype approval | explicitly issued |
| Mock dataset | approved and versioned |
| Test plan | approved |
| Rollback plan | approved |
| Storage boundary | approved |
| Main integration plan | approved |
| Manager approval flow | approved |
| Security/auth boundary | reviewed |
| Ownership and repository | explicitly assigned |

برآورده‌شدن شرط‌ها به‌صورت پراکنده کافی نیست؛ یک Implementation Approval Gate نهایی باید صادر شود.

## Blockerهای فعلی

- isolated prototype repo/app تایید نشده است.
- real storage boundary تایید نشده است.
- import runtime تایید نشده است.
- UI implementation تایید نشده است.
- migration تایید نشده است.
- real Mahak data import تایید نشده است.
- security، auth و production integration plan اجرایی تایید نشده‌اند.

## فرآیند درخواست رفع Hold

1. Design Lab package تکمیل و review شود.
2. synthetic scenario coverage و expected results ارائه شوند.
3. prototype scope، owner، location و isolation controls پیشنهاد شوند.
4. test، rollback، security و storage plan بررسی شوند.
5. مرکز کنترل تصمیم `APPROVED`، `APPROVED_WITH_CONDITIONS` یا `REJECTED` ثبت کند.
6. فقط یک دستور اجرایی مستقل می‌تواند hold را برای scope مشخص آزاد کند.

## قواعد

- هرگونه ساخت واقعی باید با دستور مستقل مرکز کنترل انجام شود.
- approval طراحی به معنی approval prototype یا implementation نیست.
- سکوت، backlog entry یا readiness report مجوز اجرا محسوب نمی‌شود.
- approval باید scope، files/repo، data boundary، owner و expiration/review point داشته باشد.
- هر اقدام خارج از scope باعث توقف و بازگشت به مرکز کنترل می‌شود.

## مواردی که حتی پس از Prototype نیازمند Approval جدا هستند

- اتصال به main.
- استفاده از داده واقعی.
- migration یا database change.
- auth/role enforcement.
- route/UI integration.
- import/export واقعی محک.
- production persistence.

## محدودیت فعلی

این policy فقط سند است و هیچ مکانیزم اجرایی، guard، CI rule، prototype، UI، route، database یا storage ایجاد نمی‌کند.
