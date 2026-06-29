# Central Cockpit Drill-down Strategy

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند خروجی CONTROL-P32-BATCH است و فقط strategy مفهومی برای drill-down کابین مرکزی را تعریف می‌کند. هیچ UI واقعی، route، component، prototype، database، auth، migration یا localStorage در این فاز ساخته یا تغییر نمی‌شود.

## Central Cockpit Drill-down Strategy چیست؟

Central Cockpit Drill-down Strategy مشخص می‌کند هر کارت اصلی کابین مرکزی به چه screen concept، گزارش، صف تصمیم، سند منبع و action مدیریتی وصل می‌شود. هدف این است که هیچ KPI یا هشدار مهم بدون مسیر بررسی، evidence، risk/confidence و audit context نمایش داده نشود.

## چرا هر کارت cockpit باید drill-down داشته باشد؟

- مدیر باید از summary به evidence برسد.
- هر هشدار باید دلیل و منبع داشته باشد.
- هر عدد مهم باید قابل بررسی و ردگیری باشد.
- AI suggestion باید در کنار شواهد، نه به عنوان حکم قطعی، دیده شود.
- تصمیم حساس باید review، approval و audit داشته باشد.
- کارت بدون drill-down خطر تصمیم‌گیری کور ایجاد می‌کند.

## Card to Drill-down Map

| کارت | summary view | primary metric | risk indicator | confidence indicator | click target concept | drill-down screen concept | source documents/reports | manager action | audit visibility | AI suggestion behavior | blocked/empty/error state |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Financial Pressure Card | فشار نقدینگی و سررسیدهای حساس | liquidity pressure score | high/conflict برای کسری یا پرداخت حساس | bank/receipt match confidence | فشار مالی | Financial Pressure Drill-down Screen | Financial Pressure Report، Bank Match Report، Receipt Review | hold، approve، request correction، escalate | audit required برای تصمیم مالی | پیشنهاد علت فشار و action پیشنهادی | no data، bank import missing، audit missing |
| Cash-in/Cash-out Card | ورودی/خروجی پول در بازه منتخب | net cash movement | medium/high برای cash-out غیرعادی | source completeness | جریان نقدی | Financial Pressure Drill-down Screen | Cash-in/Cash-out Report، Bank Transaction Mapping | request review، attach receipt، flag mismatch | audit available برای تغییر یا تایید | پیشنهاد دسته‌بندی جریان | empty period، unmatched bank rows |
| Bank Import Status Card | وضعیت import روزانه بانک | parsed/valid/review/blocked counts | conflict برای قالب یا duplicate | parse/match confidence | وضعیت فایل بانک | Bank Import Drill-down concept زیر Financial | Bank Excel Parse Report، Import Gate Report | retry parse، quarantine، request correction | audit required برای import | پیشنهاد رفع قالب یا match | unknown format، missing columns |
| Installment Confirmation Card | اقساط قابل تایید یا نیازمند بررسی | confirmed/pending installments | high/conflict برای اختلاف مبلغ/تاریخ | match confidence | تایید قسط | Manager Review Queue Drill-down Screen | Installment Audit، Bank Rule Match | confirm installment، hold، reject | audit required | پیشنهاد تایید فقط با evidence | weak match، duplicate candidate |
| Manager Review Queue Card | صف تصمیم‌های مدیر | pending review count | risk mix بر اساس itemها | confidence distribution | صف review | Manager Review Queue Drill-down Screen | Review Queue Report، Decision Audit | approve، reject، correction، escalate | audit required | اولویت‌بندی review | empty queue، stale items |
| Product Import Warning Card | هشدارهای ورود کالا | blocked/warning item count | duplicate/conflict/manual_only | validation confidence | هشدار ورود کالا | Product Import Metrics Drill-down Screen | Quality Gate Report، Product Review Metrics | block import، approve valid only، request correction | audit required برای override | پیشنهاد split یا correction | frozen workstream، no approved prototype |
| Inventory Shortage Card | کمبود یا مغایرت موجودی | shortage count/value | high برای مواد بحرانی | source reliability | کمبود موجودی | Inventory Shortage Drill-down concept | Inventory Shortage Report، Stock Movement Snapshot | request inventory check، purchase review | audit available/required برای تغییر حساس | پیشنهاد reorder یا check | no inventory model، stale snapshot |
| Production Risk Card | ریسک تولید و مواد | production risk score | high/conflict برای formula/material issue | formula confidence | ریسک تولید | Production Risk Drill-down concept | Production Cost Report، Formula Review | start production review، request material check | audit required برای formula حساس | پیشنهاد علت ریسک | formula missing، inventory mismatch |
| Workforce Risk Card | ریسک عملیاتی نیروی انسانی | active workforce findings | critical/warning/info | analyzer confidence | ریسک نیروی انسانی | Workforce Risk Drill-down concept | Workforce Analysis، Operational History | assign review، request correction | audit available برای decision queue | پیشنهاد اقدام پیشگیرانه | analyzer not available، no schedule |
| Mobile Receipt Queue Card | رسیدهای موبایل در صف | pending receipt count | conflict برای receipt/bank mismatch | OCR/match confidence | صف رسید موبایل | Mobile Receipt Queue Drill-down concept | Receipt Review Report، Bank Match Confidence | attach، reject، request correction | audit required برای اتصال حساس | پیشنهاد match احتمالی | no receipt flow، upload failed |
| AI Suggestion Card | پیشنهادهای AI با اولویت | suggestion count by risk | risk flags per suggestion | AI certainty + validation confidence | پیشنهادهای AI | AI Suggestion Review Screen | AI Snapshot، Rule Check، Audit Reference | accept for review، ignore، escalate | audit required برای هر action حساس | فقط suggestion، نه decision | low confidence، missing source |
| Crisis Signal Card | سیگنال بحران چندماژولی | active crisis signals | high/conflict/manual_only | cross-module confidence | بحران | Crisis Signal Drill-down Screen | Crisis Signal Report، Event Bus Concept، Module Snapshots | escalate، freeze action، request review | audit required | توضیح علت بحران و modules affected | unresolved conflict، audit missing |

## قانون نهایی

هر کارت cockpit باید حداقل summary، metric، risk، confidence، source، drill-down، action مدیریتی، audit visibility و blocked/empty/error state داشته باشد. کارت بدون evidence یا بدون مسیر review نباید مبنای تصمیم حساس شود.
