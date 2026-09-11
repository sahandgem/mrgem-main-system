import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface RouteErrorBoundaryProps { children: ReactNode; }
interface RouteErrorBoundaryState { hasError: boolean; }

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Workforce route failed to render", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="route-error" dir="rtl">
        <AlertTriangle size={30} />
        <div><h1>این صفحه کامل بارگذاری نشد</h1><p>داده‌های شما تغییری نکرده‌اند. صفحه را دوباره بارگذاری کنید یا به داشبورد برگردید.</p></div>
        <div className="row-actions"><button className="primary-button" type="button" onClick={() => window.location.reload()}><RotateCcw size={17} /> بارگذاری دوباره</button><a className="ghost-button" href="/organization/workforce-dashboard">بازگشت به داشبورد</a></div>
      </section>
    );
  }
}
