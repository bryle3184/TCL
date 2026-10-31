import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TaskArchive } from "@/lib/models/task";
import {
  ApiError,
  assertObjectId,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requireApiUser();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const deleted = await TaskArchive.findByIdAndDelete(id);
    if (!deleted) throw new ApiError("Archived task not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
