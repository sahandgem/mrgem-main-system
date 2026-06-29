# Reporting View Layer and Read Model Strategy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند لایه گزارش‌گیری و read model آینده مستر جم را طراحی می‌کند. گزارش‌ها باید خواندنی، قابل drill-down و قابل audit باشند، اما نباید داده اصلی را تغییر دهند.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، localStorage یا view/query محک ایجاد نمی‌کند.

## Reporting View Layer چیست؟

`Reporting View Layer` لایه‌ای مفهومی برای ساخت گزارش، summary، dashboard و cockpit card از روی داده‌های تاییدشده، سندها، eventها، snapshotها و audit trail است. این لایه read-only است.

## چرا گزارش‌ها نباید مستقیماً منطق اصلی را تغییر دهند؟

- گزارش باید مشاهده و تحلیل باشد، نه منبع mutate.
- تغییر داده از داخل report باعث audit ضعیف و خطای مدیریتی می‌شود.
- logic اصلی باید در سند، event، import، approval و audit باقی بماند.
- گزارش‌ها ممکن است cache یا snapshot باشند و نباید truth اصلی را overwrite کنند.

## Read Model چیست؟

`Read Model` ساختار خواندنی برای نمایش و تحلیل است که از داده اصلی ساخته می‌شود. read model می‌تواند برای cockpit، report، AI summary یا manager dashboard استفاده شود، اما نباید جایگزین سند اصلی، event اصلی یا audit trail شود.

## گزارش‌های آینده

| گزارش | منبع مفهومی |
|---|---|
| `Financial Pressure Report` | FinancialDocument، FinancialEvent، LiquiditySignal، Audit Trail |
| `Cash-in/Cash-out Report` | FinancialEvent، BankMatchResult، ReceiptReviewResult |
| `Product Import Report` | Product import batch، duplicate warnings، staging decisions |
| `Inventory Shortage Report` | StockState، ShortageAlert، InventoryMovementDocument |
| `Production Cost Report` | ProductionDocument، ProductionCostEstimate، MaterialRequirementSignal |
| `Workforce Risk Report` | WorkforceRiskSignal، MonthlyHealthSnapshot، OperationalHistory |
| `Manager Review Report` | Review items، Manager decisions، audit trail |
| `Import Dry-run Report` | ImportBatch، staging status، dry-run items، risk summary |
| `Audit Trail Report` | Document audit، event audit، import audit، rollback audit |
| `Crisis Signal Report` | CrisisSignal، cross-module snapshots، risk flags |

## قوانین

- reporting layer فقط خواندنی است.
- گزارش نباید داده اصلی را mutate کند.
- گزارش باید از event، snapshot، document و audit data ساخته شود.
- گزارش AI باید source و confidence داشته باشد.
- report نباید query، view یا schema محک را کپی کند.
- هر drill-down باید به source، snapshot یا audit reference برسد.

## ارتباط با Cockpit

کارت‌های cockpit می‌توانند از read model تغذیه شوند، اما actionهای حساس باید به Manager Review، Import Gate یا Document Approval بروند، نه اینکه از خود report داده را تغییر دهند.

## محدودیت فعلی

این سند فقط strategy است. هیچ reporting table، materialized view، query، dashboard، route یا UI ساخته نمی‌شود.
