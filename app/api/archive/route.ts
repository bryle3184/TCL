import { connectDB } from "@/lib/db";
import { TaskArchive } from "@/lib/models/task";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const archives = await TaskArchive.find().sort({ createdAt: -1 }).lean();
    return ok({ archives });
  } catch (error) {
    return handleApiError(error);
  }
}
