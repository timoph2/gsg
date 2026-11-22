"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { addClass, getClasses, getTeachers } from "@/lib/api";
import {
  classSchema,
  isClassNameTaken,
  LEVELS,
  type ClassInput,
} from "@/lib/validation";
export function ClassForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const teachers = useQuery({ queryKey: ["teachers"], queryFn: getTeachers });
  const classes = useQuery({ queryKey: ["classes"], queryFn: getClasses });
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: { level: undefined, name: "", teacherEmail: "" },
  });
  const levelField = register("level");
  const nameField = register("name");
  const mutation = useMutation({
    mutationFn: addClass,
    onError: (error) => {
      if (error.message.startsWith("A class named ")) {
        setError("name", {
          type: "server",
          message: error.message,
        });
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
      ]);
      router.push("/classes");
    },
  });
  const submitClass = (input: ClassInput) => {
    if (classes.data && isClassNameTaken(input.level, input.name, classes.data)) {
      setError("name", {
        type: "validate",
        message: `A class named "${input.name.trim()}" already exists for ${input.level}`,
      });
      return;
    }
    mutation.mutate(input);
  };
  // GET /api/classes only exposes the form teacher's name, not their email.
  // The client can pre-check visible data; the database enforces uniqueness against concurrent requests.
  const availableTeachers = teachers.data ?? [];
  return (
    <main className="shell">
      <h1 className="font-bold text-xl mb-5">Add Class</h1>
      <form onSubmit={handleSubmit(submitClass)} noValidate>
        <section className="panel p-7 space-y-5">
          <div>
            <label htmlFor="level" className="field-label">
              Class Level
            </label>
            <select
              id="level"
              className={`field ${errors.level ? "field-error" : ""}`}
              defaultValue=""
              {...levelField}
              onChange={(event) => {
                void levelField.onChange(event);
                if (errors.name?.type === "validate") clearErrors("name");
              }}
            >
              <option value="" disabled>
                Select a level
              </option>
              {LEVELS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.level && (
              <p className="field-help">{errors.level.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="className" className="field-label">
              Class Name
            </label>
            <input
              id="className"
              placeholder="Class Name"
              maxLength={255}
              className={`field ${errors.name ? "field-error" : ""}`}
              {...nameField}
              onChange={(event) => {
                void nameField.onChange(event);
                if (errors.name?.type === "validate") clearErrors("name");
              }}
            />
            {errors.name && <p className="field-help">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="teacherEmail" className="field-label">
              Form Teacher
            </label>
            <select
              id="teacherEmail"
              className={`field ${errors.teacherEmail ? "field-error" : ""}`}
              defaultValue=""
              {...register("teacherEmail")}
              disabled={
                teachers.isPending || teachers.isError || classes.isPending
              }
            >
              <option value="" disabled>
                {teachers.isPending
                  ? "Loading teachers..."
                  : "Assign a form teacher"}
              </option>
              {availableTeachers.map((t) => (
                <option key={t.email} value={t.email}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
            {errors.teacherEmail && (
              <p className="field-help">{errors.teacherEmail.message}</p>
            )}
            {teachers.isError && (
              <p className="field-help">
                Unable to load teachers. Refresh and try again.
              </p>
            )}
            {classes.isError && (
              <p className="field-help">
                Unable to load class assignments. Refresh and try again.
              </p>
            )}
            {!teachers.isPending &&
              !teachers.isError &&
              !availableTeachers.length && (
                <p className="text-sm text-gray-500 mt-2">
                  No existing teachers.{" "}
                  <Link
                    href="/teachers/new"
                    className="text-[#1260ba] underline"
                  >
                    Add a teacher
                  </Link>{" "}
                  first.
                </p>
              )}
            {!!classes.data?.length && (
              <p className="text-xs text-gray-500 mt-2">
                Teachers already assigned to a class cannot be assigned again.
                The server will check this when you submit.
              </p>
            )}
          </div>
        </section>
        {mutation.isError &&
          !mutation.error.message.startsWith("A class named ") && (
          <p role="alert" className="text-red-600 mt-4 text-sm">
            {mutation.error.message}
          </p>
          )}
        <div className="flex justify-end gap-3 mt-4">
          <Link href="/classes" className="btn btn-outline">
            <ArrowLeft size={16} />
            Back
          </Link>
          <button
            disabled={
              mutation.isPending ||
              teachers.isPending ||
              teachers.isError ||
              classes.isPending ||
              classes.isError ||
              !availableTeachers.length
            }
            type="submit"
            className="btn btn-primary"
          >
            {mutation.isPending ? "Adding..." : "Add Class"}
          </button>
        </div>
      </form>
    </main>
  );
}
