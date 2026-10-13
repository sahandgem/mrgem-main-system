# C36 — آداپتر احراز هویت مرورگر

تاریخ: 2026-10-09

## هدف

آماده‌کردن رفتار واقعی Login / Session / Logout بر اساس API رسمی Supabase، بدون اتصال Core به پروژه واقعی و بدون شکستن Boundary فعلی.

C36 هیچ Supabase Client واقعی نمی‌سازد.

## اصل معماری

Core فقط یک client تزریقی با قرارداد محدود می‌شناسد.

فایل:

`apps/core/src/integration/auth/supabaseBrowserAuthAdapter.ts`

Core در C36 نمی‌داند:
- URL پروژه چیست
- Publishable Key چیست
- SDK از کجا می‌آید
- شبکه چگونه اجرا می‌شود
- storage مرورگر دقیقاً کجا قرار دارد

این مسئولیت برای phase فعال‌سازی بعدی خارج از Boundary فعلی باقی می‌ماند.

## APIهای مدل‌شده

آداپتر فقط این رفتارهای Supabase Auth را مدل می‌کند:

- `getSession()`
- `signInWithPassword({ email, password })`
- `signOut({ scope: "local" })`
- `onAuthStateChange(...)`

## Construction

ساخت آداپتر inert است.

در constructor:
- getSession صدا نمی‌شود
- signIn صدا نمی‌شود
- signOut صدا نمی‌شود
- network وجود ندارد

## Initialize

`initialize()`

کارها:
1. subscription وضعیت Auth را ثبت می‌کند.
2. یک بار نشست موجود را می‌خواند.
3. اگر access token معتبر وجود داشته باشد، snapshot را authenticated می‌کند.
4. در غیر این صورت unauthenticated می‌ماند.

Initialize برای React StrictMode قابل تکرار است.

Sequence guard مانع می‌شود پاسخ دیرهنگام initialize قدیمی وضعیت lifecycle جدید را overwrite کند.

## Snapshot

Snapshot فقط اطلاعات امن UI را نگه می‌دارد:

- phase
- configured
- email
- manager-safe message

Snapshot شامل این موارد نیست:
- access token
- refresh token
- user_metadata
- role
- capability
- organization authority

## Access token

Access token فقط در حافظه داخلی adapter نگه‌داری می‌شود.

دسترسی:

`getAccessToken()`

فقط وقتی phase برابر authenticated باشد token را برمی‌گرداند.

## Login

`signIn()`

قبل از provider:
- email validate می‌شود
- password حداقل ۸ نویسه است

سپس فقط این فراخوانی انجام می‌شود:

`signInWithPassword({ email, password })`

خطای خام provider به UI عبور نمی‌کند.

خطای credential به پیام امن فارسی تبدیل می‌شود.

## Auth events

Eventهای دارای session معتبر، access token حافظه‌ای را به‌روزرسانی می‌کنند.

نمونه:

`TOKEN_REFRESHED`

token جدید جای token قبلی را می‌گیرد.

`SIGNED_OUT`

بلافاصله:
- access token پاک می‌شود
- snapshot unauthenticated می‌شود

## Logout

Logout معمولی دقیقاً:

`signOut({ scope: "local" })`

است.

قبل از پاسخ provider:
- access token محلی پاک می‌شود
- UI از حالت authenticated خارج می‌شود

اگر provider logout fail شود:
- token قدیمی برنمی‌گردد
- وضعیت fail-closed باقی می‌ماند
- raw error نمایش داده نمی‌شود

C34 در سمت BFF نیز session_id را با auth.sessions بررسی خواهد کرد؛ در Activation واقعی این دو لایه با هم logout فوری را enforce می‌کنند.

## Session policy options

Helper:

`buildSupabaseBrowserAuthClientOptions(storage)`

Policy:

- persistSession = true
- autoRefreshToken = true
- detectSessionInUrl = false
- storage = injected storage

Core خودش browser storage را باز نمی‌کند.

این فقط قرارداد C33 را برای adapter واقعی آینده فریز می‌کند.

## Lifecycle

`dispose()`

کارها:
- subscription را unsubscribe می‌کند
- token حافظه‌ای را پاک می‌کند
- listenerها را پاک می‌کند
- initialize مجدد را برای StrictMode ممکن نگه می‌دارد

## CoreAuthBoundary

C35 shell حالا provider را:

- subscribe
- initialize
- cleanup
- dispose

می‌کند.

خطای initialize به پیام امن UI تبدیل می‌شود.

## Tests

فایل جدید:

`apps/core/tests/supabaseBrowserAuthAdapter.test.ts`

پوشش:
- construction inert
- restore بدون session
- restore با session
- token خارج از snapshot
- signInWithPassword exact credentials
- raw error sanitization
- invalid credential fail-before-client
- TOKEN_REFRESHED
- SIGNED_OUT
- local-scope signOut
- signOut failure fail-closed
- dispose + StrictMode-style reinitialize
- session policy options

## Final Gate

Workspace boundary:
PASS

Core همچنان:
- browser business storage مستقیم ندارد
- network primitive ندارد
- hidden implementation ندارد

Core suites:
PASS

Build:
PASS

diff check:
PASS

## Audit

در `apps/core/src` هیچ موردی از این‌ها وجود ندارد:

- @supabase/supabase-js import
- Production project ref
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- service role key
- secret key
- direct browser storage primitive
- direct network primitive

`main.tsx` هنوز فقط:

`<App />`

را render می‌کند.

بنابراین Auth واقعی هنوز فعال نشده است.

## Production state

Real Supabase Client:
NOT CREATED

Real Auth traffic:
NONE

Real Login:
NONE

Real Session:
NONE

Live Runtime:
NOT ACTIVATED

Production data:
NOT READ

Push / Merge / Deploy:
NOT PERFORMED

## مرحله بعد

C37 — Authenticated BFF Request Contract

هدف بعدی باید آماده‌کردن handoff امن access token به transport BFF باشد، بدون اتصال واقعی شبکه.

تمرکز:
- Bearer header فقط از getAccessToken
- عدم ارسال refresh token
- 401 → Auth state invalidation / login
- no browser role/org/capability headers
- existing Runtime injection حفظ شود
- synthetic transport tests
- Live gate همچنان بسته
