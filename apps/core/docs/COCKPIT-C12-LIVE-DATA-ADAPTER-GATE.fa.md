# C12 — Live Data Adapter Gate

تاریخ: 2026-10-04

## هدف

آماده‌سازی مرز اتصال واقعی برای Core Command Center، بدون فعال‌کردن هیچ اتصال واقعی.

C12 یک مسیر Live از نظر معماری ایجاد می‌کند، اما این مسیر به‌صورت پیش‌فرض بسته و fail-closed است.

## اصول

- مسیر پیش‌فرض Runtime همچنان Mock است.
- Live source حق ندارد خودش fetch، Supabase، Mahak، Database یا localStorage را ایجاد کند.
- Live source فقط ModuleReadAdapterهای تزریق‌شده را می‌پذیرد.
- اگر Gate بسته باشد، هیچ Adapter خوانده نمی‌شود.
- انتخاب Live بدون Gate باز باید با خطای کنترل‌شده متوقف شود.
- UI نباید برای Live/Mock بازنویسی شود.
- قراردادهای packages/module-contracts تغییر نمی‌کنند.

## مسیر داده

Mock:
MockModuleAdapter
→ Validation
→ Aggregation
→ ViewModel
→ Runtime
→ UI

Live آینده:
External Transport Adapter
→ ModuleReadAdapter
→ Validation
→ Aggregation
→ ViewModel
→ Runtime
→ UI

در C12 فقط بخش LiveDataSource و Gate ساخته می‌شود؛ External Transport Adapter واقعی خارج از Scope است.

## Live Gate

Live source دو ورودی دارد:

- enabled
- adapters

قاعده:
- enabled=false → read فوراً fail-closed
- enabled=true → فقط Adapterهای تزریق‌شده خوانده می‌شوند
- source هیچ endpoint یا credential نمی‌شناسد

## Runtime Environment

Runtime Environment باید دو mode را بشناسد:

- mock
- live

Default:
- mock

برای mode=live:
- اگر Live config صریح داده نشده باشد Gate بسته می‌ماند
- هیچ fallback مخفی به network وجود ندارد

## امنیت معماری

در C12 ممنوع:

- fetch
- XMLHttpRequest
- WebSocket
- EventSource
- Supabase client
- database connection
- localStorage/sessionStorage
- Mahak direct import
- Production direct import
- write operation

## تست‌های Gate

1. Default runtime environment = mock
2. Live source با gate بسته → error
3. Gate بسته → adapter read count = 0
4. Live source با gate باز و adapter تزریق‌شده → ViewModel معتبر
5. Live mode بدون config → fail-closed
6. Runtime روی live بسته → error بدون snapshot جعلی
7. sourceKind در Runtime درست باقی بماند
8. هیچ network/storage جدید در Core اضافه نشود
9. test:core PASS
10. build:core PASS
11. git diff --check PASS

## خارج از Scope

- endpoint واقعی
- credential
- authentication
- Mahak transport
- Production transport
- Supabase
- realtime
- polling
- retry/backoff شبکه
- persistence
- deployment config

## خروجی C12

بعد از C12، اتصال واقعی می‌تواند در فاز بعد فقط با ساخت یک ModuleReadAdapter واقعی و تزریق آن پشت Gate انجام شود؛ Cockpit، Runtime، Aggregation و ViewModel نباید تغییر معماری کنند.
