# Architecture Decisions

آخرین به‌روزرسانی: 2026-06-29

## تصمیم‌های معماری گرفته‌شده

| ID | تصمیم | وضعیت |
|---|---|---|
| ADR-001 | UI اصلی فارسی، RTL و dark mode است. | فعال |
| ADR-002 | داده واقعی در کد hardcode نمی‌شود؛ seed فقط demo است. | فعال |
| ADR-003 | تا قبل از backend، persistence با localStorage و service داخلی انجام می‌شود. | فعال |
| ADR-004 | مدل‌های WF در TypeScript نگه‌داری می‌شوند و تغییر مدل باید کنترل‌شده باشد. | فعال |
| ADR-005 | منطق تحلیل باید تا حد امکان از UI جدا بماند. | فعال |
| ADR-006 | routeها از manifest/registry مرکزی تغذیه می‌شوند. | فعال |
| ADR-007 | routeها با lazy import بارگذاری می‌شوند. | فعال |
| ADR-008 | localStorage key جدید بدون ثبت در registry و بررسی backup coverage مجاز نیست. | فعال |
| ADR-009 | baselineهای قدیمی خودکار rewrite یا migrate نمی‌شوند؛ فقط با warning سازگاری توضیح داده می‌شوند. | فعال |
| ADR-010 | عملیات حساس مثل import/restore/cleanup باید محافظه‌کارانه و همراه snapshot یا امکان rollback باشد. | فعال |
| ADR-011 | notification فعلی فقط local/in-app است؛ push/email/SMS واقعی هنوز ساخته نشده است. | فعال |
| ADR-012 | `WorkforcePages.tsx` باید تدریجی کوچک شود؛ استخراج یک‌باره پرریسک است. | فعال |
| ADR-013 | `audit-app` فعلاً زیرپروژه `FIN-AUDIT` است و نباید مستقیم merge شود. | فعال |
| ADR-014 | `mahak-web-version` فعلاً زیرپروژه `DATA-MAHAK` است و نباید مستقیم merge شود. | فعال |
| ADR-015 | از زیرپروژه‌ها فقط ایده‌ها، schemaها، مدل‌ها و منطق‌های مفید، آن هم بعداً با تأیید مرکز کنترل، قابل استخراج هستند. | فعال |
| ADR-016 | Source Integration Map مرجع تصمیم‌های ادغام آینده است و CONTROL-P2 هیچ ادغام کدی انجام نمی‌دهد. | فعال |
| ADR-017 | پروژه اصلی فعلاً روی سبک‌سازی WF و کاهش بدهی `WorkforcePages.tsx` متمرکز می‌ماند؛ ماژول جدید بدون تأیید مرکز کنترل شروع نمی‌شود. | فعال |
| ADR-018 | Future Modules Roadmap مرجع ترتیب آینده ماژول‌ها است؛ Finance/Product/Mobile/Production/Inventory قبل از مدل‌های مرکزی و کاهش بدهی WF شروع نمی‌شوند. | فعال |
| ADR-019 | Core Product Model قبل از هر UI، migration، adapter اجرایی یا اتصال محک باید به صورت مستند طراحی و تأیید شود. | فعال |
| ADR-020 | Core Financial Event Model قبل از هر UI مالی، migration، auth/database change، adapter اجرایی یا اتصال پروژه پول باید به صورت مستند طراحی و تأیید شود. | فعال |
| ADR-021 | Product Adapter Boundary باید قبل از هر import، UI کالا یا migration اجرا شود؛ داده خام پروژه کالا نباید مستقیم وارد database اصلی شود. | فعال |
| ADR-022 | Product Import Validator و Duplicate Detector باید قبل از هر import واقعی، merge/update کالا، UI کالا یا Mahak Export Adapter طراحی و تأیید شوند. | فعال |
| ADR-023 | Product Auto-fix، Review Queue، Mahak Export و AI Product Snapshot باید قبل از ورود واقعی کالا به صورت مستند و قابل audit طراحی شوند. | فعال |
| ADR-024 | کار آینده باید بین workstreamها و labهای جدا تقسیم شود؛ repo اصلی فقط خروجی‌های کوچک، تأییدشده و قابل rollback را می‌پذیرد. | فعال |
| ADR-025 | هیچ دو Codex نباید همزمان یک فایل مشترک را تغییر دهند و هر handoff باید git status، محدوده، commit و push status داشته باشد. | فعال |
| ADR-026 | Financial Schema و Adapter Boundary باید قبل از هر UI مالی، receipt flow، bank import، liquidity dashboard، auth/database change یا migration طراحی و تأیید شوند. | فعال |
| ADR-027 | Financial Validation، Bank Excel Automation، Receipt Match و Installment Confirmation باید قبل از هر import واقعی یا auto confirm اجرایی به صورت مستند و قابل audit طراحی و تأیید شوند. | فعال |
| ADR-028 | Financial Review Queue، Bank Excel Format Test Plan، Bank Rule Versioning و Installment Audit باید قبل از هر automation مالی اجرایی و تایید خودکار قسط طراحی و تأیید شوند. | فعال |
| ADR-029 | کل پروژه باید با اصل Automation-First و AI-Assisted طراحی شود: سیستم تا جای امن normalize، validate، analyze، suggest و auto-act می‌کند و انسان موارد حساس، مشکوک یا کم‌اطمینان را کنترل می‌کند. | فعال |
| ADR-030 | هر AI suggestion یا auto action باید confidence level، rule version، دلیل تصمیم و audit trail داشته باشد؛ تصمیم‌های conflict و manual only هرگز auto-confirm نمی‌شوند. | فعال |
| ADR-031 | هر اتوماسیون بین‌ماژولی باید از طریق snapshot یا signal کنترل‌شده انجام شود؛ ماژول‌ها نباید داده خام یکدیگر را مستقیم mutate کنند. | فعال |
| ADR-032 | تصمیم auto action فقط برای high confidence مجاز است؛ medium به review، low به review یا blocked، conflict به blocked و manual only به تصمیم انسانی می‌رود. | فعال |
| ADR-033 | AI فقط باید از snapshotهای normalize و validate شده برای تحلیل نهایی استفاده کند؛ داده خام خارجی نباید مستقیم به AI یا main database وارد شود. | فعال |
| ADR-034 | هر داده خارجی باید قبل از ورود به سیستم اصلی از staging، validation، duplicate/conflict check، confidence score، review در صورت نیاز و audit trail عبور کند. | فعال |
| ADR-035 | main فقط داده دارای وضعیت `approved_for_import` را می‌پذیرد؛ importهای حساس باید Import Gate، dry-run report، audit reference و rollback plan داشته باشند. | فعال |
| ADR-036 | rollback اقدام حساس است و برای financial event، inventory stock، production formula، product merge، workforce critical data و approved payment/installment بدون approval ممنوع است. | فعال |
| ADR-037 | هیچ import واقعی نباید بدون dry-run report و بررسی rollback readiness اجرا شود؛ داده دارای conflict، low confidence یا manual only باید قبل از import واقعی متوقف یا review شود. | فعال |
| ADR-038 | داده quarantined نباید بدون review decision، correction log یا manager/admin approval از quarantine خارج و وارد main شود. | فعال |
| ADR-039 | Design Lab باید از main جدا بماند؛ خروجی آن مستقیم merge نمی‌شود و فقط pattern/spec تصویب‌شده با فاز implementation مستقل وارد main می‌شود. | فعال |
| ADR-040 | Central Cockpit UI باید تصمیم‌محور، قابل scan در ۱۰ ثانیه، دارای drill-down، confidence context و review boundary برای موارد حساس باشد. | فعال |
| ADR-041 | Mahak بخشی از معماری مستر جم نیست؛ فقط historical data source و architecture reference برای استخراج تجربه طراحی است. | فعال |
| ADR-042 | وابستگی مستقیم به SQL schema، tableها، columnها، queryها و viewهای محک ممنوع است؛ فقط الگوهای معماری و ایده‌های دامنه‌ای قابل استفاده هستند. | فعال |
| ADR-043 | Cockpit cardها باید برای هر هشدار source، risk، confidence، drill-down و review boundary داشته باشند؛ هیچ crisis یا AI suggestion نباید بدون evidence نمایش قطعی شود. | فعال |
| ADR-044 | Manager Review UI تنها مرجع تصمیم حساس در سطح UI است و هر تصمیم approve، reject، correction، attach، create، confirm، duplicate، ignore یا escalate باید audit trail داشته باشد. | فعال |
| ADR-045 | Core Document Architecture باید مستقل از محک و بر اساس BaseDocument/BaseDocumentItem مفهومی طراحی شود؛ هیچ schema، جدول، ستون، query یا view محک وارد قرارداد سندهای مستر جم نمی‌شود. | فعال |
| ADR-046 | Master Data Registry و Central Business Event Bus فعلاً مفهومی هستند و قبل از هر database، migration، route یا implementation باید در فاز مستقل تایید شوند. | فعال |
| ADR-047 | سند حساس بدون approval و audit trail نهایی نمی‌شود؛ conflict و low confidence نباید auto approve شوند و AI فقط پیشنهاد می‌دهد. | فعال |
| ADR-048 | Reporting View Layer و Read Model فقط خواندنی هستند و نباید داده اصلی را mutate کنند یا query/view/schema محک را کپی کنند. | فعال |
| ADR-049 | Product Feature Engine و Core Product Attribute Model مستقل از محک هستند؛ فقط الگوی feature-based استفاده می‌شود و هیچ schema، table، column، query یا view محک وارد قرارداد کالا نمی‌شود. | فعال |
| ADR-050 | Product Variant، pricing feature و production feature فعلاً فقط boundary مفهومی هستند؛ pricing engine، production formula، variant merge/update یا UI کالا بدون فاز مستقل و تایید مرکز کنترل ممنوع است. | فعال |
| ADR-051 | featureهای کالا قبل از ورود به main، AI snapshot، pricing، production یا reporting باید validation، confidence، duplicate/conflict check و audit مناسب داشته باشند. | فعال |
| ADR-052 | Product Feature AI Snapshot فقط از داده normalize و validate شده ساخته می‌شود و هیچ پیشنهاد AI نباید بدون review یا approval لازم تغییر حساس ایجاد کند. | فعال |
| ADR-053 | feature حساس، conflict یا low confidence بدون Product Feature Review Decision و audit معتبر وارد main نمی‌شود؛ review queue فقط تصمیم تولید می‌کند و داده اصلی را مستقیم mutate نمی‌کند. | فعال |
| ADR-054 | Product Feature Auto-fix فقط برای اصلاح کم‌ریسک، high confidence و rule مصوب مجاز است؛ تغییر قیمت، وزن حساس، سنگ/گروه متعارض، merge کالا، فرمول تولید، حذف feature و بارکد تکراری نیازمند review یا block هستند. | فعال |
| ADR-055 | Product Feature Review UI آینده فقط decision command تولید می‌کند و حق mutate مستقیم main data ندارد؛ raw value، normalized value، validation، confidence، risk، source و audit context باید قابل مشاهده باشند. | فعال |
| ADR-056 | ورود کالا فقط پس از Product Import Quality Gate و وجود validation، duplicate/conflict resolution، review لازم، confidence قابل قبول، dry-run و audit reference مجاز است. | فعال |
| ADR-057 | تصمیم reviewer/manager درباره feature حساس باید append-only audit، reason، role، before/after، ruleVersion و approval level داشته باشد؛ AI فقط suggestionReference است. | فعال |
| ADR-058 | تصمیم import کالا باید در سطح batch و item تفکیک شود؛ import_valid_only یا split_batch فقط با ثبت itemهای excluded، parent/child references، Quality Gate و audit معتبر مجاز است. | فعال |
| ADR-059 | Product Review Metrics یک Read Model صرفاً خواندنی است؛ تعریف metric، denominator، scope و version باید شفاف باشد و هیچ metric حق mutate یا جایگزینی Decision Audit را ندارد. | فعال |
| ADR-060 | گزارش تصمیم مدیر فقط شواهد و پیشنهاد ارائه می‌کند؛ override باید دامنه، دلیل، actor، risk acceptance و audit مستقل داشته باشد و AI تصمیم‌گیر نهایی نیست. | فعال |
| ADR-061 | Product Import Batch Split باید parent-child continuity، item membership consistency و audit کامل را حفظ کند؛ conflict، duplicate حساس و manual-only حل‌نشده وارد approved_sub_batch نمی‌شوند. | فعال |
| ADR-062 | Product Data Quality Thresholdها باید config و version مصوب داشته باشند؛ blocker قطعی با میانگین کیفیت جبران نمی‌شود و هیچ عدد اجرایی در اسناد معماری hardcode نمی‌شود. | فعال |
| ADR-063 | Product Import architecture پس از CONTROL-P26 برای Design Lab/prototype ایزوله آینده آماده است، اما هر prototype یا implementation واقعی به approval و فاز مستقل نیاز دارد. | فعال |
| ADR-064 | محک فقط reference-only و historical-data-only باقی می‌ماند؛ داده تاریخی کالا فقط از staging، validation، review، Quality Gate و audit عبور می‌کند. | فعال |
| ADR-065 | Product Import فقط می‌تواند وارد مرحله طراحی prototype ایزوله شود؛ ساخت prototype واقعی یا implementation همچنان بدون approval مستقل ممنوع است. | فعال |
| ADR-066 | نخستین prototype آینده باید فقط با synthetic/mock data نسخه‌دار، تکرارپذیر و دارای expected result ارزیابی شود؛ داده واقعی مجاز نیست. | فعال |
| ADR-067 | prototype Product Import حق write به main، استفاده از production storage، shared key، migration، auth، route اصلی یا action برگشت‌ناپذیر ندارد. | فعال |
| ADR-068 | محک همچنان reference-only و historical-data-only است؛ prototype نباید به فایل، schema، query، table یا داده واقعی محک وابسته شود. | فعال |
| ADR-069 | Product Import فقط برای Design Lab planning تایید شده است؛ Design Review approved است اما Prototype Build و Implementation وضعیت NOT_APPROVED دارند. | فعال |
| ADR-070 | Design Lab فقط flow، wireframe، mock screen، card و concept با synthetic data تولید می‌کند؛ هیچ خروجی آن بدون approval جداگانه وارد main نمی‌شود. | فعال |
| ADR-071 | داده واقعی، production storage، route، UI، database، migration، auth و direct Mahak connection در Product Import همچنان ممنوع‌اند. | فعال |
| ADR-072 | هر prototype آینده به approval صریح و مستقل مرکز کنترل نیاز دارد؛ readiness، backlog یا design approval مجوز ساخت محسوب نمی‌شوند. | فعال |
| ADR-073 | Product Import Design Lab concept package تایید مستنداتی دارد و فقط Flow Map، Screen Concept، Mock Scenario و Design Spec تولید می‌کند. | فعال |
| ADR-074 | Product Import implementation همچنان NOT_APPROVED است؛ package مفهومی، screen concept یا storyboard مجوز ساخت UI اجرایی، component، route یا prototype واقعی نیست. | فعال |
| ADR-075 | خروجی‌های Design Lab مفهومی هستند و بدون approval مستقل، merge checklist، implementation plan و rollback boundary وارد main نمی‌شوند. | فعال |
| ADR-076 | همه سناریوهای Product Import در Design Lab باید synthetic/mock و بدون داده واقعی مشتری، کالا، barcode، قیمت یا محک باشند. | فعال |
| ADR-077 | Product Import workstream برای implementation در وضعیت `FROZEN_FOR_IMPLEMENTATION` است و فقط handoff به Design Lab مجاز است. | فعال |
| ADR-078 | Prototype و implementation ورود کالا همچنان NOT_APPROVED هستند و freeze فقط با دستور مستقل مرکز کنترل برداشته می‌شود. | فعال |
| ADR-079 | workstream پیشنهادی بعدی Design Lab Foundation Package است تا rulebook و handoff قبل از هر UI/prototype واقعی کامل شود. | فعال |

## چیزهایی که بدون تأیید مرکز کنترل نباید عوض شوند

- مسیرهای موجود در route manifest
- localStorage keyهای موجود
- schema مدل‌های اصلی WF
- سیاست backup/import/restore
- baseline checksum و رفتار legacy baseline
- قرارداد analyzerها و serviceها
- ساختار RTL/dark mode اصلی
- حذف یا reset داده کاربر
- اضافه کردن backend، Supabase، login یا sync واقعی
- تغییر auth اصلی
- تغییر database اصلی
- merge مستقیم `audit-app`
- merge مستقیم `mahak-web-version`
- ساخت UI مالی قبل از تأیید Core Financial Event Model و schema
- ساخت migration مالی قبل از اجازه مرکز فرمان
- تغییر auth یا RLS به بهانه اتصال مالی
- import بانکی واقعی بدون Financial Adapter Boundary و approval
- import اکسل بانک بدون staging، normalizer، validation، duplicate check و format change handling
- auto confirm قسط بدون match خیلی قوی، قانون مصوب مدیر و نبود conflict/duplicate
- auto confirm قسط بدون audit trail، rule version و دلیل match
- تغییر rule بانکی بدون Bank Rule Change Log
- عبور دادن weak match، mismatch رسید/بانک، duplicate candidate یا پرداخت حساس از صف review
- import فایل Excel بانک بدون تست قالب و parse report
- ساخت AI automation اجرایی بدون normalize، validate، confidence score، rule check و audit trail
- اقدام خودکار برای سطح medium، low، conflict یا manual only
- نمایش AI suggestion به عنوان حقیقت قطعی بدون source، confidence و rule context
- تصمیم حساس بدون human-in-the-loop یا manager approval
- mutate مستقیم داده یک ماژول توسط ماژول دیگر به بهانه اتوماسیون
- cross-module automation بدون snapshot/signal نسخه‌دار و قابل audit
- auto action بدون عبور از Auto Action Safety Matrix
- تحلیل نهایی AI روی داده خام، staging نشده یا validate نشده
- import مستقیم Bank Excel، Mobile receipt، Product Excel/Mahak export، Stone bank، Group codes، Production formula input یا Inventory import به main
- approved import بدون auditReference، confidenceLevel و validationStatus
- import به main بدون وضعیت `approved_for_import`
- import حساس بدون Import Gate، dry-run report یا rollback plan
- rollback داده حساس بدون manager approval و before/after snapshot
- نادیده گرفتن unauthorized import attempt، partial import failure یا format changed
- import واقعی بدون Import Dry-run Report
- خروج داده از quarantine بدون QuarantineReviewDecision یا audit trail
- اجرای import برای dry-run دارای rollback not ready
- عبور دادن unknown format، unsafe auto action یا suspicious duplicate بدون quarantine/review
- اتصال خودکار رسید به رویداد حساس بدون bank match یا review
- تصمیم مالی صرفاً بر اساس شباهت متن توضیحات بانکی
- تغییر auth، database، migration، route یا localStorage به بهانه bank Excel automation
- اتصال receipt یا mobile capture به main قبل از مدل مالی و receipt flow
- dashboard نقدینگی قبل از financial schema و liquidity model
- ساخت UI کالا قبل از تأیید Core Product Model و schema
- ساخت migration کالا قبل از اجازه مرکز فرمان
- import مستقیم داده کالا بدون normalize، validation و duplicate report
- merge یا update خودکار کالا بدون review و تصمیم مرکز فرمان
- پیاده‌سازی Product Feature Engine، pricing engine یا production formula بدون فاز مستقل
- ورود attribute مشکوک، conflict یا low confidence به main بدون review
- تغییر feature قیمت‌گذار یا تولیدی بدون auditReference، validationStatus و confidenceLevel
- تبدیل Product Variant Boundary به merge/update خودکار کالا
- ساخت AI snapshot از feature خام، validate نشده یا بدون sourceReferences
- import مستقیم unknown feature، wrong unit، suspicious weight، duplicate barcode یا mismatched stone بدون review
- اعمال Product Feature Auto-fix بدون audit، validation و approval لازم
- ورود feature حساس، conflict یا low confidence بدون Product Feature Review Decision
- mutate داده اصلی توسط Product Feature Review Queue یا Product Attribute Validation Report
- auto-fix قیمت، وزن حساس، سنگ/گروه متعارض، merge کالا، فرمول تولید، حذف feature یا بارکد تکراری
- correction بدون مقدار قبل/بعد، دلیل، rule version و auditReference
- ساخت یا اجرای Product Feature Review UI واقعی بدون فاز مستقل
- mutate مستقیم main data توسط Review UI یا Quality Gate
- عبور کالا از Quality Gate بدون dry-run، audit reference یا رفع blockerها
- `pass` دادن به duplicate، conflict یا manual-only حل‌نشده
- manager override بدون دلیل، approval level و audit append-only
- ثبت AI به عنوان actor یا تصمیم‌گیر feature کالا
- import batch دارای conflict حل‌نشده، duplicate حساس یا confidence کلی پایین بدون review/approval
- `import_valid_only` یا `split_batch` بدون ثبت itemهای مستثنا و parent/child audit references
- استفاده از Product Review Metrics برای mutate داده یا جایگزینی Quality Gate/Decision Audit
- manager override مبهم روی کل batch بدون دامنه item، دلیل و risk acceptance
- اجرای تصمیم پیشنهادی AI به عنوان تصمیم نهایی import کالا
- split کردن batch بدون parent-child references، membership audit یا تطبیق شمارش‌ها
- ورود conflict، duplicate حساس یا manual-only حل‌نشده به `approved_sub_batch`
- تغییر threshold کیفیت بدون version، owner، approval و audit
- جبران blocker قطعی با میانگین یا سطح کیفیت کلی batch
- برداشت readiness معماری CONTROL-P26 به عنوان مجوز prototype یا implementation واقعی
- اتصال مستقیم داده تاریخی یا ساختار فنی محک به Product Import
- ساخت Product Import prototype واقعی بدون approval مستقل مرکز کنترل
- استفاده از داده واقعی مشتری، مالی، کالا، barcode یا محک در نخستین prototype
- write prototype به main data یا production storage
- استفاده prototype از localStorage key، auth، route یا service مشترک با main
- ساخت migration، schema dependency یا direct Mahak dependency برای prototype
- action برگشت‌ناپذیر یا تغییر manager approval واقعی در جریان demo
- برداشت `DESIGN_REVIEW_APPROVED` به عنوان مجوز Prototype Build یا Implementation
- برداشت Product Import Design Lab Concept Package به عنوان مجوز UI اجرایی، component، route، prototype واقعی یا implementation
- استفاده از داده واقعی در mock scenarioها، screen conceptها یا Design Lab package
- merge مستقیم screen concept یا Design Lab output به main بدون approval مستقل
- ساخت Product Import Flow Map به شکل route یا component واقعی در main
- برداشتن Product Import implementation freeze بدون دستور مستقل مرکز کنترل
- شروع prototype یا build ورود کالا به بهانه handoff به Design Lab
- شروع workstream بعدی بدون تصمیم مستقل مرکز کنترل
- ورود مستقیم خروجی Design Lab به main بدون review و approval مستقل
- ساخت UI/component واقعی به بهانه wireframe یا mock screen
- آزادکردن Implementation Hold بدون Design Lab approval، synthetic/test/rollback/storage/integration plan و دستور مستقل
- استفاده از readiness report یا backlog entry به عنوان مجوز اجرا
- ساخت Mahak Export Adapter قبل از validator و duplicate detector
- اعمال auto-fix بدون ProductCorrectionLog و تأیید لازم
- خروجی محک یا AI snapshot از رکورد دارای duplicate/error حل‌نشده
- dependency مستقیم برنامه اصلی به فایل‌های قدیمی `mahak-web-version`
- وابستگی مستقیم به SQL schema، table، column، query یا view محک
- طراحی هسته مستر جم بر اساس محدودیت‌های فنی محک
- انتقال naming convention یا relationهای فنی محک به عنوان قرارداد اصلی
- تبدیل BaseDocument یا Master Data Registry به schema اجرایی بدون فاز مستقل
- ساخت event bus، queue، database table یا migration برای business events بدون تایید مرکز کنترل
- کپی هر نام جدول/ستون/query/view محک در قرارداد سند یا master data
- final کردن سند حساس بدون approvalStatus معتبر و audit trail
- تغییر سند، item، receipt attachment، import یا rollback بدون DocumentAuditTrail
- mutate کردن داده اصلی از reporting layer یا read model
- ساخت گزارش بر پایه query/view/schema محک
- merge مستقیم خروجی labها به main بدون approval و checklist
- کار همزمان دو Codex روی یک فایل مشترک
- ساخت repo جدید بدون تصمیم صریح مرکز فرمان
- merge مستقیم prototype یا component از Design Lab به main
- تغییر UI اصلی، route، auth، database یا migration به بهانه Design Lab
- وابسته کردن main به assetها، dependencyها یا prototypeهای Design Lab
- نمایش AI suggestion یا crisis signal در cockpit بدون confidence، source و drill-down
- طراحی کارت cockpit بدون risk/confidence/review boundary
- نمایش پیشنهاد AI بدون reason، related data، required approval و audit reference
- اجرای تصمیم حساس از UI بدون Manager Review و audit trail
- تغییر نام شاخه‌های مادر یا کدهای branch registry

## قانون ثبت تصمیم جدید

هر تصمیم معماری جدید باید این موارد را داشته باشد:

1. شناسه ADR
2. تاریخ
3. مسئله
4. تصمیم
5. اثر روی route/storage/model/service/analyzer/UI
6. ریسک
7. تست یا build مرتبط
