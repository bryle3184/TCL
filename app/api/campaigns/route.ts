import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/lib/models/campaign";
import { campaignSchema } from "@/lib/validations";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    return ok({ campaigns });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const data = campaignSchema.parse(await request.json());

    const campaign = await Campaign.create({
      campaign: data.campaign,
      date: data.date ?? "",
      budget: data.budget,
      link: data.link ?? "",
      notes: data.notes ?? "",
    });

    return ok({ campaign }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
