# Product Feature Import Mapping and Review Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مسیر امن mapping featureهای کالا از منابع خارجی یا داخلی به مدل attribute مستر جم را طراحی می‌کند و مشخص می‌کند کدام موارد باید review شوند. این مرحله فقط مستندسازی است.

## Product Feature Import Mapping چیست؟

Product Feature Import Mapping یعنی تبدیل داده خام یا نیمه‌ساختاریافته از منابع مختلف به `attributeKey`های مفهومی و validate شده مستر جم. mapping نباید مستقیم از داده خام به main انجام شود؛ باید از staging، normalize، validation، confidence و audit عبور کند.

## featureها از کجا می‌آیند؟

| منبع | توضیح |
|---|---|
| Product Excel | فایل‌های کالا یا import آینده |
| Mahak historical data | داده تاریخی فقط از مسیر staging و بدون وابستگی schema |
| Stone bank | مرجع سنگ و ویژگی‌های مرتبط |
| Group codes | کد یا گروه کالا پس از normalize |
| Manual input | ورود دستی کنترل‌شده توسط کاربر مجاز |
| Mobile capture future | داده جمع‌آوری‌شده از اپ موبایل آینده |
| Production formula future | featureهای تولیدی پس از طراحی فرمول در فاز مستقل |

## مسیر امن

1. `raw feature input`
2. `staging`
3. `normalize`
4. `map to attributeKey`
5. `validate`
6. `confidence score`
7. `duplicate/conflict check`
8. `review if needed`
9. `approved import`
10. `audit trail`

## موارد نیازمند review

| مورد | دلیل review |
|---|---|
| unknown feature | feature ناشناخته نباید مستقیم وارد main شود |
| wrong unit | واحد اشتباه می‌تواند وزن، قیمت یا تولید را خراب کند |
| suspicious weight | وزن مشکوک روی قیمت، موجودی و تولید اثر دارد |
| duplicate barcode | بارکد تکراری باید block یا review شود |
| mismatched stone | ناسازگاری سنگ با بانک سنگ یا گروه کالا |
| product group mismatch | اختلاف گروه کالا با داده موجود یا source |
| pricing-impact conflict | conflict در featureهای اثرگذار روی قیمت |
| production-impact conflict | conflict در featureهای اثرگذار روی تولید |
| low confidence | داده کم‌اطمینان نباید auto import شود |
| manual-only mapping | mapping حساس فقط با تصمیم انسانی انجام می‌شود |

## قوانین

- داده محک فقط از staging و validation وارد شود.
- feature ناشناخته مستقیم وارد main نشود.
- mapping حساس باید audit داشته باشد.
- mapping دارای conflict یا duplicate candidate باید review شود.
- mapping اثرگذار روی قیمت یا تولید بدون validation و confidence قابل قبول تایید نشود.
- raw input نباید وارد AI snapshot یا reporting نهایی شود.
- auto-fix candidate باید به عنوان پیشنهاد ثبت شود و اعمال آن audit/approval لازم دارد.

## خروجی‌های آینده

- `ProductFeatureImportMapping`
- `ProductFeatureMappingDecision`
- `ProductFeatureReviewItem`
- `ProductFeatureImportAuditTrail`
- `ProductAttributeValidationReport`
- `ProductFeatureAutoFixSuggestion`

## محدودیت فعلی

این سند import engine، UI، database، migration، route یا localStorage key نمی‌سازد و هیچ پروژه خارجی را merge نمی‌کند.
