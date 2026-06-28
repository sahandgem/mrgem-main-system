# Baseline Compatibility بعد از P25/P26

## baseline legacy چیست؟

baseline legacy یعنی baseline یا backup bundleای که قبل از ثبت metadata رسمی backup coverage ساخته شده باشد. این حالت معمولاً وقتی رخ می‌دهد که:

- `coverageVersion` در `metadata` وجود ندارد.
- `includedKeys` یا شمارش keyها وجود ندارد.
- تعداد keyهای شناخته‌شده یا included کمتر از registry فعلی است.
- baseline فقط بخشی از localStorage keyهای امروز را داشته باشد.

## چرا بعد از P25 مهم شد؟

در P25 پوشش backup از ۱۸ key به ۲۳ key رسید و فقط `komak.workforce.snapshots.v1` عمداً بیرون ماند. بنابراین baselineهای قدیمی ممکن است checksum متفاوتی بسازند، نه به خاطر تغییر واقعی کار، بلکه به خاطر اضافه‌شدن keyهای audit/retention/signoff به bundle.

## سیستم چطور تشخیص می‌دهد؟

- backup bundleهای جدید `coverageVersion`, `knownKeyCount`, `includedKeyCount`, `excludedKeyCount`, `includedKeys`, `excludedKeys` دارند.
- helper `isLegacyBackupCoverageBaseline` نبودن این metadata یا ناقص‌بودن آن را legacy حساب می‌کند.
- helper `calculateComparableChecksum` فقط keyهای مشترک baseline و وضعیت فعلی را برای مقایسه محاسبه می‌کند.
- `BaselineDriftReport` فیلدهای `isLegacyBaseline`, `compatibilityWarnings`, `comparableKeyCount`, `nonComparableKeyCount` و checksum قابل‌مقایسه را نشان می‌دهد.

## چه چیزی migrate نمی‌شود؟

- signoffهای قدیمی بازنویسی نمی‌شوند.
- checksumهای قدیمی overwrite نمی‌شوند.
- snapshotهای قدیمی تغییر نمی‌کنند.
- localStorage key جدید ساخته نمی‌شود.
- import/restore قبلی تخریب نمی‌شود.

## چه زمانی resignoff لازم است؟

اگر تغییر واقعی در keyهای مشترک مثل فضاها، کارمندان، نوع کارها، برنامه، قوانین یا تنظیمات تحلیل دیده شود، drift همچنان واقعی است و ممکن است resignoff لازم باشد. اگر اختلاف فقط از اضافه‌شدن keyهای جدید P25 باشد، سیستم آن را warning سازگاری گزارش می‌کند و به‌تنهایی drift بحرانی نمی‌سازد.

## متن راهنمای اپراتور در P27

پیام UI باید آرام و دقیق باشد:

- نگوید داده خراب است.
- بگوید baseline قدیمی است، خراب نیست.
- توضیح بدهد مقایسه روی keyهای مشترک انجام می‌شود.
- برای دقت بالاتر پیشنهاد بازتأیید عملیاتی جدید بدهد.

نمونه پیام:

`Baseline قدیمی است، خراب نیست`

این پیام در صفحه‌های `baseline-drift`, `launch-signoff` و `data-center` به صورت notice سبک نمایش داده می‌شود، فقط وقتی report واقعاً `isLegacyBaseline=true` باشد.
