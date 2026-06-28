# Financial Schema And Adapter Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند `Financial Schema Draft` و مرز اتصال مالی آینده را طراحی می‌کند. این طراحی فقط مستند است و هیچ کد اجرایی، route، UI، localStorage key، auth، database، migration یا merge مستقیم `audit-app` ایجاد نمی‌کند.

## Financial Schema Draft

رویداد مالی در آینده باید به شکل یک record قابل audit، قابل اتصال به رسید/بانک/کالا/کارمند/تولید و قابل تحلیل در کابین مرکزی ذخیره شود.

| فیلد | نوع پیشنهادی | توضیح |
|---|---|---|
| `id` | string | شناسه پایدار رویداد مالی |
| `eventType` | string | دریافت، پرداخت، خرید، فروش، هزینه، حقوق، بدهی، طلب، انتقال، چک، نقدینگی، اصلاحیه |
| `amount` | number | مبلغ رویداد |
| `currency` | string | ارز/واحد پول |
| `eventDate` | datetime | تاریخ وقوع مالی |
| `counterpartyId` | string nullable | شناسه شخص/طرف حساب |
| `counterpartyName` | string nullable | نام طرف حساب برای گزارش |
| `moneySource` | string nullable | منبع پول: بانک، صندوق، شخص، فروش، دریافت |
| `moneyDestination` | string nullable | مقصد پول: بانک، صندوق، شخص، خرید، هزینه، حقوق |
| `paymentStatus` | string | unpaid، partial، paid، due، bounced، cancelled |
| `approvalStatus` | string | draft، pending_review، pending_manager، approved، rejected، needs_revision |
| `receiptId` | string nullable | اتصال به رسید عکس‌دار یا سند مالی |
| `bankTransactionId` | string nullable | اتصال به گردش بانکی |
| `employeeId` | string nullable | ارتباط با کارمند یا حقوق/تنخواه |
| `productId` | string nullable | ارتباط با کالا یا فروش/خرید |
| `productionId` | string nullable | ارتباط با تولید یا هزینه تولید |
| `description` | string nullable | توضیح انسانی |
| `dataSource` | string | manual، audit-app، mobile، receipt، bank-import، adapter |
| `createdAt` | datetime | زمان ایجاد |
| `updatedAt` | datetime | زمان آخرین تغییر |
| `createdBy` | string nullable | ثبت‌کننده |
| `reviewedBy` | string nullable | بررسی‌کننده |
| `approvedBy` | string nullable | مدیر تأییدکننده |
| `auditTrailId` | string nullable | اتصال به رد تغییرات |

## ارتباط با receipt

- هر رویداد مالی می‌تواند به یک یا چند رسید آینده وصل شود.
- رسید عکس‌دار نباید به معنی تأیید مالی باشد؛ فقط سند پشتیبان است.
- اگر مبلغ رسید با مبلغ رویداد اختلاف دارد، رویداد باید `needs_review` شود.

## ارتباط با bank transaction

- گردش بانکی باید به رویداد مالی map شود، نه اینکه مستقیم event را overwrite کند.
- شماره پیگیری، تاریخ، مبلغ، مبدا، مقصد و توضیح بانک باید برای تطبیق استفاده شود.
- یک تراکنش بانکی ممکن است چند رویداد مالی را پوشش دهد یا نیاز به split داشته باشد.

## ارتباط با employee

- رویدادهای حقوق، تنخواه، تسویه، هزینه کارکنان یا پرداخت به کارمند باید `employeeId` داشته باشند.
- این مدل جایگزین payroll کامل نیست؛ فقط ارتباط مالی را ثبت می‌کند.

## ارتباط با product

- خرید و فروش کالا باید بتوانند به `productId` وصل شوند.
- قیمت کالا و رویداد مالی یکی نیستند؛ رویداد مالی رخداد پرداخت/دریافت است.

## ارتباط با production

- هزینه تولید، خرید مواد، اجرت تولید یا هزینه وابسته به batch تولید باید `productionId` داشته باشد.
- Production model باید جدا طراحی شود.

## وضعیت پرداخت

مقادیر پیشنهادی:

- `unpaid`
- `partial`
- `paid`
- `due`
- `bounced`
- `cancelled`

## وضعیت تایید مدیر

مقادیر پیشنهادی:

- `draft`
- `pending_review`
- `pending_manager`
- `approved`
- `rejected`
- `needs_revision`

## منبع داده

`dataSource` باید همیشه مشخص باشد:

- `manual`
- `audit-app`
- `mobile`
- `receipt`
- `bank-import`
- `adapter`

## audit trail

هر تغییر حساس باید در audit trail آینده قابل پیگیری باشد:

- ایجاد رویداد
- تغییر مبلغ
- تغییر وضعیت پرداخت
- تغییر وضعیت تأیید
- اتصال/حذف رسید
- اتصال/حذف تراکنش بانکی
- تأیید یا رد مدیر

## Adapter Boundary

مرز اتصال مالی باید جلوی merge مستقیم `audit-app` را بگیرد. adapter آینده فقط باید داده را بخواند، normalize کند، گزارش ریسک بسازد و خروجی قابل بررسی بدهد.

خروجی‌های adapter آینده:

- `FinancialNormalizedRecord`
- `FinancialImportReport`
- `FinancialValidationError`
- `FinancialApprovalCandidate`
- `LiquiditySignal`

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی validator و decision flow مالی است. هنوز هیچ UI مالی، auth change، database change یا migration نباید انجام شود.
