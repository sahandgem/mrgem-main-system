# C10 — تحویل نهایی طراحی Cockpit

## وضعیت

این سند مرجع نهایی انتقال طراحی Penpot به پیاده‌سازی Core است.

چهار نمای نهایی طراحی‌شده:

1. `Cockpit Final — Reference Match` — دسکتاپ
2. `Cockpit Final — Detail Drawer` — پنل جزئیات
3. `Cockpit Final — Mobile Scroll` + `Cockpit Final — Mobile Viewport 420x800` — موبایل
4. `Cockpit Final — Critical State` — وضعیت بحرانی / خطای داده

اعتبارسنجی فعلی:
- Mobile: بیرون‌زدگی والد = 0، سرریز متن = 0
- Critical: 539 شکل، بیرون‌زدگی والد = 0، سرریز متن = 0

C10 در بخش زبان بصری بر هر بند قدیمی C5 که با طراحی نهایی Penpot تعارض دارد مقدم است. معماری اطلاعات، تعامل، دسترس‌پذیری و محدودیت‌های دامنه C2 تا C9 همچنان معتبرند مگر این سند صریحاً خلاف آن را بگوید.

## اصل محصول

Cockpit باید در یک نگاه حس «مرکز فرماندهی مستر جم» بدهد، نه داشبورد SaaS معمولی.

مدیر باید:
- وضعیت را ببیند؛
- موضوع مهم را سریع تشخیص دهد؛
- اثر آن را بفهمد؛
- بداند برای بررسی باید به کجا برود.

جریان ثابت:
`دیدن → فهمیدن → تصمیم گرفتن → رفتن به محل اقدام`

Core فقط مشاهده، بازرسی و ناوبری می‌کند. اجرای عملیات کسب‌وکاری داخل Core انجام نمی‌شود.

## زبان بصری نهایی

جهت نهایی از طراحی مرجع تصویری تأییدشده استخراج شده است:
- زمینه بسیار تیره و یکپارچه
- هویت رنگی واضح برای نواحی
- نور لبه و Glow کنترل‌شده
- Ring، mini-bar، sparkline و instrument graphics
- تراکم بالا ولی منظم
- مرکز فرمان از همه نواحی پرقدرت‌تر
- متن فارسی به‌عنوان زبان اصلی
- بدون ظاهر Hero/Card وب‌سایتی

هویت رنگی اصلی:
- Workforce: Cyan / Blue
- Production: Purple
- Critical: Red
- Warning: Amber
- Healthy / trusted: Green
- Information / navigation: Blue

مقادیر مرجع طراحی:
- Cyan: `#29AFFF`
- Purple: `#B26BFF`
- Green: `#43E394`
- Critical: `#FF5D6D`
- Warm critical: `#FF7A5D`
- Warning: `#FFB84F`

Glow باید محدود به لبه‌ها، ringها، آیکن‌ها، CTAهای مهم و سیگنال‌ها باشد. سطح کامل صفحه نباید Neon یا درخشان شود.


## دسکتاپ — 1365×768

مرجع اصلی: `Cockpit Final — Reference Match`

هندسه پایه:
- Top Navigation: x=8, y=8, w=1349, h=46
- Status Strip: x=8, y=60, w=1349, h=36
- Workforce Panel: x=8, y=104, w=290, h=512
- Center Area: x=308, y=104, w=741, h=512
- Production Panel: x=1059, y=104, w=298, h=512
- Vital Signs: x=8, y=624, w=1349, h=66
- Important Changes: x=8, y=698, w=1349, h=62
- Command Center داخل Center Area: y=200, h=416

چیدمان فضایی ثابت:
- چپ: Workforce
- مرکز: KPI + Command Center + Attention
- راست: Production
- پایین: Vital Signals
- زیر آن: Important Changes

مرکز صفحه باید بیشترین وزن بصری را داشته باشد. Rails رنگ هویت خود را دارند ولی با مرکز رقابت نمی‌کنند.

### KPI مرکزی

چهار KPI بالای Center Area:
- کارت فشرده با ring کوچک
- عدد اصلی پرقدرت
- delta کوتاه
- mini bars برای حس ابزار اندازه‌گیری
- رنگ فقط برای signal و trend، نه پرکردن کل سطح

### Command Center

Hero مرکزی باید:
- حس ابزار فرماندهی بدهد
- با geometry و glow کنترل‌شده از اطراف جدا شود
- عنوان و وضعیت اصلی را واضح کند
- صف Attention بلافاصله زیر/داخل همان سیستم دیده شود

Attention row:
- Severity
- عنوان مسئله
- context کوتاه
- زمان / ناحیه
- cue مقصد
- CTA «بررسی»

Hover، Selected و Focus از Severity مستقل‌اند.

## پنل جزئیات

مرجع: `Cockpit Final — Detail Drawer`

- از سمت راست باز می‌شود
- عرض تقریبی دسکتاپ: 320px
- زمینه Dashboard پشت آن حفظ و Dim می‌شود
- Drawer فقط یک مدل مشترک دارد؛ Drawer تو در تو ممنوع است

ساختار:
- عنوان: «جزئیات موضوع مدیریتی»
- خلاصه موضوع انتخاب‌شده
- چیپ‌های شدت / تازگی / دسته
- اثر کسب‌وکار
- شواهد موجود
- اعتماد به داده
- زمان و تازگی
- مقصد بررسی
- CTA اصلی برای رفتن به محل بررسی
- CTA ثانویه فقط در صورت وجود action امن و تعریف‌شده

رفتار C4 حفظ شود:
- Click / Enter / Space برای بازکردن
- Esc / Close برای بستن
- Focus بعد از بستن به trigger برگردد
- `aria-current` برای انتخاب
- Focus-visible مستقل از Selected

## موبایل

مرجع اصلی:
- `Cockpit Final — Mobile Scroll`
- `Cockpit Final — Mobile Viewport 420x800`

موبایل نسخه کوچک‌شده دسکتاپ نیست؛ Commander Feed است.

ترتیب DOM و نمایش:
1. Header
2. Status / Trust
3. Attention
4. Vital Signals
5. Workforce
6. Production
7. Important Changes
8. Upcoming Commitments
9. Bottom Navigation ثابت

Master board حدود 420×1684 است و viewport واقعی 420×800 با scroll عمودی کار می‌کند.

ریتم نهایی:
- Header: y=8, h≈80
- Status: y≈96, h≈70
- Attention: y≈176, h≈370
- Vital: y≈556, h≈342
- Workforce: y≈908, h≈216
- Production: y≈1134, h≈216
- Important Changes: y≈1360, h≈140
- Upcoming Commitments: y≈1510, h≈104
- Bottom Nav: h≈54 و fixed در پایین viewport

Attention در ابتدا حداکثر 3 مورد را نشان می‌دهد. در صورت وجود بیشتر، کنترل واقعی «نمایش همه موضوعات» استفاده شود؛ nested scroll ممنوع است.

Vital در 420px دو ستون × سه ردیف است.

Drawer در موبایل full-width است.


## وضعیت بحرانی / Critical State

مرجع: `Cockpit Final — Critical State`

Critical State یک Theme جداگانه از محصول نیست؛ همان Cockpit است که شدت سیگنال‌ها بالا رفته است.

الگوی نهایی:
- Hero مرکزی قرمز با عنوان «وضعیت بحرانی»
- 4 موضوع بحرانی در مرکز با تفکیک Red / Warm Red / Amber
- بخش «اولویت‌های اقدام» برای ترتیب بررسی مدیریتی
- Workforce و Production ساختار خود را حفظ می‌کنند و فقط سیگنال و metricهای بحرانی می‌گیرند
- Vital Signals به وضعیت هشدار تغییر می‌کنند
- نوار پایین به هشدار سیستم / Data Health تبدیل می‌شود
- CTA خطای داده برجسته ولی محدود باقی می‌ماند

قواعد معنایی:
- Business Health و Data Health یکی نیستند
- Error داده نباید خودکار همه Business KPIها را «بحرانی» فرض کند
- Stale / Partial / Error / Unknown باید با متن مشخص شوند، نه فقط رنگ
- Last Known Good تاریخی است و هرگز به‌عنوان داده جاری نمایش داده نمی‌شود
- `0` با «نامشخص»، «متصل نیست» یا «داده موجود نیست» جایگزین نمی‌شود

## متن و فونت

- فارسی زبان اصلی UI است
- نام‌های فنی انگلیسی فقط داخل code/type/token باقی بمانند
- فونت طراحی Penpot: Vazirmatn
- وابستگی شبکه‌ای جدید برای فونت ممنوع است
- اگر فایل Vazirmatn داخل repo موجود نیست، در پیاده‌سازی اولیه از stack امن محلی استفاده شود و دانلود runtime انجام نشود
- عددهای KPI با `font-variant-numeric: tabular-nums` هم‌تراز شوند

## نگاشت به ساختار فعلی کد

معماری فعلی React حفظ می‌شود و بازطراحی به معنی بازنویسی منطق داده نیست.

نگاشت اصلی:
- `CommandCenterModuleOverview.tsx` → orchestration و ترتیب ناحیه‌ها
- `CockpitSystemBar.tsx` → Top Navigation / Status
- `CommandCenterExecutiveSummary.tsx` → KPI strip / hero summary
- `CommandCenterAttentionQueue.tsx` → صف Attention
- `CockpitModuleRails.tsx` → Workforce / Production
- `CockpitSignals.tsx` → Vital + Important Changes
- `CockpitUpcomingCommitments.tsx` → Upcoming
- `CockpitDrawerShell.tsx` → Drawer
- `useCockpitViewport.ts` → responsive mode
- `drawerModel.ts` → selection / drawer state

در فاز پیاده‌سازی، اولویت با CSS/layout و presentation است. قراردادهای integration، view-model و mock scenario فقط در صورت نیاز مستقیم UI تغییر می‌کنند.

## چیزهایی که نباید در فاز Visual Implementation دست بخورند

بدون تصمیم جداگانه:
- `packages/module-contracts`
- P06
- MAHAK-GATE
- Mahak واقعی
- Production API
- Database
- localStorage
- adapterهای واقعی
- Workforce branch

Production module همچنان Experimental است.

## مسیرهای محصول

- Manager view: `/`
- Dev scenario view: `/__dev/command-center`

کنترل‌های Mock فقط در مسیر dev دیده شوند و نباید به نمای مدیر نشت کنند.

## ترتیب پیاده‌سازی پیشنهادی

1. Visual tokens و background/surface system
2. Desktop 1365×768 shell geometry
3. Center KPI + Command Center
4. Workforce / Production rails
5. Vital / Important Changes
6. Drawer
7. Mobile Commander Feed
8. Critical / Stale / Partial / Error visual states
9. Accessibility regression
10. viewport validation در 1365×768، 1440×800، 1920×960، 1920×1080، 720 و 420

در هر مرحله ابتدا ظاهر مرجع باید بدون تغییر منطق داده بازتولید شود.

## Gate نهایی

قبل از هر merge:
- no page scroll در Desktop target
- Vital کامل در viewportهای هدف
- حداقل 3 Attention کامل در 1365×768
- mobile بدون فشرده‌سازی متن
- no nested mobile scroll
- Drawer بدون reflow صفحه
- Focus / Enter / Space / Esc سالم
- متن انگلیسی ناخواسته در UI وجود نداشته باشد
- Stale / Partial / Error / Unknown از هم قابل تشخیص باشند
- Production همچنان Experimental نمایش داده شود
- test:core PASS
- build:core PASS
- diff --check PASS

## وضعیت کد هنگام ایجاد C10

Baseline:
- branch: `codex/dev-core`
- HEAD: `cc3c3fb`

تغییرات موجود قبل از C10 که نباید به‌عنوان بخشی از این سند بازنویسی یا حذف شوند:
- modified: `apps/core/src/components/commandCenter/CommandCenterAttentionQueue.tsx`
- modified: `apps/core/src/styles.css`
- untracked: `apps/core/docs/COCKPIT-C9-VALIDATION-REPORT.fa.md`

C10 فعلاً مجوز تغییر Production یا merge نیست.
