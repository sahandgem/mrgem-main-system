# C6 — طراحی حرکت و گذار Cockpit

## وضعیت و مراجع

- مرحله: طراحی Motion؛ این سند مجوز پیاده‌سازی animation، transition، CSS یا component نیست.
- نقطه شروع: commit `2cab3687b63632ad6b6ba0fbc6a0cad7bc707361` پس از بسته‌شدن C5.
- مراجع الزام‌آور: [مشخصات Cockpit](COCKPIT-DASHBOARD-SPEC.fa.md)، [پوسته C2](COCKPIT-C2-SHELL.fa.md)، [سلسله‌مراتب C2.1](COCKPIT-C2.1-HIERARCHY.fa.md)، [تراکم C3](COCKPIT-C3-INFORMATION-DENSITY.fa.md)، [تعامل C4](COCKPIT-C4-INTERACTION.fa.md) و [سیستم بصری C5](COCKPIT-C5-VISUAL-SYSTEM.fa.md).
- معیار اصلی تجربه همچنان `1365×768` است؛ Desktop تجربه اصلی و `720` و `420` فقط قواعد responsive این مرحله را دریافت می‌کنند.

C6 معماری فضایی، بودجه اطلاعات، ترتیب Attention، رفتار Single Drawer، Focus، Selection، رنگ، تایپوگرافی یا منطق داده را تغییر نمی‌دهد. حرکت فقط به فهم این سه پرسش کمک می‌کند:

1. چه چیزی باز یا بسته شد؟
2. چه چیزی انتخاب شد؟
3. چه چیزی واقعاً تغییر کرد؟

اگر حرکت پاسخ یکی از این پرسش‌ها را سریع‌تر نکند، حذف می‌شود. Cockpit در بارگذاری اولیه نباید با اجرای هماهنگ animationها وارد صحنه شود؛ وضعیت اولیه بدون نمایش افتتاحیه و فوراً قابل خواندن است.

## اصول ثابت

- حرکت بازخورد تعامل است، نه محتوا و نه ابزار جلب توجه دائمی.
- متن، label، marker و مقدار نهایی باید بدون دیدن animation نیز کاملاً قابل فهم باشند.
- تغییر معنایی و دسترس‌پذیر در همان لحظه تعامل یا دریافت snapshot جدید اعمال می‌شود؛ motion نباید نمایش یا اعلام وضعیت تازه را به پایان animation موکول کند.
- ارتفاع ردیف، عرض Rail، جای ستون‌ها، ارتفاع Top Bar و Vital Strip و scroll position بر اثر motion تغییر نمی‌کنند.
- Business Attention و Data Health مستقل می‌مانند؛ خطای داده با shake، flash یا حرکت شدید به Attention کسب‌وکاری تبدیل نمی‌شود.
- Critical، Experimental، Selected و Data State هرگز فقط با حرکت بیان نمی‌شوند.
- حرکت در بارگذاری اولیه، hoverهای متوالی و به‌روزرسانی‌های مکرر نباید حس ناپایداری یا بازی‌گونه ایجاد کند.

## ۱. پنل جزئیات

پنل جزئیات (Drawer) تنها سطح بزرگ مجاز برای حرکت مکانی است.

### بازشدن

- پنل از لبه راست RTL به جای نهایی خود می‌رسد.
- فاصله حرکت کوتاه و مرجع آن حدود `12–16px` در Desktop است؛ پنل از خارج کامل viewport پرتاب نمی‌شود.
- opacity فقط به‌صورت محدود، از حدود `0.88–0.92` به `1` تغییر می‌کند.
- مدت مرجع Desktop برابر token پنل، `180ms`، با easing استاندارد است.
- Cockpit زیر پنل ثابت می‌ماند؛ پنل روی Context قرار می‌گیرد و هیچ ستون، Rail یا Vital را هل نمی‌دهد.
- backdrop تازه، blur متحرک یا تغییر scale وجود ندارد.

محتوا، عنوان دسترس‌پذیر و معنای Selected بلافاصله به‌روز می‌شوند. انتقال Focus مطابق C4 به عنوان یا container پنل انجام می‌شود و منتظر پایان حرکت نمی‌ماند. ظاهر `focus-visible` مستقل از animation و فوری باقی می‌ماند.

### بسته‌شدن

- پنل با همان جهت، به سمت لبه راست، و با فاصله‌ای کوتاه خارج می‌شود.
- مدت مرجع بسته‌شدن `140ms` و برابر duration استاندارد، با easing خروج است؛ از بازشدن طولانی‌تر نیست.
- opacity فقط تا حدود `0.88–0.92` کاهش می‌یابد و محو نمایشی کامل ایجاد نمی‌شود.
- بازگشت Focus به trigger دقیق C4 بخشی از رفتار تعامل است، نه اثر بصری؛ animation نباید آن را گم یا عقب بیندازد.

در پیاده‌سازی فعلی، بستن پنل آن را فوراً از درخت رابط حذف می‌کند. اگر در مرحله آینده برای نمایش حرکت خروج، سطح پنل مدت کوتاهی باقی بماند، این حضور فقط بصری است: پنلِ در حال خروج دیگر نباید در ترتیب Tab، تعامل pointer یا جریان Screen Reader قابل دسترسی باشد. Focus طبق C4 به trigger بازمی‌گردد و نباید تا پایان `140ms` در پنل نگه داشته شود. مدل معنایی «پنل باز است» با پایان animation اشتباه گرفته نمی‌شود.

### تعویض محتوای پنل باز

- host پنل، موقعیت و ابعاد خود را حفظ می‌کند و دوباره از لبه صفحه وارد نمی‌شود.
- عنوان و محتوای تازه می‌توانند یک transition بسیار کوتاه opacity با duration سریع داشته باشند، مشروط به اینکه Focus، scroll reset تعریف‌شده C4 و اعلام عنوان تازه فوری بمانند.
- slide افقی یا عمودی برای تعویض payload، Drawer تو‌در‌تو و شبیه‌سازی history ممنوع است.

## ۲. Selected State

انتخاب Attention، Metric، Exception، Change یا Vital فقط state موجود C4 را آشکارتر می‌کند:

- background به Surface Selected تغییر می‌کند.
- indicator عمودی `3px` در سمت راست RTL ظاهر می‌شود.
- متن «در حال بررسی» در جای از پیش رزروشده یا بدون تغییر ارتفاع نمایش داده می‌شود.

موارد مجاز برای transition:

- background و color با duration سریع.
- opacity indicator و متن انتخاب با duration سریع.

موارد ممنوع:

- حرکت ردیف، تغییر padding یا ارتفاع، scale، glow و pulse.
- animation marker شدت؛ Critical و Selected دو سیگنال مستقل باقی می‌مانند.
- محوشدن Focus در زمان transition.

Selected از Hover ماندگارتر و واضح‌تر است. خروج pointer نباید Selected را حذف کند و ورود pointer نباید indicator انتخاب را شبیه‌سازی کند.

## ۳. Hover و Focus

- Hover می‌تواند فقط background، border/divider یا color مقصد را با duration سریع تغییر دهد.
- transition مرجع Hover حدود `90ms` است تا ابزار پاسخ‌گو بماند.
- `focus-visible` باید در همان frame تعامل صفحه‌کلید با outline کامل C5 ظاهر شود؛ outline و تشخیص Focus delay، fade یا animation ندارند.
- رنگ یا background مکمل Focus می‌تواند transition کوتاه داشته باشد، اما indicator اصلی Focus فوری است.
- Focus روی Selected همچنان مستقل و قابل تشخیص است.
- در دستگاه لمسی، نبود Hover هیچ اطلاعات یا affordance ضروری را حذف نمی‌کند.

## ۴. ورود Attention جدید

این بخش فقط رفتار بصری آینده را تعریف می‌کند. Realtime، subscription، polling، buffer پایدار، storage و قرارداد تازه در C6 ساخته نمی‌شوند.

در Core فعلی، صف از snapshot داده mock ساخته می‌شود و رفتار نگه‌داشتن snapshot هنگام تعامل هنوز وجود ندارد. صرف پیاده‌سازی transitionهای C6 نباید این رفتار آینده را وانمود کند یا منطق refresh موجود را بی‌تصمیم محصول تغییر دهد.

وقتی مدیر با Queue در حال hover، focus، scroll یا Inspect است:

- ردیف‌های نمایان خودکار reorder نمی‌شوند.
- scroll position و ردیف زیر pointer/focus ثابت می‌مانند.
- اعلان کوچک و متنی مانند «۱ موضوع جدید» بالای صف ظاهر می‌شود.
- اعلان می‌تواند با opacity و حداکثر `6px` حرکت کوتاه عمودی، طی duration استاندارد ظاهر شود.
- Critical تازه می‌تواند شمارش و label متنی Top Bar را فوراً به‌روزرسانی کند، اما blink، pulse، flash یا تکرار animation ندارد.
- Focus خودکار به اعلان یا ردیف جدید منتقل نمی‌شود.

اعمال snapshot و رتبه‌بندی جدید فقط با تعامل صریح مدیر یا refresh کنترل‌شده انجام می‌شود. در این لحظه نیز جای Focus باید با شناسه پایدار حفظ شود؛ اگر این داده در آینده موجود نباشد، رفتار نیازمند تعریف قراردادی جداگانه است. animation مجوز ساخت شناسه، وضعیت Seen یا command تازه نیست.

اعلان جدید فقط یک بار هنگام ورود واقعی اجرا می‌شود. rerender، بازشدن پنل یا تغییر viewport نباید آن را دوباره animate کند.

## ۵. تغییر تازگی و اعتماد داده

هنگام تغییر بین «تازه و معتبر»، «قدیمی»، «ناقص»، «خطای داده» یا «نامشخص»:

- label، متن توضیحی و marker معنایی فوراً به state جدید تغییر می‌کنند.
- color و opacity می‌توانند transition استاندارد کوتاه داشته باشند.
- فضای label تا حد ممکن ثابت می‌ماند تا Top Bar، Rail و Vital جابه‌جا نشوند.
- عدد، زمان یا درصد count-up/count-down، flip یا rolling animation ندارد.
- Last Known Good بدون transition گمراه‌کننده و با برچسب تاریخی و زمان خودش باقی می‌ماند.
- تغییر به Error یا بازگشت به Healthy با shake، flash، pulse یا رنگ‌کردن کل Surface همراه نیست.

Motion نباید لحظه عبور از Stale/Partial/Error را مبهم کند. اگر crossfade خواندن label را کند کند، تغییر متن فوری و فقط transition رنگ حفظ می‌شود.

## ۶. Important Changes

- animation فقط برای Event واقعاً تازه یا تغییر واقعی داده مجاز است؛ mount اولیه صفحه «ورود Event» محسوب نمی‌شود.
- آیتم تازه می‌تواند یک fade محدود با duration استاندارد داشته باشد.
- حرکت مکانی فقط در صورت نیاز به فهم محل ورود و حداکثر `4–6px` مجاز است.
- ترتیب موجود در زمان خواندن خودکار جابه‌جا نمی‌شود.
- carousel، auto-scroll، marquee، حرکت دوره‌ای و animation تکرارشونده ممنوع‌اند.
- Event بدون اثر مدیریتی فقط برای نمایش motion ساخته نمی‌شود.

Important Changes در تمام مدت از Attention آرام‌تر باقی می‌ماند؛ duration، رنگ یا دامنه حرکت نباید وزن بصری آن را بالاتر ببرد.

## ۷. Vital Strip

- تغییر واقعی value یا state فقط با transition کوتاه color و در صورت نیاز opacity نمایش داده می‌شود.
- متن و مقدار نهایی فوراً قابل خواندن‌اند.
- عددها animate، roll، count یا scale نمی‌شوند.
- Progress animation، pulse، flash و حرکت divider ممنوع است.
- تغییر «متصل نیست» به مقدار واقعی یا برعکس باید با متن صریح همراه باشد؛ animation جای معنی داده را نمی‌گیرد.
- هر شش Segment روی یک Instrument Strip ثابت می‌مانند و مستقل وارد یا خارج نمی‌شوند.

## ۸. Top Bar و Module Rails

- Top Bar به‌عنوان یک Instrument ثابت وارد، جمع یا باز نمی‌شود. فقط stateهای مجاز آن، مانند Attention Count یا Data Trust، از قواعد تغییر داده همین سند استفاده می‌کنند.
- Workforce و Production Rail حرکت مستقل، slide یا reveal ندارند.
- Metric و Exception داخل Rail فقط Hover، Focus و Selected مجاز را دریافت می‌کنند.
- Production آزمایشی با motion متفاوت یا برجسته معرفی نمی‌شود؛ label «آزمایشی» و زبان بصری C5 کافی است.
- هیچ Metric، threshold، trend یا state تازه‌ای برای ایجاد animation ساخته نمی‌شود.

## ۹. Motion Tokens پیشنهادی

این نام‌ها و مقادیر قرارداد پیشنهادی برای implementation آینده‌اند و هنوز در CSS ثبت نمی‌شوند.

| Token | مقدار مرجع | کاربرد |
| --- | ---: | --- |
| `--motion-duration-fast` | `90ms` | Hover، Selected indicator و feedback کوچک |
| `--motion-duration-standard` | `140ms` | تغییر state، اعلان تازه و خروج پنل |
| `--motion-duration-panel` | `180ms` | بازشدن پنل جزئیات در Desktop |
| `--motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | رسیدن مستقیم و کنترل‌شده به state نهایی |
| `--motion-easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | خروج سریع و بدون overshoot |

قواعد tokenها:

- delay پیش‌فرض صفر است؛ stagger میان ردیف‌ها یا Segmentها وجود ندارد.
- هیچ duration مجاز نیست برای جلب توجه افزایش یابد یا به loop تبدیل شود.
- easing دارای bounce، spring یا overshoot ممنوع است.
- برای چند property هم‌زمان، duration و easing مشترک استفاده می‌شود تا response تکه‌تکه دیده نشود.
- پایان transition نباید شرط فعال‌شدن کنترل، تغییر `aria-*` یا انتقال Focus باشد.

## ۱۰. `prefers-reduced-motion`

رعایت `prefers-reduced-motion: reduce` اجباری است:

- تمام slide و transformهای حرکتی حذف می‌شوند.
- پنل جزئیات در موقعیت نهایی خود ظاهر و پنهان می‌شود؛ layout، Focus و Context همان رفتار عادی را دارند.
- opacity transition ترجیحاً حذف و در صورت نیاز فنی حداکثر به یک تغییر بسیار کوتاه و غیرضروری محدود می‌شود.
- اعلان Attention تازه، تغییر Freshness، Selected و Important Change بدون حرکت و با متن/رنگ/indicator نهایی فوراً نمایش داده می‌شوند.
- scrolling خودکار یا smooth scrolling برای انتقال Focus استفاده نمی‌شود.
- هیچ اطلاعات، ترتیب، وضعیت یا کنترل در reduced motion حذف نمی‌شود.

Reduced motion نسخه ناقص تجربه نیست؛ فقط مسیر رسیدن بصری به همان state نهایی را حذف می‌کند.

## ۱۱. Performance

- حرکت مکانی ترجیحاً فقط با `transform` و محوشدن فقط با `opacity` انجام می‌شود.
- transition محدود color و background-color برای feedback کوچک مجاز است.
- animation روی `width`، `height`، `top`، `left`، padding، margin و grid/flex definition ممنوع یا تا حد ممکن اجتناب می‌شود.
- box-shadow بزرگ یا blur متحرک، filter سنگین و repaint سراسری مجاز نیست.
- اندازه‌گیری DOM در هر frame، خواندن و نوشتن متناوب layout و هر الگوی ایجادکننده layout thrashing ممنوع است.
- `will-change` دائمی روی Rails، Queue یا Drawer استفاده نمی‌شود؛ در صورت نیاز آینده باید موقت، محدود و اندازه‌گیری‌شده باشد.
- animation ردیف‌های خارج viewport، Segmentهای ثابت یا کل Cockpit اجرا نمی‌شود.
- بازشدن پنل و scroll داخلی Queue/Drawer نباید یکدیگر را قفل یا کند کنند.

## ۱۲. دسترس‌پذیری

- C4 مرجع نهایی Focus، Keyboard، Selection و Single Drawer Model باقی می‌ماند.
- motion Focus را جابه‌جا نمی‌کند، Tab order را تغییر نمی‌دهد و keyboard navigation را تا پایان animation مسدود نمی‌کند.
- عنوان، نقش و state پنل در لحظه بازشدن برای فناوری کمکی موجودند؛ animation اعلام screen reader را به تأخیر نمی‌اندازد.
- اعلان Attention تازه دارای متن قابل فهم است و در implementation آینده باید با روش اعلام غیرمزاحم مناسب بررسی شود؛ رنگ یا حرکت به‌تنهایی کافی نیست.
- Critical تازه بدون ربودن Focus و بدون صدای خودکار اعلام می‌شود.
- Hidden/visible شدن بصری نباید محتوای خارج‌شده را قابل Focus نگه دارد یا محتوای واردشده را تا پایان transition از keyboard پنهان کند.
- تغییر Freshness، مقدار و Last Known Good با label متنی و معنای زمانی روشن باقی می‌ماند.

## ۱۳. Responsive

### Desktop

- فاصله پنل `12–16px`، بازشدن `180ms` و بسته‌شدن `140ms` است.
- حرکت از لبه راست RTL انجام می‌شود و سه ستون Cockpit ثابت می‌مانند.
- Queue، Rails، Important Changes و Vital Strip هیچ entrance animation جمعی ندارند.

### عرض‌های 720 و 420

- پنل تمام‌عرض با فاصله کوتاه‌تر حدود `8–12px` وارد می‌شود.
- بازشدن حداکثر duration استاندارد، `140ms`، و بسته‌شدن duration سریع، `90ms`، دارد.
- opacity محدودتر از Desktop یا حذف‌شده است تا متن سریع‌تر پایدار شود.
- animation اسکرول، viewport، نوار مرورگر یا موقعیت خواندن کاربر را قفل نمی‌کند.
- motion نباید ارتفاع صفحه، ترتیب ستونی فعلی یا دسترسی به Close را تغییر دهد.
- این قواعد طراحی Mobile Commander Feed نیستند؛ آن تجربه همچنان مرحله مستقل دارد.

## ۱۴. عناصر مجاز و غیرمجاز

### اجازه حرکت دارند

- پنل جزئیات برای Open/Close.
- feedback کوتاه Hover و Selected.
- indicator و متن «در حال بررسی» بدون تغییر ابعاد.
- اعلان متنی ورود Attention تازه.
- label و رنگ Freshness/Data Trust هنگام تغییر واقعی.
- Important Change تازه پس از تغییر واقعی داده.
- state/value موجود در Vital Strip بدون animation عدد.

### نباید حرکت کنند

- معماری Left / Center / Right، Top Bar و Vital Strip.
- خود Railها، Command Core، Status Summary و Upcoming Commitments.
- ترتیب Queue زیر pointer، Focus یا Drawer باز.
- Critical marker برای جلب توجه دائمی.
- KPIها، chartها، microvisualها، dividerها و scrollbar برای تزئین.
- background، glow، shadow، icon یا brand به‌صورت پیوسته.
- داده Mock/Experimental صرفاً برای نمایش motion.

## ۱۵. ممنوعیت‌ها

در C6 ممنوع است:

- blinking، infinite animation، pulse دائمی و glow متحرک.
- parallax، floating element و animated background.
- bounce، overshoot، spring و stagger نمایشی.
- count-up/count-down، digit roll و chart animation.
- carousel، auto-scroll و automatic reorder زیر pointer/focus.
- animation تغییر‌دهنده layout یا کوچک‌کننده متن.
- sound، haptic و هر بازخورد خارج از تصویر.
- animation برای تزئین، بارگذاری اولیه یا پرکردن فضای خالی.
- تغییر معنای Healthy، Stale، Partial، Error، Unknown یا Last Known Good.

## ۱۶. معیار پذیرش implementation آینده

پیاده‌سازی آینده C6 فقط وقتی آماده پذیرش است که:

- Open، Close و Switch پنل با pointer و keyboard بدون تغییر Focus behavior C4 آزموده شوند.
- Selected، Hover و `focus-visible` در حالت‌های مستقل و ترکیبی قابل تفکیک باشند.
- ورود Attention تازه بدون reorder، scroll jump یا Focus theft بررسی شود.
- Freshness و چهار وضعیت داده بدون animation عدد و بدون ابهام Last Known Good آزموده شوند.
- حالت عادی و `prefers-reduced-motion: reduce` هر دو روی مرورگر واقعی بررسی شوند.
- viewportهای `1920×1080`، `1440×800`، `1365×768`، `720` و `420` بدون horizontal overflow، layout shift یا قفل scroll باقی بمانند.
- performance با تأکید بر transform/opacity و نبود layout thrashing بازبینی شود.
- هیچ motion فقط با رنگ، حرکت یا timing حامل اطلاعات نباشد.

## حدود و تصمیم‌های باز

این مرحله فقط همین سند را در `apps/core/docs` ایجاد می‌کند. هیچ code، CSS، component، test، mock، API، database، localStorage، adapter، realtime یا اتصال واقعی اضافه نمی‌شود. `apps/workforce`، `packages/module-contracts`، P06 و MAHAK-GATE دست‌نخورده می‌مانند.

مدل دقیق تشخیص «مدیر در حال تعامل با Queue است»، شناسه پایدار برای حفظ Focus پس از snapshot تازه، روش اعلام screen reader برای Attention جدید و منبع واقعی رویدادها در صورت نیاز **نیازمند تعریف** و احتمالاً بررسی هماهنگ قرارداد هستند. این سند هیچ field، command یا تغییر قرارداد مشترکی را تصویب نمی‌کند.

سند C6 فعلاً commit نمی‌شود و هیچ push یا merge انجام نمی‌شود.
