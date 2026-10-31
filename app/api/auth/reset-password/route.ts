import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validations";
import { ApiError, handleApiError, ok } from "@/lib/api";

function sameDay(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.slice(0, 10) === b.slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = resetPasswordSchema.parse(await request.json());

    const account = await Account.findOne({ username: data.username.trim() });
    if (!account || !sameDay(account.birthday, data.birthday)) {
      throw new ApiError("We could not verify that account and birthday.", 401);
    }

    account.password = await hashPassword(data.password);
    await account.save();

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
