"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { addTeacher } from "@/lib/api";
import { SUBJECTS, teacherSchema, type TeacherInput } from "@/lib/validation";
export function TeacherForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      subject: undefined,
      email: "",
      contactNumber: "",
    },
  });
  const mutation = useMutation({
    mutationFn: addTeacher,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      router.push("/teachers");
    },
  });
  return (
    <main className="shell">
      <h1 className="font-bold text-xl mb-5">Add Teacher</h1>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <section className="panel p-7 space-y-5">
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              id="name"
              placeholder="Name"
              className={`field ${errors.name ? "field-error" : ""}`}
              {...register("name")}
            />
            {errors.name && <p className="field-help">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="subject" className="field-label">
              Subject
            </label>
            <select
              id="subject"
              className={`field ${errors.subject ? "field-error" : ""}`}
              defaultValue=""
              {...register("subject")}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.subject && (
              <p className="field-help">{errors.subject.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className={`field ${errors.email ? "field-error" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="field-help">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contactNumber" className="field-label">
              Work Contact Number
            </label>
            <input
              id="contactNumber"
              inputMode="numeric"
              placeholder="Work contact number"
              className={`field ${errors.contactNumber ? "field-error" : ""}`}
              {...register("contactNumber")}
            />
            {errors.contactNumber && (
              <p className="field-help">{errors.contactNumber.message}</p>
            )}
          </div>
        </section>
        {mutation.isError && (
          <p role="alert" className="text-red-600 mt-4 text-sm">
            {mutation.error.message}
          </p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <Link href="/teachers" className="btn btn-outline">
            <ArrowLeft size={16} />
            Back
          </Link>
          <button
            disabled={mutation.isPending}
            type="submit"
            className="btn btn-primary"
          >
            {mutation.isPending ? "Adding..." : "Add Teacher"}
          </button>
        </div>
      </form>
    </main>
  );
}
