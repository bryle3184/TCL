import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Payout } from "@/lib/models/payout";
import { payoutSchema } from "@/lib/validations";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const payouts = await Payout.find().sort({ createdAt: -1 }).lean();
    return ok({ payouts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const data = payoutSchema.parse(await request.json());

    const payout = await Payout.create({
      name: data.name,
      campaign: data.campaign,
      date: data.date || new Date().toISOString().slice(0, 10),
      status: data.status,
      link: data.link ?? "",
    });

    return ok({ payout }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
