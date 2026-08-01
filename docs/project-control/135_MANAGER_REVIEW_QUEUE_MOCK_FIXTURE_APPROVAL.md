# Manager Review Queue Mock Fixture Approval

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

`Mock Fixture Contract = APPROVED_FOR_ISOLATED_BUILD_NEXT_STEP`

این approval فقط برای داده synthetic داخل prototype آینده است و مجوز استفاده از داده واقعی نیست.

## Itemهای مجاز

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

## قرارداد هر Item

- reviewItemId
- sourceModule
- title
- summary
- priority
- riskLevel
- confidenceLevel
- auditState
- aiSuggestion
- suggestedAction
- requiresManagerDecision
- blockedReason
- evidenceSummary
- decisionOptions
- createdAt

## decisionOptions مجاز

- `approve_concept`
- `reject_concept`
- `hold_concept`
- `request_correction_concept`
- `escalate_concept`

## قواعد Fixture

- همه شناسه‌ها، متن‌ها، اعداد و تاریخ‌ها synthetic باشند.
- هیچ داده واقعی مالی، کالا، بانک، محک، کارمند، مشتری یا رسید استفاده نشود.
- optionها فقط concept باشند و هیچ mutation واقعی نداشته باشند.
- fixture نباید وارد main، database یا production storage شود.
- هر item باید expected risk، confidence، audit و blocked state داشته باشد.
