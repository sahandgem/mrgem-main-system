import { Boxes, ShieldCheck } from "lucide-react";
import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";

export function App() {
  return (
    <div className="core-shell">
      <a className="skip-link" href="#main">رفتن به محتوای اصلی</a>
      <header className="core-topbar">
        <div className="core-brand">
          <span className="core-brand-mark"><Boxes aria-hidden="true" size={24} /></span>
          <div><strong>مستر جم</strong><span>هسته مرکزی · محیط توسعه</span></div>
        </div>
        <nav aria-label="بخش‌های هسته">
          <a href="#command-center">تصویر مدیریتی</a>
          <a href="#attention-title">صف توجه</a>
          <a href="#module-entry-title">ماژول‌ها</a>
        </nav>
      </header>
      <main id="main">
        <section className="core-intro" aria-labelledby="core-title">
          <div>
            <span className="eyebrow">MASTER GEM / CORE</span>
            <h1 id="core-title">مرکز فرمان مستر جم</h1>
            <p>یک نمای کوتاه برای فهم وضعیت، تشخیص ریسک و رفتن به محل درست بررسی.</p>
          </div>
          <div className="core-safety"><ShieldCheck aria-hidden="true" size={20} /><span>فقط‌خواندنی<br /><strong>بدون اتصال عملیاتی</strong></span></div>
        </section>
        <div className="core-notice" role="note">
          همه داده‌های این نسخه ساختگی‌اند. Production صرفاً معماری UI را نشان می‌دهد و منطق نهایی یا اتصال واقعی ندارد.
        </div>
        <div id="command-center"><CommandCenterModuleOverview /></div>
      </main>
      <footer>Core خلاصه مدیریتی را نمایش می‌دهد؛ حقیقت عملیاتی و اقدام اجرایی در ماژول مبدأ باقی می‌ماند.</footer>
    </div>
  );
}
