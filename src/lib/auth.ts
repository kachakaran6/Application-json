import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "samyukt@admin2026";
const COOKIE_NAME = "samyukt_admin_session";

// Web Crypto HMAC SHA-256 for secure stateless session tokens
async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(username: string = "admin"): Promise<string> {
  const enc = new TextEncoder();
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    iat: Date.now(),
  });
  const b64Payload = Buffer.from(payload).toString("base64url");
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(b64Payload)
  );
  const b64Sig = Buffer.from(signature).toString("base64url");
  return `${b64Payload}.${b64Sig}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [b64Payload, b64Sig] = token.split(".");
    if (!b64Payload || !b64Sig) return false;

    const key = await getKey();
    const enc = new TextEncoder();
    const sigBuf = Buffer.from(b64Sig, "base64url");

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuf,
      enc.encode(b64Payload)
    );
    if (!valid) return false;

    const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return false;
  return verifySessionToken(cookie.value);
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function verifyAdminPassword(secret: string): boolean {
  return secret === ADMIN_SECRET;
}
