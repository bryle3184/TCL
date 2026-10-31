import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingContent } from "@/lib/models/marketing";
import { marketingContentUpdateSchema } from "@/lib/validations";
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

    const data = marketingContentUpdateSchema.parse(await request.json());
    const content = await MarketingContent.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!content) throw new ApiError("Content entry not found.", 404);

    return ok({ content });
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

    const content = await MarketingContent.findByIdAndDelete(id);
    if (!content) throw new ApiError("Content entry not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
