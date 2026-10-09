import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { CommandCenterModuleOverview } from "../CommandCenterModuleOverview";
import {
  createClosedCoreAuthProvider,
  isCoreAuthEmail,
  isCoreAuthPassword,
  type CoreAuthProviderFactory,
} from "../../integration/auth/coreAuthProvider";
import type { CommandCenterRuntimeEnvironment } from "../../integration/commandCenter/commandCenterRuntimeEnvironment";

export interface CoreAuthBoundaryProps {
  authProviderFactory?: CoreAuthProviderFactory;
  runtimeEnvironmentFactory?: () => CommandCenterRuntimeEnvironment;
}

export function CoreAuthBoundary({
  authProviderFactory = createClosedCoreAuthProvider,
  runtimeEnvironmentFactory,
}: CoreAuthBoundaryProps) {
  const [provider] = useState(authProviderFactory);
  const [snapshot, setSnapshot] = useState(provider.getSnapshot);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localMessage, setLocalMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => provider.subscribe(setSnapshot), [provider]);

  const canSubmit = useMemo(
    () => snapshot.configured
      && snapshot.phase !== "authenticating"
      && !isSubmitting
      && isCoreAuthEmail(email)
      && isCoreAuthPassword(password),
    [email, isSubmitting, password, snapshot.configured, snapshot.phase],
  );

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalMessage(undefined);

    if (!isCoreAuthEmail(email)) {
      setLocalMessage("ایمیل کاری معتبر وارد کنید.");
      return;
    }
    if (!isCoreAuthPassword(password)) {
      setLocalMessage("رمز عبور باید حداقل ۸ نویسه باشد.");
      return;
    }
    if (!snapshot.configured) {
      setLocalMessage("اتصال احراز هویت هنوز فعال نشده است.");
      return;
    }

    setIsSubmitting(true);
    try {
      const outcome = await provider.signIn({
        email: email.trim(),
        password,
      });
      if (outcome.status !== "authenticated") {
        setLocalMessage(outcome.message);
      }
    } catch {
      setLocalMessage("ورود انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setPassword("");
      setIsSubmitting(false);
    }
  };

  if (snapshot.phase === "authenticated") {
    if (runtimeEnvironmentFactory) {
      return (
        <div className="core-shell">
          <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
          <CommandCenterModuleOverview runtimeEnvironmentFactory={runtimeEnvironmentFactory} />
        </div>
      );
    }

    return (
      <main className="core-auth core-auth--gate" id="core-auth-main" dir="rtl">
        <section className="core-auth-gate" aria-labelledby="core-auth-gate-title">
          <span className="core-auth-gate__icon" aria-hidden="true"><ShieldCheck size={28} /></span>
          <span className="core-auth-eyebrow">احراز هویت تأیید شد</span>
          <h1 id="core-auth-gate-title">مسیر داده مدیریتی هنوز بسته است</h1>
          <p>
            هویت کاربر تأیید شده، اما مسیر داده زنده هنوز به این بخش متصل نشده است.
            هیچ داده آزمایشی جای داده واقعی نمایش داده نمی‌شود.
          </p>
          <button type="button" onClick={() => void provider.signOut()}>
            خروج از نشست
          </button>
        </section>
      </main>
    );
  }

  const message = localMessage ?? snapshot.message;

  return (
    <main className="core-auth" id="core-auth-main" dir="rtl">
      <div className="core-auth-frame">
        <section className="core-auth-intelligence" aria-label="وضعیت دسترسی هسته">
          <header className="core-auth-brand">
            <div>
              <strong>MASTER GEM</strong>
              <span>هسته مرکز فرماندهی</span>
            </div>
            <span className="core-auth-brand__mark" aria-hidden="true"><ShieldCheck size={20} /></span>
          </header>

          <div className="core-auth-intelligence__body">
            <span className="core-auth-eyebrow">هسته مدیریتی مستر جم</span>
            <h1>یک ورودی امن برای مرکز فرماندهی</h1>
            <p>
              دسترسی این بخش فقط برای اعضای تأییدشده تیم است.
              ورود، هویت را مشخص می‌کند؛ مجوزها همچنان فقط از سیاست سمت سرور می‌آیند.
            </p>

            <div className="core-auth-status-grid" aria-label="وضعیت حفاظتی">
              <div>
                <span>هویت</span>
                <strong>احراز هویت امن</strong>
                <small>آماده اتصال، فعلاً غیرفعال</small>
              </div>
              <div>
                <span>مجوز</span>
                <strong>سیاست سرور</strong>
                <small>نقش مرورگر منبع اختیار نیست</small>
              </div>
              <div>
                <span>نشست</span>
                <strong>همین مرورگر</strong>
                <small>بدون «مرا به خاطر بسپار»</small>
              </div>
            </div>

            <div className="core-auth-signal" aria-hidden="true">
              <span />
              <span />
              <span />
              <i />
            </div>
          </div>

          <footer>
            <LockKeyhole size={15} aria-hidden="true" />
            <span>داده زنده تا احراز هویت و اتصال مسیر داده معتبر بسته می‌ماند.</span>
          </footer>
        </section>

        <section className="core-auth-panel" aria-labelledby="core-login-title">
          <div className="core-auth-panel__heading">
            <span className="core-auth-eyebrow">دسترسی داخلی</span>
            <h2 id="core-login-title">ورود به مرکز فرماندهی</h2>
            <p>با ایمیل کاری و رمز عبور حساب تأییدشده وارد شوید.</p>
          </div>

          <form className="core-auth-form" onSubmit={signIn} noValidate>
            <label>
              <span>ایمیل کاری</span>
              <span className="core-auth-input">
                <AtSign size={17} aria-hidden="true" />
                <input
                  autoComplete="username"
                  dir="ltr"
                  inputMode="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label>
              <span>رمز عبور</span>
              <span className="core-auth-input">
                <KeyRound size={17} aria-hidden="true" />
                <input
                  autoComplete="current-password"
                  dir="ltr"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                />
              </span>
            </label>

            {message && (
              <p
                className={`core-auth-message${snapshot.configured ? "" : " core-auth-message--closed"}`}
                role={snapshot.phase === "error" || localMessage ? "alert" : "status"}
              >
                {message}
              </p>
            )}

            <button className="core-auth-submit" disabled={!canSubmit} type="submit">
              <span>{snapshot.phase === "authenticating" || isSubmitting ? "در حال بررسی..." : "ورود امن"}</span>
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
          </form>

          <div className="core-auth-policy">
            <ShieldCheck size={16} aria-hidden="true" />
            <p>
              ثبت‌نام عمومی و بازیابی رمز در این نسخه وجود ندارد.
              حساب‌ها فقط توسط مدیر مجاز ایجاد می‌شوند.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
