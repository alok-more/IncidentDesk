# IncidentDesk — Incident Raise & Ticket Management System

A production-ready, full-stack **Incident Management System** built with React, TypeScript, Tailwind CSS, and Supabase. Employees can raise and track incidents while administrators manage, prioritize, and resolve tickets through a comprehensive analytics dashboard.

---

## Screenshots

> Login & Registration → Employee Dashboard → Raise Incident → Admin Dashboard → Ticket Management

---

## Features

### Employee
- Register and login with secure email/password authentication
- Personal dashboard with live ticket stats and resolution rate
- Raise incidents with title, description, category, and priority
- View all personal tickets with search, filter, and pagination
- Track ticket status changes through a full activity timeline
- Mobile-friendly card views on all screens

### Admin
- Analytics dashboard with status/priority donut charts, monthly bar chart, and resolution rate
- Manage all tickets across the organization
- Update ticket status and priority inline from the table
- View full ticket detail with audit history
- Delete tickets with confirmation dialog
- User management page with per-user ticket statistics
- Export filtered tickets to CSV
- Urgent attention panel highlighting Critical + High priority items

### Shared
- Persistent login with auto session refresh
- Role-based route protection (employee vs admin)
- Live open-ticket count badge in topbar and sidebar
- Skeleton loading screens for all data-heavy views
- Toast notifications for all actions
- Fully responsive — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM v7 |
| Forms | React Hook Form |
| Charts | Recharts |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email/password) |
| Row-Level Security | Supabase RLS Policies |

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Root layout wrapper with sidebar + topbar
│   │   ├── Sidebar.tsx         # Responsive sidebar with nav badges
│   │   └── Topbar.tsx          # Header with live notification bell
│   └── ui/
│       ├── Badges.tsx          # StatusBadge + PriorityBadge
│       ├── ConfirmDialog.tsx   # Reusable confirmation modal
│       ├── EmptyState.tsx      # Empty / search / error states
│       ├── LoadingSpinner.tsx  # Full-page and inline spinners
│       ├── Pagination.tsx      # Page navigation component
│       ├── Skeleton.tsx        # Skeleton loading screens
│       └── StatCard.tsx        # Dashboard metric card
├── context/
│   └── AuthContext.tsx         # Global auth state + Supabase session
├── hooks/
│   └── useDebounce.ts          # Debounce hook for search inputs
├── lib/
│   └── supabase.ts             # Singleton Supabase client
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── MyTicketsPage.tsx
│   │   ├── RaiseIncidentPage.tsx
│   │   └── TicketDetailPage.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminTicketsPage.tsx
│   │   ├── AdminTicketDetailPage.tsx
│   │   └── AdminUsersPage.tsx
│   └── SettingsPage.tsx
├── routes/
│   └── ProtectedRoute.tsx      # GuestRoute / ProtectedRoute / AdminRoute
├── services/
│   └── ticketService.ts        # All Supabase ticket/user queries
├── types/
│   ├── constants.ts            # Status/priority config, categories
│   └── database.ts             # TypeScript types for all tables
└── utils/
    ├── csvExport.ts            # CSV export utility
    └── formatters.ts           # Date formatting helpers
```

---

## Database Schema

### `profiles`
Extends `auth.users` with display name and role.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | References `auth.users.id` |
| `name` | text | Display name |
| `role` | text | `'user'` or `'admin'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

### `tickets`
Core incident record.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | |
| `ticket_number` | text (unique) | Auto-generated `INC-00001` format |
| `title` | text | Short description |
| `description` | text | Full incident details |
| `category` | text | Hardware, Software, Network, etc. |
| `priority` | text | Low, Medium, High, Critical |
| `status` | text | Open, In Progress, Resolved, Closed |
| `created_by` | uuid (FK) | References `auth.users.id` |
| `assigned_to` | uuid (FK, nullable) | References `auth.users.id` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

### `ticket_history`
Audit log for every status or priority change.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | |
| `ticket_id` | uuid (FK) | References `tickets.id` |
| `changed_by` | uuid (FK) | References `auth.users.id` |
| `field` | text | `'status'` or `'priority'` |
| `old_value` | text | Previous value |
| `new_value` | text | New value |
| `created_at` | timestamptz | |

### Row Level Security

| Table | Rule |
|---|---|
| `profiles` | All authenticated users can read; own row only for update |
| `tickets` | Employees see their own; admins see all |
| `tickets` (update/delete) | Admins only |
| `ticket_history` | Same as tickets; insert for admins only |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/incidentdesk.git
cd incidentdesk

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your Supabase credentials (see below)

# 4. Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project under **Settings → API**.

### Database Setup

Run the migration SQL in your Supabase **SQL Editor**. The migration file is located at:

```
supabase/migrations/create_incident_system_schema.sql
```

This creates all tables, indexes, RLS policies, the `INC-XXXXX` ticket number sequence, and auto-trigger functions.

### Seed Demo Data

To populate demo users and 20 sample tickets, run the seed script in the Supabase SQL Editor:

```sql
-- Creates: admin@example.com, employee@example.com,
--          john.doe@example.com, alice.johnson@example.com, bob.wilson@example.com
-- All passwords: password123
-- Also inserts 20 realistic sample tickets across all categories and statuses
```

> See `supabase/seed.sql` or run the seed queries from the project setup instructions.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| Employee | employee@example.com | password123 |
| Employee | john.doe@example.com | password123 |
| Employee | alice.johnson@example.com | password123 |
| Employee | bob.wilson@example.com | password123 |

---

## Available Scripts

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking (no emit)
```

---

## API Reference

All data access goes through the Supabase client SDK with RLS enforcing authorization. The service layer lives in `src/services/ticketService.ts`.

### Ticket Operations

| Method | Description |
|---|---|
| `getTickets(filters)` | Paginated list with search, status, priority, category filters |
| `getTicketById(id)` | Single ticket with creator profile joined |
| `createTicket(data)` | Insert new ticket (RLS sets `created_by = auth.uid()`) |
| `updateTicket(id, updates, userId, original)` | Update status/priority + log history |
| `deleteTicket(id)` | Hard delete (admin only via RLS) |
| `getTicketHistory(ticketId)` | Ordered audit log for a ticket |
| `getDashboardStats()` | Aggregate counts by status and priority |
| `getMonthlyStats()` | Last 6 months ticket volume for charts |
| `getOpenTicketCount()` | Live count for notification badge |
| `getAllUsers()` | User list with per-user ticket stats (admin) |

---

## Ticket Workflow

```
Open → In Progress → Resolved → Closed
```

Only administrators can change ticket status or priority. All changes are recorded in `ticket_history` with the previous and new values, timestamp, and who made the change.

---

## Categories

`Hardware` · `Software` · `Network` · `Email` · `Printer` · `Access` · `Security` · `Database` · `Server` · `Other`

## Priority Levels

| Priority | Description |
|---|---|
| Low | Minor issue, no immediate impact |
| Medium | Moderate impact, can wait for next business day |
| High | Significant impact on work or productivity |
| Critical | System down or severe business impact |

---

## Deployment

### Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project dashboard under **Settings → Environment Variables**.

### Frontend — Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

Add the same environment variables in **Site Settings → Environment Variables**.

### Database — Supabase (already hosted)

Supabase is a fully managed cloud service. Your database, auth, and RLS policies are live as soon as the migration runs. No additional deployment steps needed.

---

## Future Enhancements

- [ ] Email notifications on ticket status change (Supabase Edge Functions + Resend)
- [ ] File/screenshot attachments on tickets
- [ ] Admin assignment of tickets to specific team members
- [ ] SLA tracking with due dates and breach alerts
- [ ] Dark mode toggle
- [ ] Bulk ticket actions (multi-select + batch status update)
- [ ] Advanced dashboard filters (date range, per-department)
- [ ] Ticket templates for common incident types
- [ ] Public-facing status page
- [ ] PDF export for individual ticket reports
- [ ] Real-time updates via Supabase Realtime subscriptions

---

## License

MIT — free to use, modify, and distribute.

---

> Built with React, TypeScript, Tailwind CSS, and Supabase.
