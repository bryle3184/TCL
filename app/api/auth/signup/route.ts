import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { signupSchema } from "@/lib/validations";
import { ApiError, handleApiError, ok } from "@/lib/api";
import { isManager } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = signupSchema.parse(await request.json());

    const existing = await Account.findOne({ username: data.username });
    if (existing) {
      throw new ApiError("That username is already registered.", 409);
    }

    // Public self-registration cannot grant manager privileges once the
    // workspace is bootstrapped. Managers create elevated accounts in /users.
    const accountCount = await Account.estimatedDocumentCount();
    if (accountCount > 0 && isManager(data.role)) {
      throw new ApiError(
        "Manager accounts can only be created by an existing manager.",
        403,
      );
    }

    const account = await Account.create({
      name: data.name,
      username: data.username,
      birthday: data.birthday,
      password: await hashPassword(data.password),
      role: data.role,
    });

    const user = {
      id: account._id.toString(),
      username: account.username,
      name: account.name,
      role: account.role,
    };

    await setSessionCookie(user);
    return ok({ user, isManager: isManager(user.role) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
