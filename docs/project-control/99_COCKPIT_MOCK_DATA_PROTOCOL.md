# Cockpit Mock Data Protocol

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند پروتکل داده mock برای prototype احتمالی آینده cockpit را تعریف می‌کند. هیچ داده واقعی، storage واقعی، route، component یا prototype در این فاز ساخته نمی‌شود.

## Cockpit Mock Data Protocol چیست؟

Cockpit Mock Data Protocol مشخص می‌کند اگر در آینده prototype ایزوله cockpit تایید شد، داده‌های نمونه باید کاملاً synthetic/mock، قابل تکرار و جدا از main باشند.

## چرا cockpit prototype باید با mock data شروع شود؟

- cockpit به چند ماژول حساس وصل می‌شود و نباید داده واقعی را زود وارد طراحی کند.
- mock data اجازه تست visual language، card density و decision flow را بدون ریسک می‌دهد.
- سناریوهای مصنوعی می‌توانند conflict، crisis، low confidence و manual_only را بدون خطر واقعی نشان دهند.
- main data، localStorage production keys و database باید دست‌نخورده بمانند.

## signalهای mock

- financial_pressure_signal
- product_import_warning_signal
- manager_review_queue_signal
- inventory_shortage_signal
- production_risk_signal
- workforce_risk_signal
- ai_suggestion_signal
- crisis_signal

## قرارداد هر mock signal

| فیلد | توضیح |
|---|---|
| signalId | شناسه یکتای mock signal |
| signalType | نوع signal |
| title | عنوان قابل نمایش |
| summary | خلاصه کوتاه |
| primaryMetric | عدد یا شاخص اصلی |
| riskLevel | low، medium، high، conflict یا manual_only |
| confidenceLevel | high، medium، low، conflict یا manual_only |
| sourceModule | ماژول مفهومی منبع |
| suggestedAction | action پیشنهادی در سطح mock |
| requiresManagerDecision | آیا تصمیم مدیر لازم است |
| auditState | no_audit_needed، audit_available، audit_required، audit_missing یا audit_blocking |
| generatedAt | زمان تولید mock |

## سناریوهای mock

- normal day
- high financial pressure
- product import blocked
- inventory shortage risk
- production risk
- workforce risk
- multiple manager reviews
- crisis signal raised

## قانون

- mock data نباید از داده واقعی ساخته شود.
- mock data فقط برای concept/prototype ایزوله است.
- mock data نباید وارد main شود.
- mock data نباید کلید localStorage production، database یا service واقعی بسازد.
- هر mock scenario باید expected visual state و expected decision boundary داشته باشد.
