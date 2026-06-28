# AI Analysis Pipeline and Audit Trail

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند pipeline تحلیل AI و audit trail را برای کل سیستم مستر جم تعریف می‌کند. هدف این است که AI روی داده خام و بی‌اعتبار تصمیم نگیرد و هر پیشنهاد یا اقدام خودکار قابل پیگیری باشد.

## اصل پایه

داده خام نباید مستقیم تحلیل نهایی شود. هر داده باید قبل از AI suggestion از چند لایه کنترل عبور کند:

1. دریافت داده
2. normalize
3. validate
4. confidence score
5. rule check
6. AI suggestion
7. human approval در موارد لازم
8. audit trail

## AI Analysis Pipeline

| مرحله | هدف |
|---|---|
| Raw data intake | دریافت داده از فرم، Excel، receipt، WF history، product import، inventory movement یا production event. |
| Normalize | یکسان‌سازی قالب تاریخ، مبلغ، نام، کد، واحد، وضعیت و referenceها. |
| Validate | کنترل ناقص بودن، مقدار نامعتبر، conflict، duplicate و policy violation. |
| Confidence score | تعیین سطح اطمینان بر اساس شواهد، rule، match و کیفیت داده. |
| Rule check | بررسی ruleهای انسانی، محدودیت‌های safety و مرز manager approval. |
| AI suggestion | تولید پیشنهاد، خلاصه، هشدار، دسته‌بندی، anomaly یا اقدام پیشنهادی. |
| Human approval | ارسال موارد medium، low، conflict، manual only یا sensitive به انسان. |
| Audit trail | ثبت ورودی، خروجی، دلیل، rule version، confidence، تصمیم و شخص تاییدکننده. |

## چرا داده خام نباید مستقیم تحلیل شود؟

- ممکن است duplicate، ناقص یا conflictدار باشد.
- ممکن است قالب Excel یا ورودی تغییر کرده باشد.
- ممکن است نام، کد، مبلغ یا تاریخ نیاز به normalize داشته باشد.
- ممکن است AI از روی متن مبهم نتیجه قطعی بسازد.
- ممکن است تصمیم حساس بدون ردپا ایجاد شود.

## AI suggestion چه چیزهایی می‌تواند باشد؟

- پیشنهاد اتصال رسید به تراکنش.
- پیشنهاد تشخیص نوع تراکنش مالی.
- پیشنهاد تشخیص duplicate کالا.
- پیشنهاد auto-fix کم‌ریسک.
- هشدار نقدینگی یا ریسک تولید.
- تحلیل روند workforce یا drift.
- خلاصه مدیریتی برای کابین مرکزی.
- پیشنهاد تصمیم، نه اجرای قطعی در موارد حساس.

## audit trail چه چیزهایی را ثبت می‌کند؟

| داده audit | توضیح |
|---|---|
| source | داده از کجا آمده است. |
| normalized input | داده پس از normalize. |
| validation result | خطاها، هشدارها و وضعیت validation. |
| confidence level | high، medium، low، conflict یا manual only. |
| rule version | rule یا policy استفاده‌شده و نسخه آن. |
| AI suggestion | پیشنهاد یا تحلیل تولیدشده. |
| auto action reason | اگر اقدام خودکار انجام شد، دلیل دقیق آن. |
| human decision | تایید، رد، اصلاح، اتصال یا ignore. |
| actor | سیستم، reviewer، manager یا admin. |
| timestamp | زمان پیشنهاد، تصمیم و اجرای اقدام. |
| before/after | مقدار قبلی و مقدار جدید برای اصلاح یا اتصال حساس. |

## قوانین auto action

- auto action فقط با high confidence و audit trail کامل مجاز است.
- هر auto action باید rule version و دلیل داشته باشد.
- هر اقدام حساس باید مسیر review یا manager approval داشته باشد.
- هر تغییر حساس باید قابل برگشت یا قابل correction باشد.
- اگر conflict دیده شود، AI فقط توضیح و پیشنهاد می‌دهد و اقدام متوقف می‌شود.

## کاربرد بین ماژولی

| ماژول | استفاده از pipeline |
|---|---|
| Finance | bank import، receipt match، installment confirm و liquidity alerts |
| Product | import validator، duplicate detector، auto-fix suggestion و AI snapshot |
| Production | anomaly، cost estimation، formula validation و risk alert |
| Inventory | shortage، mismatch، movement analysis و reorder suggestion |
| Workforce | preventive alerts، monthly health، decision support و operational history |
| Mobile | document classification، upload retry، offline queue و attachment matching |
| Central Cockpit | cross-module alerts، crisis signals، recommendations و AI-ready snapshots |

## محدودیت فعلی

این سند فقط طراحی معماری است. هیچ AI engine، backend، migration، database، route، UI، localStorage، auth یا integration جدید ساخته نمی‌شود.
