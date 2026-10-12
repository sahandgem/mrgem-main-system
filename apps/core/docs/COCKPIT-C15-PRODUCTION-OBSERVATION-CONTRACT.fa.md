# C15 — Production Operations Observation Contract

تاریخ: 2026-10-04

## هدف

تعریف اولین contract واقعی مخصوص Cockpit بر پایه داده‌ای که Production Center واقعاً مالک و اجراکننده آن است.

C15 هنوز network endpoint یا Production activation ایجاد نمی‌کند.

## منبع قابل اتکا

Production Center دارای production_orders واقعی در PostgreSQL و state machine اجرایی زیر است:

- draft
- reservation_pending
- reserved
- released
- issue_pending
- in_progress
- awaiting_qc
- completion_pending
- completed
- cancelled

این state set در migration و production-order execution contract enforce شده است.

## اصل C15

Core نباید برای اولین اتصال:
- order ID دریافت کند
- product ID دریافت کند
- raw order row دریافت کند
- priority یا delay استنتاج کند
- plan attainment بسازد
- risk score بسازد

اولین DTO فقط aggregate countهای وضعیت را حمل می‌کند.

## DTO پیشنهادی

production-operations-snapshot-v1

فیلدها:

- contractVersion
- generatedAt
- sourceDataUpdatedAt
- counts
  - draft
  - reservationPending
  - reserved
  - released
  - issuePending
  - inProgress
  - awaitingQc
  - completionPending
  - completed
  - cancelled

تمام countها:
- integer
- non-negative
- organization-scoped
- از یک snapshot واحد
- بدون pagination
- بدون hidden fallback

## KPIهای مجاز

### سفارش‌های باز

تعریف دقیق:

reservation_pending
+ reserved
+ released
+ issue_pending
+ in_progress
+ awaiting_qc
+ completion_pending

draft حذف می‌شود چون هنوز وارد اجرای واقعی نشده است.
completed و cancelled terminal هستند.

Key:
production_open_orders

Severity:
normal

هیچ threshold مدیریتی در C15 تعریف نمی‌شود.

### در حال اجرا

فقط:
in_progress

Key:
production_in_progress_orders

Severity:
normal

### منتظر کنترل کیفیت

فقط:
awaiting_qc

Key:
production_awaiting_qc_orders

Severity:
info اگر count > 0
normal اگر صفر

وجود QC pending به‌تنهایی warning یا critical نیست.

### در انتظار تأیید یکپارچه‌سازی

مجموع:

reservation_pending
+ issue_pending
+ completion_pending

این stateها مطابق state machine منتظر acknowledgement مسیر بیرونی هستند.

Key:
production_integration_pending_orders

Severity:
info اگر count > 0
normal اگر صفر

بدون SLA یا timeout policy، این مقدار warning/critical نمی‌شود.

## موارد عمداً ممنوع

- delayed order
- overdue
- plan attainment
- material risk
- production priority
- SLA breach
- bottleneck
- throughput target
- output today

تا زمانی که business semantics و source contract مستقل نداشته باشند.

## Module Observation

moduleId:
production.operations

moduleType:
production

sourceSystem:
master-gem-production-center

ownership:
- businessTruthOwner = master-gem-production-center
- isDerived = true
- derivationId = production-order-state-counts
- derivationVersion = 1

capabilities:
- health.read
- kpi.read

alerts:
در C15 تولید نمی‌شود.

## Validation

رد شود اگر:
- contractVersion ناشناخته باشد
- timestamp نامعتبر باشد
- count منفی/اعشاری/NaN باشد
- count لازم وجود نداشته باشد
- field status ناشناخته جایگزین countهای مصوب شود

## Activation

C15 فقط contract و pure mapper است.

فعال‌سازی واقعی نیازمند C16:
Production Center read producer/BFF
→ sanitized snapshot
→ C13 Transport
→ production.operations adapter
→ Core

C12 Live Gate تا آن زمان بسته می‌ماند.
