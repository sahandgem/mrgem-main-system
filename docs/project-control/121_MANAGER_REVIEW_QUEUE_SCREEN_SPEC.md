# Manager Review Queue Screen Spec

آخرین به‌روزرسانی: 2026-06-30

## تعریف صفحه

Manager Review Queue Drill-down Screen نمای مفهومی تصمیم‌های منتظر بررسی مدیر است. صفحه باید evidence، risk، confidence، audit و پیشنهاد AI را نمایش دهد، اما در concept یا prototype آینده هیچ تصمیم واقعی اعمال نکند.

## هدف

- نمایش تصمیم‌های منتظر بررسی مدیر
- تفکیک `urgent`، `blocked`، `needs_review` و `low_confidence`
- نمایش دلیل ورود هر item به صف
- کمک به تصمیم انسانی با evidence و AI suggestion توضیح‌پذیر
- جلوگیری از action خودکار برای conflict، manual_only و audit_missing

## کاربران هدف

- manager
- reviewer

## Entry Point

`Central Cockpit Overview > Manager Review Queue Card`

این entry point در P43 فقط concept است و route واقعی محسوب نمی‌شود.

## بخش‌های صفحه

1. `top_summary_band`: تعداد کل، urgent، blocked، low confidence و audit missing.
2. `queue_filters`: فیلتر مفهومی module، priority، risk، confidence، audit و age.
3. `priority_lanes`: تفکیک urgent، needs review، blocked و normal.
4. `review_item_list`: خلاصه itemها با source، age و status.
5. `selected_item_detail_panel`: عنوان، شرح، evidence و blocked reason.
6. `ai_suggestion_area`: suggestion، reason و confidence بدون تصمیم نهایی.
7. `risk_confidence_audit_area`: نمایش مستقل سه محور کنترل.
8. `decision_reason_placeholder`: محل مفهومی ثبت دلیل تصمیم انسانی.
9. `audit_timeline_concept`: timeline خواندنی source، rule و review eventهای mock.

## actionهای مفهومی

- `view_item_concept`
- `view_evidence_concept`
- `view_ai_suggestion_concept`
- `mark_as_reviewed_concept`
- `request_correction_concept`
- `hold_concept`
- `escalate_concept`

## actionهای ممنوع

- approve یا reject واقعی
- write، mutation یا status change واقعی
- اتصال database، auth، backend یا storage
- تغییر document، financial event، product، inventory یا workforce data
- auto action برای تصمیم حساس

## stateها

| State | رفتار مفهومی |
|---|---|
| `empty` | نبود item بدون نمایش موفقیت ساختگی |
| `loading_mock` | skeleton یا loading صرفاً نمایشی |
| `error_mock` | خطای mock با امکان retry مفهومی |
| `blocked` | actionها غیرفعال و blocked reason واضح |
| `audit_missing` | تصمیم حساس مسدود |
| `conflict` | نیازمند manager review و بدون auto action |
| `manual_only` | فقط تصمیم انسانی با reason placeholder |

## معیار آمادگی concept

- queue و selected item همزمان قابل فهم باشند.
- priority با risk و confidence اشتباه نشود.
- blocked reason و audit state پنهان نباشند.
- AI به‌عنوان suggestion باقی بماند.
- هیچ متن یا action، عملیات واقعی را القا نکند.
