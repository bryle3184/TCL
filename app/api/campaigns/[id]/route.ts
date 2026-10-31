import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/lib/models/campaign";
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

    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) throw new ApiError("Campaign not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
