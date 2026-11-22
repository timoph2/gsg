import { NextResponse } from "next/server";
import { teacherSchema } from "@/lib/validation";
import { createTeacher, listTeachers } from "@/server/service";
import { handleError } from "@/server/http";
import { rateLimitResponse, readJsonBody } from "@/server/api-guards";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const limited = rateLimitResponse(request);
  if (limited) return limited;
  try {
    return NextResponse.json({ data: await listTeachers() });
  } catch (e) {
    return handleError(e);
  }
}
export async function POST(request: Request) {
  const limited = rateLimitResponse(request);
  if (limited) return limited;
  try {
    const input = teacherSchema.parse(await readJsonBody(request));
    await createTeacher(input);
    return NextResponse.json({ message: "Teacher created" }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
