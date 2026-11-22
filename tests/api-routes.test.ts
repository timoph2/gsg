import { beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  createClass: vi.fn(),
  createTeacher: vi.fn(),
  listClasses: vi.fn(),
  listTeachers: vi.fn(),
}));

vi.mock("@/server/service", () => services);

import {
  GET as getTeachers,
  POST as postTeacher,
} from "../src/app/api/teachers/route";
import {
  GET as getClasses,
  POST as postClass,
} from "../src/app/api/classes/route";
import { AppError } from "../src/server/errors";

describe("API success response contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves the teacher list response", async () => {
    const data = [
      {
        name: "Mary",
        subject: "Mathematics",
        email: "mary@example.com",
        contactNumber: "68129414",
      },
    ];
    services.listTeachers.mockResolvedValue(data);

    const response = await getTeachers(
      new Request("http://localhost/api/teachers", {
        headers: { "x-real-ip": "198.51.100.1" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
  });

  it("preserves the teacher create response", async () => {
    const response = await postTeacher(
      new Request("http://localhost/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "198.51.100.2",
        },
        body: JSON.stringify({
          name: "Mary",
          subject: "Mathematics",
          email: "mary@example.com",
          contactNumber: "68129414",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: "Teacher created",
    });
  });

  it("preserves the class list response", async () => {
    const data = [
      {
        level: "Primary 1",
        name: "Class 1A",
        formTeacher: { name: "Mary" },
      },
    ];
    services.listClasses.mockResolvedValue(data);

    const response = await getClasses(
      new Request("http://localhost/api/classes", {
        headers: { "x-real-ip": "198.51.100.3" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
  });

  it("preserves the class create response", async () => {
    const response = await postClass(
      new Request("http://localhost/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "198.51.100.4",
        },
        body: JSON.stringify({
          level: "Primary 1",
          name: "Class 1A",
          teacherEmail: "mary@example.com",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: "Class created",
    });
  });

  it("returns a clear 409 error when a class name is already used at its level", async () => {
    services.createClass.mockRejectedValue(
      new AppError(
        409,
        'A class named "Class 1A" already exists for Primary 1',
      ),
    );

    const response = await postClass(
      new Request("http://localhost/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "198.51.100.5",
        },
        body: JSON.stringify({
          level: "Primary 1",
          name: "Class 1A",
          teacherEmail: "mary@example.com",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: 'A class named "Class 1A" already exists for Primary 1',
    });
  });
});
