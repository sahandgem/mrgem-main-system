# Product Import Mock Scenario Storyboard

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند فقط سناریوهای synthetic/mock برای Design Lab را تعریف می‌کند. هیچ سناریو نباید از داده واقعی محک، مشتری، کالا، قیمت، barcode یا فایل واقعی استفاده کند.

## Mock Scenario Storyboard چیست؟

Mock Scenario Storyboard مجموعه داستان‌های کوتاه و قابل تکرار برای تست مفهومی flow، screen concept، validation، review، quality gate، batch decision، manager action و audit output است. هدف آن آماده‌کردن زبان مشترک Design Lab است، نه ساخت prototype اجرایی.

## قرارداد هر سناریو

هر سناریو شامل این موارد است:

- `scenarioId`
- short story
- mock input summary
- expected validation result
- expected review need
- expected quality gate decision
- expected batch decision
- expected manager action
- expected audit output

## سناریوهای synthetic

| scenarioId | short story | mock input summary | expected validation result | expected review need | expected quality gate decision | expected batch decision | expected manager action | expected audit output |
|---|---|---|---|---|---|---|---|---|
| PI-MOCK-001 | clean valid import | batch کوچک با کالاهای synthetic کامل و بدون conflict | valid with info | ندارد | pass | dry-run allowed concept | مشاهده و تایید مفهومی | parse، validation و gate pass ثبت شود |
| PI-MOCK-002 | missing required feature | یک کالا feature ضروری مثل group یا weight ندارد | error برای required feature | بله | blocked یا needs_review | request correction | درخواست اصلاح | missing feature و correction request ثبت شود |
| PI-MOCK-003 | duplicate barcode | دو کالای mock با barcode یکسان | duplicate warning/error | بله | blocked until resolved | split یا hold | mark duplicate یا request correction | duplicate evidence و decision ثبت شود |
| PI-MOCK-004 | stone mismatch | نام سنگ با stone bank mock تطبیق ندارد | warning یا needs_review | بله | needs_review | hold affected items | manual map یا correction | stone mismatch و reviewer action ثبت شود |
| PI-MOCK-005 | product group mismatch | groupCode و groupName با هم سازگار نیستند | warning/conflict | بله | needs_review | split batch | انتخاب گروه صحیح با دلیل | before/after group decision ثبت شود |
| PI-MOCK-006 | invalid weight/unit | وزن منفی، صفر یا unit ناشناخته دارد | error | بله | blocked | reject affected items | request correction | invalid weight rule و item status ثبت شود |
| PI-MOCK-007 | pricing-impact conflict | feature اثرگذار بر قیمت متعارض است | conflict | بله، manager | blocked until manager decision | hold | escalate یا reject | pricing impact risk و manager reason ثبت شود |
| PI-MOCK-008 | production-impact conflict | feature تولیدی با formula concept ناسازگار است | conflict | بله، manager | blocked | hold یا split | escalate | production risk و affected item ثبت شود |
| PI-MOCK-009 | low confidence feature | mapping با confidence پایین پیشنهاد شده است | warning/low confidence | بله | needs_review | review-only | approve/reject mapping | confidence reason و decision trace ثبت شود |
| PI-MOCK-010 | manual-only mapping | feature حساس باید فقط دستی map شود | manual only | بله | blocked until manual decision | hold | manual map with reason | manual-only boundary و actor ثبت شود |
| PI-MOCK-011 | mixed batch requiring split | batch شامل valid، warning، blocked و duplicate است | mixed | بله | pass valid only یا split required | split batch | approve split concept | parent/child batch و excluded items ثبت شود |
| PI-MOCK-012 | manager override with reason | مدیر با پذیرش ریسک یک warning را override می‌کند | warning با override required | بله، manager | pass_with_warnings | approve with reason | override با دلیل و دامنه مشخص | risk acceptance، actor و reason ثبت شود |

## قواعد ایمنی سناریوها

- همه ورودی‌ها synthetic/mock هستند.
- هیچ نام مشتری، قیمت واقعی، کد واقعی، barcode واقعی، داده مالی یا فایل واقعی محک استفاده نمی‌شود.
- سناریوها باید deterministic باشند و expected result داشته باشند.
- سناریوها فقط برای طراحی screen و flow هستند، نه برای import واقعی.
- سناریوهای conflict، low confidence و manual-only هرگز auto-confirm نمی‌شوند.

## خروجی مورد انتظار برای Design Lab

Design Lab باید بتواند از این storyboard برای طراحی جریان‌های زیر استفاده کند:

- نمایش مسیر happy path.
- نمایش مسیر correction/review.
- نمایش duplicate و conflict.
- نمایش batch split.
- نمایش manager override با دلیل.
- نمایش audit summary بدون ساخت audit واقعی.
