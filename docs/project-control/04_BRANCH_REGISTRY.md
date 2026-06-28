# Branch Registry

آخرین به‌روزرسانی: 2026-06-28

## کد شاخه‌ها

| کد | نام فارسی | نوع | نقش | وضعیت merge |
|---|---|---|---|---|
| CORE | هسته مرکزی | Mother Module | shell، route، قراردادها، navigation، state مشترک، کابین مرکزی | داخل پروژه اصلی |
| WF | نیروی انسانی | Mother Module | کارمندان، فضاها، زمان‌بندی، تحلیل، drift، readiness و عملیات مرتبط | داخل پروژه اصلی |
| FIN | مالی | Mother Module | فروش، هزینه، سود، پرداخت، جریان نقد، گزارش مالی | هنوز شروع نشده |
| PROD | تولید | Mother Module | ظرفیت تولید، سفارش تولید، کنترل کیفیت، برنامه تولید | هنوز شروع نشده |
| INV | انبار | Mother Module | موجودی، جابه‌جایی، کسری، حد سفارش، مغایرت | هنوز شروع نشده |
| UI | طراحی و تجربه کاربری | Mother Module | زبان بصری، RTL، dark mode، cockpit، responsive، accessibility | داخل پروژه اصلی |
| MOBILE | اپ موبایل | Mother Module | تجربه همراه، مشاهده سریع، ثبت سبک، اعلان‌های آینده | هنوز شروع نشده |
| DATA | استخراج داده و محک و بانک | Mother Module | import/export، اتصال محک، داده بانکی، کیفیت و تطبیق داده | نیمه‌فعال در WF |
| CONTROL | مرکز کنترل | Mother Module | تصمیم‌گیری، فازبندی، handoff، audit، do-not-touch و backlog | فعال |
| FIN-AUDIT | audit-app / داشبورد بحران نقدینگی | Subproject | منبع احتمالی schema نقدینگی، roles و RLS | فعلاً merge نشود |
| DATA-MAHAK | mahak-web-version / ثبت کالا و خروجی محک | Subproject | منبع احتمالی مدل کالا، بارکد، بانک سنگ و خروجی AI-ready | فعلاً merge نشود |

## قانون استفاده از کد شاخه

هر کار جدید باید حداقل یک کد شاخه داشته باشد. اگر کاری چند شاخه را لمس می‌کند، اثر متقاطع آن باید قبل از اجرا ثبت شود.

نمونه:

- `WF-P29`: استخراج واقعی چند صفحه کم‌ریسک از WorkforcePages
- `DATA-MAHAK-Px`: بررسی مدل کالا و خروجی محک، بدون merge مستقیم
- `FIN-AUDIT-Px`: بررسی schema نقدینگی، بدون merge مستقیم
- `CORE-Px`: تغییر route shell یا کابین مرکزی
- `CONTROL-Px`: فقط مستندسازی و کنترل پروژه

## شاخه فعال فعلی

شاخه اجرایی اصلی: `WF`

شاخه کنترل فعال: `CONTROL`

شاخه‌های پشتیبان: `CORE`, `UI`, `DATA`

زیرپروژه‌های ثبت‌شده اما merge نشده: `FIN-AUDIT`, `DATA-MAHAK`
