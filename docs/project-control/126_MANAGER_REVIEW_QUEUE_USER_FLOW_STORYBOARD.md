# Manager Review Queue User Flow Storyboard

آخرین به‌روزرسانی: 2026-06-30

## User Flow Storyboard چیست؟

شرح مرحله‌به‌مرحله مسیر مفهومی مدیر از Overview تا مشاهده evidence، پیشنهاد AI و انتخاب یک decision path غیرواقعی است. تمام سناریوها mock-only و بدون mutation هستند.

## مسیر اصلی کاربر

1. `Central Cockpit Overview`
2. `Manager Review Queue Card`
3. `Queue Summary`
4. `Filter by priority / risk / audit`
5. `Select review item`
6. `View evidence summary`
7. `View AI suggestion`
8. `View risk / confidence / audit state`
9. `Choose conceptual decision path`
10. `Enter decision reason placeholder`
11. `View audit timeline concept`

این مسیر entry point و drill-down مفهومی است و route واقعی ایجاد نمی‌کند.

## سناریوهای Storyboard

| scenarioId | Review Item | Risk / Confidence / Audit | توجه مدیر | Concept Action | Blocked Action | AI Behavior | Audit Behavior |
|---|---|---|---|---|---|---|---|
| `flow-normal-01` | normal review queue | medium / high / available | بررسی عادی | view، hold | write واقعی | پیشنهاد اولویت | timeline mock |
| `flow-fin-urgent-02` | urgent financial review | high / high / required | فوری | escalate، hold | approve واقعی | پیشنهاد با دلیل | reason required |
| `flow-product-dup-03` | duplicate product import | conflict / high / available | بررسی duplicate | request correction | merge واقعی | مقایسه evidence | duplicate audit mock |
| `flow-audit-missing-04` | audit_missing review | high / medium / missing | رفع audit blocker | view evidence | همه decisionها | فقط هشدار | decision blocked |
| `flow-low-confidence-05` | low_confidence review | medium / low / available | تصمیم انسانی | hold، request correction | auto action | uncertainty واضح | review event mock |
| `flow-manual-06` | conflict/manual_only | conflict / manual_only / required | تصمیم حساس | escalate | auto approve/reject | suggestion only | reason mandatory |
| `flow-crisis-07` | crisis signal | high / low / blocking | جمع‌آوری evidence | escalate concept | crisis mutation | عدم قطعیت واضح | audit blocking |
| `flow-hold-08` | manager hold with reason | medium / medium / available | ثبت دلیل | hold concept | status change واقعی | پیشنهاد next evidence | reason timeline mock |

## قرارداد هر سناریو

- `scenarioId`
- entry point
- review item type
- visible risk/confidence/audit
- expected manager attention
- allowed concept action
- blocked action
- AI behavior
- audit behavior

## قواعد

- هیچ سناریو action یا status change واقعی ندارد.
- هیچ داده واقعی مالی، کالا، بانک، محک، کارمند یا مشتری استفاده نمی‌شود.
- AI هرگز تصمیم نهایی نیست.
- blocked reason و audit state در همه مسیرهای حساس visible هستند.
