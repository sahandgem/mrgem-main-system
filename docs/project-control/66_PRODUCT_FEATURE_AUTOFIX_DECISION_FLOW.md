# Product Feature Auto-fix Decision Flow

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز اصلاح پیشنهادی featureهای کالا را تعریف می‌کند: چه اصلاح‌هایی کم‌ریسک‌اند، چه تغییرهایی ممنوع‌اند و هر تصمیم چگونه review و audit می‌شود.

## Product Feature Auto-fix چیست؟

Auto-fix یک پیشنهاد ساختاریافته برای اصلاح خطاهای قابل پیش‌بینی و کم‌ریسک در مقدار normalize شده است. مقدار خام حفظ می‌شود و اعمال خودکار فقط وقتی مجاز است که confidence بالا، ریسک پایین، rule مصوب و audit trail کامل وجود داشته باشد.

## Auto-fix candidateهای مجاز

| candidate | شرط ایمنی |
|---|---|
| `normalize_text` | فقط یکسان‌سازی نوشتار بدون تغییر معنی |
| `trim_spaces` | حذف فاصله اضافی و حفظ مقدار اصلی |
| `normalize_stone_name` | mapping alias شناخته‌شده به مقدار استاندارد مرجع |
| `normalize_group_label` | یکسان‌سازی label بدون تغییر group identity |
| `normalize_unit_label` | تبدیل label شناخته‌شده به واحد استاندارد، بدون تبدیل پرریسک مقدار |
| `format_barcode` | اصلاح presentation/spacing با حفظ هویت و کنترل duplicate |
| `convert_safe_numeric_format` | تبدیل رقم، جداکننده یا قالب عددی بدون تغییر مقدار |
| `map_known_alias_to_standard_value` | alias نسخه‌دار و تاییدشده با match قطعی |

## Auto-fixهای ممنوع

- تغییر قیمت یا feature اثرگذار بر pricing.
- تغییر وزن حساس یا تبدیل واحد مبهم.
- تغییر سنگ در صورت conflict یا نبود تطبیق قطعی.
- تغییر گروه کالا در صورت conflict.
- merge کالا یا تصمیم duplicate resolution.
- تغییر فرمول یا feature اثرگذار بر تولید.
- حذف feature یا پنهان‌کردن validation error.
- تغییر بارکد تکراری یا تخصیص بارکد جدید بدون review.

این موارد باید به review queue بروند و در صورت حساس بودن با تصمیم مدیر انجام شوند.

## جریان تصمیم

1. `detect issue`: validator مسئله را همراه با rawValue ثبت می‌کند.
2. `suggest auto-fix`: سیستم normalizedValue پیشنهادی و rule را تولید می‌کند.
3. `calculate confidence`: کیفیت match و کامل بودن داده امتیازدهی می‌شود.
4. `check risk`: اثر pricing، production، inventory، duplicate و AI بررسی می‌شود.
5. `send to review if sensitive`: medium/low/conflict/manual-only یا feature حساس وارد صف می‌شود.
6. `approve or reject correction`: reviewer یا manager تصمیم و دلیل را ثبت می‌کند.
7. `write audit trail`: مقدار قبل/بعد، rule version، actor و نتیجه ثبت می‌شود.

## ماتریس تصمیم

| وضعیت | تصمیم |
|---|---|
| High confidence + low risk + rule مصوب | اعمال خودکار می‌تواند مجاز باشد، فقط با audit trail |
| Medium confidence | نیازمند review |
| Low confidence | review یا block |
| Conflict | block تا تصمیم مدیر |
| Manual only | هیچ auto-fix مجاز نیست |
| Pricing/production/inventory sensitive | review یا manager approval حتی با پیشنهاد قوی |

## خروجی‌های آینده

- `ProductFeatureAutoFixSuggestion`
- `ProductFeatureCorrectionLog`
- `ProductFeatureReviewDecision`
- `ProductFeatureAuditTrail`

حداقل اطلاعات correction log:

- product/feature reference
- raw value
- normalized value قبل و بعد
- reason
- rule version
- confidence level
- risk flags
- actor و approver
- timestamp
- audit reference

## قوانین

- auto-fix اصلًا پیشنهاد است؛ اعمال خودکار فقط در حالت کم‌ریسک و high confidence مجاز است.
- auto-fix حساس باید review شود.
- هر correction باید مقدار قبل/بعد و دلیل داشته باشد.
- rawValue نباید بازنویسی یا حذف شود.
- پیشنهاد AI به تنهایی مجوز تغییر نیست.
- correction بدون rule version و auditReference معتبر نیست.

## محدودیت فعلی

این سند auto-fix engine، UI، database، migration، route، localStorage یا اتصال مستقیم به محک ایجاد نمی‌کند.
