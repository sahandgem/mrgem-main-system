# C38 — محافظ Runtime در مسیر مدیر

تاریخ: 2026-10-09

## هدف

جلوگیری از نمایش داده آزمایشی در مسیر اصلی مدیر، حتی اگر کاربر به‌درستی authenticate شود و یک Runtime آزمایشی به‌اشتباه تزریق شده باشد.

## مرز تصمیم

ورود موفق به‌تنهایی اجازه نمایش Cockpit نیست.

دو شرط جدا:
1. AuthProvider کاربر را authenticated اعلام کند.
2. Runtime تزریق‌شده واقعاً از نوع Live باشد.

بدون شرط دوم، صفحه «مسیر داده مدیریتی هنوز بسته است» نمایش داده می‌شود.

## تغییرات

- `managerRuntimeGate.ts`: بررسی `sourceMode === "live"` و `runtime.getState().sourceKind === "live"` و نبود کنترل سناریوی آزمایشی.
- `CoreAuthBoundary.tsx`: پس از Auth موفق، مسیر مدیر ابتدا این Gate را بررسی می‌کند.
- Runtime از طریق factory فقط در کامپوننت authenticated ساخته می‌شود، نه قبل از ورود.
- خطای factory یا Runtime مشکوک، fail-closed است و به نمایش Mock منجر نمی‌شود.
- دکمه خروج نشست در Cockpitِ مجاز به‌صورت قابل مشاهده قرار دارد.
- `managerRuntimeGate.test.ts`: تست Mode واقعی/آزمایشی، spoof و بسته‌بودن Gate خواندن Live.

## رفتارهای تأییدشده در طراحی

- بدون Auth: فرم ورود؛ هیچ Runtime manager ساخته نمی‌شود.
- Auth موفق بدون Runtime: Gate بسته.
- Auth موفق با Runtime Mock: Gate بسته.
- Auth موفق با Runtime جعلی که فقط `sourceMode=live` دارد: Gate بسته.
- Auth موفق با Runtime Live: Cockpit قابل Mount است، اما LiveDataSource.enabled همچنان Gate مستقل خود را دارد.
- Live غیرفعال: هیچ Snapshot واقعی یا Demo نمایش داده نمی‌شود؛ خطای خواندن امن باقی می‌ماند.

## محدودیت امنیتی

این Gate یک کنترل ایمنی Composition سمت UI است، نه جایگزین Authorization سمت سرور.

اعتبار JWT، وجود session، سازمان و capability همیشه باید در BFF با قراردادهای C28/C34 بررسی شوند.

فقط نمایش‌ندادن Mock را در مسیر مدیر تضمین می‌کند، نه حقیقی‌بودن داده با اعتماد به مرورگر.

## تغییر داده واقعی

انجام نشده:
- هیچ fetch یا سرویس جدید
- هیچ credential یا provider واقعی
- هیچ migration
- هیچ تماس با Supabase Production
- هیچ push، merge یا deploy

## مرحله بعد

C39 — Readiness و Activation Rehearsal Plan بدون روشن‌کردن Production.

باید نوع Executor شبکه‌ای، Auth واقعی و سیاست Capability به‌صورت مستقل و با تأیید صریح قبل از دسترسی به داده واقعی بررسی شوند.
