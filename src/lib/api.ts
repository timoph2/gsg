import type {
  ClassInput,
  SchoolClass,
  Teacher,
  TeacherInput,
} from "./validation";
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json: unknown = await res.json();
  if (!res.ok) {
    const error =
      json &&
      typeof json === "object" &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "Request failed";
    throw new Error(error);
  }
  return json as T;
}
export const getTeachers = async () =>
  (await request<{ data: Teacher[] }>("/api/teachers")).data;
export const getClasses = async () =>
  (await request<{ data: SchoolClass[] }>("/api/classes")).data;
export const addTeacher = (input: TeacherInput) =>
  request("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
export const addClass = (input: ClassInput) =>
  request("/api/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
