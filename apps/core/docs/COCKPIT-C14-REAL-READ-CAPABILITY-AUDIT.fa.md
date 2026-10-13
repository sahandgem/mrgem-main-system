# C14 — Real Read Capability Audit

تاریخ: 2026-10-04

## هدف

بررسی اینکه آیا در Production Center / Mahak یک Read API واقعی و قابل‌استفاده وجود دارد که بتواند به مسیر C13 متصل شود یا خیر.

هیچ Production activation، migration، credential change، service start یا write واقعی در C14 انجام نشد.

## Repoهای بررسی‌شده

### Core
- branch: codex/dev-core
- baseline C14: c75369e

### Production Center
- branch: main
- HEAD بررسی‌شده: 8138868

### Mahak development checkout
- branch: feature/production-stock-reservation-v2
- HEAD بررسی‌شده: 57bc67f

## قابلیت واقعی پیدا شده

### Production Center BFF

یک HTTP boundary واقعی وجود دارد:

GET /api/product-monitoring/:pcProductId

مسیر:
bff/src/httpServer.js

ویژگی‌ها:
- فقط GET
- authenticateRequest trusted و server-side اجباری
- browser role/org/location header قابل اعتماد نیست
- location scope بعد از authorization کاهش داده می‌شود
- خروجی Sanitized Product Monitoring DTO است
- raw Mahak payload به browser نمی‌رسد

Runtime composition:
bff/src/runtimeBoundary.js

نیازمند:
- registryPool واقعی
- authenticateRequest واقعی
- Mahak base URL
- Mahak read token
- Mahak source ID

### Mahak Product Identity Read

یک source read boundary اجرایی در branch توسعه وجود دارد:

POST /internal/source-identity/v1/product-identity/read

schema:
mahak-product-identity-v1

ویژگی‌ها:
- POST-only
- JSON-only
- Bearer read token مستقل
- loopback by default
- no CORS
- bounded body/response
- SQLite handle read-only در runtime read server
- lookup فقط با durable governed source tuple
- productCode/barcode/local numeric ID lookup fallback ممنوع

## وضعیت دیتابیس عملیاتی Mahak

فقط schema metadata و count بررسی شد؛ هیچ رکورد محصول خوانده نشد.

دیتابیس عملیاتی دارای:
- source_identity_product_read_projection
- source_identity_read_contract_meta
- source_identity_lineage
- source_identity_uid_ownership
- triggerهای read projection

source schema ثبت‌شده:
mahak-product-identity-v1

شمارش‌های readiness:
- projection rows: 18
- lineage rows: 1
- ownership rows: 18

نتیجه:
Read-contract migration/projection در دیتابیس عملیاتی نصب شده است.

## شکاف Deployment

نسخه عملیاتی Mahak در مسیر فعلی:
- دیتابیس عملیاتی را دارد
- اما فایل‌های source-identity-product-read-server.js و source-identity-runtime.js را ندارد
- endpoint read runtime در نسخه عملیاتی فعلی وجود ندارد

همچنین در محیط بررسی‌شده:
- MAHAK_SOURCE_IDENTITY_READ_TOKEN تنظیم نشده
- MAHAK_SOURCE_IDENTITY_READ_PORT تنظیم نشده
- MAHAK_SOURCE_ID تنظیم نشده
- MAHAK_ORGANIZATION_ID تنظیم نشده
- هیچ Source Identity Read Runtime یا Product Monitoring BFF process فعال نبود

بنابراین endpoint از نظر operational deployment فعال نیست.

## تست‌های موجود

### Production Center BFF
npm test

نتیجه:
12 / 12 PASS

پوشش:
- durable source tuple
- canonical mapping
- server-side authorization
- source error normalization
- no secret/source-id leakage
- lifecycle hidden
- explicit configuration requirements

### Mahak
npm run test:source-identity

نتیجه:
154 / 154 PASS

از جمله:
- read contract projection
- sourceUpdatedAt semantics
- sold lifecycle
- fail-closed read path
- lineage/org/source/UID mismatch
- authenticated HTTP identity boundary

### Core
npm run test:core
npm run build:core
git diff --check

نتیجه:
PASS

## مهم‌ترین یافته C14

Read API واقعی موجود، Product Monitoring Identity API است.

این contract:
- هویت محصول را می‌دهد
- productCode/displayName/barcode/lifecycle/sourceUpdatedAt را پوشش می‌دهد

اما Command Center C13 انتظار ModuleObservationV1 مدیریتی دارد.

این دو contract یکی نیستند.

بنابراین Product Monitoring DTO نباید مستقیماً به Command Center Transport داده شود.

یک regression gate به Core اضافه شد که Product Monitoring identity DTO را به‌عنوان Command Center observation نامعتبر رد می‌کند.

## تصمیم

### Technical capability
GO

زنجیره واقعی زیر از نظر code contract وجود دارد:

Mahak Identity Read
→ Production Center real Mahak adapter
→ Canonical Mapping Registry
→ Product Monitoring BFF
→ Sanitized Product Monitoring DTO

### Operational activation
NO-GO

دلایل:
1. Mahak operational runtime code هنوز deploy نشده است.
2. read runtime credentials/config فعال نیست.
3. Product Monitoring BFF runtime در حال اجرا نیست.
4. trusted authenticateRequest deployment مشخص/فعال نیست.
5. مهم‌تر از همه، Product Monitoring identity contract برای Cockpit Command Center contract مناسب نیست.

### Direct C13/Cockpit connection
NO-GO

هیچ mapping ساختگی از Product Monitoring identity به ModuleObservation ساخته نمی‌شود.

## مرحله بعد

برای اولین داده واقعی Cockpit باید یک Read Contract مستقل تعریف شود که مستقیماً ModuleObservation-compatible یا قابل‌نگاشت به آن باشد.

Candidateهای منطقی:
- Workforce observation read
- Production observation read

هر candidate باید:
- owner مشخص
- freshness مشخص
- stable identifiers
- versioned sanitized DTO
- read-only authority
- no hidden mock fallback
- fixture مصوب
- adapter mapping test

داشته باشد.

تا آن زمان:
- C12 Live Gate بسته می‌ماند.
- C13 Transport فقط fixture/test است.
- Cockpit روی Mock باقی می‌ماند.
