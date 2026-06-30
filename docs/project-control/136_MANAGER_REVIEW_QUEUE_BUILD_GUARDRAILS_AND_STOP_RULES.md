# Manager Review Queue Build Guardrails and Stop Rules

آخرین به‌روزرسانی: 2026-06-30

## قبل از Build آینده

- branch برابر `prototype/cockpit-overview-isolated` باشد.
- git status پاک و checkpoint ثبت‌شده باشد.
- Final File Scope تایید شده باشد.
- mock fixture contract آماده باشد.
- Test Plan و Rollback Plan آماده باشند.
- Rollback Owner و Test Owner مشخص باشند.
- Overview prototype frozen و دست‌نخورده باشد.

## Guardrailهای حین Build

- فقط پوشه `prototypes/cockpit-manager-review-queue/` تغییر کند.
- فقط شش فایل مصوب ساخته شوند.
- داده فقط synthetic/mock باشد.
- actionها فقط concept و read-only باشند.
- banner واضح prototype و resetپذیری demo state حفظ شوند.
- AI فقط suggestion باشد.
- risk، confidence، audit و blocked reason visible باشند.

## Stop Rules

در صورت نیاز یا مشاهده هر مورد زیر، build فوراً متوقف شود:

- route یا navigation اصلی
- تغییر `src/`
- تغییر `package.json` یا dependency
- database یا migration
- auth یا نقش واقعی
- localStorage یا sessionStorage
- fetch، API یا backend
- داده واقعی
- action، write یا status mutation واقعی
- production service/component dependency
- تغییر Overview prototype
- تغییر main یا تلاش برای merge
- فایل خارج از scope

## بعد از Build آینده

- static review اجرا و ثبت شود.
- Test Plan روی fixtureهای mock اجرا شود.
- manual visual review انجام شود.
- rollback path و حذف کامل پوشه قابل تایید باشند.
- نتیجه review با یکی از outcomeهای مصوب ثبت شود.
- merge همچنان موضوع تصمیم مستقل آینده باقی بماند.

## قانون

Approval P46 مجوز عبور از هیچ stop rule نیست.
