# Manager Review Queue Mock Dataset Spec

آخرین به‌روزرسانی: 2026-06-30

## تعریف

این سند قرارداد mock dataset برای طراحی و prototype احتمالی آینده Manager Review Queue است. در CONTROL-P43 هیچ dataset اجرایی، فایل fixture یا prototype ساخته نمی‌شود.

## review itemهای mock

- `financial_payment_review`
- `bank_installment_confirmation_review`
- `product_import_duplicate_review`
- `product_feature_conflict_review`
- `inventory_shortage_review`
- `production_risk_review`
- `workforce_exception_review`
- `mobile_receipt_review`
- `ai_suggestion_review`
- `crisis_signal_review`

## قرارداد هر item

| فیلد | هدف |
|---|---|
| reviewItemId | شناسه synthetic یکتا |
| sourceModule | ماژول مفهومی منبع |
| title | عنوان کوتاه و قابل اسکن |
| summary | توضیح ساختگی item |
| priority | urgent، high، normal یا low |
| riskLevel | low، medium، high، conflict یا manual_only |
| confidenceLevel | high، medium، low، conflict یا manual_only |
| auditState | available، required، missing یا blocking |
| aiSuggestion | پیشنهاد mock و غیرقطعی AI |
| suggestedAction | action مفهومی پیشنهادی |
| requiresManagerDecision | نیاز به تصمیم انسانی |
| blockedReason | دلیل روشن توقف action |
| evidenceSummary | خلاصه evidence مصنوعی |
| decisionOptions | فهرست optionهای concept-only |
| createdAt | زمان synthetic و غیرواقعی |

## decisionOptions مجاز

- `approve_concept`
- `reject_concept`
- `hold_concept`
- `request_correction_concept`
- `escalate_concept`

## سناریوهای پوشش داده‌شده

- urgent با high risk و audit available
- conflict با action مسدود
- manual_only با decision انسانی
- low confidence با evidence ناکافی
- audit_missing با decision blocking
- item عادی برای کنترل empty/normal density
- AI suggestion با confidence متوسط و approval انسانی

## قوانین داده

- تمام itemها، اشخاص، اعداد، زمان‌ها و evidenceها synthetic/mock باشند.
- داده واقعی مالی، کالا، بانک، محک، کارمند، مشتری یا رسید استفاده نشود.
- هیچ شناسه یا متن برگرفته از production وارد fixture آینده نشود.
- mock dataset نباید در main، database یا production storage ذخیره شود.
- هر item باید expected visual state و expected decision boundary داشته باشد.
