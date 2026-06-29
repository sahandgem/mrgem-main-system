# Cockpit Risk Confidence Audit Visual Rules

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند زبان دیداری مفهومی risk، confidence و audit را برای cockpit تعریف می‌کند. این سند UI واقعی یا design token اجرایی نمی‌سازد.

## Risk / Confidence / Audit Visual Rules چیست؟

این قواعد مشخص می‌کنند هر سطح ریسک، اطمینان و audit در screen conceptهای cockpit چه معنی دارد و چه رفتاری باید در طراحی مفهومی القا کند.

## سطح‌های risk

| سطح | معنی | رفتار UI مفهومی | action آزاد است؟ | review لازم است؟ | manager approval لازم است؟ |
|---|---|---|---|---|---|
| low | ریسک کم و قابل پیگیری | badge آرام، قابل drill-down | بله برای action کم‌ریسک | نه همیشه | نه |
| medium | نیازمند توجه | badge هشدار، evidence قابل مشاهده | محدود | بله در موارد حساس | شاید |
| high | ریسک بالا یا اثر مالی/عملیاتی | badge برجسته، action با guard | نه برای action حساس | بله | بله |
| conflict | داده یا rule متعارض | حالت blocking، نمایش conflict reason | نه | بله | بله |
| manual_only | تصمیم فقط انسانی | حالت manual marker، no auto action | نه | بله | بله |

## سطح‌های confidence

| سطح | معنی | رفتار UI مفهومی | action آزاد است؟ | review لازم است؟ | manager approval لازم است؟ |
|---|---|---|---|---|---|
| high | داده کامل، validation معتبر و source قابل اعتماد | نمایش confidence بالا همراه evidence | فقط برای action کم‌ریسک | نه همیشه | برای حساس‌ها بله |
| medium | شواهد کافی نیست یا چند warning دارد | نمایش نیاز به بررسی | محدود | بله | شاید |
| low | اطمینان پایین | نمایش هشدار و نیاز به evidence | نه برای action مهم | بله | بله اگر حساس باشد |
| conflict | نتایج متضاد | block و نمایش علت | نه | بله | بله |
| manual_only | نیازمند قضاوت انسانی | no auto action | نه | بله | بله |

## سطح‌های audit visibility

| سطح | معنی | رفتار UI مفهومی | action آزاد است؟ | review لازم است؟ | manager approval لازم است؟ |
|---|---|---|---|---|---|
| no_audit_needed | action غیرحساس و فقط خواندنی | audit badge لازم نیست | بله | نه | نه |
| audit_available | audit موجود است | نمایش لینک یا indicator | بله با توجه به risk | شاید | برای حساس‌ها بله |
| audit_required | audit برای action لازم است | action تا audit context دیده شود guard دارد | محدود | بله | برای حساس‌ها بله |
| audit_missing | audit لازم است اما وجود ندارد | نمایش warning/blocking | نه برای حساس‌ها | بله | بله |
| audit_blocking | نبود audit تصمیم را متوقف می‌کند | block state و توضیح دلیل | نه | بله | بله |

## قواعد نهایی

- conflict و manual_only نباید auto action شوند.
- audit_missing در تصمیم حساس باید block کند.
- high confidence فقط وقتی مجاز است که validation و source هم معتبر باشند.
- AI suggestion بدون source، confidence و audit reference نباید action حساس پیشنهاد دهد.
- risk و confidence باید کنار decision point دیده شوند، نه فقط در گزارش جدا.
- کارت cockpit بدون audit visibility برای تصمیم حساس incomplete است.
