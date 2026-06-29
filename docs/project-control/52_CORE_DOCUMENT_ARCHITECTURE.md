# Core Document Architecture

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند معماری مرکزی سندهای مستر جم را طراحی می‌کند. هدف این است که خرید، فروش، دریافت، پرداخت، تولید، انبار، حقوق و اصلاحیه‌ها در آینده یک زبان مفهومی مشترک داشته باشند، بدون کپی‌کردن schema، جدول، ستون، query یا view از محک.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth یا localStorage ایجاد نمی‌کند.

## Core Document Architecture چیست؟

`Core Document Architecture` الگوی مشترک سندهای کسب‌وکار در مستر جم است. هر سند یک header دارد که اطلاعات کلی را نگه می‌دارد و itemهایی دارد که جزئیات کالا، مبلغ، وزن، هزینه یا توضیح را ثبت می‌کنند.

## چرا مستر جم به معماری سند مرکزی نیاز دارد؟

- خرید، فروش، تولید، انبار و مالی باید با زبان مشترک به هم وصل شوند.
- audit، approval، rollback و import روی سندها قابل استانداردسازی می‌شود.
- AI Snapshot و Central Business Event Bus می‌توانند روی سندها تحلیل بسازند.
- داده تاریخی می‌تواند بدون وابستگی به schema خارجی وارد مدل مستقل شود.
- هر ماژول می‌تواند سند تخصصی خودش را داشته باشد اما قرارداد پایه را حفظ کند.

## الگوی Header / Detail مستقل از محک

این الگو فقط به عنوان ایده معماری استفاده می‌شود. هیچ نام جدول، نام ستون، relation، constraint یا query از محک وارد طراحی مستر جم نمی‌شود.

Header اطلاعات کلی سند را نگه می‌دارد. Detail یا Item اقلام سند را نگه می‌دارد. این تفکیک کمک می‌کند سند هم برای گزارش مدیریتی و هم برای جزئیات عملیاتی قابل استفاده باشد.

## BaseDocument مفهومی

| فیلد | توضیح |
|---|---|
| `id` | شناسه مستقل سند در هسته مستر جم. |
| `documentType` | نوع سند مثل مالی، خرید، فروش، تولید، انبار، حقوق یا اصلاحیه. |
| `documentNumber` | شماره سند داخلی مستر جم، مستقل از شماره‌های سیستم‌های خارجی. |
| `documentDate` | تاریخ موثر سند. |
| `status` | وضعیت سند مثل draft، pending review، approved، rejected، imported، reversed یا archived. |
| `sourceModule` | ماژول تولیدکننده سند. |
| `counterparty` | شخص، مشتری، فروشنده، کارمند یا طرف حساب مرتبط. |
| `currency` | واحد پول سند در صورت مالی بودن. |
| `totalAmount` | جمع مبلغ سند، در صورت کاربرد. |
| `approvalStatus` | وضعیت تایید manager/reviewer. |
| `createdBy` | ایجادکننده سند یا actor سیستم. |
| `approvedBy` | تاییدکننده سند در صورت نیاز. |
| `createdAt` | زمان ایجاد. |
| `updatedAt` | زمان آخرین تغییر. |
| `auditReference` | مرجع audit برای import، review، rollback یا تصمیم. |

## BaseDocumentItem مفهومی

| فیلد | توضیح |
|---|---|
| `id` | شناسه item. |
| `documentId` | ارجاع به سند پایه. |
| `itemType` | نوع item مثل کالا، خدمت، هزینه، مواد، پرداخت یا توضیح. |
| `productReference` | ارجاع به کالا یا product snapshot در صورت کاربرد. |
| `description` | توضیح item. |
| `quantity` | تعداد یا مقدار. |
| `unit` | واحد اندازه‌گیری. |
| `unitPrice` | قیمت واحد. |
| `amount` | مبلغ کل item. |
| `weight` | وزن در صورت کاربرد برای کالا یا تولید. |
| `cost` | هزینه مرتبط با item. |
| `notes` | یادداشت تکمیلی. |

## سندهای آینده

| سند | نقش |
|---|---|
| `FinancialDocument` | دریافت، پرداخت، هزینه، بدهی، طلب، چک یا اصلاحیه مالی. |
| `PurchaseDocument` | خرید کالا، مواد یا خدمات. |
| `SalesDocument` | فروش کالا یا خدمات. |
| `ProductionDocument` | ثبت تولید، مواد مصرفی، خروجی و هزینه تولید. |
| `InventoryMovementDocument` | ورود، خروج، انتقال، شمارش یا اصلاح موجودی. |
| `PayrollDocument` | حقوق، پاداش، کسری یا پرداخت کارکنان. |
| `AdjustmentDocument` | اصلاحیه کنترل‌شده برای داده‌های حساس. |

## ارتباط با ماژول‌ها

| بخش | ارتباط |
|---|---|
| Core Financial Event | سند مالی می‌تواند رویداد مالی تولید کند یا از آن پشتیبانی کند. |
| Core Product Model | itemها می‌توانند به product reference وصل شوند. |
| Inventory | سند انبار movement یا stock impact را توضیح می‌دهد. |
| Production | سند تولید مواد، خروجی و هزینه را به event و inventory وصل می‌کند. |
| Mobile Receipt | رسید موبایل می‌تواند به سند مالی یا خرید/هزینه attach شود. |
| AI Snapshot | سندها منبع snapshotهای قابل تحلیل برای AI هستند. |
| Audit Trail | هر سند و item باید قابل audit باشد. |
| Central Business Event Bus | ایجاد، تایید، اصلاح یا rollback سند می‌تواند event تولید کند. |

## قوانین

- هیچ schema، table، column، query یا view از محک کپی نشود.
- BaseDocument فقط مدل مفهومی است، نه schema اجرایی.
- هر سند حساس باید approvalStatus و auditReference داشته باشد.
- هر import سندی باید از staging، dry-run و approved import عبور کند.
- rollback یا correction سند باید before/after و manager approval داشته باشد.
