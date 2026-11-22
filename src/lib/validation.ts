import { z } from "zod";
export const SUBJECTS = [
  "English Language",
  "Mother Tongue Language",
  "Mathematics",
  "Science",
  "Art",
  "Music",
  "Physical Education",
  "Social Studies",
  "Character and Citizenship Education",
] as const;
export const LEVELS = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
] as const;
export const teacherSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  subject: z.enum(SUBJECTS, { error: "Select a subject" }),
  email: z
    .email("This email address is invalid")
    .max(255)
    .transform((v) => v.toLowerCase()),
  contactNumber: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Enter an 8-digit work contact number"),
});
export const classSchema = z.object({
  level: z.enum(LEVELS, { error: "Select a class level" }),
  name: z.string().trim().min(1, "Class name is required").max(255),
  teacherEmail: z
    .email("Select a valid form teacher")
    .transform((v) => v.toLowerCase()),
});
export type TeacherInput = z.input<typeof teacherSchema>;
export type ClassInput = z.input<typeof classSchema>;
export type Teacher = z.output<typeof teacherSchema>;
export type SchoolClass = {
  level: string;
  name: string;
  formTeacher: { name: string };
};

export function isClassNameTaken(
  level: string,
  name: string,
  existingClasses: SchoolClass[],
): boolean {
  const normalizedName = name.trim().toLowerCase();
  return existingClasses.some(
    (schoolClass) =>
      schoolClass.level === level &&
      schoolClass.name.trim().toLowerCase() === normalizedName,
  );
}
