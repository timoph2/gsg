import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
export function handleError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Malformed JSON request body" },
      { status: 400 },
    );
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error("Unexpected API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
