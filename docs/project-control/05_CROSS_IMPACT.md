# اثر متقاطع تغییرات

پیش از تغییر هر ناحیه، ردیف مربوط مرور شود.

| تغییر | اثر مستقیم | بررسی‌های اجباری |
|---|---|---|
| مدل Space/Employee/Task/Schedule | CRUD، analyzer، simulator، recommendation، backup، maintenance، readiness | typecheck، seed، orphan detection، backup round-trip |
| AnalysisRule یا AnalysisSettings | findings، score، recommendations، readiness، baseline drift | analyzer tests، settings persistence، resignoff impact |
| WorkCompatibilityRule | analyzer، recommendations، simulator، drift | compatibility tests، baseline classification |
| Schedule item | dashboard، analysis، simulator، queue، reports | overlap، invalid time، inactive references |
| Decision report | archive، monthly health، alerts، readiness | report analytics، trend و recurring risk |
| Monthly goal | health، alerts، readiness، operations calendar | month label و archived state |
| Preventive alert state | dashboard، readiness، maintenance، operations calendar | stale state cleanup و alert key stability |
| Backup key | export/import، snapshot، maintenance، drift baseline | validation، checksum، restore و recursion |
| Launch signoff/resignoff | baseline، drift، history، retention | signed state، checksum، actor/note |
| History event/archive | drift trend، retention، data center | archive eligibility، cleanup safety، snapshot قبل از حذف |
| Operations policy | calendar due date/priority، dashboard، notification | disabled control، cadence، escalation |
| Route path | navigation، registry، legacy CurrentPage، links داخل صفحه | manifest test، 200 response، active nav، alias |
| Lazy entry/import | initial bundle، loading/error boundary | build chunks، direct URL load، browser console |
| localStorage schema | همه داده‌های محلی و restore | migration plan، version key، backward compatibility |

## نقاط حساس شناخته‌شده

### Route duplication

مسیرها در manifest مرکزی ثبت شده‌اند، ولی dispatch واقعی داخل `CurrentPage` در `WorkforcePages.tsx` نیز شرط‌های path دارد. هر route جدید یا rename باید هر دو محل را بررسی کند تا زمانی که این بدهی حذف شود.

### Backup coverage

کلیدهای مشاهده‌شده ۲۴ عددند و بعد از P25، `workforceBackupKeys` شامل ۲۳ کلید است. وضعیت فعلی موارد حساس:

- `komak.workforce.snapshots.v1`؛ عمداً برای جلوگیری از snapshot داخل snapshot خارج از backup مستقیم است.
- `komak.workforce.maintenanceReports.v1`؛ از P25 داخل backup است.
- `komak.workforce.launchSignoffs.v1`؛ از P25 داخل backup است.
- `komak.workforce.operationalResignoffs.v1`؛ از P25 داخل backup است.
- `komak.workforce.historyRetentionPolicy.v1`؛ از P25 داخل backup است.
- `komak.workforce.historyArchives.v1`؛ از P25 داخل backup است.

تصمیم P25 در `02_DECISIONS.md` ثبت شده و با تست round-trip پوشش داده شده است.

### نتیجه P25 برای Backup coverage

- source of truth کلیدها به `src/registry/workforceStorageKeys.ts` منتقل شد.
- تعداد کلیدهای شناخته‌شده: ۲۴.
- تعداد کلیدهای داخل backup/import/snapshot bundle: ۲۳.
- `komak.workforce.snapshots.v1` عمداً خارج از backup مستقیم ماند تا recursion ایجاد نشود.
- `maintenanceReports`, `launchSignoffs`, `operationalResignoffs`, `historyRetentionPolicy`, `historyArchives` وارد backup شدند.
- import و restore اکنون وابسته به registry هستند؛ key ناشناخته warning می‌دهد و key حیاتیِ missing مانع import می‌شود.
- snapshot قبل از import/restore همچنان ساخته می‌شود، پس rollback وضعیت قبل از عملیات حفظ شده است.
- اثر مستقیم روی Data Center: API سرویس کامل‌تر شد؛ UI در P25 تغییر نکرد.
- اثر روی baseline/drift: checksumهای جدید ممکن است نسبت به baselineهای قدیمی متفاوت شوند، چون audit/retention داده بیشتری وارد bundle می‌شود.

### Baseline drift

اضافه یا حذف یک backup key می‌تواند checksum و drift را تغییر دهد. تغییر coverage باید با baselineهای موجود و نیاز به resignoff بررسی شود.

### نتیجه P26 برای baseline compatibility

- backup bundleهای جدید coverage metadata دارند و baselineهای بعد از P25 قابل تشخیص‌اند.
- baselineهای قدیمی بدون metadata به عنوان legacy شناخته می‌شوند.
- در drift legacy، مقایسه اصلی فقط روی keyهای مشترک baseline و current انجام می‌شود.
- keyهایی که فقط به خاطر پوشش جدید P25 اضافه شده‌اند، در `compatibilityWarnings` گزارش می‌شوند و به‌تنهایی drift بحرانی یا resignoff فوری نمی‌سازند.
- تغییر واقعی در keyهای مشترک همچنان drift واقعی محسوب می‌شود.
- signoff/resignoff جدید coverage version ذخیره می‌کند، اما signoff/resignoff قدیمی rewrite نمی‌شود.
- import/restore از P25 حفظ شده و P26 localStorage key جدیدی اضافه نکرد.

### نتیجه P27 برای operator guidance

- warning legacy baseline در UI موجود نمایش داده می‌شود، اما به عنوان خرابی داده معرفی نمی‌شود.
- پیام فقط اپراتور را به بررسی و در صورت نیاز بازتأیید هدایت می‌کند.
- route، localStorage key، migration و rewrite داده قدیمی اضافه نشد.

### Local-only operations

Notification، calendar، history و signoff روی مرورگر فعلی هستند. پاک‌شدن storage یا استفاده از دستگاه دیگر باعث نبود داده می‌شود.

## ماتریس حداقل تست

| سطح تغییر | حداقل بررسی |
|---|---|
| docs-only | صحت inventory، لینک فایل‌ها، عدم تغییر src |
| UI محدود | build، direct route، RTL/overflow، console |
| service/localStorage | unit test، persistence، invalid JSON، reset behavior |
| analyzer | pure input، no mutation، boundary cases، score/status |
| backup/restore | checksum، validate-only، round-trip، snapshot قبل از restore |
| route architecture | manifest uniqueness، lazy build، همه direct URLها 200 |

## نتیجه P28 برای معماری route/page

- route manifest و pathها تغییر نکردند.
- ده entry صفحه سیستم مسیر صریح می‌گیرند و دیگر به تشخیص مسیر از `window.location.pathname` در entry وابسته نیستند.
- `WorkforceRoutePageByPath` فقط لایه dispatch فعلی را parameterized کرده و منطق analyzer/service/storage را تغییر نداده است.
- `BaselineCompatibilityNotice` به component مستقل منتقل شد؛ اثر مستقیم آن فقط کاهش تمرکز UI در `WorkforcePages.tsx` است.
- localStorage key، backup coverage، baseline checksum و migration تغییری نکردند.
- ریسک باقی‌مانده: بدنه implementation صفحه‌ها هنوز در فایل مرکزی است و استخراج واقعی باید مرحله‌ای ادامه پیدا کند.

## اثر متقاطع WF-P29 پیشنهادی

طبق تصمیم مرکز کنترل، WF-P29 هنوز اجرا/تأیید نشده است. اگر این فاز اجرا شود، باید این موارد کنترل شوند:

- route URLها و manifest behavior نباید تغییر کنند.
- localStorage key جدید نباید ساخته شود.
- analyzer/service business logic نباید تغییر کند.
- pageهای منتقل‌شده نباید از `WorkforceRouteAdapter` یا `WorkforcePages` برای بدنه واقعی استفاده کنند.
- build و test باید بعد از extraction موفق باشند.
- هر helper مشترک جدید نباید باعث circular import شود.