import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { CreativeAsset } from "@/lib/models/creative";
import { creativeSchema } from "@/lib/validations";
import { fileToDataUrl, isUpload, readText } from "@/lib/upload";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const assets = await CreativeAsset.find()
      .sort({ createdAt: -1 })
      .lean();

    return ok({ assets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();

    const form = await request.formData();
    const data = creativeSchema.parse({
      campaign: readText(form, "campaign"),
      platform: readText(form, "platform"),
      status: readText(form, "status") || "Pending",
      link: readText(form, "link"),
    });

    const upload = form.get("file");
    let link = data.link ?? "";
    let fileName = "";

    if (isUpload(upload) && upload.size > 0) {
      link = await fileToDataUrl(upload);
      fileName = upload.name;
    }

    const asset = await CreativeAsset.create({
      campaign: data.campaign,
      platform: data.platform,
      status: data.status,
      file: fileName,
      link,
    });

    return ok({ asset }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
