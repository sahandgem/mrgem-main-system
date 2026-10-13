import type { Employee, Space, StatusTone, TaskType, WeeklyScheduleItem, WorkDay } from "../models/workforce";
import { toPersianNumber, weekDays, workingHours } from "../models/workforce";
import { StatusBadge } from "./StatusBadge";

export type ScheduleFilters = {
  employeeId: string;
  spaceId: string;
  taskTypeId: string;
  day: string;
};

function taskTone(task?: TaskType): StatusTone {
  if (!task) return "empty";
  if (task.requiresCustomerPresence) return "sales";
  if (task.category.includes("دیجیتال") || task.focusNeed === "زیاد") return "focus";
  if (task.category.includes("استراحت")) return "break";
  if (task.needsCleanSpace) return "info";
  return "good";
}

function isInHour(item: WeeklyScheduleItem, hour: string) {
  const start = Number(item.startTime.slice(0, 2));
  const end = Number(item.endTime.slice(0, 2));
  const current = Number(hour);
  return current >= start && current < end;
}

export function WeeklyGrid({
  compact = false,
  items,
  employees,
  spaces,
  taskTypes,
  filters,
}: {
  compact?: boolean;
  items: WeeklyScheduleItem[];
  employees: Employee[];
  spaces: Space[];
  taskTypes: TaskType[];
  filters?: Partial<ScheduleFilters>;
}) {
  const visibleItems = items.filter((item) => {
    if (!item.isActive) return false;
    if (filters?.employeeId && item.employeeId !== filters.employeeId) return false;
    if (filters?.spaceId && item.spaceId !== filters.spaceId) return false;
    if (filters?.taskTypeId && item.taskTypeId !== filters.taskTypeId) return false;
    if (filters?.day && item.day !== filters.day) return false;
    return true;
  });

  return (
    <section className={`weekly-grid-shell ${compact ? "compact" : ""}`}>
      <div className="weekly-grid">
        <div className="grid-corner">ساعت</div>
        {weekDays.map((day) => (
          <div className="day-header" key={day}>
            {day}
          </div>
        ))}
        {workingHours.map((hour) => (
          <div className="grid-row" key={hour}>
            <div className="hour-cell">{toPersianNumber(hour)}:۰۰</div>
            {weekDays.map((day) => {
              const blocks = visibleItems.filter((item) => item.day === day && isInHour(item, hour));
              return (
                <div className={`schedule-cell ${blocks.length ? "has-block" : ""}`} key={`${day}-${hour}`}>
                  {blocks.length ? (
                    blocks.map((block) => {
                      const employee = employees.find((item) => item.id === block.employeeId);
                      const space = spaces.find((item) => item.id === block.spaceId);
                      const task = taskTypes.find((item) => item.id === block.taskTypeId);
                      const tone = taskTone(task);
                      return (
                        <div className={`schedule-block tone-${tone}`} key={block.id}>
                          <div className="block-topline">
                            <strong>{employee?.name ?? "کارمند حذف‌شده"}</strong>
                            <StatusBadge tone={tone}>{space?.name ?? "فضای حذف‌شده"}</StatusBadge>
                          </div>
                          <span>{task?.name ?? "نوع کار حذف‌شده"}</span>
                          <small>
                            {toPersianNumber(block.startTime)} تا {toPersianNumber(block.endTime)}
                          </small>
                        </div>
                      );
                    })
                  ) : (
                    <span className="empty-slot">خالی</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export function dayOptions() {
  return [{ label: "همه روزها", value: "" }, ...weekDays.map((day: WorkDay) => ({ label: day, value: day }))];
}
