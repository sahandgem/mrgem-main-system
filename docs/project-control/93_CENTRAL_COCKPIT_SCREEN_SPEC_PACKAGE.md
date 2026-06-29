# Central Cockpit Screen Spec Package

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند screen specهای مفهومی اولیه برای Central Cockpit را تعریف می‌کند. این specها خروجی Design Lab هستند و ساخت UI واقعی، component، route یا prototype محسوب نمی‌شوند.

## Central Cockpit Screen Spec Package چیست؟

Central Cockpit Screen Spec Package مجموعه screen conceptهایی است که مسیر overview تا drill-down، review، AI suggestion و crisis بررسی را برای مدیر تعریف می‌کند.

## Screen Specs مفهومی اولیه

### Central Cockpit Overview Screen

| بخش | توضیح |
|---|---|
| screen goal | نمایش وضعیت کل کسب‌وکار در ۱۰ ثانیه |
| target user | manager، owner، senior operator |
| entry point | صفحه اصلی cockpit آینده |
| input data | module snapshots، risk summaries، confidence summaries |
| primary cards | Financial Pressure، Product Import Warning، Manager Review Queue، Crisis Signal |
| secondary cards | Inventory Shortage، Production Risk، Workforce Risk، Mobile Receipt Queue، AI Suggestion |
| actions | drill-down، open review queue، view crisis details |
| decision points | انتخاب اینکه کدام هشدار باید بررسی شود |
| risk/confidence display | badgeهای risk/confidence روی هر کارت |
| AI suggestion area | خلاصه ۳ تا ۵ پیشنهاد با evidence |
| manager decision area | فقط shortcut به review، نه تصمیم مستقیم حساس |
| audit trail visibility | audit indicator روی کارت‌های حساس |
| empty/loading/error states | no signals، loading snapshots، stale data |
| implementation restrictions | بدون route/component واقعی تا approval مستقل |

### Financial Pressure Drill-down Screen

| بخش | توضیح |
|---|---|
| screen goal | بررسی علت فشار نقدینگی و پرداخت‌های حساس |
| target user | manager، finance reviewer |
| entry point | Financial Pressure یا Cash-in/Cash-out Card |
| input data | financial pressure report، bank match، receipt status |
| primary cards | pressure score، overdue/upcoming، cash-in/out |
| secondary cards | weak matches، missing receipts، approval required |
| actions | hold، request correction، escalate، open receipt review |
| decision points | تایید/رد/بررسی پرداخت حساس |
| risk/confidence display | risk by payment/event، match confidence |
| AI suggestion area | علت احتمالی فشار و پیشنهاد اقدام |
| manager decision area | فقط با reason و audit reference |
| audit trail visibility | required برای تصمیم مالی |
| empty/loading/error states | no bank data، incomplete receipt، audit missing |
| implementation restrictions | بدون اتصال بانک یا داده واقعی |

### Product Import Metrics Drill-down Screen

| بخش | توضیح |
|---|---|
| screen goal | بررسی کیفیت batchهای ورود کالا در سطح concept |
| target user | manager، product reviewer |
| entry point | Product Import Warning Card |
| input data | quality gate report، review metrics، mock/synthetic batch summary |
| primary cards | valid/blocked/review counts، duplicate/conflict count |
| secondary cards | quality thresholds، auto-fix candidates، manual-only items |
| actions | approve valid only concept، block import concept، request correction |
| decision points | split، hold، reject، correction |
| risk/confidence display | duplicate/conflict/manual_only و confidence distribution |
| AI suggestion area | پیشنهاد split، correction یا quarantine |
| manager decision area | override فقط با دلیل در concept |
| audit trail visibility | required برای override و batch decision |
| empty/loading/error states | workstream frozen، no mock batch، missing gate |
| implementation restrictions | Product Import implementation همچنان NOT_APPROVED |

### Manager Review Queue Drill-down Screen

| بخش | توضیح |
|---|---|
| screen goal | نمایش همه itemهای نیازمند تصمیم انسانی |
| target user | manager، reviewer |
| entry point | Manager Review Queue Card یا Installment Confirmation Card |
| input data | review items، source module، risk/confidence، AI suggestion |
| primary cards | pending، critical، overdue، manual_only |
| secondary cards | by module، by action type، by confidence |
| actions | approve، reject، hold، correction، escalate |
| decision points | تصمیم انسانی با دلیل |
| risk/confidence display | روی هر item و summary |
| AI suggestion area | پیشنهاد action با evidence و confidence |
| manager decision area | مرکز اصلی صفحه |
| audit trail visibility | required برای تصمیم حساس |
| empty/loading/error states | empty queue، stale queue، missing source |
| implementation restrictions | بدون mutation واقعی |

### Crisis Signal Drill-down Screen

| بخش | توضیح |
|---|---|
| screen goal | بررسی سیگنال بحران چندماژولی |
| target user | manager، control room |
| entry point | Crisis Signal Card |
| input data | crisis signal report، module snapshots، related events |
| primary cards | crisis level، affected modules، root causes |
| secondary cards | timeline، unresolved conflicts، required approvals |
| actions | escalate، freeze related action، request review |
| decision points | پذیرش بحران، escalation یا رفع هشدار |
| risk/confidence display | conflict/manual_only برجسته |
| AI suggestion area | توضیح علت احتمالی و next action |
| manager decision area | decision with reason |
| audit trail visibility | required و blocking اگر audit missing باشد |
| empty/loading/error states | no crisis، missing snapshot، conflict unresolved |
| implementation restrictions | بدون event bus اجرایی |

### AI Suggestion Review Screen

| بخش | توضیح |
|---|---|
| screen goal | بررسی پیشنهادهای AI قبل از اقدام انسانی |
| target user | manager، reviewer |
| entry point | AI Suggestion Card یا drill-downهای دیگر |
| input data | AI snapshot، validation، rule check، source references |
| primary cards | suggestion، reason، confidence، risk flags |
| secondary cards | related data، required approval، audit reference |
| actions | accept for review، ignore، escalate، request evidence |
| decision points | AI فقط پیشنهاد می‌دهد؛ تصمیم با انسان است |
| risk/confidence display | AI certainty جدا از validation confidence |
| AI suggestion area | کل محتوای صفحه، با source و evidence |
| manager decision area | action انسانی با reason |
| audit trail visibility | required برای action حساس |
| empty/loading/error states | no suggestions، missing source، low confidence |
| implementation restrictions | بدون AI اجرایی یا auto action |

## قانون

این screen specها فقط concept هستند. هیچ UI واقعی، component، route، state، service یا prototype در این فاز ساخته نمی‌شود.
