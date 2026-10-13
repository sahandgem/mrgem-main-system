# C5 — سیستم بصری Cockpit

## وضعیت و مراجع

- مرحله: طراحی Visual System؛ این سند مجوز پیاده‌سازی CSS یا UI نیست.
- نقطه شروع: commit `a079eed9fe4798ed92c7d5fd560ed674911f1b23` پس از تأیید و ثبت C4.
- مراجع الزام‌آور: [مشخصات Cockpit](COCKPIT-DASHBOARD-SPEC.fa.md)، [پوسته C2](COCKPIT-C2-SHELL.fa.md)، [سلسله‌مراتب C2.1](COCKPIT-C2.1-HIERARCHY.fa.md)، [تراکم C3](COCKPIT-C3-INFORMATION-DENSITY.fa.md) و [تعامل C4](COCKPIT-C4-INTERACTION.fa.md).
- معیار اصلی خوانایی: `1365×768`.

C5 فقط زبان ظاهری Cockpit را تعریف می‌کند. معماری Left / Center / Right، بودجه اطلاعاتی، ارتفاع ردیف‌ها، ترتیب محتوا، Single Drawer Model، رفتار Focus و مسیر Scan → Select → Inspect → Navigate تغییر نمی‌کنند.

## فلسفه بصری

Cockpit باید حس یک «مرکز فرماندهی آرام و دقیق» را بدهد: یک سطح یکپارچه برای پایش، با مرکز تصمیم روشن و ابزارهای کناری سریع‌خوان. شباهت به Strategy HUD یا Mission Control از نظم، تراکم کنترل‌شده، ریتم ثابت و سیگنال‌های محدود می‌آید؛ نه از Neon، قاب‌های چندلایه یا تزئینات علمی‌تخیلی.

اصل ثابت:

**Signal first → Metric second → Meaning third → Metadata last**

ترتیب نگاه مطلوب مدیر:

1. سیگنال وضعیت و شدت.
2. عدد یا مسئله اصلی.
3. اثر مدیریتی.
4. زمان، منبع و جزئیات اعتماد داده.

فضای اضافه برای جداسازی معنایی و خوانایی مصرف می‌شود، نه برای بزرگ‌کردن همه اجزا یا افزودن محتوای تزئینی. فارسی زبان اصلی است و واژه انگلیسی فقط برای نام ثابت محصول یا اصطلاحی کوتاه و جاافتاده مجاز است.

## زبان قابل مشاهده برای مدیر

نام‌های فنی انگلیسی می‌توانند در code، نام component، type و token باقی بمانند، اما تمام labelها، statusها، کنترل‌ها و پیام‌هایی که مدیر در UI می‌بیند باید فارسی باشند. در مستندات، اولین اشاره می‌تواند به شکل «پنل جزئیات (Drawer)» نوشته شود؛ متن محصول فقط «پنل جزئیات» را نشان می‌دهد.

| اصطلاح فنی | متن قابل مشاهده در UI |
| --- | --- |
| Critical | فوری |
| Attention | نیازمند توجه |
| Healthy | تازه و معتبر |
| Stale | قدیمی |
| Partial | ناقص |
| Error | خطای داده |
| Unknown | نامشخص |
| Experimental | آزمایشی |
| Drawer | پنل جزئیات |

این نگاشت مانع استفاده از نام‌های فنی در تست و پیاده‌سازی نیست؛ هدف آن یکدستی زبان تجربه مدیر است. واژه‌های انگلیسی نباید به‌عنوان badge یا metadata قابل مشاهده به UI نشت کنند، مگر نام رسمی محصول یا داده‌ای که ترجمه آن معنای دامنه را تغییر دهد.

## ۱. سه سطح سلسله‌مراتب وضعیت

### Critical

- فقط برای موضوعی که فوراً توجه مدیر را لازم دارد.
- ترکیب اجباری: marker باریک + label متنی «فوری» + عنوان با وزن بالا.
- رنگ Critical فقط در marker، label، عدد مرتبط یا جزء کوچک سیگنال دیده می‌شود؛ کل ردیف یا پنل قرمز نمی‌شود.
- جایگاه در ابتدای صف و کنتراست عنوان مهم‌تر از افزایش سطح رنگ است.
- هیچ Blink، Pulse دائمی یا Glow ندارد.

### Attention

- برای موضوع مهم ولی غیرفوری.
- ترکیب: marker یا status dot محدود + label «نیازمند توجه» + وزن متوسط رو به بالا.
- رنگ Warning در سطح کوچک مصرف می‌شود و پس‌زمینه ردیف خنثی می‌ماند.

### Normal

- برای وضعیت پایدار، زمینه و Metricهای بدون هشدار.
- بدون رنگ اشباع و بدون badge اضافی؛ متن اصلی روشن و metadata خنثی است.
- Healthy فقط جایی سبز می‌شود که اعلام سلامت واقعاً معنا دارد؛ سبز تزئینی یا پیش‌فرض همه Metricها نیست.

شدت هیچ‌گاه فقط با رنگ منتقل نمی‌شود. label، marker و ترتیب مکانی همیشه معنای رنگ را پشتیبانی می‌کنند. Business Health در جایگاه سیگنال کسب‌وکار نمایش داده می‌شود و Data Health در جایگاه اعتماد داده؛ این دو رنگ یا عنوان مشترک گمراه‌کننده ندارند.

## نقشه وزن بصری

ترتیب ثابت وزن بصری در Cockpit:

1. **Command Core / Attention:** مرکز فرمان و مهم‌ترین موضوع‌های نیازمند تصمیم.
2. **Vital Strip:** علائم حیاتی ثابت و سریع‌خوان.
3. **Workforce / Production Rails:** ابزارهای کمکی برای فهم زمینه ماژول‌ها.
4. **Important Changes:** تغییرهای مهم اما آرام‌تر از صف توجه.
5. **Top System Bar metadata:** اطلاعات ابزاری سیستم، اعتماد داده و زمان.

قواعد این نقشه:

- مرکز فرمان باید همیشه بیشترین وزن بصری را داشته باشد؛ Signal و مسئله اصلی آن پیش از جزئیات کناری دیده می‌شوند.
- Rails ابزار کمکی‌اند و با مرکز از نظر کنتراست، اندازه عنوان یا شدت رنگ رقابت نمی‌کنند.
- Important Changes عمداً آرام‌تر از Attention می‌ماند، حتی اگر چند تغییر هم‌زمان وجود داشته باشد.
- Top Bar یک Instrument Bar است، نه قهرمان صفحه؛ metadata آن نباید نقطه شروع نگاه شود.
- Vital Strip مهم و پیوسته است، اما شش Segment آن نباید شبیه شش CTA یا شش Card پررنگ دیده شوند.
- این ترتیب در وضعیت‌های تازه و معتبر، قدیمی، ناقص و خطای داده حفظ می‌شود. هشدار Data Health باید واضح باشد، اما نباید خودکار جای Business Attention را به‌عنوان مهم‌ترین عنصر بگیرد.

## ۲. سیستم رنگ محدود

پالت پایه سرد، تیره و کم‌اشباع است. متن و سیگنال‌ها باید روی آن خوانا باشند، اما صفحه نباید به مجموعه‌ای از لکه‌های رنگی تبدیل شود.

| نقش | Token پیشنهادی | مقدار مرجع | مصرف مجاز |
| --- | --- | --- | --- |
| زمینه Cockpit | `--surface-base` | `#0b1218` | پشت کل صفحه |
| سطح Instrument | `--surface-instrument` | `#0e151d` | Top Bar و زمینه پیوسته ابزارها |
| سطح اصلی | `--surface-primary` | `#111923` | Rails، Command Core و Vital Strip |
| سطح Inspect | `--surface-raised` | `#15212d` | Drawer و لایه جزئیات |
| سطح Hover | `--surface-hover` | `#17232e` | فقط بازخورد اشاره‌گر |
| سطح Selected | `--surface-selected` | `#1a2834` | انتخاب فعال و موقت C4 |
| متن اصلی | `--text-primary` | `#f0f3f6` | عنوان، Metric و مسئله |
| متن دوم | `--text-secondary` | `#b0bbc7` | اثر و Context |
| Metadata | `--text-muted` | `#929fac` | زمان، منبع و توضیح سطح سوم |
| Border معماری | `--border-strong` | `#3a4b5b` | مرز ناحیه اصلی یا Drawer |
| Divider | `--border-subtle` | `#293441` | جداسازی ردیف و Segment |
| Critical | `--signal-critical` | `#eb969d` | سیگنال فوری، محدود |
| Warning | `--signal-warning` | `#e2ba7b` | نیازمند توجه |
| Healthy | `--signal-healthy` | `#89c7b1` | سلامت معتبر |
| Informational | `--signal-info` | `#93bdd4` | انتخاب، مسیر بررسی و اطلاعات |
| Experimental | `--signal-experimental` | `#b2a5cf` | Production آزمایشی |
| Unknown | `--signal-unknown` | `#8f9daa` | نامشخص، متصل نیست، بدون داده |

قواعد استفاده:

- Critical، Warning و Healthy در هر viewport فقط به‌اندازه لازم برای یافتن Signal استفاده می‌شوند.
- Experimental بنفش کم‌اشباع است و نباید با Warning یا Data Error اشتباه شود؛ همیشه همراه متن «آزمایشی» می‌آید.
- Unknown خاکستری خنثی است و هرگز با `0` یا Healthy جایگزین نمی‌شود.
- Data State علاوه بر رنگ، label ثابت Healthy / قدیمی / ناقص / خطا / نامشخص دارد.
- رنگ Signal روی متن طولانی یا سطح کامل Rail اعمال نمی‌شود.
- Focus رنگ مستقل خود را دارد و با Selected یا Severity ادغام نمی‌شود.

## ۳. Surfaces و عمق

سه سطح اصلی تعریف می‌شود:

1. **Base surface:** زمینه عمومی Cockpit؛ بدون قاب داخلی و بدون سایه.
2. **Raised / inspect surface:** Drawer یا لایه‌ای که واقعاً بالای Context قرار می‌گیرد؛ یک مرز قوی و سایه بسیار ظریف دارد.
3. **Selected / active surface:** تغییر تون محدود روی همان سطح، همراه indicator؛ لایه جدید یا Card مستقل نمی‌سازد.

قواعد:

- Workforce Rail، Command Core و Production Rail سه مرز معماری‌اند؛ اجزای داخل آن‌ها با divider، alignment و spacing جدا می‌شوند، نه Cardهای تو‌در‌تو.
- Top Bar، Important Changes و Vital Strip هرکدام یک Surface پیوسته‌اند.
- Shadow فقط برای Drawer یا overlay واقعی مجاز است. Rails و Attention Row سایه مستقل ندارند.
- Radius کوچک و مهندسی‌شده است؛ ظاهر نرم و کارت‌محور SaaS ساخته نمی‌شود.
- Border کامل برای هر Metric، Exception، Attention یا Vital Segment ممنوع است.

## ۴. تایپوگرافی

`Tahoma` و `Segoe UI` فقط fallback محلی نسخه اول هستند، نه تصمیم قطعی فونت نهایی:

`Tahoma, "Segoe UI", sans-serif`

اعداد باید با `font-variant-numeric: tabular-nums` هم‌تراز شوند. وزن و فاصله برای hierarchy استفاده می‌شود؛ کاهش افراطی اندازه فونت ابزار فشرده‌سازی نیست.

| نقش | اندازه / Line-height | وزن | کاربرد |
| --- | --- | --- | --- |
| Cockpit title / Brand | `12 / 16px` | 700 | Master Gem / Core؛ کوچک و ثابت |
| Section title | `12 / 18px` | 700 | عنوان Rail، Attention، Changes و Vital |
| KPI major | `24 / 30px` | 700 | Metric اصلی Rail یا Vital |
| KPI secondary | `18 / 24px` | 700 | Metric مکمل و شمارش‌ها |
| Attention title | `14 / 23px` | 700 | مسئله اصلی Command Row |
| Body / impact | `13 / 21–22px` | 400–500 | اثر کسب‌وکاری و توضیح ضروری |
| Metadata | `11 / 18px` | 400 | زمان، منبع، confidence و freshness |
| Status label | `11 / 16px` | 700 | فوری، قدیمی، ناقص، آزمایشی |
| Micro label | `10 / 14px` | 600 | فقط annotation بسیار کوتاه و غیرحیاتی |

قواعد تایپوگرافی فارسی:

- انتخاب نهایی فونت فارسی باید هنگام C5 Implementation روی مرورگر واقعی و به‌ویژه در `1365×768` اعتبارسنجی شود.
- هیچ وابستگی شبکه‌ای برای دریافت فونت اضافه نمی‌شود؛ فونت نهایی باید محلی، bundled یا مبتنی بر fallback امن سیستم باشد.
- متن مدیریتی اصلی ترجیحاً از `13px` پایین‌تر نمی‌رود.
- `11px` فقط برای metadata واقعاً ثانویه مانند زمان، منبع یا توضیح اعتماد داده است.
- `10px` فقط برای micro-label غیرحیاتی استفاده می‌شود و حامل پیام تصمیم‌ساز نیست.
- اگر خوانایی با بودجه C3 تعارض پیدا کرد، ابتدا spacing، طول wording و اولویت نمایش اصلاح می‌شوند؛ متن اصلی برای جاگرفتن کوچک نمی‌شود.

Ellipsis فقط وقتی مجاز است که متن کامل در پنل جزئیات و نام دسترس‌پذیر باقی بماند. عنوان Attention در View اول یک خط و اثر حداکثر یک خط باقی می‌ماند؛ این تصمیم بودجه C3 است، نه تغییر محتوایی C5.

## ۵. زبان بصری Attention

هر Command Row از شش نشانه با ترتیب ثابت استفاده می‌کند:

1. **Severity marker:** خط یا نقطه کوچک در رنگ معنایی، همراه label متنی.
2. **Main issue:** روشن‌ترین متن ردیف و اولین مقصد چشم.
3. **Business impact:** یک سطح کنتراست پایین‌تر.
4. **Deadline/time:** عدد tabular، فقط اگر معنای زمانی معتبر دارد.
5. **Destination cue:** متن کوتاه Informational؛ آیکن جهت فقط مکمل متن است.
6. **Data trust:** metadata سطح سوم؛ هشدار ضروری Stale / Partial / Last Known Good پنهان نمی‌شود.

حالت‌ها:

- **Default:** سطح شفاف یا Primary، divider ظریف و marker وضعیت.
- **Hover:** فقط Surface Hover و روشن‌ترشدن cue مقصد؛ بدون indicator انتخاب.
- **Focus-visible:** outline مستقل ۲px با offset داخلی/خارجی کافی؛ حتی روی Selected قابل دیدن است.
- **Selected:** Surface Selected + indicator عمودی `3px` در سمت راست RTL + نشانه متنی کوتاه «در حال بررسی». این وضعیت جای Severity یا Focus را نمی‌گیرد.
- **New:** label کوچک «جدید» یا dot همراه متن؛ بدون حرکت.

Critical هیچ‌گاه تمام ردیف را قرمز نمی‌کند. Selected نیز نباید با Critical اشتباه شود: Selected از Informational و Critical از رنگ بحرانی استفاده می‌کند.

## ۶. زبان Module Rails

Workforce و Production ابزارهای کناری Cockpit هستند، نه پنل گزارش یا مجموعه Card.

- عنوان Rail کوتاه، هم‌تراز و کم‌ارتفاع است؛ وضعیت Data و Experimental کنار عنوان و در سطح ثانویه دیده می‌شود.
- Summary Metrics در یک شبکه فشرده و بدون قاب مستقل قرار می‌گیرند. عدد با `KPI secondary/major` و label با Metadata یا Status label نمایش داده می‌شود.
- Divider واحد Summary را از Exceptionها جدا می‌کند.
- Exceptionها ردیف‌های سبک با عنوان، اثر کوتاه و marker کوچک‌اند؛ وزن آن‌ها از Attention مرکزی کمتر است.
- Hover و Focus تعامل‌پذیری Metric/Exception را نشان می‌دهد، ولی کل Rail به یک هدف کلیک تبدیل نمی‌شود.
- Workforce از رنگ Healthy/Warning/Critical فقط مطابق داده موجود استفاده می‌کند.
- Production همیشه label «آزمایشی» با رنگ Experimental دارد. این رنگ به معنی سلامت، خطر یا قطع اتصال نیست.
- نبود داده Production یا Workforce با Unknown و متن صریح نشان داده می‌شود؛ فضای خالی با KPI تازه پر نمی‌شود.

## ۷. زبان Vital Strip

Vital Strip یک Instrument Strip پیوسته است؛ شش Segment آن ریتم مشترک دارند و Card مستقل نیستند.

- Background مشترک، Border-top معماری و divider عمودی ظریف میان Segmentها.
- ترتیب در هر Segment: Metric/State → label → context کوتاه.
- Metric روشن‌ترین عنصر؛ label کوچک و ثابت؛ context فقط یک خط و muted.
- signal کوچک فقط وقتی معنا دارد که وضعیت معتبر و متفاوتی را منتقل کند.
- Hover/Selected با تغییر Surface محدود نمایش داده می‌شود؛ Border یا Shadow مستقل ساخته نمی‌شود.
- برای نبود داده فقط «متصل نیست»، «داده موجود نیست» یا «نامشخص» نمایش داده می‌شود. اندازه متن این حالت از عدد واقعی کوچک‌تر است تا با Metric اشتباه نشود، اما خوانا می‌ماند.
- Experimental در Orders/Production فقط در صورت mock آزمایشی موجود همراه label نمایش داده می‌شود؛ هیچ عدد ساختگی برای پرکردن Strip مجاز نیست.

## ۸. Top System Bar

Top Bar یک Instrument Bar پیوسته با ارتفاع پایه ۴۸px است، نه Navbar یا Header سایت.

ترتیب وزن:

1. Overall Business State.
2. Attention Count، با برجستگی فقط در صورت وجود موضوع مهم.
3. Data Trust، از Business State جدا.
4. زمان/آخرین به‌روزرسانی با عنوان دقیق.
5. Master Gem / Core به‌عنوان شناسه کوچک و ثابت.
6. Refresh به‌عنوان کنترل ابزاری کم‌غلبه.

جداسازی با فاصله و divider کوتاه انجام می‌شود، نه Boxهای هم‌اندازه. Refresh آیکن/متن روشن و focus-visible مستقل دارد، اما مانند CTA اصلی دیده نمی‌شود. Error دریافت در Data Trust نمایش داده می‌شود و به‌تنهایی رنگ Business State را تغییر نمی‌دهد.

## ۹. Important Changes

Important Changes یک Event Feed خلاصه و آرام است:

- یک Surface مشترک با ۲ یا ۳ ستون/آیتم مطابق بودجه C3.
- هر آیتم: Change با وزن متوسط، Impact با رنگ ثانویه و Time با Metadata.
- Divider میان آیتم‌ها؛ بدون Card، badge بزرگ یا سایه.
- signal رنگی فقط وقتی تغییر خودش هشدار معتبر دارد؛ در حالت عادی خنثی است.
- Hover/Focus تعامل Inspect را روشن می‌کند، اما این بخش از Attention مرکزی کم‌کنتراست‌تر می‌ماند.
- Log فنی، status دریافت و eventهای بدون اثر مدیریتی وارد این زبان بصری نمی‌شوند.

## ۱۰. پنل جزئیات

پنل جزئیات (Drawer) سطح Raised/Inspect است و با یک مرز سمت چپ و سایه ظریف از Cockpit جدا می‌شود، بدون اینکه به محصول دیگری شبیه شود. در UI فقط عنوان فارسی «پنل جزئیات» نمایش داده می‌شود. ترتیب Scan آن ثابت است:

1. Title و Close.
2. State row: Severity، Module، Data State و Experimental در صورت نیاز.
3. Business impact.
4. Evidence.
5. Data trust.
6. Metadata / reference.
7. Navigation معتبر.

قواعد نمایش:

- بخش‌ها با spacing و divider کم‌رنگ گروه‌بندی می‌شوند؛ Cardهای داخلی فقط برای مرز معنایی واقعی مجازند.
- عنوان ۱۸px و اثر مدیریتی ۱۳px است؛ metadata ۱۱px و متن فنی خام نمایش داده نمی‌شود.
- Evidence به فهرست کوتاه یا زوج label/value تبدیل می‌شود؛ paragraphهای طولانی شکسته و عنوان‌دار می‌شوند.
- وضعیت Stale یا Error ابتدا پیام انسانی دارد؛ Last Known Good در گروه جدا، با زمان تاریخی خودش نشان داده می‌شود.
- Navigation تنها کنترل برجسته انتهای Drawer است و وقتی مقصد معتبر نیست با ظاهر خنثی و متن روشن «مسیر هنوز متصل نیست» جایگزین می‌شود.
- Focus title، Close و trigger بازگشت طبق C4 حفظ می‌شوند؛ ظاهر Focus مستقل از Selected است.

## ۱۱. Microvisuals

### Gate استفاده

هر Microvisual باید یک سؤال مدیریتی مشخص را سریع‌تر پاسخ دهد؛ اگر سؤال و پاسخ سریع آن قابل بیان نیست، Microvisual حذف می‌شود. متن و عدد اصلی باید حتی با حذف کامل Microvisual همچنان قابل فهم باشند.

- بدون تاریخچه زمانی معتبر، Sparkline و Trend ممنوع‌اند.
- بدون baseline یا target تعریف‌شده، Progress ممنوع است.
- بدون تعریف واقعی ظرفیت، Capacity bar ممنوع است.
- بدون risk model موجود، Risk indicator تازه ساخته نمی‌شود.
- Production آزمایشی فقط از mockهای از قبل موجود استفاده می‌کند؛ KPI، Trend، Progress یا سیگنال تازه برای زیبایی ساخته نمی‌شود.
- وجود فضای خالی، به‌تنهایی مجوز Microvisual نیست.

پس از عبور از این Gate، Microvisual فقط وقتی مجاز است که خواندن وضعیت را سریع‌تر کند و داده واقعی یا Mock مصوب با مرجع روشن داشته باشد:

- **Compact progress:** خط `3–4px` برای نسبت معتبر با baseline/target تعریف‌شده؛ همراه مقدار متنی.
- **Capacity bar:** فقط برای تعریف واقعی و موجود ظرفیت Workforce؛ همراه label و مقدار.
- **Mini trend / sparkline:** تاریخچه زمانی معتبر، بازه مشخص و جهت قابل توضیح؛ همراه خلاصه متنی.
- **Status dot:** قطر `6px` برای وضعیت مکمل؛ هرگز بدون label یا متن دسترس‌پذیر.
- **Risk indicator:** marker کوتاه برای سطح مصوب ریسک؛ نه محاسبه تازه در UI.

ممنوع:

- Gauge، نمودار سه‌بعدی، Radar، Donut یا Chart صرفاً تزئینی.
- Sparkline برای یک مقدار، داده بدون تاریخچه یا بازه نامشخص.
- استفاده از progress به‌عنوان تزئین پس‌زمینه.
- استخراج trend، threshold یا ریسک جدید در لایه نمایش.

## ۱۲. زبان آیکن

- یک مجموعه line icon ساده با grid پایه ۱۶px و stroke حدود `1.5px` انتخاب شود؛ انتخاب کتابخانه در زمان implementation و بدون افزودن سیستم دوم انجام می‌شود.
- آیکن فقط برای Close، Refresh، جهت Navigation، وضعیت اتصال یا تشخیص سریع نوع سیگنال مجاز است.
- متن مهم، Severity، Experimental و Data State هرگز فقط با آیکن بیان نمی‌شوند.
- آیکن‌های جهت در RTL جهت درست دارند.
- آیکن تزئینی کنار همه عنوان‌ها، illustration و نمادهای هواپیما/فضا ممنوع است.

## ۱۳. Scrollbar

Scrollbar بخشی کم‌غلبه از ابزار است:

- عرض مرجع `6px`؛ track شفاف یا هم‌رنگ Surface.
- thumb در حالت عادی با کنتراست محدود و در Hover/Focus واضح‌تر.
- radius کامل فقط برای thumb مجاز است.
- scrollbar سیستم نباید با رنگ روشن مرکز توجه شود، اما پنهان‌کردن کامل آن نیز ممنوع است.
- Queue و Drawer باید با صفحه‌کلید و اشاره‌گر قابل پیمایش باقی بمانند؛ نشان «مورد دیگر» C4 مستقل از scrollbar حفظ می‌شود.

## ۱۴. Design Tokens پیشنهادی

نام‌ها قرارداد پیشنهادی C5 برای implementation آینده‌اند و هنوز در کد ثبت نمی‌شوند.

### Spacing

| Token | مقدار | کاربرد |
| --- | ---: | --- |
| `--space-1` | `4px` | فاصله marker و label |
| `--space-2` | `8px` | فاصله داخلی کوچک |
| `--space-3` | `12px` | فاصله ردیف/گروه |
| `--space-4` | `16px` | padding اصلی Rail و section |
| `--space-5` | `20px` | گروه‌های Drawer |
| `--space-6` | `24px` | جداسازی سطح بالا در فضای بزرگ |

### Radius

| Token | مقدار | کاربرد |
| --- | ---: | --- |
| `--radius-control` | `4px` | دکمه و focus target |
| `--radius-surface` | `6px` | Surface واقعی، در صورت نیاز |
| `--radius-pill` | `999px` | فقط status dot/pill کوتاه |

### Border و indicator

| Token | مقدار |
| --- | ---: |
| `--border-width` | `1px` |
| `--focus-width` | `2px` |
| `--selected-indicator-width` | `3px` |
| `--severity-dot-size` | `6px` |
| `--icon-size` | `16px` |

### Shadow

| Token | مقدار | کاربرد |
| --- | --- | --- |
| `--shadow-none` | `none` | همه ردیف‌ها و Rails |
| `--shadow-raised` | `-8px 0 24px rgb(0 0 0 / 18%)` | Drawer در RTL |
| `--shadow-focus` | `0 0 0 2px var(--focus-ring)` | Focus-visible؛ نه عمق تزئینی |

### Typography tokens

- `--font-ui`: stack محلی فارسی/سیستمی.
- `--font-size-kpi-major`: `24px`.
- `--font-size-kpi-secondary`: `18px`.
- `--font-size-title`: `14px`.
- `--font-size-body`: `13px`.
- `--font-size-meta`: `11px`.
- `--font-size-micro`: `10px`، فقط غیرحیاتی.
- `--line-height-tight`: `1.25` برای Metric.
- `--line-height-ui`: `1.6` برای متن فشرده فارسی.
- `--line-height-reading`: `1.8` برای جزئیات Drawer.

### Layout tokens حفظ‌شده

- `--system-bar-height`: `48px`.
- `--vital-height`: `88px` در Desktop بزرگ و `80px` در viewport فشرده.
- عرض Rails، فاصله ستون‌ها، ارتفاع ردیف‌ها و Drawer مطابق C2/C3/C4 باقی می‌مانند و C5 token تازه‌ای برای تغییر آن‌ها تصویب نمی‌کند.

## ۱۵. دسترس‌پذیری و کنترل کیفیت بصری

- متن اصلی و متن عملیاتی باید کنتراست خوانا روی Surface خود داشته باشند؛ هدف حداقل WCAG AA برای متن عادی است.
- Signal، Selected، New، Experimental و Data State علاوه بر رنگ، متن یا شکل مشخص دارند.
- Focus-visible روی همه اهداف تعاملی با outline مستقل و بدون جابه‌جایی Layout دیده می‌شود.
- Hover هیچ اطلاعات منحصربه‌فردی ندارد که از کاربر صفحه‌کلید پنهان بماند.
- اعداد فارسی/لاتین در هر ناحیه یکدست و tabular هستند؛ جهت متن، زمان و کد مرجع به‌طور صریح کنترل می‌شود.
- نمایش در `1365×768` نباید برای جا دادن محتوا به Micro label یا حذف هشدار اعتماد داده متکی شود.

## ۱۶. Responsive

### Desktop و 1365×768

- معیار اصلی همان بودجه C3 است؛ اندازه فونت و ارتفاع ردیف کم نمی‌شود.
- Critical و Selected در مرکز باید در نگاه اول قابل تفکیک باشند.
- Railها با Summary Metric و سه Exception موجود قابل Scan باقی می‌مانند.
- Vital Strip کامل و پیوسته دیده می‌شود.
- Drawer روی Layout قرار می‌گیرد و آن را هل نمی‌دهد.

### 1920×1080 و 1920×960

- فضای بیشتر صرف line length بهتر، تنفس گروه‌ها و ظرفیت مجاز C3 می‌شود.
- KPI، title و icon صرفاً به‌دلیل عرض بیشتر بزرگ نمی‌شوند.
- Surface یا decoration تازه برای پرکردن فضای خالی اضافه نمی‌شود.

### 720 و 420

- ساختار ستونی موجود C2/C3/C4 حفظ می‌شود.
- همان نقش‌های رنگ، typography و interaction اعمال می‌شوند، اما Commander Feed نهایی طراحی نمی‌شود.
- Vital Strip می‌تواند مطابق رفتار فعلی wrap شود؛ Segment مستقل به Card تبدیل نمی‌شود.
- Drawer تمام‌عرض فعلی و hierarchy داخلی آن حفظ می‌شود.

## ۱۷. Motion — فقط قواعد آینده C6

C5 هیچ animation پیاده نمی‌کند. در C6 فقط این motionها امکان بررسی دارند:

- باز و بسته‌شدن Drawer با جابه‌جایی کوتاه و opacity محدود.
- گذار Hover ↔ Selected بدون تغییر ابعاد.
- ورود Signal جدید با اعلان غیرمزاحم و بدون reorder ناگهانی.
- تغییر Freshness با crossfade یا تغییر label محدود.

قواعد آینده:

- Motion باید قابل کاهش با `prefers-reduced-motion` باشد.
- Blink، حرکت پیوسته، parallax، شمارنده نمایشی و animation تزئینی ممنوع‌اند.
- Critical برای جلب توجه حرکت دائمی ندارد.
- تعریف duration/easing نهایی، تست حرکت و implementation همگی به C6 منتقل می‌شوند.

## ۱۸. موارد منتقل‌شده به مراحل بعد

- پیاده‌سازی tokenها و جایگزینی رنگ‌ها/spacing فعلی: مرحله implementation C5 پس از تأیید این سند.
- انتخاب نهایی کتابخانه آیکن و audit همه آیکن‌ها: implementation C5.
- هرگونه animation و transition رفتاری: C6.
- Mobile Commander Feed: مرحله مستقل Mobile.
- اعتبارسنجی رنگ با مدیر، نمایشگر واقعی و ابزار contrast: هنگام implementation C5.
- Microvisual واقعی فقط پس از وجود داده و baseline معتبر؛ نبود داده مجوز نمونه‌سازی عددی نیست.
- تعریف عملیاتی Seen / Investigating / Resolved / Snoozed همچنان نیازمند تصمیم محصول، مالکیت داده و احتمالاً بررسی قرارداد است.

## ۱۹. ممنوعیت‌ها و معیار پذیرش سند

در C5 هیچ‌کدام از موارد زیر مجاز نیست:

- تغییر Spatial Architecture، Information Density یا Interaction Model.
- تغییر `apps/workforce` یا `packages/module-contracts`.
- API، database، localStorage، storage bridge یا adapter واقعی.
- اتصال واقعی Workforce، Production یا Mahak.
- تغییر P06 یا MAHAK-GATE.
- KPI، threshold، alert، business logic یا داده Mock تازه.
- Neon، Glow شدید، Glassmorphism سنگین، Gauge یا Chart تزئینی.

سند زمانی آماده بررسی است که برای رنگ، typography، Surface، Attention، Rails، Vital Strip، Top Bar، Changes، Drawer، Microvisual، Icon، Depth، Scrollbar، Responsive و tokenها قاعده قابل اجرا داشته باشد؛ در عین حال هیچ‌یک از تصمیم‌های C2 تا C4 را تغییر ندهد.

این مرحله فقط همین سند را ایجاد می‌کند. هیچ code، CSS، component، test، commit، push یا merge در C5 Design انجام نمی‌شود.
