import { sql } from "drizzle-orm";
import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
export const teacher = pgTable("teacher", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 })
    .notNull()
    .unique("teacher_email_unique"),
  contactNumber: varchar("contact_number", { length: 30 }).notNull(),
});
export const schoolClass = pgTable("school_class", {
  id: uuid("id").primaryKey().defaultRandom(),
  level: varchar("level", { length: 30 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  teacherId: uuid("teacher_id")
    .notNull()
    .unique("school_class_teacher_id_unique")
    .references(() => teacher.id),
}, (table) => [
  uniqueIndex("school_class_level_name_unique").on(
    table.level,
    sql`lower(btrim(${table.name}))`,
  ),
]);
