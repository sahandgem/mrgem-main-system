# Product Import Validator And Duplicate Detector

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند قوانین مفهومی اعتبارسنجی ورود کالا و تشخیص کالای تکراری را طراحی می‌کند. این کار فقط مستندسازی کنترل پروژه است و هیچ کد اجرایی، route، UI، localStorage key، database، migration یا merge مستقیم `mahak-web-version` ایجاد نمی‌کند.

## Product Import Validator چیست؟

`Product Import Validator` لایه بررسی قبل از ورود هر رکورد کالا به مستر جم است. این لایه باید قبل از هر UI، import واقعی، adapter اجرایی یا migration اجرا شود و مشخص کند هر کالا معتبر است، نیاز به بررسی دارد یا باید از ورود آن جلوگیری شود.

هدف validator این است که داده خام پروژه کالا، خروجی محک، فایل Excel یا خروجی AI-ready مستقیماً وارد سیستم اصلی نشود و ابتدا از نظر completeness، type، format، mapping، duplicate risk و سازگاری با schema بررسی شود.

## قوانین اعتبارسنجی فیلدها

| فیلد | قانون | سطح پیش‌فرض |
|---|---|---|
| `productCode` | نباید خالی باشد و باید بعد از trim پایدار بماند. | Error |
| `barcode` | اگر وجود دارد باید format قابل قبول داشته باشد و در batch و داده موجود یکتا باشد. | Error / Warning |
| `name` | نباید خالی باشد و باید بعد از normalize قابل نمایش باشد. | Error |
| `groupCode` | باید قابل تشخیص یا قابل mapping به گروه کالا باشد. | Warning |
| `mahakCode` | اگر وجود دارد نباید با `productCode` اشتباه گرفته شود و باید جدا نگه‌داری شود. | Warning |
| `weight` | باید عددی، مثبت و در بازه منطقی دامنه کالا باشد. | Error |
| `wage` | باید عددی باشد؛ مقدار خالی فقط اگر سیاست مرکز کنترل اجازه دهد قابل قبول است. | Warning |
| `basePrice` | باید عدد معتبر، غیرمنفی و قابل parse باشد. | Warning |
| `salePrice` | باید عدد معتبر، غیرمنفی و ترجیحاً کمتر از basePrice نباشد مگر با توضیح. | Warning |
| `stoneName` | باید با بانک سنگ یا mapping پیشنهادی قابل تطبیق باشد. | Warning |
| `stoneType` | باید با دسته‌های سنگ قابل تطبیق باشد. | Warning |
| `inventoryStatus` | باید یکی از مقادیر مجاز schema باشد. | Error |
| `productionStatus` | باید یکی از مقادیر مجاز schema باشد. | Error |
| `dataSource` | باید مشخص باشد: mahak، mahak-web-version، manual، import یا ai-ready. | Error |

## Duplicate Detector چیست؟

`Product Duplicate Detector` لایه تشخیص احتمال تکراری بودن کالا است. این لایه نباید خودکار کالاها را merge کند؛ فقط باید سطح خطر، شواهد، دلیل تشخیص و پیشنهاد تصمیم را به مرکز فرمان یا صف بررسی آینده بدهد.

هدف duplicate detector این است که هم از ورود کالای تکراری جلوگیری کند و هم جلوی یکی شدن اشتباه دو کالای متفاوت را بگیرد.

## معیارهای تشخیص کالای تکراری

| معیار | توضیح | سطح پیشنهادی |
|---|---|---|
| barcode یکسان | قوی‌ترین نشانه تکراری، مگر سیاست alias وجود داشته باشد. | Error / Merge candidate |
| productCode یکسان | کد داخلی یکسان یعنی احتمال بسیار بالای duplicate یا update. | Error / Update existing product |
| mahakCode یکسان | کد محک یکسان باید به عنوان duplicate یا update بررسی شود. | Warning / Update existing product |
| ترکیب نام + وزن + سنگ + گروه | اگر چند ویژگی اصلی یکسان باشند، احتمال duplicate بالاست. | Warning |
| شباهت نام کالا | نام‌های نزدیک با اختلاف نگارشی باید review شوند. | Info / Warning |
| اختلاف جزئی در نوشتار سنگ یا گروه | تفاوت‌های املایی یا فاصله/نیم‌فاصله ممکن است duplicate پنهان بسازد. | Auto-fix candidate |
| کالاهای ظاهراً متفاوت ولی احتمالاً یکی | ترکیب شواهد ضعیف مثل نام نزدیک، وزن نزدیک، گروه مشابه و سنگ مشابه. | Needs review |

## سطح هشدارها

| سطح | معنی | رفتار پیشنهادی |
|---|---|---|
| Error | ورود کالا ممنوع است. | import block شود تا داده اصلاح شود. |
| Warning | نیاز به بررسی مدیر یا اپراتور دارد. | وارد صف review شود. |
| Info | فقط اطلاع‌رسانی است. | ثبت در report، بدون توقف import. |
| Auto-fix candidate | قابل اصلاح پیشنهادی است. | پیشنهاد اصلاح نمایش داده شود، اعمال خودکار فقط با تأیید آینده. |

## خروجی‌های مورد انتظار

| خروجی | هدف |
|---|---|
| `ProductImportReport` | جمع‌بندی تعداد رکوردها، خطاها، هشدارها، duplicateها و تصمیم پیشنهادی import |
| `DuplicateProductWarning` | هشدار duplicate با شواهد، شدت، رکوردهای درگیر و پیشنهاد تصمیم |
| `ProductValidationError` | خطای field-level یا record-level با پیام قابل فهم |
| `ProductAutoFixSuggestion` | پیشنهاد اصلاح مثل normalize کردن نام سنگ، groupCode یا barcode format |
| `ProductImportDecision` | تصمیم نهایی پیشنهادی برای هر رکورد یا batch |

## تصمیم‌های ورود کالا

| تصمیم | معنی |
|---|---|
| Import allowed | رکورد معتبر است و مانع جدی ندارد. |
| Import blocked | خطای جدی دارد و نباید وارد شود. |
| Needs review | نیازمند بررسی مدیر/اپراتور است. |
| Merge candidate | احتمالاً باید با کالای موجود یکی شود، اما merge خودکار ممنوع است. |
| Update existing product | احتمالاً باید رکورد موجود را به‌روزرسانی کند، با تأیید آینده. |
| Create new product | رکورد می‌تواند کالای جدید بسازد. |

## خطرهایی که باید کنترل شوند

| خطر | اثر |
|---|---|
| ورود کالای تکراری | موجودی، فروش، خروجی محک و گزارش‌ها خراب می‌شوند. |
| خراب شدن خروجی محک | فایل یا mapping محک نامعتبر می‌شود. |
| اشتباه شدن بارکد | اسکن، فروش، انبار و تولید خطا می‌گیرند. |
| اشتباه در وزن یا اجرت | قیمت و تولید اشتباه محاسبه می‌شود. |
| اشتباه در بانک سنگ | تحلیل، گروه‌بندی و خروجی AI-ready آلوده می‌شود. |
| یکی شدن کالای متفاوت | داده واقعی از بین می‌رود و اصلاح سخت می‌شود. |
| جدا شدن کالای یکسان | duplicate پنهان ایجاد می‌شود و گزارش‌ها دوپاره می‌شوند. |

## ترتیب امن آینده

1. Product Import Validator
2. Product Duplicate Detector
3. Product Auto-fix Rules
4. Product Review Queue
5. Product Import Decision Flow
6. Product Duplicate Resolution Flow
7. Mahak Export Adapter
8. UI بعداً و فقط پس از تأیید مرکز فرمان
9. migration فقط با اجازه مرکز فرمان

## قواعد توقف

- اگر `productCode`، `name`، `dataSource` یا statusهای اصلی نامعتبر باشند، import متوقف شود.
- اگر barcode یا productCode با رکورد موجود تداخل قطعی داشته باشد، رکورد وارد نشود و به review برود.
- اگر اختلاف کد محک و کد داخلی قابل توضیح نباشد، adapter نباید آن‌ها را یکی فرض کند.
- اگر duplicate detector مطمئن نیست، merge ممنوع است و تصمیم باید به review queue برود.

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی مستند `Product Auto-fix Rules` و `Product Review Queue` است. هنوز هیچ UI، migration، database change یا merge پروژه کالا نباید انجام شود.
