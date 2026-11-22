CREATE TABLE "school_class" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"teacher_id" uuid NOT NULL,
	CONSTRAINT "school_class_teacher_id_unique" UNIQUE("teacher_id")
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"contact_number" varchar(30) NOT NULL,
	CONSTRAINT "teacher_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "school_class" ADD CONSTRAINT "school_class_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;