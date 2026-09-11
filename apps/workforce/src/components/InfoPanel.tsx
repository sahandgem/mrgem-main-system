import type { StatusTone } from "../models/workforce";
import { toPersianNumber } from "../models/workforce";
import { StatusBadge } from "./StatusBadge";

type PanelItem = {
  title: string;
  caption: string;
  tone: StatusTone;
};

type SpaceCapacity = {
  name: string;
  usage: number;
  caption: string;
  tone: StatusTone;
};

export function InfoPanel({ title, items }: { title: string; items: PanelItem[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-list">
        {items.map((item) => (
          <article className={`panel-row tone-${item.tone}`} key={item.title}>
            <StatusBadge tone={item.tone}>{item.title}</StatusBadge>
            <p>{item.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CapacityPanel({ items }: { items: SpaceCapacity[] }) {
  return (
    <section className="panel">
      <h2>ظرفیت فضاها</h2>
      <div className="capacity-list">
        {items.map((item) => (
          <article className="capacity-row" key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.caption}</span>
            </div>
            <div className="capacity-meter" aria-label={`ظرفیت ${item.name}`}>
              <span className={`tone-${item.tone}`} style={{ width: `${item.usage}%` }} />
            </div>
            <b>{toPersianNumber(item.usage)}٪</b>
          </article>
        ))}
      </div>
    </section>
  );
}
