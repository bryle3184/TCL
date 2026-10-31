import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingArchive } from "@/lib/models/marketing";
import { archiveNameSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const archives = await MarketingArchive.find().sort({ createdAt: -1 }).lean();
    return ok({ archives });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const { name } = archiveNameSchema.parse(await request.json());

    const existing = await MarketingArchive.findOne({ name });
    if (existing) throw new ApiError("An archive with that name exists.", 409);

    const archive = await MarketingArchive.create({ name });
    return ok({ archive }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
