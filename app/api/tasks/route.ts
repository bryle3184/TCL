import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/lib/models/task";
import { taskSchema } from "@/lib/validations";
import {
  handleApiError,
  ok,
  requireApiUser,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    await connectDB();

    const scope = request.nextUrl.searchParams.get("scope");
    const filter = scope === "mine" ? { assigned: user.role } : {};
    const tasks = await Task.find(filter).lean();

    tasks.sort((a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      if (aTime !== bTime) return aTime - bTime;
      return a.task.localeCompare(b.task);
    });

    return ok({ tasks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const data = taskSchema.parse(await request.json());

    const task = await Task.create({
      task: data.task,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      live: data.live ?? "",
      note: data.note ?? "",
      assigned: data.assigned ?? "",
      role: user.role,
    });

    return ok({ task }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
