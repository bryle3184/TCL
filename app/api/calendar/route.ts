import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  LeaveCalendar,
  LiveCalendar,
  calendarWriteDate,
  normalizeCalendar,
  type CalendarDocument,
  type CalendarMap,
} from "@/lib/models/calendar";
import type { Model } from "mongoose";
import {
  calendarDeleteSchema,
  calendarEventMutationSchema,
} from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";
import { PLATFORMS } from "@/lib/constants";

function modelFor(type: string | null): Model<CalendarDocument> {
  if (type === "live") return LiveCalendar;
  if (type === "leave") return LeaveCalendar;
  throw new ApiError("Unknown calendar type.", 400);
}

async function readMap(model: Model<CalendarDocument>): Promise<CalendarMap> {
  const doc = await model.findOne().sort({ _id: 1 }).lean();
  return normalizeCalendar(doc?.date);
}

async function writeMap(
  model: Model<CalendarDocument>,
  map: CalendarMap,
): Promise<void> {
  const doc = await model.findOne().sort({ _id: 1 });

  if (doc) {
    doc.set("date", calendarWriteDate(map));
    doc.markModified("date");
    await doc.save();
    return;
  }

  await model.create({ date: calendarWriteDate(map) });
}

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const type = request.nextUrl.searchParams.get("type");
    const model = modelFor(type);
    return ok({ events: await readMap(model) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const type = request.nextUrl.searchParams.get("type");
    const model = modelFor(type);
    const data = calendarEventMutationSchema.parse(await request.json());

    if (type === "live") {
      if (!data.event.host || !data.event.topic) {
        throw new ApiError("Host and topic are required.", 422);
      }
      if (data.event.platform && !PLATFORMS.includes(data.event.platform as (typeof PLATFORMS)[number])) {
        throw new ApiError("Unsupported platform.", 422);
      }
    } else if (!data.event.employee) {
      throw new ApiError("Employee name is required.", 422);
    }

    const map = await readMap(model);
    const events = map[data.date] ?? [];

    if (data.index !== undefined && data.index < events.length) {
      events[data.index] = data.event;
    } else {
      events.push(data.event);
    }

    map[data.date] = events;
    await writeMap(model, map);

    return ok({ events: map }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const type = request.nextUrl.searchParams.get("type");
    const model = modelFor(type);
    const data = calendarDeleteSchema.parse(await request.json());

    const map = await readMap(model);
    const events = map[data.date] ?? [];
    if (data.index >= events.length) {
      throw new ApiError("Calendar event not found.", 404);
    }

    events.splice(data.index, 1);
    if (events.length === 0) {
      delete map[data.date];
    } else {
      map[data.date] = events;
    }

    await writeMap(model, map);
    return ok({ events: map });
  } catch (error) {
    return handleApiError(error);
  }
}
