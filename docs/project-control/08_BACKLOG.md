# Backlog

آخرین به‌روزرسانی: 2026-06-29

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
| UI/CONTROL | طراحی Design Lab to Main Handoff | روش تبدیل prototype به approved component spec و implementation امن در main |
| CONTROL | طراحی multi-Codex handoff protocol | پروتکل تحویل کار بین Codexها و مرکز فرمان |
| CONTROL | طراحی branch ownership rules | مالکیت branch/file/workstream برای جلوگیری از conflict |
| CONTROL | طراحی merge approval checklist | checklist قبل از هر merge به main |
| CONTROL | طراحی rollback checklist | تعریف مسیر برگشت برای mergeهای کدی و lab output |
| CONTROL | طراحی Source Integration Plan | تبدیل نقشه منابع به برنامه استخراج مرحله‌ای |
| FIN-AUDIT | بررسی استخراج schema نقدینگی، roles و RLS | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
| DATA-MAHAK | بررسی استخراج مدل کالا، بارکد، بانک سنگ و خروجی AI-ready | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
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
