import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  MarketingArchive,
  MarketingContent,
} from "@/lib/models/marketing";
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

    const archive = await MarketingArchive.findById(id).lean();
    if (!archive) throw new ApiError("Archive not found.", 404);

    // Same behaviour as the original: removing an archive removes the
    // content entries filed under it.
    await MarketingContent.deleteMany({ archive: archive.name });
    await MarketingArchive.findByIdAndDelete(id);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
