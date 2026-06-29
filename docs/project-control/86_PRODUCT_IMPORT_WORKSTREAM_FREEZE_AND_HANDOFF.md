# Product Import Workstream Freeze and Handoff

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند freeze موقت workstream ورود کالا را ثبت می‌کند. freeze به معنی توقف implementation است، نه حذف دانش یا بستن مسیر Design Lab.

## Workstream Freeze چیست؟

Workstream Freeze یعنی یک مسیر کاری پس از رسیدن به نقطه آماده‌سازی مستند، برای جلوگیری از ساخت زودهنگام و تغییر ناخواسته main app متوقف می‌شود. در این وضعیت فقط handoff، review و تصمیم مرکز کنترل مجاز است.

## چرا Product Import فعلاً freeze می‌شود؟

- بسته معماری و concept ورود کالا به اندازه کافی برای Design Lab آماده شده است.
- ساخت زودهنگام prototype یا UI می‌تواند main app را قبل از approval آلوده کند.
- هنوز storage، database، auth، migration، route و integration plan اجرایی تایید نشده‌اند.
- فقط داده synthetic/mock مجاز است و هیچ داده واقعی نباید وارد جریان شود.
- Design Lab باید rulebook و screen spec را بررسی کند، نه اینکه خروجی اجرایی بسازد.

## وضعیت freeze

| مورد | وضعیت |
|---|---|
| Status | FROZEN_FOR_IMPLEMENTATION |
| Allowed | Design Lab handoff only |
| Not Allowed | prototype/build/main integration |

## Handoff به Design Lab

Handoff باید شامل این منابع باشد:

- `82_PRODUCT_IMPORT_DESIGN_LAB_CONCEPT_PACKAGE.md`
- `83_PRODUCT_IMPORT_FLOW_MAP_AND_SCREEN_CONCEPTS.md`
- `84_PRODUCT_IMPORT_MOCK_SCENARIO_STORYBOARD.md`
- `76_PRODUCT_IMPORT_PROTOTYPE_CHARTER.md`
- `77_PRODUCT_IMPORT_SYNTHETIC_DATA_PROTOCOL.md`
- `78_PRODUCT_IMPORT_PROTOTYPE_ISOLATION_BOUNDARY.md`
- `80_PRODUCT_IMPORT_DESIGN_LAB_TRANSITION_PLAN.md`
- `81_PRODUCT_IMPORT_IMPLEMENTATION_HOLD_POLICY.md`

## قانون handoff

- Design Lab فقط با mock/synthetic data کار می‌کند.
- هیچ خروجی Design Lab بدون approval مستقل وارد main نمی‌شود.
- freeze فقط با دستور مستقل مرکز کنترل برداشته می‌شود.
- handoff به معنی permission برای ساخت prototype واقعی نیست.
- هر خروجی future باید به عنوان concept، spec یا review note تحویل داده شود، نه کد اجرایی.

## وضعیت خروج از freeze

خروج از freeze فقط زمانی ممکن است که مرکز کنترل یک فاز مستقل با scope روشن، test plan، rollback plan، storage boundary، security boundary و approval صریح برای prototype یا implementation صادر کند.
