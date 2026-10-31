import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiUser();
    await connectDB();
    const data = changePasswordSchema.parse(await request.json());

    const account = await Account.findById(session.id);
    if (!account) throw new ApiError("Account not found.", 404);

    const result = await verifyPassword(data.currentPassword, account.password);
    if (!result.ok) throw new ApiError("Current password is incorrect.", 401);

    account.password = await hashPassword(data.password);
    await account.save();

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
