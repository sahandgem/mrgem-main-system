# Cockpit Manager Decision Flow Spec

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند تصمیم‌های مدیریتی داخل cockpit را در سطح مفهومی تعریف می‌کند. هیچ decision engine، UI، component، route یا audit اجرایی در این فاز ساخته نمی‌شود.

## Cockpit Manager Decision Flow چیست؟

Cockpit Manager Decision Flow مشخص می‌کند مدیر در cockpit چه نوع تصمیم‌هایی می‌گیرد، هر تصمیم چه داده‌ای لازم دارد و چطور باید با risk، confidence، AI suggestion و audit reference همراه شود.

## تصمیم‌های مدیر در cockpit

- approve
- reject
- hold
- request correction
- escalate
- override with reason
- confirm installment
- approve import valid only
- block import
- start production review
- request inventory check

## قرارداد هر تصمیم

| فیلد | توضیح |
|---|---|
| decisionId | شناسه یکتا برای decision |
| decisionType | نوع تصمیم مثل approve، reject، hold |
| sourceCard | کارت cockpit که تصمیم از آن شروع شده |
| sourceModule | ماژول منبع مثل Finance، Product، Inventory، WF |
| relatedDocument | سند یا report مرتبط، اگر وجود دارد |
| relatedEvent | event یا signal مرتبط، اگر وجود دارد |
| riskFlags | ریسک‌های اثرگذار روی تصمیم |
| confidenceLevel | سطح confidence تصمیم یا داده |
| aiSuggestionReference | ارجاع به پیشنهاد AI، اگر وجود دارد |
| decisionReason | دلیل انسانی تصمیم |
| actor | شخص یا نقش تصمیم‌گیر |
| timestamp | زمان تصمیم |
| auditReference | ارجاع audit یا placeholder مفهومی |

## قوانین تصمیم حساس

- تصمیم حساس بدون audit ممنوع است.
- AI فقط suggestion دارد، decision ندارد.
- override مدیر باید دلیل، دامنه، risk acceptance و audit داشته باشد.
- conflict و manual_only نباید auto action شوند.
- decision بدون sourceCard، riskFlags یا confidenceLevel نباید در conceptهای حساس approved شود.

## ارتباط با کارت‌ها

| sourceCard | تصمیم‌های رایج |
|---|---|
| Financial Pressure Card | hold، approve، request correction، escalate |
| Installment Confirmation Card | confirm installment، hold، reject |
| Product Import Warning Card | approve import valid only، block import، request correction |
| Inventory Shortage Card | request inventory check، escalate |
| Production Risk Card | start production review، hold |
| Manager Review Queue Card | approve، reject، correction، escalate |
| AI Suggestion Card | accept for review، ignore، escalate |
| Crisis Signal Card | escalate، hold، request correction |

## خروجی تصمیم

خروجی هر تصمیم در این مرحله فقط concept است و باید برای آینده بتواند به Decision Audit، Manager Review Report یا Business Event متصل شود. هیچ mutate واقعی در main انجام نمی‌شود.
