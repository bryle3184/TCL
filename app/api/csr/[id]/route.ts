import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { CustomerService } from "@/lib/models/csr";
import { csrUpdateSchema } from "@/lib/validations";
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
    const { status } = csrUpdateSchema.parse(await request.json());

    const ticket = await CustomerService.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!ticket) throw new ApiError("Ticket not found.", 404);

    return ok({ ticket });
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

    const ticket = await CustomerService.findByIdAndDelete(id);
    if (!ticket) throw new ApiError("Ticket not found.", 404);

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
