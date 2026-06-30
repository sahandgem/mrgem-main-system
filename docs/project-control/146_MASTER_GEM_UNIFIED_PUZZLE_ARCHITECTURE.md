# Master Gem Unified Puzzle Architecture

آخرین به‌روزرسانی: 2026-06-30

## 1. Project Core Decision

Project Core تصمیم گرفت که مستر جم فقط cockpit، داشبورد یا یک تصویر مدیریتی نیست.

مستر جم باید به شکل یک سیستم‌عامل مدیریتی و یک هواپیمای کامل ساخته شود. cockpit فقط کابین خلبان است. Workforce فقط یکی از موتورهای اصلی است. Product/Inventory، Finance، Production، Sales، Friday Market، Media، AI و Decision Queue قطعات دیگر هواپیما هستند.

قانون مادر:

- هیچ قطعه‌ای کل پروژه تلقی نمی‌شود.
- هیچ prototype یا تصویر گرافیکی مجوز implementation یا merge نیست.
- هر قطعه باید جایگاه خود را در پازل مادر داشته باشد.
- هر ساخت جدید باید به داده، پردازش، خروجی و اثر تصمیمی یا عملیاتی وصل باشد.

## 2. Source Inputs Combined

این سند از ترکیب منابع زیر ساخته شده است:

- Workforce P0-P22
- Cockpit docs/prototypes
- P52 Aircraft Architecture Lock
- P53 Module Build Priority Matrix
- سند کابین خلبانی مرکزی مستر جم
- داده‌ها و ایده‌های پروژه محک/کالا
- ایده مالی و جریان نقد
- مسیر تولید، انبار تصویری، عکس، n8n، GitHub/Codex و هوش مصنوعی

## 3. P0-P22 Workforce Position

پروژه P0 تا P22 باید به عنوان `Workforce Operations Engine` وارد معماری مادر شود.

این قطعه شامل قابلیت‌های زیر است:

- Workforce dashboard
- employee/space/task/schedule/rules
- analyzer
- analysis/settings pages
- compatibility rules
- what-if simulator
- recommendation engine
- decision queue
- reports
- archive/comparison/trends
- monthly health
- preventive alerts
- backup/restore/snapshots
- maintenance console
- operational readiness
- launch checklist
- launch signoff/baseline
- baseline drift/resignoff
- operational history/audit trail
- history retention/archive
- operations calendar
- schedule settings/export/notifications
- route-level code splitting

این موتور باید در آینده اجرا و تکمیل شود. اما دیگر نباید به اشتباه کل پروژه تلقی شود. Workforce Operations Engine یک موتور مستقل داخل هواپیمای مستر جم است.

## 4. Visual Cockpit Position

کابین گرافیکی و تصویر مدیریتی قبلی فقط یک قطعه از پازل است.

آن تصویر باید در آینده به عنوان بخشی از `Central Cockpit / Executive Visual Layer` اجرا شود. بهترین محیط گرافیکی هدف است، اما هیچ UI نباید صرفاً تزئینی باشد.

قانون UI:

- هر صفحه باید داده ورودی داشته باشد.
- هر صفحه باید پردازش یا تحلیل داشته باشد.
- هر صفحه باید خروجی قابل فهم داشته باشد.
- هر صفحه باید اثر روی تصمیم، هشدار، وظیفه، تولید، مالی یا عملیات داشته باشد.

## 5. Aircraft Puzzle Map

| Puzzle Piece | Aircraft Metaphor | Current Source | Current Status | Future Role | Execution Rule |
|---|---|---|---|---|---|
| Project Core | مغز و قانون مادر پروژه | ChatGPT Project Core و docs کنترل پروژه | active in ChatGPT Project Core | تعیین مسیر، قانون، اولویت و توقف‌ها | Codex فقط دستور دقیق و scope دار را اجرا کند |
| Workforce Operations Engine | موتور عملیات نیرو و کار روزانه | Workforce P0-P22 | built/needs stabilization | مدیریت نیرو، زمان، وظیفه، هشدار، تصمیم، backup و عملیات روزانه | refactor و تکمیل تدریجی، بدون تلقی شدن به عنوان کل پروژه |
| Central Cockpit | کابین خلبان مدیرعامل | cockpit overview prototype and manager review queue prototype | prototype only/frozen | نمایش اجرایی، drill-down، هشدار، صف تصمیم و پیشنهاد AI | فقط پس از آماده بودن موتورهای داده‌ای و approval مستقل |
| Product + Inventory Core | بدنه کالا، مواد، قطعه، عکس و موجودی | Mahak/Product subproject | subproject/no direct merge | مدل کالا، بارکد، انبار، موجودی، کیفیت داده و import امن | فقط از طریق data contract، staging و validation |
| Finance + Cashflow Core | مخزن سوخت و فشار مالی | audit-app/finance ideas/bank transaction intelligence | subproject/design needed | تراکنش، نقدینگی، پرداخت، دریافت، قسط، رسید و هشدار مالی | direct merge ممنوع؛ finance data contract لازم است |
| Production Engine | موتور تولید، فرمول، BOM و دستور ساخت | production analysis ideas | design needed | تبدیل کالا و مواد به کار تولیدی، هزینه، ریسک و خروجی ساخت | اول contract و flow، بعد implementation مستقل |
| Visual Inventory + Media | چشم و حافظه تصویری کالا/رسید/قطعه | mobile photo idea/media asset concept | design needed | عکس کالا، رسید، قطعه، evidence و اتصال به AI snapshot | بدون داده واقعی و storage production تا approval مستقل |
| Sales + Friday Market | موتور درآمد و بازار | فروش، جمعه‌بازار، کانال‌های درآمد | design needed | سفارش، فروش، کانال، reconciliation و feedback بازار | بعد از Product/Finance contract طراحی شود |
| AI Review + Decision Queue | کمک‌خلبان تصمیم | review queue concepts and AI suggestions | prototype/design only | پیشنهاد، confidence، review boundary و تصمیم انسانی | AI پیشنهاد می‌دهد؛ تصمیم حساس با مدیر و audit |
| Audit/Backup/History | جعبه سیاه هواپیما | Workforce backup/history/signoff/baseline | partly built in Workforce | ردیابی، rollback، baseline، drift، signoff و گزارش اعتماد | هر تغییر حساس باید audit و snapshot داشته باشد |

## 6. Central Data Model

مدل داده مرکزی آینده باید این موجودیت‌ها را پوشش دهد:

- Product: کالای قابل فروش، تولید، انبار و تحلیل.
- Material: ماده یا ورودی خام مورد نیاز تولید یا تعمیر.
- Component: قطعه یا جزء قابل ترکیب در محصول یا فرمول تولید.
- Recipe/BOM: دستور ساخت، ترکیب مواد و نسبت‌های تولید.
- WorkOrder: دستور کار تولید، آماده‌سازی، تعمیر یا عملیات داخلی.
- Task: کار عملیاتی قابل برنامه‌ریزی برای نیرو، تولید یا فروش.
- Employee: عضو تیم با نقش، مهارت، وضعیت و ارتباط با کارها.
- InventoryMovement: ورود، خروج، جابه‌جایی، اصلاح یا مغایرت موجودی.
- Sale: رویداد فروش، کانال درآمد، مشتری و اثر مالی.
- Payment/Transaction: دریافت، پرداخت، قسط، انتقال بانکی یا رویداد نقدینگی.
- MediaAsset: عکس، رسید، تصویر کالا، evidence یا فایل پشتیبان.
- DecisionItem: مورد نیازمند تصمیم مدیر، review، approval یا rejection.
- Idea/Experiment: ایده، تست، آزمایش بازار یا مسیر نوآوری کنترل‌شده.

## 7. Build Philosophy

از این به بعد هیچ صفحه‌ای مستقل و بی‌اتصال ساخته نمی‌شود.

هر feature قبل از ساخت باید به این پرسش‌ها جواب دهد:

1. مشکل اصلی چیست؟
2. داده ورودی از کجا می‌آید؟
3. چه کسی داده را وارد یا تایید می‌کند؟
4. چه پردازشی انجام می‌شود؟
5. خروجی تصمیمی چیست؟
6. به کدام ماژول دیگر وصل می‌شود؟
7. اگر ساخته نشود چه ضرری دارد؟
8. ساده‌ترین نسخه اول چیست؟

## 8. Execution Priority

ترتیب پیشنهادی مادر:

1. Lock shared architecture and data model
2. Stabilize Workforce Operations Engine
3. Define Task + Decision Core
4. Define Finance Cashflow Contract
5. Define Product/Inventory Contract
6. Define Visual Inventory + Media Capture
7. Design Production MVP
8. Design Visual Pricing Queue
9. Design Friday Market sales/reconciliation
10. Design Central Cockpit read-only slices
11. Expand AI review/automation

Cockpit implementation نباید جلوتر از موتورهای داده‌ای اصلی برود.

## 9. Rules For Existing Subprojects

### Mahak/Product

- ارزش بالا دارد.
- منبع کالا، قیمت، بارکد، تاریخچه خرید/فروش و الگوی کالا است.
- direct merge ممنوع است.
- باید با data contract وارد معماری شود.

### Finance/Audit

- ارزش بالا دارد.
- منبع نقدینگی، تراکنش، تایید و فشار مالی است.
- direct merge ممنوع است.
- باید با finance data contract وارد معماری شود.

### Cockpit Prototypes

- frozen هستند.
- فقط concept/visual هستند.
- داده واقعی، storage، API یا تصمیم واقعی ندارند.
- implementation جداگانه approval می‌خواهد.

### Workforce

- قطعه واقعی ساخته‌شده است.
- باید پایدار شود.
- refactor باید ادامه داشته باشد.
- باید به عنوان موتور داخل پازل مادر ثبت شود.

## 10. Project Core Operating Law

از این لحظه:

- Project Core مسیر را تعیین می‌کند.
- Codex فقط مجری دستور دقیق است.
- هیچ task مبهمی اجرا نشود.
- هر task باید preflight، scope، forbidden scope، stop rules، verification و report داشته باشد.
- اگر task از محدوده خارج شد، Codex باید توقف کند.
- main قفل است.
- merge فقط با approval جداگانه مجاز است.
- implementation فقط با approval جداگانه مجاز است.
- subproject merge ممنوع است مگر با approval جداگانه.
- UI/visual build باید به داده و تصمیم وصل باشد.

## 11. Current Lock State

- CODE MAIN was paused.
- این task فقط docs-only exception است.
- P55 انجام شده ولی P55A هنوز اجرا نشده است.
- P56 متوقف است.
- main قفل است.
- no merge.
- no implementation.
- next code action باید بعداً توسط Project Core تعیین شود.

## 12. Recommended Next Action

بعد از ثبت این سند، next action نباید implementation باشد.

پیشنهاد بعدی:

`CORE-P02 — Master Gem Central Data Model Contract`

هدف CORE-P02:

طراحی قرارداد داده مرکزی بین Workforce، Product/Inventory، Finance، Production، Media و Cockpit. این مرحله نیز docs-only باشد مگر Project Core بعداً خلافش را تایید کند.
