# Cockpit Prototype Environment Decision

آخرین به‌روزرسانی: 2026-06-29

## وضعیت تصمیم

این سند خروجی CONTROL-P36-BATCH است و فقط ویژگی‌های محیط prototype احتمالی آینده را مشخص می‌کند. هیچ محیط، UI یا prototype واقعی در این فاز ساخته نمی‌شود.

| موضوع | وضعیت |
|---|---|
| Prototype Environment | `NOT_CREATED` |
| Environment Planning | `READY` |
| Prototype Build | `NOT_APPROVED` |
| Main Integration | `NOT_APPROVED` |
| Real Implementation | `NOT_APPROVED` |

## Cockpit Prototype Environment Decision چیست؟

تصمیم معماری درباره محل و حدود محیطی است که فقط پس از approval مستقل می‌تواند برای ارزیابی Central Cockpit Overview Screen ساخته شود؛ این محیط باید از main و تمام وابستگی‌های production جدا بماند.

## گزینه‌های قابل قبول محیط آینده

- isolated mock-only prototype area
- بدون main route یا main navigation
- بدون dependency به production component
- بدون production storage یا کلید مشترک
- بدون database، migration و backend
- بدون auth و نقش واقعی
- بدون داده واقعی
- بدون action یا approval واقعی

## محیط پیشنهادی

- isolated prototype boundary only
- mock/synthetic data only
- mock service ایزوله
- resettable demo state
- visible prototype banner و demo label
- no production persistence
- file scope محدود و از پیش تاییدشده

## موارد ممنوع

- main route و main navigation
- production localStorage key یا هر shared storage
- production database، backend، migration یا auth
- real manager action و real approval mutation
- import، write یا mutation واقعی
- داده واقعی مالی، کالا، کارمند، محک، بانک یا رسید
- اتصال مستقیم خروجی Design Lab به main

## شرط ایجاد محیط

ایجاد محیط فقط بعد از خروجی `approved_for_build`، تعیین file scope، approval fixtureهای mock، تعیین test command و rollback owner مجاز خواهد بود.

## نتیجه

- `Environment planning is READY.`
- `Environment creation is NOT_APPROVED.`
- `Cockpit Prototype remains ON_HOLD.`
