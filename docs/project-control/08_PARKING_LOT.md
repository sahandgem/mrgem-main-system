# Parking Lot

موارد این فایل خارج از P24 هستند و نباید بدون فاز مصوب اجرا شوند.

## اولویت بالا

| موضوع | دلیل توقف | فاز پیشنهادی |
|---|---|---|
| ممیزی پوشش backup برای ۲۴ storage key | نیازمند تصمیم درباره recursion و داده‌های audit | P25 |
| تست round-trip کامل export/import/restore | باید بعد از policy پوشش backup تثبیت شود | P25 |
| اصلاح `analysis/TESTING.md` قدیمی | docs فعلی با runner واقعی ناسازگار است | P25 یا docs maintenance |

## معماری و نگهداری‌پذیری

| موضوع | وضعیت |
|---|---|
| انتقال implementation واقعی pageها از `WorkforcePages.tsx` | هنوز ۵۰۱۷ خط و shared chunk است |
| حذف dispatch تکراری path از `CurrentPage` | manifest هنوز تنها dispatcher واقعی نیست |
| تقسیم `models/workforce.ts` بر اساس bounded context | فعلاً یک فایل ۹۰۰+ خطی است |
| تقسیم `tests/analysis.test.ts` | ۱۵۳۷ خط و ۲۵۶ assertion در یک فایل |
| جایگزینی experimental loader تست | هشدار Node فعلی |
| تفکیک CSS page/print/layout | فعلاً یک فایل مشترک |

## QA آینده

- component tests برای فرم‌ها و Error Boundary
- browser smoke tests خودکار برای ۲۸ route
- accessibility audit برای keyboard، label و contrast
- تست mobile viewport در pipeline
- performance budget خودکار برای chunkها

## Integrationهای عمداً پارک‌شده

- Supabase یا backend
- login، role و access control
- sync چند دستگاه
- push notification، email و SMS
- Google Calendar یا Outlook sync
- history server-side و audit غیرقابل‌تغییر
- migration framework برای schemaهای localStorage

## نیازمند تأیید دستی

- آیا P23 خارج از repository انجام شده است؟
- آیا خروج عمدی signoff/resignoff/archive از backup قبلاً تصمیم‌گیری شده است؟
- آیا alias `/decision-reports` هنوز مصرف‌کننده بیرونی دارد؟
