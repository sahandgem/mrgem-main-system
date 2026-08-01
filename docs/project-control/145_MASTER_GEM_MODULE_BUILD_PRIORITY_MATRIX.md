# Master Gem Module Build Priority Matrix

تاریخ ثبت: `2026-06-30`

## 1. Decision Context

P52 معماری مادر «هواپیمای مسترجم» را با وضعیت `LOCKED_FOR_DECISION` تثبیت کرد. P53 فقط برای مقایسه و انتخاب اولویت ادامه مسیر است و هیچ مجوزی برای implementation، merge یا شروع ماژول ایجاد نمی‌کند.

Cockpit یکی از قطعات هواپیما و مصرف‌کننده خروجی ماژول‌هاست؛ هدف کل پروژه نیست. انتخاب مرحله بعد باید پایداری موتورهای واقعی، قرارداد داده و قابلیت rollback را بر سرعت ساخت ظاهر کابین مقدم بداند.

## 2. Candidate Modules

| کد | گزینه | نقش در هواپیما |
|---|---|---|
| A | Workforce Continuation / Refactor | تثبیت اولین موتور واقعی |
| B | Production Module Design | طراحی موتور تولید و فرمول ساخت |
| C | Finance Data Contract / Bank Transaction Intelligence | طراحی قرارداد سوخت و فشار مالی |
| D | Product + Inventory Data Contract | طراحی مخزن قطعات، کالا و موجودی |
| E | Cockpit Read-only Workforce Slice | برنامه اتصال کابین به موتور Workforce |
| F | Sales / Customer Response Design | طراحی رادار بازار و ارتباط مشتری |
| G | AI Review Queue Expansion | توسعه مفهومی کمک‌خلبان و صف بررسی |

## 3. Evaluation Criteria

تمام معیارها از `1` تا `5` امتیاز می‌گیرند.

- در معیارهای ارزش و آمادگی، `5` بهترین وضعیت است.
- در `Implementation risk` و `Architecture risk`، `1` کم‌خطر و `5` پرخطر است.
- امتیاز نهایی برای مقایسه از فرمول زیر ساخته می‌شود تا risk بالا مزیت تلقی نشود:

`Final Score = average(BV, CD, DR, CR, IM, SS, LV, 6-IR, 6-AR)`

| کد | معیار |
|---|---|
| BV | Business value |
| CD | Cockpit dependency / اهمیت برای تغذیه cockpit |
| DR | Data readiness |
| IR | Implementation risk |
| AR | Architecture risk |
| CR | Current code readiness |
| IM | Independence from subproject merge |
| SS | Speed to safe result |
| LV | Long-term aircraft value |

## 4. Scoring Matrix

| Module | BV | CD | DR | IR | AR | CR | IM | SS | LV | Final score / 5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A. Workforce Continuation / Refactor | 5 | 5 | 5 | 2 | 2 | 4 | 5 | 4 | 5 | **4.56** |
| B. Production Module Design | 5 | 4 | 1 | 4 | 4 | 1 | 5 | 1 | 5 | **2.89** |
| C. Finance Data Contract | 5 | 5 | 2 | 4 | 4 | 1 | 2 | 2 | 5 | **2.89** |
| D. Product + Inventory Data Contract | 5 | 5 | 2 | 4 | 5 | 1 | 2 | 2 | 5 | **2.78** |
| E. Cockpit Read-only Workforce Slice | 4 | 5 | 5 | 3 | 4 | 3 | 5 | 3 | 4 | **3.78** |
| F. Sales / Customer Response Design | 4 | 3 | 1 | 4 | 4 | 1 | 5 | 1 | 4 | **2.56** |
| G. AI Review Queue Expansion | 4 | 4 | 3 | 4 | 4 | 3 | 5 | 2 | 4 | **3.22** |

این امتیازها ابزار تصمیم هستند، نه مجوز اجرا. dependencyهای سخت و سیاست‌های قفل‌شده حتی در صورت امتیاز عددی خوب همچنان لازم‌الاجرا هستند.

## 5. Priority Matrix

| Module | Aircraft role | Current status | Required data | Dependencies | Risk | Benefit | Score | Recommended action |
|---|---|---|---|---|---|---|---:|---|
| Workforce Continuation / Refactor | اولین موتور واقعی | real core؛ دارای بدهی معماری | داده و تحلیل موجود WF | تست، route registry، extraction کوچک و rollback | regression در فایل‌های بزرگ | پایداری core و آماده‌سازی read contract | 4.56 | `refactor_first` |
| Production Module Design | موتور تولید | docs-only | محصول، مواد، فرمول، مرحله و هزینه | Product و Inventory contract | طراحی روی master data ناپایدار | ارزش عملیاتی بلندمدت بالا | 2.89 | `wait` |
| Finance Data Contract | سوخت و فشار مالی | subproject + docs | financial event، bank transaction، approval و audit | boundary مستقل از audit-app | ورود auth/RLS/database ناسازگار | مبنای pressure signal و نقدینگی | 2.89 | `design_next` |
| Product + Inventory Data Contract | مخزن قطعات | subproject + docs | product identity، barcode، stock و movement | extraction plan مستقل از Mahak | duplicate، mapping و coupling بالا | پایه Production، Sales و Mahak | 2.78 | `design_next` |
| Cockpit Read-only Workforce Slice | کابین خلبان | دو prototype frozen | Workforce summary و freshness | تثبیت WF، read contract، route/test approval | ساخت کابین پیش از معماری پایدار | نمایش سریع ارزش داده واقعی | 3.78 | `wait` |
| Sales / Customer Response Design | رادار بازار | missing | sale، customer، demand و response event | Product، Finance و customer identity | تعریف KPI بی‌منبع | حلقه بازار و تجربه مشتری | 2.56 | `wait` |
| AI Review Queue Expansion | کمک‌خلبان | WF partial + prototype | evidence، confidence، rules و audit | data contracts و human review boundary | پیشنهاد گمراه‌کننده یا action ناخواسته | تصمیم‌یار چندماژولی | 3.22 | `wait` |

### Action Boundary

- `refactor_first`: تنها اقدام پیشنهادی نزدیک، ولی اجرای آن نیازمند فاز scope و approval مستقل است.
- `design_next`: فقط طراحی قرارداد؛ نه build، import یا merge.
- `wait`: وابستگی یا ریسک حل‌نشده دارد.
- Product/Mahak و Finance/Audit App همچنان `keep_as_subproject` هستند؛ اقدام `design_next` فقط روی قرارداد core اعمال می‌شود.
- prototypeهای cockpit همچنان `prototype_only` و frozen هستند.

## 6. Module-Specific Notes

### Workforce

- real core از قبل وجود دارد و تنها producer عملیاتی بالغ پروژه است.
- `WorkforcePages.tsx` هنوز بدهی معماری و نقطه تمرکز ریسک است.
- control score، findings، recommendations، queue، reports، health، alerts و history آن آماده‌ترین منبع واقعی آینده cockpit هستند.
- ادامه کار باید extraction کوچک، بدون تغییر رفتار و با test/build/rollback باشد.

### Production

- برای هواپیمای کامل حیاتی و موتور عملیاتی دوم است.
- پیش از طراحی اجرایی به مدل محصول، موجودی، فرمول، event و costing نیاز دارد.
- شروع UI یا service قبل از data/process design ممنوع است.

### Finance

- نقش سوخت، نقدینگی و فشار مالی را دارد.
- `audit-app` همچنان subproject است و direct merge ممنوع است.
- مرحله امن آینده می‌تواند فقط Financial Data Contract و Bank Transaction Intelligence Design باشد؛ بدون auth، RLS، database یا import واقعی.

### Product / Inventory

- `mahak-web-version` و دانش کالا ارزش بالایی دارند، اما subproject باقی می‌مانند.
- direct merge ممنوع است؛ ابتدا identity، barcode، duplicate، stock movement و staging contract باید قفل شوند.
- این قرارداد پیش‌نیاز Production و Sales است، حتی اگر امتیاز کوتاه‌مدت آن به‌دلیل ریسک پایین‌تر باشد.

### Cockpit

- اجرای زودهنگام آن خطر ساخت کابین بدون موتورهای کامل را دارد.
- اگر بعداً تصویب شود، slice اول فقط read-only، Workforce-only و بدون تصمیم واقعی خواهد بود.
- prototypeها source code تولید نیستند و مستقیم وارد main نمی‌شوند.

### Sales و AI

- Sales هنوز domain contract معتبر ندارد و پس از Product/Finance طراحی می‌شود.
- AI expansion باید پس از data contracts انجام شود؛ AI پیشنهاد می‌دهد و تصمیم حساس با review و audit انسانی باقی می‌ماند.

## 7. Recommended Build Order

ترتیب پیشنهادی P53:

1. **Workforce Core Stabilization:** کاهش بدهی معماری با فازهای کوچک و قابل rollback.
2. **Product + Inventory Data Contract Design:** قفل identity، barcode، stock و movement بدون merge Mahak.
3. **Finance Data Contract Design:** قفل financial event، bank mapping، approval و audit بدون merge audit-app.
4. **Production Data and Process Design:** پس از روشن‌شدن Product/Inventory.
5. **Cockpit Workforce Read-only Implementation Plan:** فقط plan پس از تثبیت read contract و freshness.
6. **Sales / Customer Response Design:** پس از Product و Finance.
7. **Cross-module AI Review Queue Expansion:** پس از وجود producerهای معتبر و audit مشترک.

دلیل تفاوت با ترتیب صرفاً نمایشی: Product/Inventory و Finance سوخت و قطعات موتورهای بعدی را تعریف می‌کنند؛ cockpit و AI بدون آن‌ها فقط ظاهر چندماژولی خواهند داشت.

## 8. P54 Recommendation

پیشنهاد اصلی و یگانه:

`P54 — Workforce Core Stabilization Before Aircraft Expansion`

دلیل انتخاب:

- بالاترین امتیاز matrix را دارد.
- تنها real core عملیاتی و منبع داده واقعی فعلی است.
- کاهش بدهی آن ریسک تمام اتصال‌های آینده، از cockpit تا AI، را کم می‌کند.
- به merge زیرپروژه، database، auth یا مدل جدید وابسته نیست.

P54 باید ابتدا scope، candidateهای کم‌ریسک، فایل‌های ممنوع، test/build gate و rollback را تعیین کند. این توصیه به‌تنهایی مجوز refactor یا تغییر کد نیست.

## 9. Do Not Touch Rules

- `main` روی `b16b1a0` قفل است.
- merge ممنوع است.
- P53 هیچ implementation را تایید نمی‌کند.
- `src`، route و package تغییر نکنند.
- storage key، localStorage یا sessionStorage جدید ساخته نشود.
- database، auth، API یا backend تغییر نکند.
- داده واقعی وارد prototypeها نشود.
- زیرپروژه Product یا Finance مستقیم merge نشود.
- cockpit بدون plan و approval مستقل اجرا نشود.
- هر اقدام P54 باید preflight، scope، test، rollback و commit مستقل داشته باشد.

## Decision Result

`NEXT_PRIORITY = WORKFORCE_CORE_STABILIZATION_DECISION`

این نتیجه فقط اولویت را مشخص می‌کند؛ implementation همچنان `NOT_APPROVED` است.
