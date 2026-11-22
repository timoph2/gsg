import { describe, it, expect } from "vitest";
import {
  teacherSchema,
  classSchema,
  isClassNameTaken,
} from "../src/lib/validation";
describe("teacher validation", () => {
  const valid = {
    name: "Mary",
    subject: "Mathematics",
    email: "mary@example.com",
    contactNumber: "68129414",
  };
  it("accepts valid teacher", () =>
    expect(teacherSchema.safeParse(valid).success).toBe(true));
  it("rejects invalid email", () =>
    expect(teacherSchema.safeParse({ ...valid, email: "wrong" }).success).toBe(
      false,
    ));
  it("rejects invalid phone", () =>
    expect(
      teacherSchema.safeParse({ ...valid, contactNumber: "123" }).success,
    ).toBe(false));
  it("rejects blank name", () =>
    expect(teacherSchema.safeParse({ ...valid, name: " " }).success).toBe(
      false,
    ));
});
describe("class validation", () => {
  it("accepts valid class", () =>
    expect(
      classSchema.safeParse({
        level: "Primary 1",
        name: "Class 1A",
        teacherEmail: "mary@example.com",
      }).success,
    ).toBe(true));
  it("rejects invalid level", () =>
    expect(
      classSchema.safeParse({
        level: "University",
        name: "Class 1A",
        teacherEmail: "mary@example.com",
      }).success,
    ).toBe(false));
  it("trims class names before submission", () =>
      expect(
        classSchema.parse({
          level: "Primary 1",
          name: "  Class 1A  ",
          teacherEmail: "mary@example.com",
        }).name,
      ).toBe("Class 1A"));
  it("checks duplicate class names case-insensitively within the same level", () => {
      const existing = [
        {
          level: "Primary 1",
          name: "Class 1A",
          formTeacher: { name: "Mary" },
        },
      ];

      expect(isClassNameTaken("Primary 1", " class 1a ", existing)).toBe(true);
      expect(isClassNameTaken("Primary 2", "Class 1A", existing)).toBe(false);
      expect(isClassNameTaken("Primary 1", "Class 1B", existing)).toBe(false);
  });
});
