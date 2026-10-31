import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { CustomerService } from "@/lib/models/csr";
import { csrSchema } from "@/lib/validations";
import { handleApiError, ok, requireApiUser } from "@/lib/api";

export async function GET() {
  try {
    await requireApiUser();
    await connectDB();

    const tickets = await CustomerService.find()
      .sort({ createdAt: -1 })
      .lean();
    return ok({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser();
    await connectDB();
    const data = csrSchema.parse(await request.json());

    const ticket = await CustomerService.create({
      customer: data.customer,
      concern: data.concern,
      date: data.date || new Date().toISOString().slice(0, 10),
      status: data.status,
      chatlink: data.chatlink ?? "",
    });

    return ok({ ticket }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
