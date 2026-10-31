import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { CreativeAsset } from "@/lib/models/creative";
import { creativeUpdateSchema } from "@/lib/validations";
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
    const { status } = creativeUpdateSchema.parse(await request.json());

    const asset = await CreativeAsset.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!asset) throw new ApiError("Creative asset not found.", 404);

    return ok({ asset });
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

    const asset = await CreativeAsset.findByIdAndDelete(id);
    if (!asset) throw new ApiError("Creative asset not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
