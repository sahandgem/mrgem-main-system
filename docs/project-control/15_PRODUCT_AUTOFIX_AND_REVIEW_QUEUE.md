# Product Auto-fix And Review Queue

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند قواعد اصلاح پیشنهادی کالا و صف بررسی کالاهای مشکوک را طراحی می‌کند. این طراحی فقط مستند است و هیچ کد اجرایی، UI، route، localStorage key، database، migration یا merge مستقیم `mahak-web-version` ایجاد نمی‌کند.

## Product Auto-fix Rules چیست؟

`Product Auto-fix Rules` مجموعه‌ای از پیشنهادهای اصلاح امن است که قبل از ورود کالا به مستر جم، خطاهای ساده و قابل توضیح را شناسایی می‌کند. این rules نباید بدون تأیید مرکز فرمان یا مدیر آینده تغییر واقعی روی داده اصلی ایجاد کنند.

هدف auto-fix این است که داده خام کالا قابل خواندن، قابل normalize و قابل بررسی شود، بدون اینکه کالای متفاوت اشتباهاً یکی شود یا داده واقعی از بین برود.

## خطاهای قابل اصلاح پیشنهادی

| مورد | اصلاح پیشنهادی | سطح تصمیم |
|---|---|---|
| فاصله اضافه در `name` | trim و collapse spaces | Auto-fix candidate |
| نیم‌فاصله/فاصله متفاوت در نام سنگ | normalize نوشتار و ثبت نسخه اصلی | Auto-fix candidate |
| حروف عربی/فارسی متفاوت | normalize ی/ک و نویسه‌های مشابه | Auto-fix candidate |
| format ساده barcode | حذف فاصله و کاراکترهای جداکننده غیرضروری | Auto-fix candidate |
| `groupName` شناخته‌شده بدون `groupCode` | پیشنهاد groupCode از mapping | Needs review |
| `stoneName` نزدیک به بانک سنگ | پیشنهاد stoneName استاندارد | Needs review |
| status با حروف متفاوت | normalize به مقدار مجاز schema | Auto-fix candidate |
| عدد قیمت/وزن با جداکننده متنی | parse و تبدیل به عدد | Needs review |

## خطاهایی که نیاز به تأیید مدیر دارند

| مورد | دلیل |
|---|---|
| barcode تکراری | ممکن است نشان‌دهنده duplicate یا alias واقعی باشد. |
| productCode تکراری | ممکن است update باشد، نه کالای جدید. |
| mahakCode تکراری | mapping محک باید انسانی بررسی شود. |
| نام مشابه با وزن و سنگ نزدیک | خطر یکی شدن کالای متفاوت وجود دارد. |
| وزن یا اجرت خارج از بازه منطقی | ممکن است خطای ورود داده یا کالای خاص باشد. |
| groupCode ناشناخته | mapping گروه روی خروجی محک اثر مستقیم دارد. |
| salePrice کمتر از basePrice | ممکن است تخفیف یا خطای قیمت‌گذاری باشد. |

## Product Review Queue چیست؟

`Product Review Queue` صف تصمیم‌گیری برای کالاهایی است که validator یا duplicate detector آن‌ها را `Warning`، `Needs review`، `Merge candidate` یا `Update existing product` تشخیص داده‌اند.

این صف باید در آینده قبل از هر import واقعی، UI یا migration طراحی شود. فعلاً فقط مفهوم و قرارداد تصمیم‌ها ثبت می‌شود.

## جریان بررسی کالاهای مشکوک

1. adapter داده خام را normalize می‌کند.
2. validator خطاها و هشدارها را تولید می‌کند.
3. duplicate detector هشدارهای تکراری را تولید می‌کند.
4. auto-fix suggestions ساخته می‌شود.
5. موارد خطرناک وارد review queue می‌شوند.
6. مدیر یا نقش تأییدکننده آینده تصمیم را ثبت می‌کند.
7. تصمیم در correction log ثبت می‌شود.
8. فقط رکوردهای مجاز وارد مرحله بعدی import یا UI می‌شوند.

## نقش مدیر در تأیید یا رد اصلاح

مدیر آینده باید بتواند این تصمیم‌ها را بگیرد، اما این سند UI نمی‌سازد:

- تأیید اصلاح پیشنهادی
- رد اصلاح پیشنهادی
- ارسال به بررسی بیشتر
- انتخاب کالای موجود برای update
- رد merge candidate
- اجازه ساخت کالای جدید
- block کامل رکورد یا batch

## خروجی‌های مورد انتظار

| خروجی | هدف |
|---|---|
| `ProductAutoFixSuggestion` | پیشنهاد اصلاح با دلیل، فیلد درگیر، مقدار قبلی و مقدار پیشنهادی |
| `ProductReviewItem` | آیتم صف review شامل رکورد، هشدارها، duplicateها، پیشنهادها و ریسک |
| `ProductReviewDecision` | تصمیم مدیر برای approve، reject، merge، update، create یا block |
| `ProductCorrectionLog` | تاریخچه تصمیم‌ها و اصلاح‌های پیشنهادی/تأییدشده |

## ProductCorrectionLog

هر اصلاح یا تصمیم باید در آینده قابل audit باشد. log باید حداقل این اطلاعات را نگه دارد:

- شناسه رکورد یا batch
- نوع correction
- مقدار قبلی
- مقدار پیشنهادی
- تصمیم نهایی
- تصمیم‌گیرنده
- زمان تصمیم
- دلیل یا note

## قواعد توقف

- auto-fix نباید به معنی تغییر خودکار database باشد.
- merge خودکار کالا ممنوع است.
- update کالای موجود بدون تصمیم review ممنوع است.
- اگر ریسک duplicate بالا باشد، create new product ممنوع است.
- اگر خروجی correction log قابل ساخت نیست، import نباید جلو برود.

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی `Product Import Decision Flow` و `Product Duplicate Resolution Flow` است. هنوز هیچ UI، migration، database change یا merge پروژه کالا نباید انجام شود.
