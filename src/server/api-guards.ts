import { NextResponse } from "next/server";
import { AppError } from "./errors";

const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_RATE_LIMIT_KEYS = 10_000;
export const MAX_REQUEST_BODY_BYTES = 16 * 1024;
const rateLimitWindows = new Map<string, { count: number; startedAt: number }>();

export function rateLimitResponse(request: Request): NextResponse | null {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const clientIp =
    forwardedFor?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
  const key = `${new URL(request.url).pathname}:${clientIp}`;
  const retryAfter = consumeRateLimit(key);

  if (retryAfter === null) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.toLowerCase();
  if (contentType?.split(";")[0].trim() !== "application/json") {
    throw new AppError(415, "Content-Type must be application/json");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    throw new AppError(413, "Request body must not exceed 16 KB");
  }

  if (!request.body) throw new AppError(400, "Request body is required");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();
        throw new AppError(413, "Request body must not exceed 16 KB");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  if (body.length === 0) throw new AppError(400, "Request body is required");
  return JSON.parse(new TextDecoder().decode(body));
}

function consumeRateLimit(key: string, now = Date.now()): number | null {
  const window = rateLimitWindows.get(key);
  if (!window || now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
    if (rateLimitWindows.size >= MAX_RATE_LIMIT_KEYS) {
      for (const [existingKey, existingWindow] of rateLimitWindows) {
        if (now - existingWindow.startedAt >= RATE_LIMIT_WINDOW_MS) {
          rateLimitWindows.delete(existingKey);
        }
      }
      if (rateLimitWindows.size >= MAX_RATE_LIMIT_KEYS) {
        return RATE_LIMIT_WINDOW_MS / 1000;
      }
    }
    rateLimitWindows.set(key, { count: 1, startedAt: now });
    return null;
  }

  if (window.count >= RATE_LIMIT) {
    return Math.max(
      1,
      Math.ceil((window.startedAt + RATE_LIMIT_WINDOW_MS - now) / 1000),
    );
  }

  window.count++;
  return null;
}
