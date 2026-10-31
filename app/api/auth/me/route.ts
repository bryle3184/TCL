import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { requireApiUser, handleApiError, ok, ApiError } from "@/lib/api";
import { isManager } from "@/lib/constants";

export async function GET() {
  try {
    const session = await requireApiUser();
    await connectDB();

    const account = await Account.findById(session.id).lean();
    if (!account) throw new ApiError("Account no longer exists.", 401);

    return ok({
      user: {
        id: String(account._id),
        username: account.username,
        name: account.name,
        role: account.role,
        birthday: account.birthday ?? "",
      },
      isManager: isManager(account.role),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
