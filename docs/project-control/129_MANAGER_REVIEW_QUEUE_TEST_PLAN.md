# Manager Review Queue Test Plan

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

این Test Plan فقط برای prototype ایزوله احتمالی آینده Manager Review Queue است. در CONTROL-P45 هیچ تست اجرایی، fixture یا prototype ساخته و اجرا نمی‌شود.

## هدف تست

- صحت نمایش queue، priority، risk، confidence و audit با mock data
- آشکار بودن blocked reason و مرز Human-in-the-loop
- اطمینان از suggestion-only بودن AI
- اثبات نبود write، decision mutation و production dependency
- ارزیابی stateهای normal، blocked، conflict، manual_only و crisis

## سناریوهای تست

| testId | scenario | انتظار اصلی |
|---|---|---|
| `mrq-test-01` | normal review queue | queue و detail panel بدون blocker نمایش داده شوند |
| `mrq-test-02` | urgent financial review | priority و high risk واضح، action واقعی ممنوع |
| `mrq-test-03` | duplicate product import review | conflict و duplicate evidence قابل مشاهده |
| `mrq-test-04` | audit_missing blocked review | decision path به‌صورت مفهومی block شود |
| `mrq-test-05` | low_confidence review | review انسانی و uncertainty واضح باشند |
| `mrq-test-06` | conflict/manual_only review | هیچ auto action قابل نمایش نباشد |
| `mrq-test-07` | crisis escalation | escalation فقط concept و audit blocking visible باشد |
| `mrq-test-08` | manager hold with reason | reason placeholder الزامی و status واقعی ثابت بماند |
| `mrq-test-09` | AI suggestion only | AI پیشنهاد بدهد و decision نهایی نمایش ندهد |

## قرارداد هر Test Case

- `testId`
- scenario
- mockInput
- expectedScreenState
- expectedRiskDisplay
- expectedConfidenceDisplay
- expectedAuditDisplay
- expectedAIBehavior
- expectedBlockedAction
- passCriteria
- failCriteria

## معیارهای عمومی Pass

- فقط mock/synthetic input استفاده شود.
- risk، confidence و audit مستقل و قابل مشاهده باشند.
- blocked reason در state حساس پنهان نباشد.
- AI فقط suggestion باشد.
- هیچ action یا write واقعی رخ ندهد.
- هیچ route، storage، database، auth، backend یا main dependency وجود نداشته باشد.

## معیارهای عمومی Fail

- استفاده یا نشت داده واقعی
- decision mutation یا نمایش موفقیت واقعی
- auto action برای conflict/manual_only
- تصمیم حساس در وضعیت audit_missing
- پنهان شدن risk/confidence/audit
- dependency به production یا main

## قوانین قطعی

- داده واقعی ممنوع است.
- action و write واقعی ممنوع‌اند.
- اجرای تست واقعی فقط بعد از build approval مستقل مجاز است.
