# Design Lab Screen Spec Template and Review Checklist

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند قالب screen spec و checklist بررسی خروجی Design Lab را تعریف می‌کند. این قالب برای طراحی مفهومی است و ساخت UI، route، component یا prototype واقعی محسوب نمی‌شود.

## Screen Spec Template چیست؟

Screen Spec Template قالب استانداردی است که هر screen concept باید با آن توضیح داده شود تا هدف، داده، actionها، ریسک، confidence، AI behavior، audit و محدودیت‌های implementation قابل بررسی باشند.

## قالب پیشنهادی هر screen spec

| بخش | توضیح |
|---|---|
| screen title | عنوان صفحه یا screen concept |
| screen goal | هدف اصلی صفحه |
| user role | نقش کاربر هدف |
| entry point | از کجا وارد این screen می‌شود |
| data source | منبع داده، ترجیحاً mock/synthetic یا snapshot مفهومی |
| primary cards | کارت‌های اصلی تصمیم یا KPI |
| secondary cards | کارت‌ها یا بخش‌های کمکی |
| actions | actionهای مجاز در سطح concept |
| decision points | نقطه‌های تصمیم انسانی یا مدیریتی |
| risk/confidence display | روش نمایش risk و confidence |
| AI suggestion behavior | AI چه چیزی پیشنهاد می‌دهد و چه چیزی نباید انجام دهد |
| audit trail visibility | audit کجا و چطور دیده می‌شود |
| empty/loading/error states | وضعیت خالی، بارگذاری و خطا |
| mobile/tablet/desktop notes | نکات responsive بدون ساخت UI واقعی |
| accessibility notes | خوانایی، contrast، keyboard و وضوح متن |
| implementation restrictions | چیزهایی که در این مرحله نباید ساخته شوند |

## Review Checklist

| پرسش | نتیجه مورد انتظار |
|---|---|
| آیا هدف صفحه واضح است؟ | هدف باید در یک جمله روشن باشد |
| آیا کاربر در ۱۰ ثانیه وضعیت را می‌فهمد؟ | KPI، هشدار و action اصلی باید قابل scan باشند |
| آیا action اصلی واضح است؟ | کاربر باید بداند قدم بعدی چیست |
| آیا risk و confidence واضح است؟ | سطح ریسک و اطمینان نباید پنهان باشد |
| آیا AI فقط suggestion است؟ | AI نباید تصمیم حساس را اجرا کند |
| آیا تصمیم حساس نیازمند approval است؟ | مرز approval باید دیده شود |
| آیا audit visible است؟ | audit reference یا placeholder باید مشخص باشد |
| آیا داده واقعی استفاده نشده؟ | فقط mock/synthetic یا concept مجاز است |
| آیا route/component/code ساخته نشده؟ | خروجی باید مستند یا mock باشد |
| آیا خروجی فقط concept است؟ | نباید قابلیت اجرایی داشته باشد |

## خروجی checklist

| خروجی | معنی |
|---|---|
| approved | concept برای مرحله بعدی بررسی یا handoff قابل قبول است |
| needs_revision | قبل از ادامه باید اصلاح شود |
| rejected | مسیر طراحی فعلی قابل قبول نیست |
| frozen | ادامه کار تا تصمیم مستقل مرکز کنترل متوقف است |

## حداقل شرط approved

یک screen spec فقط وقتی approved می‌شود که هدف، نقش کاربر، داده، action، risk/confidence، AI boundary، audit visibility، empty/error state و implementation restrictions کامل باشد.
