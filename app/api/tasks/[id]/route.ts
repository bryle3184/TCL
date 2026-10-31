import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/lib/models/task";
import { taskUpdateSchema } from "@/lib/validations";
import {
  ApiError,
  assertObjectId,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireApiUser();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const data = taskUpdateSchema.parse(await request.json());
    const update: Record<string, unknown> = {};

    if (data.task !== undefined) update.task = data.task;
    if (data.deadline !== undefined) {
      update.deadline = data.deadline ? new Date(data.deadline) : null;
    }
    if (data.live !== undefined) update.live = data.live;
    if (data.note !== undefined) update.note = data.note;
    if (data.assigned !== undefined) update.assigned = data.assigned;

    const task = await Task.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!task) throw new ApiError("Task not found.", 404);

    return ok({ task });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requireApiUser();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) throw new ApiError("Task not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
