# Job Tracker

A full-stack web application to track job applications you've applied to. Built with **Next.js (full-stack)**, **Prisma ORM**, and **MySQL**.

## Features

- **Dashboard** — statistics & progress overview: pipeline donut chart, status distribution bars, success/rejection rate, and recent applications
- **Work** — manage all job applications with full CRUD (create, view, edit, delete)
- **Status tracking** — each application goes through stages: `Apply`, `HR Interview`, `Test`, `User Interview`, `Offering`, `Reject`
- **Search & filter** — filter applications by status or search by company/position
- **Input validation** — Zod validation on the server + HTML validation on the client
- **Modern UI** — consistent design system (indigo/violet accent), date picker, lots of empty/error states

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | Next.js 16 (App Router), React 19 |
| Language  | TypeScript                        |
| Styling   | Tailwind CSS 4                    |
| Backend   | Next.js API Routes (Route Handlers) |
| Database  | MySQL                             |
| ORM       | Prisma                            |
| Validation| Zod                               |
| Icons     | lucide-react                      |

## Prerequisites

- **Node.js 20+**
- **MySQL 8.x** running locally (the project connects via TCP on `localhost:3306`)
- **npm**

## Setup on Your Own Laptop

### 1. Clone the repository

```bash
git clone <your-repo-url> apply-worker
cd apply-worker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open a MySQL client/shell, then run:

```sql
CREATE DATABASE IF NOT EXISTS apply_worker;
```

Or from the terminal (adjust flags to match your MySQL credentials):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS apply_worker;"
```

### 4. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Then edit `.env` and set the connection string to **your** MySQL credentials, e.g.:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/apply_worker"
```

> `username:password` — if your MySQL user has no password, use an empty password: `mysql://root:@localhost:3306/apply_worker`.

### 5. Sync the database schema with Prisma

```bash
npx prisma db push
```

This creates the `jobs` table (with the `status` enum) and generates the Prisma Client.

> Already have a `prisma/migrations` folder? Use `npx prisma migrate dev --name init` instead.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. (Optional) Production build

```bash
npm run build
npm start
```

## Common Issues

| Problem                          | Fix                                                                 |
| -------------------------------- | ------------------------------------------------------------------- |
| `Can't reach database server`     | Make sure MySQL is running and the host/port in `DATABASE_URL` is correct. |
| `Access denied for user`         | Credentials in `DATABASE_URL` don't match your MySQL user — double-check username/password. |
| `Unknown database 'apply_worker'`| The database hasn't been created — run the `CREATE DATABASE` step.   |
| Prisma Client not generated      | Run `npx prisma generate` (or `npx prisma db push`).                 |

## API Endpoints

| Method   | Endpoint            | Description                          |
| -------- | ------------------- | ------------------------------------ |
| `GET`    | `/api/jobs`         | List all applications (date desc)    |
| `POST`   | `/api/jobs`         | Create a new application             |
| `GET`    | `/api/jobs/:id`     | Get one application                  |
| `PUT`    | `/api/jobs/:id`     | Update an application                |
| `DELETE` | `/api/jobs/:id`     | Delete an application                |

All write endpoints validate the payload with **Zod** (`lib/schemas.ts`).

## Database Schema

| Column        | Type                       | Notes                       |
| ------------- | -------------------------- | --------------------------- |
| `id`          | `varchar` (UUID)           | Primary key                 |
| `company_name`| `varchar` (255)            |                             |
| `position`    | `varchar` (255)            |                             |
| `apply_date`  | `datetime`                 | Set via date picker         |
| `status`      | `enum`                     | See status list above       |
| `description` | `longtext`                 | Long text w/ special chars  |
| `created_at`  | `datetime`                 | Auto                          |
| `updated_at`  | `datetime`                 | Auto-updated                |

## Project Structure

```
app/
  ├── api/jobs/            # Route handlers (REST API)
  │   ├── route.ts             # GET all / POST
  │   └── [id]/route.ts        # GET / PUT / DELETE one
  ├── service/job.service.ts   # Business logic (DB access layer)
  ├── dashboard/page.tsx       # Dashboard page
  ├── work/page.tsx            # Work (job list + CRUD) page
  ├── layout.tsx               # Root layout
  └── page.tsx                 # Redirects to /dashboard
components/
  ├── Sidebar.tsx              # Navigation sidebar
  ├── Modal.tsx                # Reusable modal dialog
  ├── JobForm.tsx              # Add/edit/view form
  ├── StatusBadge.tsx          # Status tag (shared colors)
  ├── PageHeader.tsx           # Shared page header
  └── EmptyState.tsx           # Empty/error states
lib/
  ├── prisma.ts                # Prisma client singleton
  ├── schemas.ts               # Zod validation schemas
  └── status.ts                # Status config (colors/labels)
prisma/
  └── schema.prisma            # DB schema (model `job` → table `jobs`)
```

## Notes

- All credentials live in `.env` (never commit it). `.env.example` is the template.
- Business data-access logic is in `app/service/job.service.ts` so API routes stay thin.
- The Prisma model is named `job` (lowercase) and maps to table `jobs` (snake_case, no capitals).