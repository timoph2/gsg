"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getClasses, getTeachers } from "@/lib/api";
export function ListPage({ kind }: { kind: "teachers" | "classes" }) {
  const isTeacher = kind === "teachers";
  const teachers = useQuery({
    queryKey: ["teachers"],
    queryFn: getTeachers,
    enabled: isTeacher,
  });
  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
    enabled: !isTeacher,
  });
  const query = isTeacher ? teachers : classes;
  const rows = isTeacher ? teachers.data : classes.data;
  const title = isTeacher ? "Teachers" : "Classes";
  const addLabel = isTeacher ? "Add Teacher" : "Add Class";
  const href = isTeacher ? "/teachers/new" : "/classes/new";
  return (
    <main className="shell">
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-bold text-xl">{title}</h1>
        {!!rows?.length && (
          <Link className="btn btn-primary" href={href}>
            <Plus size={16} />
            {addLabel}
          </Link>
        )}
      </div>
      <section
        className={`panel ${!rows?.length ? "min-h-[440px] flex justify-center items-center" : ""}`}
      >
        {query.isPending ? (
          <p className="text-gray-500">Loading {title.toLowerCase()}...</p>
        ) : query.isError ? (
          <div className="text-center">
            <p className="text-red-600 mb-3">{query.error?.message}</p>
            <button className="btn btn-outline" onClick={() => query.refetch()}>
              Try again
            </button>
          </div>
        ) : !rows?.length ? (
          <div className="text-center">
            <p className="font-semibold text-sm mb-4">
              There are no existing {title.toLowerCase()} yet.
            </p>
            <Link className="btn btn-primary" href={href}>
              <Plus size={16} />
              {addLabel}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {(isTeacher
                    ? ["#", "Name", "Subject", "Email", "Work Contact"]
                    : ["#", "Class Level", "Class Name", "Form Teacher"]
                  ).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isTeacher
                  ? teachers.data?.map((t, i) => (
                      <tr key={t.email}>
                        <td>{i + 1}</td>
                        <td>{t.name}</td>
                        <td>{t.subject}</td>
                        <td>{t.email}</td>
                        <td>{t.contactNumber}</td>
                      </tr>
                    ))
                  : classes.data?.map((c, i) => (
                      <tr key={`${c.level}-${c.name}-${i}`}>
                        <td>{i + 1}</td>
                        <td>{c.level}</td>
                        <td>{c.name}</td>
                        <td>{c.formTeacher.name}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
