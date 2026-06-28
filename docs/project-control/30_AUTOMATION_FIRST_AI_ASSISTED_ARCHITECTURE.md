# Automation-First AI-Assisted Architecture

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند اصل معماری `Automation-First` و `AI-Assisted` را برای کل سیستم مستر جم ثبت می‌کند. از این مرحله به بعد، طراحی هر شاخه باید فرض کند که کارهای تکراری، قابل تشخیص و کم‌ریسک تا جای امن توسط سیستم انجام شوند و انسان برای بررسی موارد مشکوک، تصمیم‌های حساس و کنترل نهایی وارد شود.

این سند فقط تصمیم معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Automation-First یعنی چه؟

`Automation-First` یعنی جریان‌های کاری از ابتدا طوری طراحی شوند که سیستم بتواند داده را بگیرد، تمیز کند، اعتبارسنجی کند، تحلیل کند، پیشنهاد بدهد و فقط وقتی شرایط امن است اقدام خودکار انجام دهد.

اصل کلی:

1. data enters
2. system normalizes
3. system validates
4. system analyzes
5. system suggests
6. system auto-acts only when safe
7. human reviews risky or uncertain cases
8. everything is logged

## AI-Assisted یعنی چه؟

`AI-Assisted` یعنی هوش مصنوعی نقش کمک‌تحلیل‌گر و کمک‌تصمیم‌گیر دارد، نه جایگزین بی‌قید مدیر. AI باید anomaly، pattern، risk، suggestion و summary تولید کند، اما تصمیم‌های حساس باید با confidence، rule، audit trail و در صورت نیاز تایید انسانی همراه باشند.

## چرا مستر جم باید به سمت اتوماسیون و AI برود؟

- کاهش کار دستی تکراری.
- کاهش خطای انسانی در ثبت و تطبیق داده.
- سرعت بیشتر در تشخیص بحران مالی، کسری موجودی، تداخل برنامه یا ریسک تولید.
- تبدیل داده‌های پراکنده به هشدار و پیشنهاد مدیریتی.
- ساخت cockpit مرکزی که قبل از بحران، سیگنال‌های ضعیف را نشان دهد.
- قابل audit شدن تصمیم‌ها، تاییدها و اصلاح‌ها.

## کاربرد در Finance

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| bank excel automation | Excel بانک در staging خوانده، normalize و validate شود؛ import مستقیم ممنوع است. |
| transaction description matcher | شرح تراکنش با ruleهای مدیر و confidence score تحلیل شود. |
| receipt review | رسید با bank transaction و financial event match شود و mismatch به review برود. |
| installment confirmation | فقط high confidence با rule مصوب و audit trail می‌تواند auto confirm شود. |
| liquidity alerts | سیستم cash-in، cash-out، سررسید و mismatch را به هشدار نقدینگی تبدیل کند. |
| manager approval | پرداخت حساس، conflict و correction باید به تایید مدیر برود. |

## کاربرد در Product

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| import validator | کالا قبل از ورود normalize و validate شود. |
| duplicate detector | barcode، productCode، mahakCode و شباهت نام/وزن/سنگ/گروه بررسی شود. |
| auto-fix suggestions | اصلاح‌های پیشنهادی فقط به عنوان suggestion یا با approval اجرا شوند. |
| review queue | duplicate، warning و merge candidate وارد صف بررسی شوند. |
| Mahak export control | خروجی محک فقط پس از validator و duplicate resolution آماده شود. |
| AI product snapshot | snapshot تمیز و نسخه‌دار برای تحلیل AI تولید شود. |

## کاربرد در Production

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| formula validation | فرمول تولید قبل از اجرا از نظر داده ناقص، وزن و مواد کنترل شود. |
| material requirement suggestion | سیستم مواد لازم و کمبود احتمالی را پیشنهاد دهد. |
| production cost estimation | هزینه تولید بر اساس مواد، اجرت، زمان و ضایعات تخمین زده شود. |
| waste/anomaly detection | ضایعات یا خروجی غیرعادی هشدار داده شود. |
| production risk alerts | ریسک تاخیر، کمبود مواد یا هزینه غیرعادی به مدیر گزارش شود. |

## کاربرد در Inventory

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| stock shortage alerts | کمبود موجودی و نزدیک شدن به نقطه سفارش هشدار شود. |
| duplicate/mismatch detection | مغایرت کالا، بارکد، مکان یا شمارش تشخیص داده شود. |
| reorder suggestion | سیستم سفارش مجدد یا جابه‌جایی موجودی را پیشنهاد دهد. |
| inventory movement analysis | ورود/خروج و روند مصرف برای تصمیم مدیریتی تحلیل شود. |

## کاربرد در Workforce

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| preventive alerts | سیستم پیش از بحران برنامه هفتگی، هشدار پیشگیرانه بدهد. |
| monthly health analysis | سلامت ماهانه عملیات از تاریخچه و baseline تحلیل شود. |
| decision support | پیشنهاد تصمیم به مدیر داده شود، نه اجرای کور. |
| risk detection | ریسک ظرفیت، تمرکز، پوشش، تداخل و فشار کاری شناسایی شود. |
| operational history analysis | روندهای گذشته برای کاهش drift و خطای تکراری بررسی شوند. |

## کاربرد در Mobile

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| receipt photo capture | عکس رسید ثبت و برای review/attachment آماده شود. |
| offline queue | داده بدون اتصال نگه‌داری و بعداً sync شود، بدون از دست رفتن audit. |
| document classification | AI نوع سند را پیشنهاد دهد، نه اینکه بدون کنترل نهایی ثبت کند. |
| upload retry automation | ارسال ناموفق با policy امن دوباره تلاش شود. |
| attachment matching | رسید به رویداد مالی یا تراکنش بانکی پیشنهاد match بگیرد. |

## کاربرد در Central Cockpit

| قابلیت | رفتار Automation-First و AI-Assisted |
|---|---|
| cross-module analysis | داده مالی، کالا، انبار، تولید و WF در سطح snapshot تحلیل شود. |
| management alerts | هشدارهای مدیریتی با سطح ریسک و علت نمایش داده شوند. |
| decision recommendations | سیستم پیشنهاد عملیاتی بدهد و مدیر تصمیم نهایی را بگیرد. |
| crisis signals | سیگنال‌های بحران نقدینگی، کمبود موجودی، فشار تولید یا اختلال نیروی انسانی دیده شوند. |
| AI-ready snapshots | خروجی تمیز، نسخه‌دار و قابل audit برای AI آماده شود. |

## قوانین توقف

- هیچ auto action بدون audit trail مجاز نیست.
- هیچ AI suggestion نباید بدون confidence و منبع داده نمایش قطعی شود.
- هیچ داده خام نباید مستقیم وارد تحلیل نهایی شود.
- هیچ اقدام حساس بدون review یا manager approval انجام نشود.
- هیچ کد اجرایی برای اتوماسیون بدون فاز مستقل و approval مرکز فرمان ساخته نشود.
