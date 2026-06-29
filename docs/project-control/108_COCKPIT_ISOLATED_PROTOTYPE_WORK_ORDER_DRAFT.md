# Cockpit Isolated Prototype Work Order Draft

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این Work Order فقط draft مستنداتی است. هیچ مجوز، فایل اجرایی یا شروع کاری برای prototype ایجاد نمی‌کند.

## Work Order Draft چیست؟

شرح کنترل‌شده هدف، دامنه، خروجی و ممنوعیت‌های کاری است که در صورت approval آینده می‌تواند برای ساخت prototype ایزوله Central Cockpit Overview Screen صادر شود.

## هدف ساخت احتمالی آینده

- نمایش Central Cockpit Overview با mock signalهای مصوب
- ارزیابی layout کارت‌ها و فهم وضعیت در کمتر از ۱۰ ثانیه
- نمایش مستقل risk، confidence و audit state
- نمایش AI suggestion به عنوان پیشنهاد، نه تصمیم نهایی
- نمایش drill-down concept بدون route یا navigation واقعی
- اثبات نبود هرگونه action و persistence واقعی

## محدوده مجاز فقط در صورت approval آینده

- mock-only overview screen
- isolated mock data service
- prototype banner و visible demo label
- reset demo state
- visual risk/confidence badges
- audit mock indicators
- AI Suggestion Mock Panel
- بدون persistence واقعی

## محدوده ممنوع

- database، migration، backend و auth
- route و navigation اصلی
- production component dependency
- production localStorage key یا shared storage
- write، approval، reject یا import واقعی
- اتصال به محک، بانک یا داده مالی واقعی
- داده واقعی کالا، موجودی یا کارمند
- هر action برگشت‌ناپذیر

## خروجی احتمالی آینده

- Cockpit Overview Prototype
- Mock Signal Renderer
- Card Layout Demo
- Risk/Confidence Visual Demo
- AI Suggestion Mock Panel
- Audit Summary Mock Area

## معیار تحویل احتمالی

- فقط file scope تاییدشده تغییر کرده باشد.
- تمام سناریوها synthetic و resetپذیر باشند.
- test plan و rollback verification اجرا و مستند شوند.
- هیچ route، production storage، database، auth یا real data dependency وجود نداشته باشد.

## قانون

این Work Order فقط `DRAFT` است. شروع ساخت واقعی به دستور مستقل مرکز کنترل و تصمیم `approved_for_build` نیاز دارد.
