import type { ReactNode } from "react";
import type { StatusTone } from "../models/workforce";

export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}
