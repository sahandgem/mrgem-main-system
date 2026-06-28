import type { WeeklyScheduleItem } from "../models/workforce";

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function durationHours(item: Pick<WeeklyScheduleItem, "startTime" | "endTime">) {
  return Math.max(0, (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60);
}

export function overlaps(
  a: Pick<WeeklyScheduleItem, "day" | "startTime" | "endTime">,
  b: Pick<WeeklyScheduleItem, "day" | "startTime" | "endTime">,
) {
  return a.day === b.day && timeToMinutes(a.startTime) < timeToMinutes(b.endTime) && timeToMinutes(b.startTime) < timeToMinutes(a.endTime);
}

export function isNearInTime(
  a: Pick<WeeklyScheduleItem, "day" | "startTime" | "endTime">,
  b: Pick<WeeklyScheduleItem, "day" | "startTime" | "endTime">,
  thresholdMinutes = 60,
) {
  if (a.day !== b.day || overlaps(a, b)) return false;
  const gap = Math.min(
    Math.abs(timeToMinutes(a.endTime) - timeToMinutes(b.startTime)),
    Math.abs(timeToMinutes(b.endTime) - timeToMinutes(a.startTime)),
  );
  return gap <= thresholdMinutes;
}

export function overlapWindow(items: Array<Pick<WeeklyScheduleItem, "startTime" | "endTime">>) {
  const start = Math.max(...items.map((item) => timeToMinutes(item.startTime)));
  const end = Math.min(...items.map((item) => timeToMinutes(item.endTime)));
  return {
    startTime: minutesToTime(start),
    endTime: minutesToTime(end),
  };
}
