import "server-only";
import { count, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { schoolClass, teacher } from "./schema";
import { AppError } from "./errors";
import type { Teacher, SchoolClass } from "@/lib/validation";
const MAX_RECORDS_PER_TABLE = 100;

export async function listTeachers(): Promise<Teacher[]> {
  const rows = await getDb()
    .select({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email,
      contactNumber: teacher.contactNumber,
    })
    .from(teacher)
    .orderBy(teacher.name);
  return rows as Teacher[];
}
export async function createTeacher(data: Teacher) {
  try {
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('teacher')::bigint)`,
      );
      const [{ total }] = await tx.select({ total: count() }).from(teacher);
      if (total >= MAX_RECORDS_PER_TABLE) {
        throw new AppError(409, "The maximum of 100 teachers has been reached");
      }
      await tx.insert(teacher).values(data);
    });
  } catch (error) {
    if (isUniqueViolation(error))
      throw new AppError(409, "A teacher with this email already exists");
    throw error;
  }
}
export async function listClasses(): Promise<SchoolClass[]> {
  const rows = await getDb()
    .select({
      level: schoolClass.level,
      name: schoolClass.name,
      teacherName: teacher.name,
    })
    .from(schoolClass)
    .innerJoin(teacher, eq(schoolClass.teacherId, teacher.id))
    .orderBy(schoolClass.level, schoolClass.name);
  return rows.map(({ level, name, teacherName }) => ({
    level,
    name,
    formTeacher: { name: teacherName },
  }));
}
export async function createClass(data: {
  level: string;
  name: string;
  teacherEmail: string;
}) {
  const db = getDb();
  const [assignedTeacher] = await db
    .select({ id: teacher.id })
    .from(teacher)
    .where(eq(teacher.email, data.teacherEmail))
    .limit(1);
  if (!assignedTeacher)
    throw new AppError(400, "The selected form teacher does not exist");
  try {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('school_class')::bigint)`,
      );
      const [{ total }] = await tx.select({ total: count() }).from(schoolClass);
      if (total >= MAX_RECORDS_PER_TABLE) {
        throw new AppError(409, "The maximum of 100 classes has been reached");
      }
      await tx
        .insert(schoolClass)
        .values({
          level: data.level,
          name: data.name,
          teacherId: assignedTeacher.id,
        });
    });
  } catch (error) {
    if (
      getUniqueViolationConstraint(error) === "school_class_level_name_unique"
    )
      throw new AppError(
        409,
        `A class named "${data.name}" already exists for ${data.level}`,
      );
    if (isUniqueViolation(error))
      throw new AppError(409, "This teacher is already assigned to a class");
    throw error;
  }
}
function isUniqueViolation(error: unknown): boolean {
  return getUniqueViolationConstraint(error) !== undefined;
}
function getUniqueViolationConstraint(error: unknown): string | undefined {
  let current: unknown = error;
  for (let i = 0; i < 4 && current && typeof current === "object"; i++) {
    if ("code" in current && current.code === "23505") {
      return "constraint" in current && typeof current.constraint === "string"
        ? current.constraint
        : "unknown";
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return undefined;
}
