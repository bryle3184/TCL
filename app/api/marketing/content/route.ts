import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingContent } from "@/lib/models/marketing";
import { marketingContentSchema } from "@/lib/validations";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();

    const archive = request.nextUrl.searchParams.get("archive");
    const filter = archive
      ? { archive }
      : {
          $or: [
            { archive: "" },
            { archive: null },
            { archive: { $exists: false } },
          ],
        };

    const content = await MarketingContent.find(filter)
      .sort({ schedule: 1, createdAt: 1 })
      .lean();

    return ok({ content });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const data = marketingContentSchema.parse(await request.json());

    const content = await MarketingContent.create({
      id: data.id || `content-${Date.now()}`,
      schedule: data.schedule ?? "",
      account: data.account ?? "",
      platform: data.platform ?? "",
      event: data.event ?? "",
      visual: data.visual ?? "",
      header: data.header ?? "",
      subheader: data.subheader ?? "",
      caption: data.caption ?? "",
      hashtags: data.hashtags ?? "",
      creatives: data.creatives ?? "",
      campaign: data.campaign ?? "",
      notes: data.notes ?? "",
      status: data.status,
      archive: data.archive ?? "",
      file: data.file ?? "",
    });

    return ok({ content }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
