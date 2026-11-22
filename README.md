

## Stack
- Next.js 16 App Router, React 19, TypeScript, Node.js API route handlers
- Supabase-hosted PostgreSQL + Drizzle ORM / Drizzle Kit
- TanStack Query, React Hook Form, Zod, Tailwind CSS, Lucide icons
- Vitest for schema validation tests
- pnpm

## Local setup with Docker
1. Run Docker Desktop
2. Create `.env.local` in project root to set database connection string:
   ```env
   DATABASE_URL=postgresql://postgres.USER:PASSWORD@HOST_POOLER:6543/DB_NAME

   ```

3. Run database migrations against that database using the Docker migration service:
   ```bash
   docker compose run --build --rm migrate
   ```
    This creates 'school_class' and 'teacher' table.

4. Build and start the app from the project root:
```bash
docker compose up --build
```
Starting the app does not run migrations. Run the migration command in step 3 whenever new database migrations need to be applied.

Open http://localhost:3000

Compose reads `DATABASE_URL` from `.env.local` and passes it to the running container; the file is not copied into the image.
Stop the app with `docker compose down`.

## API contract

| Method | Endpoint        | Success                                                             |
| ------ | --------------- | ------------------------------------------------------------------- |
| POST   | `/api/teachers` | 201                                                                 |
| GET    | `/api/teachers` | 200 `{ "data": [{ "name", "subject", "email", "contactNumber" }] }` |
| POST   | `/api/classes`  | 201                                                                 |
| GET    | `/api/classes`  | 200 `{ "data": [{ "level", "name", "formTeacher": { "name" } }] }`  |

```bash
curl -X POST http://localhost:3000/api/teachers -H 'Content-Type: application/json' -d '{"name":"Mary","subject":"Mathematics","email":"teachermary@gmail.com","contactNumber":"68129414"}'
curl http://localhost:3000/api/teachers
curl -X POST http://localhost:3000/api/classes -H 'Content-Type: application/json' -d '{"level":"Primary 1","name":"Class 1A","teacherEmail":"teachermary@gmail.com"}'
curl http://localhost:3000/api/classes
```


## Assumptions
- Teacher email addresses are unique and normalized to lowercase.
- Class Name is unique and normalized to lowercase among its level.
- Work contact numbers assumed to be exactly eight digits, no country prefix.
- Each class requires one teacher, and a teacher can only belong to one class. A unique database constraint on `school_class.teacher_id` enforces this even with concurrent requests.
- The database tables are named `teacher` and `school_class`, API endpoints remain `/api/teachers` and `/api/classes`.



## Security
- Database credentials are read only by server code via environment variables.
- Input is validated server-side using Zod, queries are parameterized through Drizzle, there are request body limits up to 16kb to prevent excessive sized request creations.
-  Unexpected server errors are not returned verbatim, but kept generic to not expose information to client

- Rate limited to prevent malicious spamming
- Authentication and authorization are not implemented. If added, keep short-lived access tokens in memory and store refresh tokens in `HttpOnly`, `Secure`, `SameSite` cookies sent only over HTTPS. Enforce authorization on the server.



## API suggestions
- To include Pagination, SKIP LIMIT if roughly under 1 million records, else use cursor pagination
- If the API uses Express, adapt the rate limiter as Express middleware and configure CORS with an allowlist of trusted frontend origins that need cross-origin access.
- Depending on query patterns, table indexes can be added, such as for looking up all rows in `school_class` by level.
- For Typescript frontend and backend, tRPC can be used for to share typed API contracts. 

- Frontend caching is done via React Query, such as caching teacher list under ["teachers"] key, shared across pages while the app’s QueryClient remains mounted. The cache is considered fresh for 30 seconds (providers.tsx). During that time, navigating to a page that uses the same key can reuse the cached data.
(After a teacher is added, the app invalidates ["teachers"], so the next use refreshes it. This is an in-memory cache; it doesn’t persist across a full page reload.)
