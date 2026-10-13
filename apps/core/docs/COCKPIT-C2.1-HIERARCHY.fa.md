# C2.1 — سلسله‌مراتب بصری و خوانایی Cockpit

## مبنا و هدف

نقطه بازگشت ساختار C2: `47ebdf1` با پیام `feat(core): establish Cockpit C2 structural shell`.
این commit تأیید Visual Design نیست. مراجع فضایی همچنان COCKPIT-DASHBOARD-SPEC.fa.md و COCKPIT-C2-SHELL.fa.md هستند.

هدف: تبدیل Dashboard Grid به Command Cockpit، با حفظ Left / Center / Right و معماری اصلی C2.

قانون اصلی: **Signal first → Metric second → Meaning third → Metadata last**.
مدیر باید وضعیت اولیه را از نشانگر و عدد بفهمد؛ خواندن چند جمله نباید پیش‌شرط فهم وضعیت باشد.

## قواعد اجزا

- Top System Bar یک Instrument Bar پیوسته با ارتفاع پایه ۴۸ پیکسل است. Boxهای هم‌اندازه مستقل حذف می‌شوند. Master Gem/Core کوچک و ثابت؛ وضعیت کلی، تعداد Attention، اعتماد داده و زمان عناصر اصلی هستند. Refresh کنترل ابزاری کوچک است؛ Header سایت‌مانند ساخته نمی‌شود.
- Workforce یک Surface اصلی دارد؛ کارت‌های داخلی حذف می‌شوند. خلاصه بالا شامل Coverage / Capacity / Conflict / Attention است. عدد پیش از توضیح دیده می‌شود و پایین فقط ۳ تا ۴ مورد مهم قرار می‌گیرد.
- Command Core غالب‌ترین ناحیه است. Status Summary فشرده، Attention صاحب بیشترین فضای مرکز و Upcoming Commitments کم‌اهمیت‌تر است.
- Attention به Command Row تبدیل می‌شود: نشانگر اولویت، مسئله اصلی، اثر کسب‌وکاری، زمان، ماژول/مقصد و سپس تازگی/اطمینان. Border کامل هر ردیف حذف و جداکننده ظریف استفاده می‌شود. Critical و Attention با رنگ محدود، label و marker مشخص می‌شوند؛ سطح ردیف قرمز یا کهربایی نمی‌شود.
- Production نیز Instrument Rail است: Summary metrics بالا و exceptions پایین. Mock/Experimental روشن اما کم‌غلبه است. هیچ منطق کسب‌وکاری جدیدی تعریف نمی‌شود.
- Important Changes یک Surface افقی مشترک با ۲ تا ۳ تغییر و divider است؛ از Attention کم‌اهمیت‌تر و فاقد Log فنی است.
- Vital Strip یک نوار پیوسته با شش segment فروش، نقدینگی، سفارش‌ها، نیروی انسانی، تولید و داده است. Metric برجسته، label کوچک، context کوتاه و divider ظریف؛ Border مستقل segment ممنوع است. داده ناموجود صفر تلقی نمی‌شود.

## Border و Typography

Borderهای داخلی باید محسوس کم شوند؛ قاب برای معماری اصلی، انتخاب و وضعیت مهم است. hierarchy با فاصله، هم‌ترازی، تایپوگرافی و divider ساخته می‌شود. فارسی زبان اصلی؛ label فنی انگلیسی حذف یا کم‌اهمیت می‌شود. Metric برجسته‌تر از توضیح و metadata آخرین سطح است. کاهش ارتفاع با کوچک‌کردن متن عملیاتی جبران نمی‌شود؛ ادامه موارد کم‌اولویت قابل دسترسی باقی می‌ماند.

## پذیرش

viewportهای 1920×1080، 1920×960، 1440×800 و به‌ویژه 1365×768 بررسی شوند. در viewport واقعی مدیر، مهم‌ترین Attention فوراً قابل تشخیص، Vital Strip قابل مشاهده، Rails قابل اسکن و اسکرول افقی صفر باشد. روز عادی، چند Attention، Stale/Partial/Error و Drawer نیز حفظ شوند. Tablet/Mobile نباید شکسته شوند؛ طراحی کامل Mobile مرحله مستقلی است.

## حدود مرحله

فقط apps/core. هیچ تغییر در apps/workforce، packages/module-contracts، P06 یا MAHAK-GATE مجاز نیست. validation، aggregation، view-model و Last Known Good حفظ می‌شوند. اتصال واقعی، API، دیتابیس و adapter واقعی اضافه نمی‌شود.

این مرحله Visual System نهایی نیست: Glow، Sci-Fi decoration، Motion جدید، chart پیچیده و Design System نهایی خارج از دامنه‌اند. پیاده‌سازی C2.1 فعلاً commit نمی‌شود؛ push و merge انجام نمی‌شود.
