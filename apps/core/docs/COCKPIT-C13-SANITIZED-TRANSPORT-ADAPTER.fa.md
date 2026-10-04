# C13 — Sanitized Transport Adapter / اولین مرز Transport

تاریخ: 2026-10-04

## تصمیم

بررسی قراردادهای موجود Production Center نشان می‌دهد شکل endpoint، payload واقعی Core/Mahak، identifierها، authorization و schema عملیاتی هنوز تأیید نشده‌اند.

بنابراین C13 نباید payload یا endpoint واقعی اختراع کند.

C13 فقط مکانیزم transport را می‌سازد:

External/Trusted Source
→ Sanitized Transport
→ TransportModuleAdapter
→ existing Validation
→ Aggregation
→ ViewModel
→ Runtime
→ Cockpit

## چرا این مسیر

اسناد موجود صریحاً می‌گویند:
- raw source payload نباید مستقیم وارد UI شود.
- endpoint و schema واقعی هنوز UNKNOWN هستند.
- اولین اتصال production باید read-only باشد.
- real failure نباید با mock به‌صورت مخفی پر شود.
- write و direct database access ممنوع است.

پس در C13:
- transport interface واقعی و قابل‌جایگزینی ساخته می‌شود.
- adapter واقعی از نظر معماری ساخته می‌شود.
- implementation فعال فقط fixture/in-memory است.
- هیچ network client ساخته نمی‌شود.

## قرارداد Transport

Transport فقط snapshot sanitize‌شده تحویل می‌دهد و یکی از این نتایج را برمی‌گرداند:

- payload
- no_data
- unavailable

Transport:
- business logic ندارد.
- view model نمی‌سازد.
- payload را معتبر فرض نمی‌کند.
- validation نهایی همچنان در Core انجام می‌شود.

## TransportModuleAdapter

وظیفه:
- moduleId و adapterKey ثابت دارد.
- transport را صدا می‌زند.
- نتیجه transport را به AdapterReadResult تبدیل می‌کند.
- raw error/stack را به UI عبور نمی‌دهد.
- write ندارد.

## Fixture Transport

فقط برای automated test و integration rehearsal است.

ویژگی:
- in-memory
- deterministic
- بدون fetch
- بدون database
- بدون localStorage
- بدون credential

Fixture می‌تواند:
- payload معتبر بدهد.
- no_data بدهد.
- unavailable بدهد.
- payload malformed بدهد تا validator موجود آن را رد کند.

## ارتباط با C12

C12 LiveDataSource فقط adapter تزریق‌شده می‌پذیرد.

C13 adapter جدید را به همان LiveDataSource تزریق می‌کند؛ بنابراین:
- Live Gate همچنان باید صریحاً باز باشد.
- default runtime همچنان Mock است.
- UI هیچ تغییر معماری نمی‌کند.

## محدودیت دامنه

این C13 ادعا نمی‌کند:
- Mahak endpoint مشخص شده.
- Production endpoint مشخص شده.
- Product Monitoring contract executable شده.
- authentication مشخص شده.
- identifier semantics تأیید شده.

این موارد طبق قراردادهای موجود هنوز blocking هستند.

## Gate

C13 کامل است اگر:

1. fixture transport payload معتبر → LiveDataSource → ViewModel معتبر
2. no_data → no_data semantics
3. unavailable → error/data-health semantics
4. malformed payload → existing validator rejects
5. adapter هیچ write surface نداشته باشد
6. closed C12 gate همچنان transport را صدا نزند
7. هیچ fetch/network/storage/database جدیدی وارد Core نشود
8. test:core PASS
9. build:core PASS
10. git diff --check PASS

## خارج از Scope

- BFF واقعی
- HTTP endpoint
- Mahak route
- Production Center route
- Supabase
- credentials
- authentication
- authorization implementation
- retry/backoff
- polling
- WebSocket
- write command
