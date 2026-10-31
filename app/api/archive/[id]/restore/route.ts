import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Task, TaskArchive } from "@/lib/models/task";
import {
  ApiError,
  assertObjectId,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: Context) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const archived = await TaskArchive.findById(id).lean();
    if (!archived) throw new ApiError("Archived task not found.", 404);

    const task = await Task.create({
      task: archived.task,
      deadline: archived.date ? new Date(archived.date) : undefined,
      live: archived.live ?? "",
      note: archived.note ?? "",
      assigned: archived.assigned ?? "",
      role: user.role,
    });

    await TaskArchive.findByIdAndDelete(id);
    return ok({ task }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
