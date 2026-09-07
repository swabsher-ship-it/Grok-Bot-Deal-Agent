import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getStore, saveStore } from "./store";
import { uid } from "./utils";

const SESSION_COOKIE = "dealagent_session";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, email: string): Promise<string> {
  const store = getStore();
  const token = uid("sess");
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  store.sessions[token] = {
    userId,
    email,
    expiresAt: expires.toISOString(),
  };
  saveStore(store);
  return token;
}

export function destroySession(token: string): void {
  const store = getStore();
  delete store.sessions[token];
  saveStore(store);
}

export function getSessionFromToken(token: string | undefined) {
  if (!token) return null;
  const store = getStore();
  const session = store.sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete store.sessions[token];
    saveStore(store);
    return null;
  }
  const user = store.users.find((u) => u.id === session.userId && u.active);
  if (!user) return null;
  return { token, user, session };
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return getSessionFromToken(token);
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
