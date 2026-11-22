import { NextResponse } from "next/server";
import { classSchema } from "@/lib/validation";
import { createClass, listClasses } from "@/server/service";
import { handleError } from "@/server/http";
import { rateLimitResponse, readJsonBody } from "@/server/api-guards";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const limited = rateLimitResponse(request);
  if (limited) return limited;
  try {
    return NextResponse.json({ data: await listClasses() });
  } catch (e) {
    return handleError(e);
  }
}
export async function POST(request: Request) {
  const limited = rateLimitResponse(request);
  if (limited) return limited;
  try {
    const input = classSchema.parse(await readJsonBody(request));
    await createClass(input);
    return NextResponse.json({ message: "Class created" }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
