# AI Suggestion UI and Risk Visual Language

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مشخص می‌کند پیشنهادهای AI در UI مستر جم چگونه نمایش داده شوند تا کمک‌تصمیم باشند، نه جایگزین تصمیم مدیر. همچنین زبان دیداری ریسک و confidence را برای cockpit و review تعریف می‌کند.

این سند فقط طراحی است و هیچ UI اجرایی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## AI Suggestion UI چیست؟

`AI Suggestion UI` الگوی نمایش پیشنهاد AI همراه با دلیل، confidence، risk، داده مرتبط و نیاز به تایید است. AI نباید تصمیم حساس را قطعی جلوه دهد؛ باید شواهد و مرز تصمیم را نشان دهد.

## AI چطور پیشنهاد بدهد؟

- پیشنهاد باید کوتاه، قابل فهم و همراه با دلیل باشد.
- confidence باید واضح دیده شود.
- اگر action حساس است، required approval باید روشن باشد.
- risk flags باید کنار suggestion نمایش داده شوند.
- هر پیشنهاد باید به source و audit reference وصل باشد.
- AI باید گزینه «نیاز به بررسی مدیر» را پنهان نکند.

## هر پیشنهاد AI باید شامل چه باشد؟

| بخش | توضیح |
|---|---|
| suggestion | پیشنهاد اصلی سیستم. |
| reason | دلیل پیشنهاد به زبان مدیریتی. |
| confidence | high، medium، low، conflict یا manual only. |
| risk flags | ریسک‌های duplicate، mismatch، sensitive، missing field یا conflict. |
| related data | داده‌های مرتبط مثل receipt، bank transaction، product، inventory یا workforce signal. |
| required approval | آیا reviewer، manager یا admin باید تایید کند. |
| audit reference | مسیر ردیابی source، validation، rule و تصمیم. |

## زبان دیداری ریسک

| سطح ریسک | معنی UI | رفتار پیشنهادی |
|---|---|---|
| low risk | امن یا کم‌اثر | نمایش آرام، امکان اقدام کم‌ریسک |
| medium risk | نیازمند توجه | review یا confirmation سبک |
| high risk | اثر مالی/عملیاتی مهم | decision panel و تایید مدیر |
| conflict | شواهد ناسازگار | block تا تصمیم مدیر |
| manual only | policy اجازه automation نمی‌دهد | فقط تصمیم انسانی |

## زبان دیداری confidence

| سطح confidence | معنی UI | رفتار |
|---|---|---|
| high confidence | شواهد کافی و بدون conflict | auto action فقط اگر safe matrix اجازه دهد |
| medium confidence | شواهد نسبی اما نیازمند بررسی | review queue |
| low confidence | داده ضعیف یا ناقص | review یا block |
| conflict | داده ناسازگار | blocked |
| manual only | حساس یا policy-bound | never auto action |

## قانون

- AI پیشنهاد می‌دهد.
- auto action فقط در موارد امن مجاز است.
- تصمیم حساس فقط با مدیر است.
- conflict و manual only نباید به شکل اقدام آماده نمایش داده شوند.
- هر suggestion باید قابل drill-down به evidence و audit باشد.

## محدودیت فعلی

این سند فقط زبان مفهومی UI است. هیچ component، style، token، route یا logic در main ساخته نمی‌شود.
