# Confidence Scoring Model

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مدل امتیاز اطمینان را برای تصمیم‌های Automation-First و AI-Assisted مستر جم طراحی می‌کند. هدف این است که سیستم بداند چه چیزی می‌تواند auto action شود، چه چیزی باید وارد review queue شود و چه چیزی باید blocked بماند.

این سند فقط طراحی است و هیچ کد اجرایی، مدل داده، route، UI، database، migration، auth یا localStorage ایجاد نمی‌کند.

## Confidence Scoring Model چیست؟

`Confidence Scoring Model` روش مشترک ارزیابی کیفیت داده، قدرت rule، خطر conflict و قابلیت اعتماد source است. خروجی آن یک سطح تصمیم است، نه صرفاً یک عدد. این سطح باید قبل از AI suggestion، auto action یا manager review استفاده شود.

## معیارهای اثرگذار روی confidence

| معیار | اثر روی confidence |
|---|---|
| data completeness | هرچه فیلدهای ضروری کامل‌تر باشند، confidence بالاتر است. |
| validation result | error و warning شدید confidence را پایین می‌آورند. |
| rule match strength | rule دقیق، نسخه‌دار و مصوب confidence را بالا می‌برد. |
| duplicate risk | احتمال تکراری بودن، auto action را محدود می‌کند. |
| conflict risk | تعارض مبلغ، تاریخ، طرف حساب، سند یا وضعیت معمولاً باعث conflict می‌شود. |
| source reliability | منبع قابل اعتماد مثل bank transaction تاییدشده قوی‌تر از متن آزاد است. |
| historical consistency | سازگاری با رفتار گذشته یا baseline confidence را تقویت می‌کند. |
| manager-approved rule | rule تاییدشده مدیر، مخصوصاً با history خوب، confidence را بالا می‌برد. |
| receipt/bank/product match quality | کیفیت match بین رسید، بانک، کالا، inventory یا production اهمیت دارد. |
| AI suggestion certainty | certainty خروجی AI فقط کمکی است و به تنهایی نباید auto action بسازد. |

## سطح‌های confidence

| سطح | تعریف | تصمیم |
|---|---|---|
| High confidence | داده کامل، validate شده، rule قوی دارد، source قابل اعتماد است و conflict یا duplicate ندارد. | auto action allowed with audit trail |
| Medium confidence | داده نسبتاً کامل است اما بخشی از match، source یا history نیاز به بررسی دارد. | review queue |
| Low confidence | داده ناقص، rule ضعیف، source مبهم یا match کم‌کیفیت است. | review or blocked |
| Conflict | شواهد با هم ناسازگارند؛ مثل اختلاف مبلغ، تاریخ، سند، طرف حساب، barcode یا موجودی. | blocked until manager decision |
| Manual only | policy اجازه auto action نمی‌دهد، حتی اگر داده کامل باشد. | never auto action |

## تصمیم‌ها

| سطح | اقدام مجاز |
|---|---|
| High confidence | auto action allowed with audit trail |
| Medium confidence | review queue |
| Low confidence | review or blocked |
| Conflict | blocked until manager decision |
| Manual only | never auto action |

## نمونه کاربرد در ماژول‌ها

| ماژول | high confidence | medium/low/conflict |
|---|---|---|
| Finance | attach strong bank match یا confirm installment با rule سختگیرانه | اختلاف رسید/بانک، duplicate transaction، پرداخت حساس |
| Product | پیشنهاد duplicate قوی یا auto-fix کم‌ریسک | merge کالا، barcode conflict، mahakCode مبهم |
| Production | هشدار خودکار ریسک یا کمبود مواد | تغییر فرمول، هزینه غیرعادی، conflict مواد |
| Inventory | هشدار کمبود یا mismatch | تغییر موجودی حساس یا reconcile دستی |
| Workforce | هشدار پیشگیرانه و decision support | تغییر schedule حساس یا تصمیم عملیاتی بدون مدیر |
| Mobile | classify document یا retry upload کم‌ریسک | سند مبهم، رسید حساس یا match ضعیف |
| Central Cockpit | نمایش alert و recommendation | crisis decision یا اقدام cross-module حساس |

## قواعد ایمنی

- score بالا بدون audit trail کافی نیست.
- AI certainty بدون validation و rule match کافی نیست.
- conflict همیشه auto action را متوقف می‌کند.
- manual only حتی با confidence بالا خودکار نمی‌شود.
- هر مدل score باید قابل توضیح و قابل بازبینی باشد.

## خروجی‌های پیشنهادی آینده

- `ConfidenceAssessment`
- `ConfidenceEvidence`
- `ConfidenceDecision`
- `ModuleRiskSignal`
- `ReviewRoutingReason`
