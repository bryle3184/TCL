import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Account } from "@/lib/models/account";
import { signSession, verifySession, type SessionUser } from "@/lib/jwt";

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentAccount(): Promise<SessionUser | null> {
  const session = await getSessionUser();
  if (!session) return null;

  await connectDB();
  const account = await Account.findById(session.id)
    .select("name username role")
    .lean();
  if (!account) return null;

  return {
    id: String(account._id),
    username: account.username,
    name: account.name,
    role: account.role,
  };
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
