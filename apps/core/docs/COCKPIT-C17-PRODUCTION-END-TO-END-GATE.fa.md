# C17 — Production Operations End-to-End Gate

تاریخ: 2026-10-04

## هدف

اثبات مسیر کامل داده Production تا Command Center، بدون فعال‌سازی شبکه یا Production.

مسیر تست‌شده:

C16-shaped snapshot
→ ProductionOperationsSanitizedTransport
→ TransportModuleAdapter
→ Validation
→ Aggregation
→ CommandCenterViewModel

## تغییرات معماری

### Live registry injection

CommandCenterLiveDataSource اکنون می‌تواند registry صریح دریافت کند.

Default:
integrationModuleRegistry فعلی

بنابراین:
- Manager UI فعلی تغییر نمی‌کند.
- Mock route فعلی تغییر نمی‌کند.
- تست Live می‌تواند production.operations را بدون جایگزین‌کردن production.demo آزمایش کند.

### Data label

CommandCenterViewModel اکنون دو label مجاز دارد:

- DEMO/MOCK
- LIVE/READ-ONLY

Mock همچنان DEMO/MOCK است.

CommandCenterLiveDataSource همیشه LIVE/READ-ONLY تولید می‌کند.

این تغییر جلوی نمایش اشتباه داده Live با برچسب Mock را می‌گیرد.

## Production transport

ProductionOperationsSanitizedTransport فقط یک reader تزریق‌شده می‌پذیرد.

در C17:
- reader fixture است.
- fetch وجود ندارد.
- endpoint call وجود ندارد.
- credential وجود ندارد.

Transport:
- فقط moduleId = production.operations را می‌پذیرد.
- snapshot معتبر را با mapper C15 به ModuleObservationV1 تبدیل می‌کند.
- contract نامعتبر را validation failure می‌کند.
- exception خواندن را unavailable می‌کند.
- null را no_data می‌کند.

## E2E fixture

fixture شکل دقیق C16 را دارد:

production-operations-snapshot-v1

و countهای state machine واقعی Production را حمل می‌کند.

تست اثبات می‌کند:

- production.operations در ViewModel ظاهر می‌شود.
- reliability = fresh
- isExperimental = false
- KPI production_open_orders درست محاسبه می‌شود.
- KPI production_awaiting_qc_orders درست محاسبه می‌شود.
- dataLabel = LIVE/READ-ONLY
- C12 Live Gate بسته باشد reader اصلاً فراخوانی نمی‌شود.
- contract version خراب به healthy تبدیل نمی‌شود.

## نکته مهم

این C17 هنوز از HTTP واقعی استفاده نمی‌کند.

C16 producer واقعی است، اما در C17 فقط شکل قرارداد آن با fixture بازپخش می‌شود.

بنابراین هنوز:
- Production Runtime روشن نشده.
- Core fetch ندارد.
- browser network request ندارد.
- C12 Live Gate در UI فعال نشده.
- deploy انجام نشده.

## Gate نهایی

C17 کامل است اگر:

1. test:core PASS
2. build:core PASS
3. git diff --check PASS
4. Mock default behavior unchanged
5. C10 UI unchanged
6. Live source correctly labeled
7. custom live registry works without mutating global registry
8. C16 snapshot reaches Command Center through C13 boundary
9. closed Live Gate performs zero Production reads
10. malformed Production contract fails closed

## مرحله بعد

C18 فقط در صورت ادامه می‌تواند یک HTTP reader سروری/محدود برای C16 producer بسازد.

پیشنهاد C18:
- reader در browser نباشد.
- endpoint base URL و auth از trusted runtime تزریق شوند.
- localhost/read-only gate
- explicit enable flag
- timeout
- no retry loop
- no hidden mock fallback
- activation جدا از implementation

تا آن زمان Core UI روی Mock باقی می‌ماند.
