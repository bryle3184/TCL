import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { getSessionUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { isManager } from "@/lib/constants";
import type { SessionUser } from "@/lib/jwt";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function requireApiUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) throw new ApiError("You must be signed in.", 401);

  // Resolve the account on every request so deleted accounts lose access
  // immediately and role changes are enforced without waiting for a new token.
  await connectDB();
  const account = await Account.findById(session.id)
    .select("name username role")
    .lean();

  if (!account) throw new ApiError("Account no longer exists.", 401);

  return {
    id: String(account._id),
    username: account.username,
    name: account.name,
    role: account.role,
  };
}

export async function requireApiManager(): Promise<SessionUser> {
  const user = await requireApiUser();
  if (!isManager(user.role)) {
    throw new ApiError("Manager access is required for this action.", 403);
  }
  return user;
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)[0]?.message ?? "Invalid data.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    return NextResponse.json(
      { error: "That username is already registered." },
      { status: 409 },
    );
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid data.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Malformed request body." },
      { status: 400 },
    );
  }

  console.error("[api]", error);
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function assertObjectId(id: string): string {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError("Record not found.", 404);
  }
  return id;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
