# Manager Review UI Concept

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مفهوم UI صف تصمیم مدیر را برای مستر جم تعریف می‌کند. هدف این است که مدیر بتواند موارد مشکوک، حساس یا کم‌اطمینان را با دلیل، داده خام، داده normalize شده، confidence و پیشنهاد AI بررسی کند.

این سند فقط طراحی است و هیچ UI اجرایی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Manager Review UI چیست؟

`Manager Review UI` سطح تصمیم انسانی در معماری Automation-First است. هر موردی که conflict، medium/low confidence، duplicate risk، حساسیت مالی/عملیاتی یا نیاز به تایید مدیر دارد باید به این UI مفهومی برسد.

## چه آیتم‌هایی وارد review می‌شوند؟

| آیتم | دلیل ورود |
|---|---|
| financial weak match | match مالی قوی نیست و ممکن است به رویداد اشتباه وصل شود. |
| receipt/bank conflict | رسید و بانک در مبلغ، تاریخ، شماره پیگیری یا طرف حساب اختلاف دارند. |
| installment medium confidence | قسط احتمالی است ولی برای auto confirm کافی نیست. |
| product duplicate | کالا احتمالاً تکراری است. |
| product auto-fix candidate | اصلاح پیشنهادی کالا نیاز به تایید دارد. |
| inventory mismatch | موجودی با رکورد یا movement ناسازگار است. |
| production formula risk | فرمول، مواد، وزن یا هزینه تولید ریسک دارد. |
| workforce risk alert | هشدار نیروی انسانی نیاز به تصمیم عملیاتی دارد. |
| mobile receipt issue | رسید موبایل ناقص، مبهم، تکراری یا upload نشده است. |

## تصمیم‌های مدیر

| تصمیم | کاربرد |
|---|---|
| approve | تایید ادامه جریان یا import. |
| reject | رد داده، پیشنهاد یا اقدام. |
| request correction | درخواست اصلاح داده، mapping یا سند. |
| attach to existing | اتصال به رکورد موجود. |
| create new | ایجاد رکورد جدید پس از approval. |
| confirm installment | تایید قسط پس از بررسی evidence. |
| mark duplicate | علامت‌گذاری آیتم به عنوان تکراری. |
| ignore | نادیده گرفتن آیتم نامرتبط یا کم‌اهمیت با audit. |
| escalate | ارجاع به مدیر بالاتر یا بررسی عمیق‌تر. |

## هر آیتم review باید چه نشان دهد؟

- دلیل هشدار.
- داده خام.
- داده normalize شده.
- validation status.
- confidence level.
- risk flags.
- پیشنهاد AI.
- related entities.
- audit reference.
- history یا timeline مرتبط.
- تصمیم‌های مجاز برای مدیر.

## الزام audit trail

هر تصمیم مدیر باید audit trail داشته باشد:

- actor
- timestamp
- decision
- reason
- source data reference
- before/after در صورت اصلاح
- rule version یا confidence evidence
- affected records

## اصول UX

- مدیر باید دلیل تصمیم را بدون خواندن متن طولانی بفهمد.
- evidence و confidence باید کنار پیشنهاد AI دیده شوند.
- موارد conflict و manual only باید visually locked باشند.
- actionهای حساس باید confirm step داشته باشند.
- decision panel باید از dashboard قابل drill-down باشد.

## محدودیت فعلی

این سند فقط concept است. هیچ صفحه، modal، route، component یا logic در main ساخته نمی‌شود.
