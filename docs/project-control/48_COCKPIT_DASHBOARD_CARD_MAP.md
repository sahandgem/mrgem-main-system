# Cockpit Dashboard Card Map

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند نقشه کارت‌های اصلی کابین خلبانی مرکزی مستر جم را طراحی می‌کند. هدف این است که Design Lab و فازهای آینده بدانند صفحه اصلی cockpit چه کارت‌هایی دارد، هر کارت از چه داده‌ای تغذیه می‌شود و چه رفتاری در drill-down یا review دارد.

این سند فقط طراحی است و هیچ UI اجرایی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Cockpit Dashboard Card Map چیست؟

`Cockpit Dashboard Card Map` نقشه کارت‌های مدیریتی کابین مرکزی است. هر کارت باید یک وضعیت مهم را سریع نشان دهد، دلیل هشدار را آشکار کند، confidence و risk را نمایش دهد و در صورت نیاز مدیر را به review یا drill-down هدایت کند.

## کارت‌های اصلی صفحه کابین خلبانی

| کارت | هدف کارت | داده ورودی | خروجی یا اقدام | سطح ریسک | سطح confidence | drill-down احتمالی | نیاز به review |
|---|---|---|---|---|---|---|---|
| Financial Pressure Card | نمایش فشار نقدینگی، سررسیدها و پرداخت‌های حساس | LiquiditySignal، FinancialEvent، ApprovalDecision | هشدار فشار مالی، پیشنهاد اقدام مدیریتی | medium تا critical | medium/high | liquidity detail، payment queue، audit | برای پرداخت حساس بله |
| Cash-in / Cash-out Card | نمایش روند ورودی/خروجی پول | BankMatchResult، FinancialEvent، cash flow summary | نمایش روند و anomaly | low تا high | medium/high | bank transactions، cash flow timeline | در anomaly یا conflict |
| Bank Import Status Card | نمایش وضعیت import اکسل بانک | ImportBatch، ImportDryRunReport، BankExcelParseReport | وضعیت staging، blocked، approved، quarantined | low تا high | high/medium/low/conflict | import batch detail، dry-run، quarantine | برای conflict یا unknown format |
| Installment Confirmation Card | کنترل تایید قسط‌ها | BankMatchResult، rule version، installment candidate | confirm، review یا block | medium تا critical | high/medium/conflict | installment evidence، rule audit | برای medium/conflict بله |
| Manager Review Queue Card | نمایش تصمیم‌های منتظر مدیر | FinancialReviewItem، QuarantineItem، ProductReviewItem | approve، reject، correction، escalation | medium تا critical | mixed | review item detail | بله |
| Product Import Warning Card | نمایش هشدار import کالا | ProductImportReport، DuplicateProductWarning، MahakExportPreview | هشدار duplicate، barcode، mapping | medium/high | medium/low/conflict | product import detail، duplicate evidence | برای merge/update بله |
| Inventory Shortage Card | نمایش کمبود یا mismatch موجودی | StockState، ShortageAlert، InventoryMismatchWarning | reorder suggestion، finance alert | low تا high | medium/high | inventory movement، product reference | برای stock change حساس |
| Production Risk Card | نمایش ریسک تولید | ProductionOrderSignal، MaterialRequirementSignal، ProductionAnomalyWarning | هشدار مواد، فرمول، هزینه یا anomaly | medium/high | medium/low | formula detail، material need، cost estimate | برای تغییر فرمول بله |
| Workforce Risk Card | نمایش ریسک نیروی انسانی | WorkforceRiskSignal، PreventiveAlert، MonthlyHealthSnapshot | هشدار ظرفیت، تمرکز، پوشش و فشار کاری | low تا high | medium/high | schedule، operational history، decision queue | برای تصمیم حساس بله |
| Mobile Receipt Queue Card | نمایش رسیدهای موبایل و upload queue | MobileReceiptInput، OfflineUploadQueueItem، DocumentClassificationSignal | attach suggestion، retry، review | low تا high | medium/low/conflict | receipt detail، attachment evidence | برای mismatch بله |
| AI Suggestion Card | نمایش پیشنهادهای AI | AI snapshot، ConfidenceAssessment، risk flags | پیشنهاد اقدام یا توضیح | low تا high | high/medium/low | evidence، source، audit reference | برای medium به بالا یا حساس |
| Crisis Signal Card | نمایش بحران‌های چندماژولی | CockpitSnapshot، CrisisSignal، cross-module signals | هشدار بحران و decision pack | critical | medium/high/conflict | crisis detail، affected modules | بله |

## اصول طراحی کارت‌ها

- هر کارت باید در یک نگاه وضعیت، ریسک و اقدام احتمالی را نشان دهد.
- کارت نباید تصمیم حساس را خودکار انجام دهد.
- هر عدد یا هشدار باید drill-down داشته باشد.
- هر پیشنهاد AI باید source، confidence و audit reference داشته باشد.
- کارت‌های بحرانی باید manager review boundary را واضح نشان دهند.

## محدودیت فعلی

این سند فقط map طراحی است. هیچ کارت واقعی، کامپوننت، route یا UI در main ساخته نمی‌شود.
