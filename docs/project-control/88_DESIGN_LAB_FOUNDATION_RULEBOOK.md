# Design Lab Foundation Rulebook

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند خروجی CONTROL-P31-BATCH است و قانون‌نامه پایه Design Lab را برای مستر جم تعریف می‌کند. این سند مجوز ساخت UI واقعی، prototype واقعی، route، component، storage، database، migration، auth یا اتصال مستقیم به main نیست.

## Design Lab Foundation چیست؟

Design Lab Foundation مجموعه قوانین، قراردادها و مرزهای طراحی است که قبل از هر prototype یا implementation باید وجود داشته باشد. هدف آن این است که طراحی‌ها قابل فهم، قابل بررسی، قابل handoff و امن باشند، بدون اینکه main app تغییر کند.

## نقش Design Lab در معماری مستر جم

Design Lab فضای جداگانه مفهومی برای طراحی تجربه کاربری، flow، screen spec، visual language و decision UX است. Design Lab باید ایده‌ها را روشن کند، ریسک‌ها را قابل دیدن کند و مسیر handoff را آماده کند؛ اما نباید خودش main app را تغییر دهد.

## خروجی‌هایی که Design Lab تولید می‌کند

- flow map
- wireframe
- mock screen
- screen spec
- component pattern
- design token proposal
- UX scenario
- interaction rule
- risk/confidence visual rule
- manager decision UX
- AI suggestion UX

## کارهایی که Design Lab انجام نمی‌دهد

- کدنویسی اجرایی.
- route واقعی.
- component واقعی.
- database.
- migration.
- auth.
- storage واقعی.
- اتصال مستقیم به main.
- تغییر UI اصلی.
- استفاده از داده واقعی.
- تصمیم‌گیری حساس به جای مدیر.

## اصول طراحی

- cockpit-like: صفحه‌ها باید تصمیم‌محور، فشرده و مدیریتی باشند.
- فارسی و RTL: زبان، چیدمان و خوانش باید برای کاربر فارسی‌زبان طبیعی باشد.
- dark-first: طراحی‌ها باید اول با فضای dark/cockpit قابل خواندن باشند.
- مدیر باید در ۱۰ ثانیه وضعیت را بفهمد.
- هر هشدار باید دلیل داشته باشد.
- هر عدد مهم باید drill-down داشته باشد.
- AI پیشنهاد می‌دهد، تصمیم حساس با انسان است.
- risk و confidence باید واضح دیده شوند.
- UI نباید تصمیم حساس را پنهان کند.

## قانون حساسیت تصمیم

هر طراحی که با پول، کالا، import، review، approval، rollback، داده حساس یا تصمیم مدیریتی کار می‌کند باید این موارد را نشان دهد:

- دلیل هشدار.
- منبع داده.
- confidence.
- risk level.
- نیاز به approval.
- audit reference یا audit placeholder.
- مرز اینکه AI فقط پیشنهاد داده است.

## معیار خروجی قابل قبول

یک خروجی Design Lab فقط زمانی قابل بررسی است که هدف صفحه، کاربر هدف، ورودی/خروجی داده، actionهای مجاز، actionهای ممنوع، risk/confidence، audit و وضعیت handoff آن روشن باشد.
