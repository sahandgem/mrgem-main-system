# Design Lab Output Contract and Handoff

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند قرارداد خروجی‌های Design Lab و نحوه handoff آن‌ها را تعریف می‌کند. خروجی Design Lab مفهومی است و بدون approval مستقل وارد main یا prototype اجرایی نمی‌شود.

## Design Lab Output Contract چیست؟

Design Lab Output Contract قالب مشترک برای تحویل هر خروجی طراحی است. این قرارداد باعث می‌شود هر screen، flow یا pattern قبل از بررسی مرکز کنترل، هدف، داده، action، risk، confidence، AI suggestion و audit boundary مشخص داشته باشد.

## فیلدهای الزامی هر خروجی

| فیلد | توضیح |
|---|---|
| outputId | شناسه یکتا برای خروجی Design Lab |
| workstream | شاخه یا موضوع مثل Product Import، Cockpit، Finance یا Workforce |
| screenName | نام screen یا pattern |
| purpose | هدف خروجی |
| targetUser | کاربر هدف مثل manager، reviewer، operator |
| inputData | داده ورودی مفهومی یا synthetic |
| outputData | داده خروجی مفهومی، decision یا report |
| mainActions | actionهای مجاز در سطح concept |
| forbiddenActions | actionهایی که نباید طراحی یا القا شوند |
| riskDisplay | روش نمایش ریسک |
| confidenceDisplay | روش نمایش confidence |
| aiSuggestionArea | محل و رفتار پیشنهاد AI |
| managerDecisionArea | محل تصمیم انسانی یا مدیریتی |
| auditReferenceArea | محل نمایش audit reference یا placeholder |
| emptyState | وضعیت خالی |
| errorState | وضعیت خطا |
| loadingState | وضعیت بارگذاری |
| handoffStatus | وضعیت handoff |

## وضعیت‌های handoff

| وضعیت | معنی |
|---|---|
| draft | هنوز برای بررسی آماده نیست |
| ready_for_review | آماده بررسی مرکز کنترل یا Design review |
| approved_for_prototype | فقط برای prototype مستقل و با approval جداگانه مجاز است |
| rejected | خروجی رد شده و نباید ادامه پیدا کند |
| needs_revision | نیازمند اصلاح قبل از بررسی دوباره |
| frozen | خروجی برای implementation یا ادامه کار متوقف شده است |

## قانون‌ها

- هیچ خروجی Design Lab مستقیم وارد main نشود.
- هر انتقال به prototype نیازمند approval مستقل است.
- هر انتقال به implementation نیازمند approval مستقل و test plan است.
- اگر screen با داده حساس کار می‌کند، risk و audit باید مشخص باشند.
- اگر screen تصمیم حساس دارد، managerDecisionArea و approval boundary باید روشن باشد.
- اگر AI در screen دیده می‌شود، باید suggestion باشد، نه تصمیم نهایی.

## Handoff Package

هر handoff باید حداقل شامل این موارد باشد:

- output contract تکمیل‌شده.
- screen spec یا flow map.
- mock/synthetic data reference.
- risk/confidence rule.
- audit boundary.
- implementation restrictions.
- review checklist result.
- پیشنهاد next step بدون دستور اجرا.
