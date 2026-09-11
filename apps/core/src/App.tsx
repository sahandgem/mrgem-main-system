import { Boxes, Cable, ShieldCheck } from "lucide-react";
import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";

const plannedConnections = [
  { name: "ورود کالا · محک", scope: "اولین نامزد اتصال؛ منتظر تأیید مرز آداپتور و هویت منبع" },
  { name: "حسابرسی", scope: "تحلیل مالی در پروژه خودش؛ ارائه خلاصه مدیریتی از طریق قرارداد" },
  { name: "مرکز تولید", scope: "عملیات تولید در پروژه خودش؛ ارائه وضعیت و هشدارها از طریق قرارداد" },
  { name: "برنامه هفتگی", scope: "کارکنان، برنامه‌ریزی و داده‌ها در محیط مستقل Workforce" },
];

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
          <a href="#command-center">مرکز فرمان</a>
          <a href="#connections">نقشه اتصال‌ها</a>
        </nav>
      </header>
      <main id="main">
        <section className="core-intro" aria-labelledby="core-title">
          <div>
            <span className="eyebrow">MASTER GEM / CORE</span>
            <h1 id="core-title">هسته مرکزی مستر جم</h1>
            <p>یک دید مدیریتی مشترک؛ هر پروژه با منطق و محیط توسعه مستقل خودش.</p>
          </div>
          <div className="core-safety"><ShieldCheck aria-hidden="true" size={20} /><span>فقط‌خواندنی<br /><strong>بدون اتصال عملیاتی</strong></span></div>
        </section>
        <div className="core-notice" role="note">
          این محیط آزمایشی است. شاخص‌ها و هشدارهای زیر ساختگی‌اند و وضعیت واقعی کسب‌وکار را نشان نمی‌دهند.
        </div>
        <div id="command-center"><CommandCenterModuleOverview /></div>
        <section id="connections" className="core-connections" aria-labelledby="connections-title">
          <div className="core-section-heading"><Cable aria-hidden="true" size={21} /><h2 id="connections-title">نقشه اتصال‌های آینده</h2></div>
          <p>این فهرست نقشه توسعه است، نه فهرست سامانه‌های متصل. اتصال واقعی هر پروژه نیازمند بررسی و تأیید جداگانه است.</p>
          <div className="connection-grid">
            {plannedConnections.map((connection) => (
              <article className="connection-card" key={connection.name}>
                <span className="connection-state">متصل نشده</span>
                <h3>{connection.name}</h3><p>{connection.scope}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>Core صاحب خلاصه و قرارداد اتصال است؛ اطلاعات عملیاتی در پروژه مبدأ می‌مانند.</footer>
    </div>
  );
}
