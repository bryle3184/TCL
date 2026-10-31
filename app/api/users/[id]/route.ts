import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { hashPassword } from "@/lib/password";
import { userUpdateSchema } from "@/lib/validations";
import { isManager } from "@/lib/constants";
import {
  ApiError,
  assertObjectId,
  handleApiError,
  ok,
  requireApiManager,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireApiManager();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    const data = userUpdateSchema.parse(await request.json());
    const account = await Account.findById(id);
    if (!account) throw new ApiError("Account not found.", 404);

    if (data.name !== undefined) account.name = data.name;
    if (data.birthday !== undefined) account.birthday = data.birthday;
    if (data.role !== undefined) {
      if (isManager(account.role) && !isManager(data.role)) {
        const managers = await Account.countDocuments({
          role: { $in: ["Head of Ecommerce Manager", "Ecommerce Supervisor"] },
        });
        if (managers <= 1) {
          throw new ApiError(
            "At least one manager account must remain in the workspace.",
            409,
          );
        }
      }
      account.role = data.role;
    }
    if (data.password) {
      account.password = await hashPassword(data.password);
    }

    await account.save();
    return ok({
      account: {
        _id: account._id,
        name: account.name,
        username: account.username,
        role: account.role,
        birthday: account.birthday,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const manager = await requireApiManager();
    await connectDB();
    const { id } = await context.params;
    assertObjectId(id);

    if (manager.id === id) {
      throw new ApiError("You cannot delete your own account.", 409);
    }

    const account = await Account.findById(id);
    if (!account) throw new ApiError("Account not found.", 404);

    if (isManager(account.role)) {
      const managers = await Account.countDocuments({
        role: { $in: ["Head of Ecommerce Manager", "Ecommerce Supervisor"] },
      });
      if (managers <= 1) {
        throw new ApiError(
          "At least one manager account must remain in the workspace.",
          409,
        );
      }
    }

    await Account.findByIdAndDelete(id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
