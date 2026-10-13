import { Edit3, Plus, RotateCcw, Save, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { StatusTone } from "../models/workforce";
import { StatusBadge } from "./StatusBadge";

export type EntityColumn<T> = {
  label: string;
  render: (item: T) => ReactNode;
};

export function EntityPanel<T extends { id: string; isActive: boolean }>({
  title,
  subtitle,
  addLabel,
  rows,
  columns,
  editingId,
  error,
  form,
  onNew,
  onEdit,
  onDeactivate,
  onCancel,
  onSubmit,
  onResetDemo,
}: {
  title: string;
  subtitle: string;
  addLabel: string;
  rows: T[];
  columns: EntityColumn<T>[];
  editingId: string | null;
  error: string;
  form: ReactNode;
  onNew: () => void;
  onEdit: (item: T) => void;
  onDeactivate: (id: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onResetDemo: () => void;
}) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">مدیریت P1</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={onResetDemo}>
            <RotateCcw size={17} /> بازگشت demo
          </button>
          <button className="primary-button" type="button" onClick={onNew}>
            <Plus size={17} /> {addLabel}
          </button>
        </div>
      </header>

      <section className="management-layout">
        <section className="config-card">
          <h2>{editingId ? "ویرایش رکورد" : "افزودن رکورد"}</h2>
          {error && <p className="form-error">{error}</p>}
          <div className="field-grid">{form}</div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={onSubmit}>
              <Save size={16} /> ذخیره
            </button>
            <button className="ghost-button" type="button" onClick={onCancel}>
              <XCircle size={16} /> انصراف
            </button>
          </div>
        </section>

        <section className="config-card table-card">
          <h2>لیست ثبت‌شده</h2>
          <div className="entity-table">
            {rows.map((row) => (
              <article className={row.isActive ? "" : "inactive-row"} key={row.id}>
                <div className="entity-main">
                  {columns.map((column) => (
                    <div key={column.label}>
                      <small>{column.label}</small>
                      <strong>{column.render(row)}</strong>
                    </div>
                  ))}
                </div>
                <div className="row-actions">
                  <StatusBadge tone={row.isActive ? ("good" as StatusTone) : ("empty" as StatusTone)}>
                    {row.isActive ? "فعال" : "غیرفعال"}
                  </StatusBadge>
                  <button type="button" onClick={() => onEdit(row)}>
                    <Edit3 size={15} /> ویرایش
                  </button>
                  {row.isActive && (
                    <button className="danger-button" type="button" onClick={() => onDeactivate(row.id)}>
                      غیرفعال‌سازی
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "time";
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field field-textarea">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-field">
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
