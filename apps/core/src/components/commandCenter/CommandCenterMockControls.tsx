import { FlaskConical } from "lucide-react";
import type { CommandCenterMockScenario } from "../../integration/commandCenter/commandCenterMockDataSource";
import { StatusBadge, type StatusTone } from "../StatusBadge";

export interface ScenarioOption {
  key: CommandCenterMockScenario;
  label: string;
  title: string;
  description: string;
  tone: StatusTone;
}

export function CommandCenterMockControls({
  activeScenario,
  disabled,
  options,
  onSelect,
}: {
  activeScenario: CommandCenterMockScenario;
  disabled: boolean;
  options: readonly ScenarioOption[];
  onSelect: (scenario: CommandCenterMockScenario) => void;
}) {
  const active = options.find((item) => item.key === activeScenario) ?? options[0];
  return (
    <details className="mock-controls">
      <summary aria-label="کنترل تست سناریوهای داده"><FlaskConical aria-hidden="true" size={16} /><span>کنترل تست سناریوهای داده</span><StatusBadge tone={active.tone}>{active.label}</StatusBadge></summary>
      <div className="mock-controls__body">
        <div><strong>{active.title}</strong><p>{active.description}</p></div>
        <div className="mock-controls__options" role="group" aria-label="انتخاب سناریوی داده mock">
          {options.map((option) => (
            <button
              aria-pressed={activeScenario === option.key}
              disabled={disabled}
              key={option.key}
              onClick={() => onSelect(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
