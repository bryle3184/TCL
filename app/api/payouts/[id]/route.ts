import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Payout } from "@/lib/models/payout";
import { payoutUpdateSchema } from "@/lib/validations";
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
    const { status } = payoutUpdateSchema.parse(await request.json());

    const payout = await Payout.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!payout) throw new ApiError("Payout not found.", 404);

    return ok({ payout });
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

    const payout = await Payout.findByIdAndDelete(id);
    if (!payout) throw new ApiError("Payout not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
