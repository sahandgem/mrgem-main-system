# Module Data Producer Consumer Contracts

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مشخص می‌کند هر ماژول مستر جم در آینده چه داده‌ای تولید می‌کند، چه داده‌ای مصرف می‌کند و چه مرزی باید بین داده خام، signal، snapshot و decision وجود داشته باشد.

این سند فقط طراحی قرارداد داده است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## اصل قرارداد

- هر ماژول مالک داده اصلی خودش است.
- ماژول‌ها نباید داده خام یکدیگر را مستقیم mutate کنند.
- تبادل داده باید از طریق reference، signal، snapshot یا approved import انجام شود.
- هر خروجی بین‌ماژولی باید source، version، validation status و confidence داشته باشد.

## Finance

| نقش | داده |
|---|---|
| تولید می‌کند | `FinancialEvent`، `ReceiptReviewResult`، `BankMatchResult`، `LiquiditySignal`، `ApprovalDecision` |
| مصرف می‌کند | `ProductReference`، `EmployeeReference`، `ProductionCostSignal`، `BankExcelInput`، `MobileReceiptInput` |

Finance باید رویداد مالی و سیگنال نقدینگی تولید کند، اما ورودی‌های خارجی مثل Excel بانک و رسید موبایل باید ابتدا از staging و validation عبور کنند.

## Product

| نقش | داده |
|---|---|
| تولید می‌کند | `ProductNormalizedRecord`، `DuplicateProductWarning`، `MahakExportPreview`، `ProductAISnapshot` |
| مصرف می‌کند | `StoneBankInput`، `GroupCodeInput`، `MahakExcelInput`، `InventoryReference` |

Product باید ورودی کالا، بانک سنگ و گروه‌ها را normalize کند و قبل از هر export یا inventory readiness، duplicate و conflict را گزارش دهد.

## Production

| نقش | داده |
|---|---|
| تولید می‌کند | `ProductionOrderSignal`، `MaterialRequirementSignal`، `ProductionCostEstimate`، `ProductionAnomalyWarning` |
| مصرف می‌کند | `ProductReference`، `InventoryStockState`، `FinancialCostRule` |

Production از مدل کالا، موجودی و قاعده هزینه مالی استفاده می‌کند و خروجی آن باید به inventory و finance signal بدهد، نه اینکه مستقیماً داده آن‌ها را تغییر دهد.

## Inventory

| نقش | داده |
|---|---|
| تولید می‌کند | `StockState`، `ShortageAlert`، `InventoryMismatchWarning`، `ReorderSuggestion` |
| مصرف می‌کند | `ProductReference`، `ProductionRequirement`، `PurchaseFinancialSignal` |

Inventory وضعیت موجودی، کمبود و مغایرت را تولید می‌کند و می‌تواند به finance یا cockpit هشدار بدهد، اما خرید یا پرداخت را مستقیم ایجاد نمی‌کند.

## Workforce

| نقش | داده |
|---|---|
| تولید می‌کند | `WorkforceRiskSignal`، `MonthlyHealthSnapshot`، `PreventiveAlert` |
| مصرف می‌کند | `OperationalHistory`، `AttendanceOrPerformanceInput`، `ManagerDecisionInput` |

Workforce ریسک عملیاتی و سلامت برنامه را تحلیل می‌کند. هر ورودی attendance/performance آینده باید boundary مستقل و policy روشن داشته باشد.

## Mobile

| نقش | داده |
|---|---|
| تولید می‌کند | `MobileReceiptInput`، `OfflineUploadQueueItem`، `DocumentClassificationSignal` |
| مصرف می‌کند | `FinancialEventReference`، `UploadPolicy`، `AttachmentRule` |

Mobile داده سریع و میدانی تولید می‌کند. خروجی موبایل باید قبل از اتصال به finance یا cockpit، upload policy، duplicate check و review boundary داشته باشد.

## Central Cockpit

| نقش | داده |
|---|---|
| تولید می‌کند | `ManagementAlert`، `CrisisSignal`، `DecisionRecommendation`، `CrossModuleAISnapshot` |
| مصرف می‌کند | Finance signals، Product signals، Production signals، Inventory signals، Workforce signals، Mobile signals |

Central Cockpit مصرف‌کننده signal و snapshot است. Cockpit نباید داده اصلی ماژول‌ها را مستقیم تغییر دهد؛ فقط alert، recommendation و decision pack تولید می‌کند.

## قوانین قرارداد

- هر contract باید version داشته باشد.
- هر signal باید risk level و confidence داشته باشد.
- هر مصرف‌کننده باید فقط داده تاییدشده یا snapshot را مصرف کند.
- هر تغییر contract باید در docs/project-control ثبت شود.
- cross-module action باید از safety matrix و human-in-the-loop عبور کند.

## محدودیت فعلی

این سند فقط قرارداد مفهومی است. هیچ interface، type، schema یا API اجرایی ساخته نمی‌شود.
