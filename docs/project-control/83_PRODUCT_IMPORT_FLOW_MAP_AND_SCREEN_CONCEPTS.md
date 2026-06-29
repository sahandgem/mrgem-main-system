# Product Import Flow Map and Screen Concepts

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند فقط screen concept و flow map مفهومی برای Design Lab است. هیچ component، route، UI اجرایی، prototype واقعی، import واقعی یا storage واقعی در این فاز ساخته نمی‌شود.

## Flow Map کلی

```text
upload/select mock source
-> parse preview
-> staging preview
-> feature mapping
-> validation report
-> review queue
-> quality gate result
-> batch decision
-> manager report
-> audit summary
```

## قرارداد مشترک screen concept

هر screen concept باید این موارد را مشخص کند:

- هدف صفحه.
- داده ورودی.
- داده خروجی.
- actionهای مجاز در سطح mock.
- risk و confidence نمایش‌داده‌شده.
- محل نمایش AI suggestion.
- محل تصمیم reviewer یا manager.
- audit context یا audit reference مفهومی.

## Screen Concepts

### Import Source Selection Mock

| بخش | توضیح |
|---|---|
| هدف | انتخاب منبع synthetic/mock برای شروع flow طراحی |
| داده ورودی | mock source name، source type، batch label |
| داده خروجی | selected mock batch و source summary |
| actionهای مجاز | select mock source، view source summary، cancel mock flow |
| risk/confidence | نمایش placeholder برای source reliability |
| AI suggestion | فقط توضیح می‌دهد source برای چه سناریویی مناسب است |
| manager/reviewer decision | ندارد؛ هنوز مرحله تصمیم نیست |

### Parse Preview Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش اینکه mock input چگونه parse شده است |
| داده ورودی | selected mock batch |
| داده خروجی | parsed rows/items، parse warnings، parse blockers |
| actionهای مجاز | view parsed item، flag parse issue، continue to staging preview |
| risk/confidence | parse confidence و unknown format risk |
| AI suggestion | پیشنهاد درباره مشکل احتمالی format |
| manager/reviewer decision | فقط mark for review در سطح concept |

### Staging Preview Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش رکوردهای normalize شده قبل از validation |
| داده ورودی | parsed mock items |
| داده خروجی | normalized preview و staging status |
| actionهای مجاز | compare raw/normalized، view staging status |
| risk/confidence | completeness، source reliability و normalization confidence |
| AI suggestion | توضیح تغییر raw به normalized |
| manager/reviewer decision | request correction فقط به عنوان mock action |

### Feature Mapping Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش mapping ویژگی‌های خام به attributeهای مفهومی کالا |
| داده ورودی | normalized mock items و feature candidates |
| داده خروجی | feature mapping proposal، unknown feature list |
| actionهای مجاز | accept mapping suggestion، mark unknown، send to review |
| risk/confidence | mapping confidence، manual-only flag، mismatch risk |
| AI suggestion | پیشنهاد attributeKey و دلیل mapping |
| manager/reviewer decision | manual map یا escalate فقط در سطح concept |

### Validation Report Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش نتیجه validation قبل از Quality Gate |
| داده ورودی | mapped features |
| داده خروجی | validation errors، warnings، info، auto-fix candidates |
| actionهای مجاز | filter issues، open item detail، send issue to review |
| risk/confidence | severity، affected item count، confidence summary |
| AI suggestion | پیشنهاد علت خطا یا اصلاح کم‌ریسک |
| manager/reviewer decision | accept auto-fix suggestion یا needs review در mock |

### Review Queue Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش itemهای نیازمند review انسانی |
| داده ورودی | validation report و mapping conflicts |
| داده خروجی | review decisions و unresolved items |
| actionهای مجاز | approve، reject، request correction، mark duplicate، escalate |
| risk/confidence | issue risk، confidence، manual-only marker |
| AI suggestion | پیشنهاد decision با reason و evidence |
| manager/reviewer decision | مرکز اصلی تصمیم انسانی |

### Quality Gate Result Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش اینکه batch از gate عبور می‌کند یا نه |
| داده ورودی | validation، review decisions، duplicate/conflict status |
| داده خروجی | pass، pass_with_warnings، needs_review، blocked، quarantine |
| actionهای مجاز | view blockers، view warnings، go to batch decision |
| risk/confidence | gate status، blocker summary، data quality score concept |
| AI suggestion | پیشنهاد مسیر بعدی مثل split یا correction |
| manager/reviewer decision | تایید عبور حساس فقط در سطح mock |

### Batch Decision Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش تصمیم batch پس از gate |
| داده ورودی | gate result و item-level status |
| داده خروجی | dry-run only، split batch، quarantine، reject، approve concept |
| actionهای مجاز | choose mock decision، view included/excluded items |
| risk/confidence | batch risk، unresolved count، rollback readiness concept |
| AI suggestion | توصیه تصمیم batch با دلیل |
| manager/reviewer decision | انتخاب نهایی مدیر در mock flow |

### Manager Decision Report Screen

| بخش | توضیح |
|---|---|
| هدف | خلاصه مدیریتی برای تصمیم نهایی |
| داده ورودی | batch decision، gate، review، AI suggestions |
| داده خروجی | decision report، required action، manager note concept |
| actionهای مجاز | approve concept، reject concept، request correction concept |
| risk/confidence | high-risk flags، confidence distribution، manual-only count |
| AI suggestion | جمع‌بندی پیشنهادی با evidence |
| manager/reviewer decision | محل ثبت دلیل تصمیم مدیر در concept |

### Audit Summary Screen

| بخش | توضیح |
|---|---|
| هدف | نمایش رد تصمیم‌ها و رخدادهای mock flow |
| داده ورودی | همه screen decisions و mock events |
| داده خروجی | audit summary، decision trace، issue history |
| actionهای مجاز | view audit item، export concept note |
| risk/confidence | نشان دادن اینکه کدام تصمیم با چه confidence گرفته شده |
| AI suggestion | فقط reference به پیشنهادهای قبلی |
| manager/reviewer decision | ندارد؛ صفحه read-only concept است |

## قانون نهایی

این صفحه‌ها فقط screen concept هستند. ساختن component، route، state management، storage، service، prototype واقعی یا import واقعی باید در فاز مستقل و با approval جداگانه انجام شود.
