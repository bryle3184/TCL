import { clearSessionCookie } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
