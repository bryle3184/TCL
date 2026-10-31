import mongoose, { Schema, type Model } from "mongoose";

export type CalendarEvent = {
  host?: string;
  topic?: string;
  time?: string;
  platform?: string;
  employee?: string;
  reason?: string;
  id?: string;
};

export type CalendarMap = Record<string, CalendarEvent[]>;

/**
 * Legacy calendar documents store a map of dateKey -> events inside a
 * nested `date` array. The shape has varied between writes, so both the
 * reader and writer below normalize defensively.
 */
export interface CalendarDocument {
  _id: mongoose.Types.ObjectId;
  date?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

const CalendarSchema = new Schema<CalendarDocument>(
  {
    date: { type: Schema.Types.Mixed, default: undefined },
  },
  { strict: false, timestamps: true },
);

function calendarModel(name: string, collection: string) {
  return (
    (mongoose.models[name] as Model<CalendarDocument>) ??
    mongoose.model<CalendarDocument>(name, CalendarSchema, collection)
  );
}

export const LiveCalendar = calendarModel("LiveCalendar", "live_calendars");
export const LeaveCalendar = calendarModel("LeaveCalendar", "leave_calendars");

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

export function normalizeCalendar(raw: unknown): CalendarMap {
  let value = raw;

  // Unwrap arrays until we reach a plain object map.
  for (let i = 0; i < 5 && Array.isArray(value); i += 1) {
    value = value[0];
  }

  if (!isPlainObject(value)) return {};

  const map: CalendarMap = {};
  for (const [dateKey, events] of Object.entries(value)) {
    if (Array.isArray(events)) {
      map[dateKey] = events.filter(isPlainObject) as CalendarEvent[];
    }
  }

  return map;
}

export function calendarWriteDate(map: CalendarMap): unknown[] {
  return [map];
}
