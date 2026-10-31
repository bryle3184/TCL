import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { verifyPassword, hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validations";
import { ApiError, handleApiError, ok } from "@/lib/api";
import { isManager } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = loginSchema.parse(await request.json());

    const account = await Account.findOne({ username: data.username.trim() });
    if (!account) {
      throw new ApiError("Invalid username or password.", 401);
    }

    const result = await verifyPassword(data.password, account.password);
    if (!result.ok) {
      throw new ApiError("Invalid username or password.", 401);
    }

    // Transparently upgrade legacy plaintext passwords to bcrypt.
    if (result.legacy) {
      account.password = await hashPassword(data.password);
      await account.save();
    }

    const user = {
      id: account._id.toString(),
      username: account.username,
      name: account.name,
      role: account.role,
    };

    await setSessionCookie(user);

    return ok({ user, isManager: isManager(user.role) });
  } catch (error) {
    return handleApiError(error);
  }
}
