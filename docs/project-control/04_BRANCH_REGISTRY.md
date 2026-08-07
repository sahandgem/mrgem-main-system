# Branch Registry

## CORE-HARDEN-P09 Remote Promotion

- `main`: remotely promoted and verified at `b1623f4` before the P09D docs-only closure commit.
- `origin/main`: manually verified at `b1623f4` with ahead/behind `0 / 0` before P09D.
- `backup/main-before-master-gem-v1-remote-promotion-e3cd9f6`: retained at `e3cd9f6`.
- `backup/main-before-master-gem-v1-hardening-integration-e42b320`: retained at `e42b320`.

## CORE-HARDEN-P08

- `docs/master-gem-v1-post-integration-lock-p08`: docs-only post-integration lock and remote-readiness review from local main `e3cd9f6`; no main change, merge or push.
- `main`: P08-locked local baseline remains `e3cd9f6` until a separately authorized P09.

## CORE-HARDEN-P07

- `main`: local verified hardening integration merge `56413ed`; no push.
- `backup/main-before-master-gem-v1-hardening-integration-e42b320`: retained P07 rollback reference at exact pre-merge main `e42b320`; do not delete or repoint without Project Core approval.
- `review/master-gem-v1-hardening-integration-readiness-p06`: consumed as second parent `fd722ce` of the verified local merge; retained as review evidence.

## CORE-HARDEN-P06

- `review/master-gem-v1-hardening-integration-readiness-p06`: docs-only ancestry, delta and quality review; eligible future source for one local no-ff merge only after separate P07 approval. No merge or push occurred.
- Future rollback branch, not created by P06: `backup/main-before-master-gem-v1-hardening-integration-e42b320`.

## CORE-HARDEN-P05

- `docs/master-gem-v1-hardening-closure-p05`: docs-only canonical debt register and closure baseline, created from P04 head `c7180b6`; no merge or push.

## CORE-HARDEN-P03

- `docs/master-gem-v1-release-rollback-discipline-p03`: docs-only release/rollback discipline baseline, created from verified P02 head; no merge or push.
- `backup/main-before-master-gem-core-v1-merge-b16b1a0`: verified local rollback reference; do not delete or mutate without Project Core approval.

آخرین به‌روزرسانی: 2026-08-02

## کد شاخه‌ها

| کد | نام فارسی | نوع | نقش | وضعیت merge |
|---|---|---|---|---|
| CORE | هسته مرکزی | Mother Module | shell، route، قراردادها، navigation، state مشترک، کابین مرکزی | داخل پروژه اصلی |
| WF | نیروی انسانی | Mother Module | کارمندان، فضاها، زمان‌بندی، تحلیل، drift، readiness و عملیات مرتبط | داخل پروژه اصلی |
| FIN | مالی | Mother Module | فروش، هزینه، سود، پرداخت، جریان نقد، گزارش مالی | هنوز شروع نشده |
| PROD | تولید | Mother Module | ظرفیت تولید، سفارش تولید، کنترل کیفیت، برنامه تولید | هنوز شروع نشده |
| INV | انبار | Mother Module | موجودی، جابه‌جایی، کسری، حد سفارش، مغایرت | هنوز شروع نشده |
| UI | طراحی و تجربه کاربری | Mother Module | زبان بصری، RTL، dark mode، cockpit، responsive، accessibility | داخل پروژه اصلی |
| MOBILE | اپ موبایل | Mother Module | تجربه همراه، مشاهده سریع، ثبت سبک، اعلان‌های آینده | هنوز شروع نشده |
| DATA | استخراج داده و محک و بانک | Mother Module | import/export، اتصال محک، داده بانکی، کیفیت و تطبیق داده | نیمه‌فعال در WF |
| CONTROL | مرکز کنترل | Mother Module | تصمیم‌گیری، فازبندی، handoff، audit، do-not-touch و backlog | فعال |
| FIN-AUDIT | audit-app / داشبورد بحران نقدینگی | Subproject | منبع احتمالی schema نقدینگی، roles و RLS | فعلاً merge نشود |
| DATA-MAHAK | mahak-web-version / ثبت کالا و خروجی محک | Subproject | منبع احتمالی مدل کالا، بارکد، بانک سنگ و خروجی AI-ready | فعلاً merge نشود |

## قانون استفاده از کد شاخه

هر کار جدید باید حداقل یک کد شاخه داشته باشد. اگر کاری چند شاخه را لمس می‌کند، اثر متقاطع آن باید قبل از اجرا ثبت شود.

نمونه:

- `WF-P29`: استخراج واقعی چند صفحه کم‌ریسک از WorkforcePages
- `DATA-MAHAK-Px`: بررسی مدل کالا و خروجی محک، بدون merge مستقیم
- `FIN-AUDIT-Px`: بررسی schema نقدینگی، بدون merge مستقیم
- `CORE-Px`: تغییر route shell یا کابین مرکزی
- `CONTROL-Px`: فقط مستندسازی و کنترل پروژه

## شاخه فعال فعلی

- baseline اجرایی محلی: `main` روی `e42b320`؛ قفل‌شده و بدون مجوز push
- شاخه docs فعال: `docs/master-gem-core-v1-post-merge-lock`؛ ساخته‌شده مستقیم از baseline
- rollback: `backup/main-before-master-gem-core-v1-merge-b16b1a0` روی `b16b1a0`
- review نگه‌داری‌شده: `review/master-gem-core-v1-final-gate` روی `276d526`
- candidate نگه‌داری‌شده: `integration/master-gem-core-v1-candidate` روی `d977037`
- شاخه اجرایی `WF`: frozen؛ P56 مجاز نیست
- شاخه کنترل فعال: `CONTROL/CORE` فقط برای baseline lock و تصمیم readiness
- زیرپروژه‌های ثبت‌شده اما merge نشده: `FIN-AUDIT`, `DATA-MAHAK`

هیچ branch در CORE-POST-MERGE-P01 حذف، merge، rebase یا push نشد.
