# Backlog

آخرین به‌روزرسانی: 2026-06-30

## الان

| اولویت | شاخه | کار | توضیح |
|---|---|---|---|
| بالا | WF | extraction کنترل‌شده adapterهای کم‌ریسک باقی‌مانده | فقط فازهای کوچک، بدون تغییر route/storage/model/behavior |
| بالا | CONTROL | نگه‌داری sync اسناد کنترل پروژه | بعد از هر P، current state و phase log اصلاح شود |

## بعداً

| شاخه | کار | توضیح |
|---|---|---|
| WF | ادامه کوچک‌سازی adapterهای باقی‌مانده | پس از WF-P31، DataCenterPage هم جدا شده است |
| FIN-AUDIT | بررسی استخراج مدل نقدینگی از پروژه پول | فقط schema/model/idea؛ merge مستقیم ممنوع |
| DATA-MAHAK | بررسی استخراج مدل کالا و بارکد از پروژه کالا | فقط schema/model/idea؛ merge مستقیم ممنوع |
| CORE/DATA/INV | طراحی Core Product Model | مدل مشترک آینده برای کالا، انبار و تولید |
| CORE/DATA/INV | طراحی Product Schema Draft | تبدیل مدل مفهومی کالا به schema پیشنهادی، بدون migration |
| DATA-MAHAK | طراحی Product Adapter Boundary | مرز استخراج/تبدیل داده کالا از پروژه کالا یا محک، بدون merge |
| DATA-MAHAK | بررسی خروجی محک | تحلیل ستون‌ها، mapping و محدودیت‌های Excel/محک |
| DATA-MAHAK | بررسی بانک سنگ | استخراج مفهومی نوع سنگ و ویژگی‌های لازم |
| DATA-MAHAK | بررسی barcode strategy | بررسی تولید، یکتایی، alias و کنترل تکراری بارکد |
| DATA-MAHAK | بررسی AI-ready product export | طراحی خروجی تمیز و قابل تحلیل برای AI |
| DATA-MAHAK | طراحی Product Import Validator | اعتبارسنجی داده کالا قبل از هر import یا UI |
| DATA-MAHAK | طراحی Product Duplicate Detector | تشخیص تکراری بر اساس کد داخلی، کد محک، بارکد، نام، وزن و سنگ |
| DATA-MAHAK | طراحی Mahak Export Adapter | تولید preview و mapping خروجی محک بدون نوشتن در سیستم اصلی |
| DATA-MAHAK | طراحی AI Product Snapshot | snapshot نسخه‌دار و تمیز برای تحلیل هوشمند |
| DATA-MAHAK | طراحی Product Auto-fix Rules | قواعد پیشنهادی برای اصلاح امن نام سنگ، گروه، barcode format و statusها |
| DATA-MAHAK | طراحی Product Review Queue | صف بررسی کالاهای دارای warning، duplicate یا merge/update candidate |
| DATA-MAHAK | طراحی Product Import Decision Flow | جریان تصمیم برای allowed، blocked، review، merge، update و create |
| DATA-MAHAK | طراحی Product Duplicate Resolution Flow | روش حل duplicate بدون merge خودکار و با تأیید مرکز فرمان |
| DATA-MAHAK | بررسی Mahak Export Adapter بعد از validator | خروجی محک فقط پس از validator و duplicate detector بررسی شود |
| DATA-MAHAK | طراحی Product Correction Log | ثبت اصلاح‌ها، تصمیم‌ها، مقدار قبلی/پیشنهادی و تأییدکننده |
| CORE/DATA-MAHAK | طراحی Product Feature Review Queue | صف featureهای ناشناخته، ناقص، متعارض، کم‌اطمینان یا حساس |
| CORE/DATA-MAHAK | طراحی Product Feature Auto-fix Decision Flow | مرز پیشنهاد و اعمال اصلاح کم‌ریسک با confidence، review و audit |
| CORE/DATA-MAHAK | طراحی Product Feature Correction Log | ثبت مقدار قبل/بعد، دلیل، rule version، actor و auditReference |
| CORE/DATA-MAHAK | طراحی Product Feature Review Decision | قرارداد تصمیم approve/reject/correction/manual mapping/block/escalate |
| CORE/DATA-MAHAK | طراحی Product Feature Review Audit Trail | رد کامل ورود صف، شواهد، reviewer، تصمیم و نتیجه |
| CORE/DATA-MAHAK | طراحی Product Import Quality Report | خلاصه کیفیت batch کالا برای import gate و cockpit |
| CORE/DATA-MAHAK | طراحی Product Feature Risk Summary | جمع‌بندی duplicate، pricing، production، inventory و AI risk |
| UI/PRODUCT | طراحی Product Feature Review UI Contract | قرارداد نمایش شواهد، actionها و stateهای review بدون ساخت UI واقعی |
| CORE/DATA-MAHAK | طراحی Product Import Quality Gate | دروازه validation، duplicate/conflict، confidence، review، dry-run و audit پیش از import |
| CORE/CONTROL | طراحی Product Feature Decision Audit Model | audit تصمیم reviewer/manager با actor، role، before/after، reason و ruleVersion |
| CORE/DATA-MAHAK | طراحی Product Import Gate Decision | قرارداد pass، pass_with_warnings، needs_review، blocked، quarantine و reject_batch |
| CORE/DATA-MAHAK | طراحی Product Import Risk Summary | خلاصه blockerها و ریسک‌های batch/item برای quality gate |
| CORE/CONTROL | طراحی Product Import Approval Requirement | تعیین approval لازم برای featureهای حساس و warningهای قابل عبور |
| CORE/CONTROL | طراحی Product Feature Manager Override | override فقط با reason، approval level و audit append-only |
| UI/PRODUCT | طراحی Product Feature Review UI State Model | stateهای pending تا resolved و transitionهای مجاز review |
| CORE/DATA-MAHAK | طراحی Product Import Batch Decision Contract | قرارداد تصمیم batch با source، counts، gate، confidence، risk، approval و audit |
| CORE/DATA | طراحی Product Review Metrics Read Model | projection خواندنی شاخص‌های review، blocker، duplicate، auto-fix و confidence |
| CORE/CONTROL | طراحی Product Import Manager Decision Report | گزارش مدیریتی quality gate، review، risk، AI suggestion و اقدام لازم |
| CORE/DATA-MAHAK | طراحی Product Import Batch Split Flow | تقسیم امن valid/review/quarantine/rejected/correction با parent-child reference و membership audit |
| CORE/CONTROL | طراحی Product Import Override Audit | ثبت دامنه، دلیل، actor، risk acceptance و نتیجه override مدیر |
| CORE/DATA | طراحی Product Data Quality Monitoring | پایش روند issueها، source quality، confidence و impactها بدون mutation |
| UI/CONTROL | طراحی Product Import Cockpit Metrics | شاخص‌های read-only کیفیت import برای کابین خلبانی و drill-down |
| CORE/DATA | طراحی Product Data Quality Threshold Policy | thresholdهای نسخه‌دار کیفیت، blockerها و سطح‌های excellent تا blocked |
| CONTROL/DATA-MAHAK | طراحی Product Import Architecture Readiness Report | جمع‌بندی آمادگی مدل، validation، review، gate، audit، batch و metrics |
| DATA-MAHAK | بررسی Product Import Prototype Candidate | فقط پس از approval مستقل، با داده مصنوعی و محیط ایزوله |
| UI/PRODUCT | بررسی Product Import Design Lab Candidate | prototype تصویری بدون اتصال main و بدون import واقعی |
| UI/CONTROL | طراحی Product Data Quality Cockpit Metrics | نمایش read-only threshold breach، source quality و روند review |
| CONTROL/DATA-MAHAK | ثبت Product Import Implementation Blockers | approval، schema/type، config، test data، security، audit و rollback |
| CONTROL/DATA-MAHAK | طراحی Product Import Prototype Charter | منشور هدف، scope، خروجی، معیار موفقیت/توقف و ممنوعیت‌های prototype |
| CONTROL/DATA-MAHAK | طراحی Product Import Synthetic Data Protocol | fixtureهای مصنوعی، deterministic و دارای expected result بدون داده واقعی |
| CONTROL/DATA-MAHAK | طراحی Product Import Prototype Isolation Boundary | جدایی کامل از main، production storage، Mahak، auth، route و approval واقعی |
| DATA-MAHAK | طراحی Product Import Demo Flow | فقط پس از approval ساخت prototype و با mock service/data |
| DATA-MAHAK | طراحی Product Import Mock Dataset | sampleهای synthetic برای valid، duplicate، mismatch، conflict و low confidence |
| CONTROL/DATA-MAHAK | طراحی Product Import Prototype Exit Criteria | معیار docs، synthetic test، dry-run، gate، review، rollback و security |
| CONTROL/DATA-MAHAK | طراحی Product Import Implementation Approval Gate | approval نهایی مستقل پیش از هر implementation یا اتصال واقعی |
| CONTROL/DATA-MAHAK | ثبت Product Import Prototype Approval Review | وضعیت رسمی Design Review، Design Lab، Prototype Build و Implementation |
| UI/PRODUCT | طراحی Product Import Design Lab Transition Plan | ورودی‌ها، خروجی‌ها و handoff مفهومی Design Lab بدون کدنویسی |
| CONTROL/DATA-MAHAK | ثبت Product Import Implementation Hold Policy | شرایط hold، blockerها و الزامات approval مستقل |
| UI/PRODUCT | طراحی Product Import Flow Map | مسیر synthetic input تا review، gate، batch و manager decision |
| UI/PRODUCT | طراحی Product Import Design Lab Concept Package | بسته مفهومی Design Lab برای flow، screen spec، کارت‌ها، report و AI suggestion |
| UI/PRODUCT | طراحی Product Import Screen Concepts | screen conceptهای dry-run، staging، mapping، validation، review، gate، decision و audit |
| UI/PRODUCT | طراحی Product Import Mock Scenario Storyboard | سناریوهای synthetic برای valid، missing، duplicate، mismatch، conflict، low confidence و override |
| UI/PRODUCT | طراحی Product Import Design Lab Screen Spec | مشخصات صفحه‌های مفهومی بدون ساخت component یا route |
| UI/PRODUCT | طراحی Product Import AI Suggestion Panel Concept | نمایش suggestion، reason، confidence، risk، related data و approval requirement |
| UI/PRODUCT | طراحی Product Import Audit Summary Screen | نمایش مفهومی رد تصمیم‌ها، issueها و audit reference بدون audit اجرایی |
| UI/PRODUCT | طراحی Product Import Manager Decision UX | تجربه مفهومی تصمیم مدیر برای approve، reject، correction، split، hold و override |
| CONTROL/DATA-MAHAK | ثبت Product Import Design Lab Review Summary | جمع‌بندی READY/NOT_APPROVED و آماده‌سازی handoff بدون اجرای واقعی |
| CONTROL/DATA-MAHAK | ثبت Product Import Workstream Freeze | freeze برای implementation و مجاز بودن فقط Design Lab handoff |
| UI/PRODUCT | آماده‌سازی Product Import Design Lab Handoff | بسته تحویل شامل اسناد concept، flow، storyboard، synthetic data و isolation |
| CONTROL | طراحی Next Control Workstream Decision | انتخاب مسیر بعدی پس از freeze Product Import |
| UI/CONTROL | طراحی Design Lab Foundation Package | rulebook و مرزهای Design Lab پیش از UI یا prototype واقعی |
| UI/CONTROL | طراحی Design Lab Foundation Rulebook | قانون‌نامه نقش Design Lab، خروجی‌های مجاز، ممنوعیت‌ها و اصول cockpit |
| UI/CONTROL | طراحی Design Lab Output Contract | قرارداد خروجی شامل هدف، داده، action، risk/confidence، AI، manager decision و audit |
| UI/CONTROL | طراحی Design Lab Handoff Status Model | وضعیت‌های draft، ready_for_review، approved_for_prototype، rejected، needs_revision و frozen |
| UI/CONTROL | طراحی Design Lab Screen Spec Template | قالب screen title، goal، role، data source، cards، actions، states و restrictions |
| UI/CONTROL | طراحی Design Lab Review Checklist | کنترل هدف، وضعیت ۱۰ ثانیه‌ای، risk/confidence، AI boundary، audit و concept-only بودن |
| UI/CONTROL | طراحی Design Lab to Main Approval Gate | gate خروج از Design Lab به prototype/main با approval، test و rollback |
| UI/CONTROL | طراحی Cockpit UX Rulebook | اصول ۱۰ ثانیه‌ای، drill-down، هشدار دلیل‌دار و تصمیم مدیریتی |
| UI/CONTROL | طراحی Risk and Confidence Visual Rulebook | زبان دیداری risk/confidence برای cockpit و review screens |
| UI/CONTROL | طراحی Manager Decision UX Standard | استاندارد نمایش تصمیم انسانی، approval، reason و audit |
| UI/CONTROL | طراحی Central Cockpit Drill-down Strategy | مسیر drill-down از کارت‌ها به evidence، review و audit |
| UI/CONTROL | طراحی Central Cockpit Screen Spec Package | screen specهای Overview، Financial، Product Import، Manager Review، Crisis و AI Suggestion |
| UI/CONTROL | طراحی Cockpit Manager Decision Flow | قرارداد approve/reject/hold/correction/escalate/override و actionهای مدیریتی |
| UI/CONTROL | طراحی Cockpit Risk Confidence Audit Visual Rules | قواعد دیداری risk، confidence و audit برای کارت‌ها و decision pointها |
| UI/CONTROL | طراحی Cockpit Card to Drill-down Map | اتصال هر کارت cockpit به screen concept، report، action و audit |
| UI/CONTROL | طراحی Cockpit AI Suggestion Review Screen | بررسی پیشنهادهای AI با evidence، confidence، risk و approval |
| UI/CONTROL | طراحی Cockpit Crisis Signal Drill-down | صفحه مفهومی بررسی crisis signal چندماژولی |
| UI/CONTROL | طراحی Cockpit Implementation Approval Gate | gate مستقل قبل از هر UI، route، component یا prototype واقعی cockpit |
| UI/CONTROL | طراحی Cockpit First Screen Candidate | انتخاب Central Cockpit Overview Screen به عنوان first candidate آینده |
| UI/CONTROL | طراحی Cockpit Prototype Hold Policy | ثبت ON_HOLD بودن prototype و NOT_APPROVED بودن implementation |
| UI/CONTROL | طراحی Cockpit Mock Data Protocol | تعریف signalهای mock برای prototype ایزوله آینده بدون داده واقعی |
| UI/CONTROL | طراحی Cockpit Overview Mock Screen | فقط پس از approval مستقل و با mock/synthetic data |
| UI/CONTROL | طراحی Cockpit Card Layout Study | بررسی تراکم کارت و scan ده‌ثانیه‌ای در Design Lab |
| UI/CONTROL | طراحی Cockpit Risk Confidence Visual Test | تست مفهومی نمایش risk/confidence/audit بدون UI واقعی |
| UI/CONTROL | طراحی Cockpit Prototype Isolation Boundary | مرز جدایی prototype از main، route، storage، auth و data واقعی |
| UI/CONTROL | طراحی Cockpit Prototype Test Plan | سناریوهای synthetic برای فهم ۱۰ ثانیه‌ای، risk/confidence، audit و جلوگیری از mutation |
| UI/CONTROL | طراحی Cockpit Prototype Rollback and Exit Plan | محرک‌های توقف، پاک‌سازی demo state، verification و exit outcomeهای کنترل‌شده |
| UI/CONTROL | طراحی Cockpit Prototype Demo State Reset | reset کامل fixture، mock service state و وضعیت نمایشی بدون اثر روی main |
| UI/CONTROL | طراحی Cockpit Prototype Risk Review | بررسی ریسک data leak، misleading confidence، missing audit و main dependency |
| UI/CONTROL | طراحی Cockpit Prototype Approval Review | review مستقل مرکز کنترل پیش از هر ساخت prototype |
| UI/CONTROL | تایید Cockpit Overview Screen Spec | بررسی screen candidate و scope پیش از برداشتن hold |
| UI/CONTROL | Cockpit Overview Screen Spec Approval Review | بازبینی رسمی screen spec بدون صدور مجوز ساخت |
| UI/CONTROL | Cockpit Overview Mock Signal Dataset Spec | قرارداد signalهای synthetic، deterministic و resetپذیر |
| UI/CONTROL | Cockpit Overview Layout and Card Behavior Spec | تعریف layout، card states، risk/confidence و audit behavior |
| UI/CONTROL | Cockpit Prototype Readiness Report | جمع‌بندی readiness و blockerهای باقیمانده پیش از approval |
| UI/CONTROL | Cockpit Future Isolated Prototype Approval | تصمیم مستقل مرکز کنترل برای ادامه hold یا prototype ایزوله |
| UI/CONTROL | Cockpit Test Execution Plan | تعیین owner، evidence، pass/fail و عدم استفاده از داده واقعی |
| UI/CONTROL | Cockpit Prototype Environment Decision | انتخاب محیط مستقل بدون route/storage/database/auth production |
| UI/CONTROL | Cockpit Isolated Prototype Work Order Draft | scope ساخت احتمالی آینده با mock-only و ممنوعیت production dependency |
| UI/CONTROL | Cockpit Prototype Build Approval Review | تصمیم مستقل مرکز کنترل پیش از هر build |
| UI/CONTROL | Cockpit Prototype Pre-build Checklist | کنترل checkpoint، data boundary، file scope، test و rollback |
| UI/CONTROL | Cockpit Future Build Approval | صدور یا رد تصمیم صریح `approved_for_build` در فاز مستقل |
| UI/CONTROL | Cockpit Prototype File Scope | فهرست محدود فایل‌های مجاز و مالک هر فایل پیش از build |
| UI/CONTROL | Cockpit Prototype Mock Fixture | fixture مصنوعی نسخه‌دار با expected result و reset کامل |
| UI/CONTROL | Cockpit Prototype Rollback Owner | تعیین مسئول توقف، پاک‌سازی و verification پس از rollback |
| UI/CONTROL | Cockpit Isolated Prototype Build Approval Decision | approval محدود build آینده بدون مجوز main integration |
| UI/CONTROL | Cockpit Prototype File Scope and Boundary | ناحیه‌های مجاز prototype و ممنوعیت فایل‌های production |
| UI/CONTROL | Cockpit Prototype Execution Guardrails | کنترل‌های قبل، هنگام و بعد از build ایزوله |
| UI/CONTROL | Cockpit Prototype Build Stop Rules | توقف فوری در صورت production dependency، real data یا main mutation |
| UI/CONTROL | Cockpit Overview Isolated Prototype Build | فقط با دستور اجرایی مستقل و scope مصوب P37 |
| UI/CONTROL | Cockpit Mock Fixture Implementation | fixture synthetic نسخه‌دار، resetپذیر و بدون production persistence |
| UI/CONTROL | Cockpit Prototype Test Execution | اجرای isolation، mock behavior، risk/confidence/audit و rollback tests |
| UI/CONTROL | Cockpit Prototype Review Report | ثبت نتیجه، محدودیت‌ها، evidence و exit outcome پس از build آینده |
| UI/CONTROL | Cockpit Prototype Minor Mobile Sizing Iteration | انجام شد در P41؛ Mobile re-review در P42 تایید شد |
| UI/CONTROL | Cockpit Prototype Iteration Review | Mobile iteration بسته شد؛ review بعدی فقط برای تغییر مستقل آینده لازم است |
| UI/CONTROL | Cockpit Main Merge Approval Review | تصمیم مستقل مرکز کنترل؛ `approved_for_iteration` مجوز merge نیست |
| UI/CONTROL | Cockpit Future Screen Design Planning | مسیر بعدی cockpit؛ طراحی صفحه‌های آینده بدون اصلاح بیشتر prototype فعلی |
| UI/CONTROL | Manager Review Queue Drill-down Screen Spec | طراحی summary، filters، lanes، item list، detail، AI و audit در سطح concept |
| UI/CONTROL | Manager Review Queue Mock Dataset | ده review item مصنوعی با risk، confidence، audit، evidence و decisionOptions مفهومی |
| UI/CONTROL | Manager Review Queue Interaction Rules | مرز interaction، visual language و block شدن actionهای حساس |
| UI/CONTROL | Manager Review Queue Prototype Candidate | فقط پس از approval مستقل؛ CONTROL-P43 مجوز build نیست |
| UI/CONTROL | Cockpit Overview Prototype Freeze | Overview پس از mobile approval بدون دستور مستقل تغییر نکند |
| UI/CONTROL | Cockpit Future Screen Design Package | ادامه Screen Specهای cockpit بدون ساخت UI، route یا component |
| UI/CONTROL | Manager Review Queue Design Review Result | concept iteration تایید شد؛ build همچنان NOT_APPROVED |
| UI/CONTROL | Manager Review Queue User Flow Storyboard | مسیر Overview تا evidence، AI، reason و audit timeline با هشت سناریوی mock |
| UI/CONTROL | Manager Review Queue Prototype Approval Gate | gate مستقل برای file scope، data، test، rollback و build approval |
| UI/CONTROL | Manager Review Queue Build Hold Policy | prototype تا تکمیل gate برابر ON_HOLD باقی بماند |
| UI/CONTROL | Manager Review Queue Test Plan | سناریوهای isolation، visual state، interaction و blocked action |
| UI/CONTROL | Manager Review Queue Rollback Plan | حذف کامل prototype آینده، reset mock state و verification |
| UI/CONTROL | Manager Review Queue Isolated Prototype Candidate | فقط پس از gate pass و approval مستقل مرکز کنترل |
| WF | ادامه Workforce Refactor Continuation | ادامه extraction کنترل‌شده در فاز اجرایی جدا |
| FIN-AUDIT | طراحی Finance Bank Excel Automation Architecture | معماری اتوماسیون اکسل بانک بدون import واقعی |
| PROD/DATA | طراحی Production Formula Architecture | مدل مفهومی فرمول تولید، مواد و هزینه بدون engine اجرایی |
| INV/DATA | طراحی Inventory Visual Registry Architecture | رجیستری دیداری وضعیت موجودی و مغایرت‌ها در سطح concept |
| UI/PRODUCT | طراحی Product Review Queue Screen Concept | mock مفهومی issue، raw/normalized، confidence، risk و actionها |
| UI/PRODUCT | طراحی Product Quality Gate Screen Concept | نمایش شرط‌ها، blockerها و gate decision بدون رفتار اجرایی |
| UI/PRODUCT | طراحی Product Import Manager Report Screen | گزارش مفهومی batch، risk، AI suggestion و required action |
| CONTROL/DATA-MAHAK | بررسی Product Import Isolated Prototype Approval | فقط پس از Design Lab review و تکمیل test/rollback/storage/security plan |
| UI | بررسی Product UI بعد از کاهش بدهی Workforce | UI کالا فقط بعد از مدل/schema/validator و کاهش بدهی WF |
| CORE/FIN | طراحی Core Financial Event Model | مدل مشترک آینده برای نقدینگی، رسید و رویداد مالی |
| CORE/FIN | طراحی Financial Schema Draft | تبدیل مدل مفهومی رویداد مالی به schema پیشنهادی، بدون migration |
| FIN-AUDIT | طراحی Financial Adapter Boundary | مرز استخراج/تبدیل داده مالی از پروژه پول، بدون merge |
| CORE/FIN | طراحی Financial Approval Flow | جریان ثبت، بررسی، تأیید مدیر، رد و درخواست اصلاح |
| CORE/FIN | طراحی Liquidity Warning Model | مدل هشدار فشار نقدینگی، سررسیدها و cash-in/cash-out |
| FIN/MOBILE | طراحی Receipt Attachment Flow | اتصال رسید عکس‌دار به رویداد مالی و queue بررسی |
| CORE/FIN | طراحی Bank Transaction Mapping | mapping شماره پیگیری، تاریخ، مبلغ، مبدا و مقصد به رویداد مالی |
| MOBILE | طراحی Mobile Receipt Capture Dependency | وابستگی اپ موبایل به مدل مالی و receipt flow |
| CORE/FIN | طراحی Audit Trail Model | رد تغییرات مالی، تأیید مدیر، اتصال رسید و mapping بانکی |
| CORE/FIN | طراحی Financial Validation Rules | کنترل مبلغ، تاریخ، طرف حساب، وضعیت پرداخت، سند، بانک و duplicate قبل از ورود داده مالی |
| CORE/FIN | طراحی Financial Import Decision Flow | تصمیم‌های import allowed، blocked، review، attach، create، confirm installment و correction |
| FIN/MOBILE | طراحی Receipt Review Flow | جریان بررسی رسید عکس‌دار و اتصال کنترل‌شده به رویداد مالی |
| CORE/FIN | طراحی Bank Match Confidence | سطح‌بندی exact، strong، weak، conflict و no match برای تطبیق بانک و رویداد |
| CORE/FIN | طراحی Liquidity Alert Rules | قواعد هشدار نقدینگی برای cash-in، cash-out، سررسید، mismatch و پرداخت بدون سند |
| CORE/FIN | طراحی Manager Approval Boundary | مرز تصمیم‌هایی که باید مدیر تایید کند، مخصوصاً پرداخت حساس، قسط و اصلاحیه |
| FIN-AUDIT | طراحی Daily Bank Excel Import | طراحی خواندن اکسل گردش حساب روزانه در staging بدون ورود مستقیم به database |
| FIN-AUDIT | طراحی Bank Transaction Normalizer | یکسان‌سازی تاریخ، مبلغ، برداشت/واریز، شماره پیگیری، مبدا، مقصد و توضیحات |
| FIN-AUDIT | طراحی Transaction Description Matcher | تشخیص rule-based قسط، دریافت، پرداخت، بدهی، خرید یا هزینه از متن شرح بانکی |
| CORE/FIN | طراحی Installment Auto Confirmation | تایید قسط فقط با اطمینان خیلی بالا، قانون مدیر و بدون conflict/duplicate |
| FIN/MOBILE | طراحی Receipt Attachment Link | اتصال قابل ردیابی receipt، bank transaction و financial event با دلیل match |
| FIN-AUDIT | طراحی Bank Excel Format Change Handling | توقف امن import هنگام تغییر قالب اکسل بانک و نیاز به approval قالب جدید |
| CORE/FIN | طراحی Financial Review Queue | صف کنترل انسانی برای mismatch، duplicate، weak match، پرداخت حساس و اصلاحیه مالی |
| CORE/FIN | طراحی Financial Review Decision Workflow | تصمیم‌های approve، reject، correction، attach، create، confirm installment و duplicate |
| CORE/FIN | طراحی Financial Correction Log | ثبت مقدار قبلی/جدید، دلیل اصلاح، شخص تصمیم‌گیر و زمان تصمیم |
| FIN-AUDIT | طراحی Bank Excel Format Test Plan | تست ستون‌ها، تغییر قالب، نبود ستون، مبلغ/تاریخ نامعتبر و فایل تکراری |
| FIN-AUDIT | طراحی Bank Excel Parse Report | گزارش warning/error/import decision برای فایل گردش حساب |
| FIN-AUDIT | طراحی Bank Rule Management | مدیریت قانون‌های متن، مبلغ، برداشت/واریز، حساب، طرف حساب، قرارداد و قسط |
| CORE/FIN | طراحی Installment Auto Confirmation Audit | ثبت دلیل، rule version، match evidence و نتیجه duplicate/conflict برای تایید قسط |
| CORE/FIN | طراحی Rule Versioning | نسخه‌بندی ruleها و اتصال هر تصمیم auto confirm به نسخه rule |
| CORE/FIN | طراحی Bank Rule Change Log | لاگ ایجاد، تغییر، غیرفعال‌سازی یا حذف rule با دلیل و تاییدکننده |
| CONTROL/CORE | طراحی Automation-First Architecture | اصل طراحی کل سیستم بر پایه normalize، validate، analyze، suggest، safe auto action و audit |
| CONTROL/CORE | طراحی AI-Assisted Decision Support | نقش AI به عنوان کمک‌تحلیل‌گر و کمک‌تصمیم‌گیر با مرز انسانی |
| CONTROL/CORE | طراحی Human-in-the-loop Rules | قوانین ورود انسان برای موارد حساس، مشکوک، conflict یا manual only |
| CONTROL/CORE | طراحی Confidence Scoring Model | مدل high، medium، low، conflict و manual only برای همه ماژول‌ها |
| CONTROL/DATA | طراحی AI Analysis Pipeline | مسیر raw data، normalize، validate، confidence، rule check، AI suggestion و approval |
| CONTROL/CORE | طراحی Cross-module Automation Map | نقشه اتوماسیون بین Finance، Product، Production، Inventory، Workforce، Mobile و Cockpit |
| CONTROL/DATA | طراحی AI Audit Trail | ثبت source، normalized input، validation، confidence، rule version، suggestion و decision |
| CONTROL/CORE | طراحی Auto Action Safety Rules | مرز اقدام خودکار امن و موارد نیازمند manager review |
| CONTROL/CORE | طراحی Manager Review Boundary | تعریف مواردی که باید همیشه به مدیر یا reviewer برسند |
| CONTROL/DATA | طراحی Cross-module AI Snapshot Strategy | تعریف snapshotهای مشترک برای Finance، Product، Production، Inventory، Workforce، Mobile و Cockpit |
| CONTROL/DATA | طراحی Module Data Producer/Consumer Map | مشخص کردن تولیدکننده و مصرف‌کننده داده در هر ماژول |
| CONTROL/CORE | طراحی Auto Action Safety Matrix | ماتریس auto action، review required و manual only برای کل سیستم |
| CONTROL/CORE | طراحی Automation Risk Boundary | مرز ریسک اتوماسیون بین هشدار، پیشنهاد، اقدام خودکار و تصمیم مدیر |
| CONTROL/CORE | طراحی Auto Action Audit Requirements | الزامات audit برای هر اقدام خودکار شامل source، confidence، rule version و reason |
| CONTROL/DATA | طراحی Module Data Producer/Consumer Contract | قرارداد versioned برای producer/consumer هر ماژول و مصرف snapshot/signal |
| CONTROL/DATA | طراحی Staging Review Boundary | مرز review برای داده خارجی، duplicate، conflict و low confidence |
| CONTROL/DATA | طراحی Safe Import Boundary | ورود کنترل‌شده فقط پس از validation، confidence، review و audit |
| CONTROL/DATA | طراحی Snapshot Versioning | نسخه‌بندی snapshotها و قرارداد تغییر schema مفهومی |
| CONTROL/DATA | طراحی AI Snapshot Audit Reference | اتصال هر snapshot به source، validation، rule و decision قابل ردیابی |
| CONTROL/DATA | طراحی Approved Import Flow | مسیر approved import از staging به سیستم اصلی بدون ورود مستقیم داده خام |
| CONTROL/DATA | طراحی External Data Staging Policy | policy داده‌های Bank Excel، Mobile receipt، Product Excel، Stone bank، Group codes و Inventory import |
| CONTROL/DATA | طراحی Import Gate | نقطه کنترل نهایی برای validation، conflict، duplicate، confidence، approval، audit و rollback |
| CONTROL/DATA | طراحی Import Dry-run Report | گزارش اثر import قبل از اجرای واقعی، شامل created/updated/skipped و rollback data |
| CONTROL/DATA | طراحی Import Error Handling | رفتار block، quarantine، review، correction، retry و rollback candidate برای خطاها |
| CONTROL/DATA | طراحی Rollback Policy | سیاست rollback امن با before/after snapshot، affected records، actor، reason و approval |
| CONTROL/DATA | طراحی Import Batch Audit | audit برای batch id، source، status، actor، approval، import result و rollback |
| CONTROL/DATA | طراحی Quarantine Flow | مسیر نگه‌داری و review داده پرریسک، قالب ناشناخته یا import غیرمجاز |
| CONTROL/DATA | طراحی Staging Status Lifecycle | چرخه وضعیت raw_received تا imported/rejected/quarantined |
| CONTROL/DATA | طراحی Import Dry-run Report Standard | استاندارد گزارش قبل از import واقعی و نمایش اثر، ریسک و rollback readiness |
| CONTROL/DATA | طراحی Import Dry-run Summary | خلاصه batch شامل parsed، valid، invalid، duplicate، conflict، review و blocked |
| CONTROL/DATA | طراحی Quarantine Review Flow | جریان بررسی، اصلاح، رد، archive یا approval داده quarantined |
| CONTROL/DATA | طراحی Quarantine Correction Log | ثبت اصلاح داده quarantined، مقدار قبلی/جدید، actor و دلیل |
| CONTROL/DATA | طراحی Import Simulation Test Cases | سناریوهای تست مفهومی برای Bank Excel، Mobile receipt، Product Excel، Inventory و conflictها |
| CONTROL/DATA | طراحی Import Risk Summary | خلاصه ریسک‌های duplicate، conflict، low confidence، unsafe action و manual only |
| CONTROL/DATA | طراحی Import Approval Requirement | تعیین نیاز به reviewer/manager/admin approval قبل از import |
| CONTROL/DATA | طراحی Rollback Readiness Check | بررسی اینکه batch قبل از import برنامه rollback/correction دارد یا نه |
| FIN-AUDIT | بررسی liquidity model از audit-app | تحلیل مدل فشار نقدینگی و cash-in/cash-out |
| FIN-AUDIT | بررسی approval workflow | طراحی جریان ثبت، بررسی، تایید و رد مدیر |
| FIN/MOBILE | بررسی receipt attachment flow | اتصال سند یا عکس رسید به رویداد مالی |
| CORE/FIN | بررسی bank transaction mapping | mapping تراکنش بانکی به رویداد مالی، بدون اتصال واقعی |
| MOBILE | بررسی mobile receipt capture flow | ثبت رسید از اپ موبایل پس از تثبیت مدل مالی و رسید |
| CORE/INV | طراحی Core Inventory Model | مدل مشترک ورود/خروج، موجودی، مکان و مغایرت |
| PROD | طراحی Production Flow Model | مدل جریان تولید پس از تثبیت کالا و انبار |
| FIN/MOBILE | طراحی Receipt Capture Flow | جریان ثبت رسید، عکس، بررسی و اتصال به رویداد مالی |
| MOBILE | طراحی Mobile Capture App | اپ ثبت سبک پس از مدل رسید و رویداد مالی |
| DATA-MAHAK | طراحی Mahak Integration Boundary | مرز اتصال محک، خروجی‌ها و کنترل تکراری |
| CORE/UI | طراحی Central Cockpit Dashboard Map | نقشه KPIها، alertها و decisionها برای کابین مرکزی |
| UI | طراحی Design Lab repo | repo جدا برای UI/UX، design tokens و component patterns |
| UI | طراحی UI/UX cockpit prototype | prototype مستقل از main برای cockpit مدیریتی |
| UI | طراحی component pattern extraction | روش ورود pattern/component تأییدشده از Design Lab به main |
| UI | طراحی Design Lab Launch | نقشه راه راه‌اندازی Design Lab بدون ساخت repo و بدون تغییر main |
| UI | طراحی Cockpit UI/UX Prototype | prototype کابین مرکزی برای وضعیت ۱۰ ثانیه‌ای مدیر |
| UI | طراحی Design Tokens Draft | colors، typography، spacing، radius، shadows، density، status و confidence |
| UI | طراحی Component Pattern Strategy | patternهای کارت، صف review، پیشنهاد AI، import status و decision panel |
| UI/CORE | طراحی Cockpit Dashboard Card Map | نقشه کارت‌های financial pressure، product warning، inventory، production، workforce و crisis |
| UI | طراحی Manager Review UI Concept | تجربه تصمیم approve/reject/correction/quarantine/rollback برای مدیر |
| UI | طراحی AI Suggestion UI Concept | نمایش پیشنهاد AI با source، confidence، evidence و review boundary |
| UI | طراحی Risk and Confidence Visual Language | زبان بصری ریسک، بحران، review و confidence برای کل cockpit |
| UI/CORE | طراحی Risk Visual Language | نمایش low، medium، high، conflict و manual only در کارت‌ها و review |
| UI/CORE | طراحی Confidence Visual Language | نمایش high، medium، low، conflict و manual only با evidence و source |
| UI/CORE | طراحی Cockpit Drill-down Strategy | مسیر summary به detail، source snapshot، audit reference و review queue |
| UI | طراحی Review Queue Card Pattern | الگوی کارت تصمیم مدیر برای approve، reject، correction، attach و escalate |
| UI | طراحی Crisis Signal UI Pattern | الگوی هشدار بحران چندماژولی با risk، affected modules و decision pack |
| UI/CONTROL | طراحی Design Lab to Main Handoff | روش تبدیل prototype به approved component spec و implementation امن در main |
| CONTROL | طراحی multi-Codex handoff protocol | پروتکل تحویل کار بین Codexها و مرکز فرمان |
| CONTROL | طراحی branch ownership rules | مالکیت branch/file/workstream برای جلوگیری از conflict |
| CONTROL | طراحی merge approval checklist | checklist قبل از هر merge به main |
| CONTROL | طراحی rollback checklist | تعریف مسیر برگشت برای mergeهای کدی و lab output |
| CONTROL | طراحی Source Integration Plan | تبدیل نقشه منابع به برنامه استخراج مرحله‌ای |
| FIN-AUDIT | بررسی استخراج schema نقدینگی، roles و RLS | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
| DATA-MAHAK | بررسی استخراج مدل کالا، بارکد، بانک سنگ و خروجی AI-ready | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
| CORE/DATA | طراحی Core Document Architecture | استفاده از ایده Header/Detail و BaseDocument بدون وابستگی به schema محک |
| CORE/DATA | طراحی BaseDocument Pattern | قرارداد مفهومی header سندهای مالی، خرید، فروش، تولید، انبار و اصلاحیه |
| CORE/DATA | طراحی BaseDocumentItem Pattern | قرارداد مفهومی itemهای سند شامل product، quantity، unit، amount، weight و cost |
| DATA/PRODUCT | طراحی Product Feature Engine | طراحی ویژگی‌محور کالا بر اساس الگوهای قابل استفاده، نه ساختار فنی محک |
| DATA/PRODUCT | طراحی Core Product Attribute Model | مدل attribute شامل type، value، validation، confidence، risk و audit |
| DATA/PRODUCT | طراحی Product Variant Boundary | مرز variant در برابر کالای مستقل و نیاز به review برای merge/update |
| DATA/PRODUCT | طراحی Product Pricing Feature Boundary | مشخص کردن featureهای اثرگذار بر قیمت بدون پیاده‌سازی pricing engine |
| PROD/DATA | طراحی Product Production Feature Boundary | مشخص کردن featureهای اثرگذار بر تولید بدون پیاده‌سازی formula engine |
| DATA/PRODUCT | طراحی Product Feature Validation Rules | قوانین اعتبارسنجی featureها بر اساس type، group، source، confidence و risk |
| DATA/PRODUCT | طراحی Product Feature AI Snapshot | خلاصه featureهای تاییدشده برای تحلیل AI و cockpit |
| CORE/CONTROL | طراحی Product Attribute Audit Trail | audit تغییر attribute، source، validation، confidence و decision |
| DATA/PRODUCT | طراحی Product Feature Import Mapping | mapping داده خام یا staging شده به attributeKeyهای مفهومی |
| DATA/PRODUCT | طراحی Product Feature Review Boundary | مرز review برای unknown feature، wrong unit، duplicate barcode، conflict و low confidence |
| DATA/PRODUCT | طراحی Product Attribute Validation Report | گزارش read-only کیفیت attributeها، warningها، blockedها و auto-fixها برای dry-run، review، cockpit و AI snapshot |
| DATA/PRODUCT | طراحی Product Feature Risk Warning | هشدارهای featureهای اثرگذار روی duplicate، pricing، production و inventory |
| DATA/PRODUCT | طراحی Product Feature Auto-fix Suggestion | پیشنهاد اصلاح feature بدون اعمال خودکار و با audit/approval |
| CORE/CONTROL | طراحی Product Feature Audit Trail | audit mapping، validation، review، auto-fix suggestion و approved import |
| CORE/DATA | طراحی Reporting View Layer | طراحی لایه گزارش خواندنی مستقل، بدون وابستگی به viewهای محک |
| CORE/CONTROL | طراحی Audit Framework | چارچوب audit برای import، rollback، تصمیم‌ها و تغییرات حساس |
| CORE | طراحی Event Driven Business Engine | موتور رویداد کسب‌وکار مستقل از محک و آماده برای ماژول‌های آینده |
| CORE/DATA | طراحی Master Data Registry | registry داده‌های پایه مثل کالا، گروه، سنگ، طرف حساب و مکان، مستقل از جدول‌های محک |
| CORE | طراحی Central Business Event Bus | event bus مفهومی برای رخدادهای مالی، کالا، تولید، انبار، موبایل، review و crisis |
| CORE | طراحی Business Event Contract | قرارداد event شامل eventId، eventType، sourceModule، confidence، riskFlags و auditReference |
| CORE/DATA | طراحی Document Approval Status Model | وضعیت تایید سند شامل draft، pending، approved، rejected، reversed و archived |
| CORE/CONTROL | طراحی Document Audit Trail Boundary | مرز audit برای سندها، itemها، import، approval، correction و rollback |
| CORE/DATA | طراحی Document Status Model | چرخه وضعیت سند از draft تا finalized، cancelled و archived |
| CORE/CONTROL | طراحی Document Change Log | ثبت actionType، actor، before/after، reason، confidence، risk و relatedEvent |
| CORE/DATA | طراحی Read Model Strategy | ساختار خواندنی برای cockpit، report و AI summary بدون mutate داده اصلی |
| CORE/DATA | طراحی Audit Trail Report | گزارش audit سند، event، import، rollback و تصمیم مدیر |
| CORE/DATA | طراحی Crisis Signal Report | گزارش crisis signal از eventها، snapshotها و risk flags چندماژولی |
| WF | کوچک‌سازی ادامه‌دار `WorkforcePages.tsx` | ادامه استخراج صفحه‌ها در فازهای کوچک و قابل rollback |
| CORE | dashboard مرکزی چندشاخه | اتصال KPIهای WF به کابین مرکزی مستر جم |
| UI | تست responsive و accessibility | keyboard، contrast، overflow و mobile viewport |

## پارکینگ

| شاخه | ایده | دلیل پارک شدن |
|---|---|---|
| FIN-AUDIT | Merge کامل audit-app | merge مستقیم ممنوع است |
| DATA-MAHAK | Merge کامل mahak-web-version | merge مستقیم ممنوع است |
| CORE | تغییر auth اصلی | نیازمند تصمیم امنیتی و backend |
| DATA | تغییر database اصلی | نیازمند طراحی migration/backend و تأیید مرکز کنترل |
| FIN | ماژول مالی کامل | هنوز فاز مصوب ندارد |
| PROD | برنامه تولید | نیازمند مدل دامنه جداگانه |
| INV | انبار | نیازمند تعریف موجودیت و جریان ورود/خروج |
| MOBILE | اپ موبایل | وابسته به تثبیت API/backend یا adapter |
| DATA | sync چند دستگاه | قبل از backend امن نباید ساخته شود |
| UI | redesign گسترده | فعلاً باید cockpit موجود حفظ شود |
