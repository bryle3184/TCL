import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Task, TaskArchive } from "@/lib/models/task";
import { archiveActionSchema } from "@/lib/validations";
import {
  ApiError,
  assertObjectId,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

/**
 * Mirrors the original "Task done" / "Delete" behaviour: the task leaves the
 * active board and is preserved in task_archives with a status.
 */
export async function POST(request: NextRequest, context: Context) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const { status } = archiveActionSchema.parse(await request.json());
    const task = await Task.findById(id).lean();
    if (!task) throw new ApiError("Task not found.", 404);

    const archived = await TaskArchive.create({
      task: task.task,
      date: task.deadline ?? new Date(),
      live: task.live ?? "",
      status,
      note: task.note ?? "",
      assigned: task.assigned ?? "",
      archivedBy: user.name,
    });

    await Task.findByIdAndDelete(id);

    return ok({ archived }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
