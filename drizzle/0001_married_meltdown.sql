DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "school_class"
    GROUP BY "level", lower(btrim("name"))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add school_class_level_name_unique: duplicate class names exist within a level. Resolve the duplicates and retry the migration.';
  END IF;
END;
$$;
--> statement-breakpoint
CREATE UNIQUE INDEX "school_class_level_name_unique" ON "school_class" USING btree ("level",lower(btrim("name")));