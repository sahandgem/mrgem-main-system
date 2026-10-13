import type { ReactNode } from "react";

export type StatusTone = "good" | "warn" | "critical" | "focus" | "info" | "empty";

export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}
