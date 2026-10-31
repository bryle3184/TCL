import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  ok,
  requireApiManager,
} from "@/lib/api";

export async function GET() {
  try {
    await requireApiManager();
    await connectDB();

    const accounts = await Account.find()
      .select("name username role birthday createdAt")
      .sort({ name: 1 })
      .lean();

    return ok({ accounts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiManager();
    await connectDB();
    const data = signupSchema.parse(await request.json());

    const existing = await Account.findOne({ username: data.username });
    if (existing) throw new ApiError("That username is already registered.", 409);

    const account = await Account.create({
      name: data.name,
      username: data.username,
      birthday: data.birthday,
      password: await hashPassword(data.password),
      role: data.role,
    });

    return ok(
      {
        account: {
          _id: account._id,
          name: account.name,
          username: account.username,
          role: account.role,
          birthday: account.birthday,
          createdAt: account.createdAt,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
