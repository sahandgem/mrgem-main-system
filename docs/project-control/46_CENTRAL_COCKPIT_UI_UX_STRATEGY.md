# Central Cockpit UI UX Strategy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند استراتژی UI/UX کابین خلبانی مرکزی مستر جم را تعریف می‌کند. کابین مرکزی باید وضعیت کل سیستم را سریع، قابل اعتماد و قابل drill-down نشان دهد.

این سند فقط طراحی است و هیچ UI اجرایی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## کابین خلبانی مرکزی باید چه کاری کند؟

کابین مرکزی باید برای مدیر تصویر فوری از سلامت کسب‌وکار بسازد: فشار مالی، هشدار کالا، وضعیت موجودی، ریسک تولید، ریسک نیروی انسانی، صف review و پیشنهادهای AI. هدف این است که مدیر در چند ثانیه بفهمد چه چیزی امن است، چه چیزی نیاز به توجه دارد و چه چیزی بحرانی است.

## اصل UI

- مدیر در ۱۰ ثانیه وضعیت را بفهمد.
- هر هشدار دلیل داشته باشد.
- هر عدد قابل drill-down باشد.
- موارد حساس با review boundary دیده شوند.
- AI فقط پیشنهاد بدهد، تصمیم حساس با مدیر باشد.
- UI باید فارسی، RTL، dark mode، مدیریتی و قابل اسکن باشد.
- کارت‌ها باید خلاصه، تصویری و کم‌متن باشند.

## بخش‌های صفحه اصلی cockpit

| بخش | هدف |
|---|---|
| financial pressure | نمایش فشار نقدینگی، پرداخت‌های حساس و سررسیدها. |
| cash-in/cash-out | روند ورود و خروج پول و mismatchهای احتمالی. |
| product/import warnings | هشدار import کالا، duplicate، barcode و Mahak readiness. |
| inventory shortage | کمبود موجودی، reorder suggestion و mismatch. |
| production risk | ریسک فرمول، مواد، هزینه و anomaly تولید. |
| workforce risk | ریسک برنامه، ظرفیت، تمرکز، پوشش و هشدار پیشگیرانه. |
| mobile receipt queue | رسیدهای موبایل، upload status و attachment matching. |
| AI suggestions | پیشنهادهای AI با confidence و source. |
| manager review queue | آیتم‌های نیازمند تصمیم مدیر یا reviewer. |
| crisis signals | سیگنال‌های بحرانی چندماژولی. |

## رفتار drill-down

هر KPI یا هشدار باید بتواند به سطح بعدی برود:

- summary به detail.
- detail به source snapshot.
- source snapshot به audit reference.
- decision card به review queue.
- AI suggestion به evidence و confidence.

## زبان بصری ریسک

| سطح | هدف بصری |
|---|---|
| OK | وضعیت امن و بدون نیاز فوری. |
| Attention | نیاز به بررسی یا روند رو به ریسک. |
| Critical | نیاز به اقدام مدیریتی. |
| Review | منتظر تصمیم انسان. |
| AI Suggestion | پیشنهاد غیرقطعی با confidence. |

## محدودیت فعلی

این سند فقط strategy است. طراحی بصری باید در Design Lab انجام شود و مستقیم وارد main نشود.
