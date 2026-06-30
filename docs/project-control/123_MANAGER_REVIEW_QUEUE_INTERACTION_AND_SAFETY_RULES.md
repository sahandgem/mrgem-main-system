# Manager Review Queue Interaction and Safety Rules

آخرین به‌روزرسانی: 2026-06-30

## تعریف

این سند رفتارهای مجاز concept و guardrailهای Manager Review Queue را مشخص می‌کند تا صفحه آینده به decision mutation واقعی یا production dependency تبدیل نشود.

## قوانین Interaction

- کلیک روی item فقط detail panel مفهومی را باز کند.
- مشاهده evidence و audit timeline فقط read-only concept باشد.
- AI suggestion فقط پیشنهاد همراه reason و confidence باشد.
- هر decision حساس، reason placeholder قابل مشاهده داشته باشد.
- `conflict` و `manual_only` هرگونه auto action را مسدود کنند.
- `audit_missing` تصمیم حساس را block کند.
- `low confidence` همیشه به review انسانی برود.
- actionهای concept نباید success واقعی یا status mutation القا کنند.

## قوانین Visual

- priority، risk و confidence سه نشانه مستقل باشند.
- audit state در list و detail panel قابل مشاهده باشد.
- blocked reason هرگز پشت tooltip یا interaction ثانویه پنهان نشود.
- urgent فقط با رنگ مشخص نشود و label متنی داشته باشد.
- AI suggestion از decision panel انسانی تفکیک شود.
- empty، loading mock، error mock و blocked state از هم قابل تشخیص باشند.

## قوانین ایمنی

- no real write
- no real approval or rejection
- no real status change
- no localStorage or sessionStorage
- no database or migration
- no auth or real roles
- no fetch، API یا backend
- no production dependency
- no main route or navigation
- no real financial، product، bank، Mahak، employee یا customer data

## Stop Rules آینده

اگر طراحی یا prototype احتمالی به route، storage، database، auth، production service، real data یا decision mutation نیاز پیدا کرد، کار باید متوقف و approval جدید درخواست شود.

## خروجی P43

صفحه فقط برای concept و تصمیم آینده درباره prototype آماده می‌شود. Prototype Build، Main Integration و Implementation همچنان `NOT_APPROVED` هستند.
