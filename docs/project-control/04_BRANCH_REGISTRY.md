## CORE-V2-P03 Design Branch

- Branch: `architecture/master-gem-v2-command-center-consumption-p03`
- Parent: `feature/master-gem-v2-integration-backbone-p02`
- Parent commit: `7ec283150e9e78696ef2b736d8be6ccebb03b957`
- Scope: docs-only Command Center data-consumption design.
- Merge/push: not authorized in P03.

﻿# Branch Registry
## CORE-V2-P02 Integration Backbone Baseline

- `feature/master-gem-v2-integration-backbone-p02`: additive implementation branch from P01 commit `e22fa035cb0f8d8bb1121b7ebd19ed1857be9348`.
- Purpose: mock-only contract, static registry, validator, adapter boundary, aggregation, tests, and Report 178.
- Rollback point: `e22fa035cb0f8d8bb1121b7ebd19ed1857be9348`.
- No merge or push is authorized by P02; `main` remains V1 baseline `7d39d79`.
## CORE-V2-P01 Integration Backbone Design

- `architecture/master-gem-v2-integration-backbone-p01`: docs-only discovery/contract branch from P00 commit `596ad8d7897c510eafeea674843f8cfd7509d21d`.
- Purpose: produce Report 177 for Gate V2-A operator review.
- No merge or push is authorized by P01.
- `main` remains the stable V1 baseline `7d39d79`.
## CORE-V2 Planning

- `docs/master-gem-v2-roadmap-p00`: docs-only roadmap branch created from exact stable V1 baseline `7d39d79c2e6de73581d51f7cdb3c7aebe0f194d4`; no merge or push is authorized in P00.
- `main` and `origin/main`: protected V1 references remain at `7d39d79` during this planning phase.
- Existing V1 rollback branches remain retained and must not be deleted or repointed without Project Core approval.
- Future V2 branches must be phase-scoped and created only after the corresponding V2-A, V2-B, V2-C, or V2-D gate.

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
