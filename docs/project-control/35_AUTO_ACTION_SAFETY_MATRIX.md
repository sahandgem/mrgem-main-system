# Auto Action Safety Matrix

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مشخص می‌کند در معماری Automation-First مستر جم چه کارهایی می‌توانند auto action شوند، چه کارهایی همیشه review می‌خواهند و چه کارهایی manual only هستند.

این سند فقط طراحی کنترل است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Auto Action Safety Matrix چیست؟

`Auto Action Safety Matrix` مرز امنیتی بین اقدام خودکار، پیشنهاد، review و تصمیم دستی است. این ماتریس کمک می‌کند هر ماژول قبل از اجرای اتوماسیون بداند سطح ریسک اقدام چیست.

## کارهایی که می‌توانند auto action شوند

فقط وقتی `High confidence`، audit trail، source مشخص و نبود conflict برقرار باشد:

| کار | شرط ایمنی |
|---|---|
| normalize text | فقط پاک‌سازی فرمت، فاصله، نگارش یا دسته‌بندی غیرحساس. |
| suggest duplicate | فقط پیشنهاد duplicate، نه merge خودکار. |
| attach strong bank match | فقط match قوی با مبلغ، تاریخ، شماره پیگیری و نبود conflict. |
| confirm installment only under strict rules | فقط rule مصوب، مبلغ/تاریخ دقیق، نبود duplicate و audit کامل. |
| create warning | ایجاد هشدار بدون تغییر داده اصلی. |
| generate AI snapshot | snapshot خواندنی و نسخه‌دار، بدون mutate داده اصلی. |
| classify document | طبقه‌بندی پیشنهادی سند، با امکان review. |
| retry upload | تلاش مجدد امن برای upload بدون ایجاد رکورد تکراری. |

## کارهایی که همیشه review می‌خواهند

| کار | دلیل |
|---|---|
| پرداخت حساس | اثر مالی مستقیم و نیاز به تایید مدیر. |
| تغییر مالی مهم | تغییر مبلغ، تاریخ، طرف حساب، منبع پول یا وضعیت تایید. |
| merge کالا | خطر یکی شدن کالای متفاوت یا خراب شدن خروجی محک. |
| حذف داده | ریسک از دست رفتن اطلاعات یا audit. |
| تغییر rule | اثر مستقیم روی auto actionهای آینده. |
| conflict بین رسید و بانک | شواهد مالی ناسازگار است. |
| low confidence match | داده ناقص یا match ضعیف است. |
| تغییر موجودی حساس | اثر روی کالا، تولید، فروش یا مالی. |
| تغییر فرمول تولید | اثر روی هزینه، مواد، موجودی و خروجی تولید. |
| crisis signal حساس | نیازمند تحلیل انسانی قبل از اقدام بیرونی. |

## کارهایی که manual only هستند

| کار | دلیل |
|---|---|
| migration | تغییر ساختار پایدار داده فقط با تصمیم مرکز فرمان. |
| database change | اثر سیستمی و پرریسک. |
| auth change | اثر امنیتی مستقیم. |
| merge مستقیم پروژه پول یا کالا | طبق ADRهای فعلی ممنوع است. |
| تایید نهایی پرداخت‌های حساس | باید با manager approval انجام شود. |
| حذف دائمی داده | نیازمند تصمیم صریح و مسیر backup/rollback. |
| تغییر localStorage key اصلی | نیازمند ثبت، backup coverage و migration plan. |
| route جدید اصلی | نیازمند فاز مستقل و approval. |

## الزامات audit برای auto action

هر auto action باید ثبت کند:

- source data
- normalized data
- validation result
- confidence level
- rule version
- action reason
- affected record یا snapshot
- timestamp
- actor: system یا human
- rollback/correction path

## قانون توقف

اگر یک اقدام در بیش از یک دسته قرار گرفت، دسته امن‌تر ملاک است:

1. manual only
2. review required
3. auto action allowed

هیچ اقدام خودکار نباید فقط به دلیل راحتی عملیاتی از review یا manual only عبور کند.
