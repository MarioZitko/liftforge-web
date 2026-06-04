# LiftForge Web — CLAUDE.md

## Project overview

React 19 SPA for LiftForge, a coaching platform where coaches build training programs and clients track their workouts. Built with Vite, TypeScript, TailwindCSS v4, and shadcn/ui. Communicates with the LiftForge NestJS API via cookie-based JWT auth.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | TailwindCSS v4 (via `@tailwindcss/vite` plugin) |
| Component library | shadcn/ui (Radix UI primitives) + Tabler Icons + Lucide |
| Routing | React Router DOM v7 |
| State management | Zustand 5 (with `persist` middleware) |
| Forms | React Hook Form v7 + Zod validation |
| HTTP client | Axios (singleton pattern per resource) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | Recharts |
| Animations | Framer Motion |
| Date picker | react-day-picker v9 |
| Toasts | Sonner |
| Tables | @tanstack/react-table v8 |
| Theme | next-themes (dark/light mode) |

## Project structure

```
src/
  main.tsx             # React entry point
  App.tsx              # providers: ThemeProvider, AuthProvider, Router
  routes.tsx           # all route definitions with role guards
  api/                 # typed API clients, one per domain
    types.ts           # shared ApiSuccessResponse / ApiErrorResponse types
    auth/
    client/
    coach/
    exercises/
    programs/
    training/
    training-block/
    training-exercise/
    training-week/
    users/
  components/          # reusable UI components
    ui/                # shadcn/ui generated components (don't hand-edit)
    layout/            # AppShell, Sidebar, Header
    buttons/
    dataTable/
    dropdown/
    fileUpload/
    grid/
    input/
    loaders/
    page/
    shared/
    sidebar/
    sortableList/
    submitHandler/
    typography/
  hooks/
    useAuth.ts         # login/logout, session hydration on load
    useMobile.ts
    useProgramView.ts
    useServerPagination.ts
    useToggleSet.ts
    AuthProvider.tsx   # wraps app, calls getMe on mount
  lib/
    base.api.ts        # BaseApi class — all API clients extend this
    axios.ts
    RequireRole.tsx    # route-level role guard component
    date.ts
    program-utils.ts
    utils.ts           # cn() and other utility helpers
  pages/               # one folder per feature area
    auth/
    admin/
    calendar/
    clients/
    dashboard/
    exercises/
    profile/
    programs/
    HomePage.tsx
  store/
    userStore.ts       # persisted Zustand store (localStorage: "liftforge-user")
    clientStore.ts
    coachStore.ts
  types/               # global TypeScript types
```

## Routing & auth

All routes are defined in [`src/routes.tsx`](src/routes.tsx).

**Role-based access pattern:**
```tsx
<ProtectedRoute>
  <RequireRole allow={["COACH", "ADMIN"]}>
    <SomePage />
  </RequireRole>
</ProtectedRoute>
```

- `ProtectedRoute` redirects to `/login` if `useUserStore` has no user
- `RequireRole` renders nothing / redirects if the user's role is not in `allow`
- Roles: `CLIENT | COACH | ADMIN`

**Route map summary:**

| Path | Role | Page |
|---|---|---|
| `/dashboard` | COACH, ADMIN | CoachDashboardPage |
| `/programs` | COACH, ADMIN | CoachProgramsPage |
| `/programs/:id` | COACH, ADMIN | ProgramDetailPage |
| `/programs/:id/trainings/:id` | COACH, ADMIN | TrainingDetailPage |
| `/my-programs` | CLIENT, ADMIN | ClientProgramsPage |
| `/my-programs/:id` | CLIENT, ADMIN | ClientProgramDetailPage |
| `/calendar` | COACH, ADMIN | CalendarPage |
| `/my-calendar` | CLIENT, ADMIN | ClientCalendarPage |
| `/clients` | COACH, ADMIN | ClientsPage |
| `/coach/exercises` | COACH, ADMIN | CoachExercisesPage |
| `/client/exercises` | CLIENT, ADMIN | ClientExercisesPage |
| `/admin` | ADMIN | AdminPage |
| `/profile` | all | ProfilePage |

## API client pattern

Every API domain has a singleton class extending `BaseApi`:

```typescript
// src/api/exercises/exercises.api.ts
export default class ExercisesApiClient extends BaseApi {
  private static instance: ExercisesApiClient;
  private constructor() { super("/exercises"); }
  public static getInstance() { ... }

  async getAll(): Promise<ApiSuccessResponse<Exercise[]>> {
    return (await this.axiosInstance.get("/")).data;
  }
}
```

`BaseApi` ([`src/lib/base.api.ts`](src/lib/base.api.ts)):
- Sets `baseURL` to `VITE_API_BASE_URL + resourcePath`
- Enables `withCredentials: true` for cookie auth
- Response interceptor: on 401 outside public pages → clears user store → redirects to `/login`

**Response envelope** (matches API):
```typescript
interface ApiSuccessResponse<T> {
  statusCode: number;
  timestamp: string;
  data: T;
}
```

## State management

Three Zustand stores:

| Store | Persisted | Contents |
|---|---|---|
| `userStore` | yes (localStorage) | current user (`GetMeResponse \| null`), setUser, logout |
| `clientStore` | no | client-specific state |
| `coachStore` | no | coach-specific state |

`useUserStore` is the auth source of truth. On app load, `AuthProvider` calls `getMe()` to hydrate/validate the stored session against the live cookie.

## Auth flow (frontend side)

1. App mounts → `AuthProvider` calls `authApi.getMe()` → sets user or clears store
2. Login → `authApi.login()` → `authApi.getMe()` → `setUser()`
3. Logout → `authApi.logout()` → `clearUser()` → redirect to `/login`
4. 401 response anywhere → `BaseApi` interceptor clears user + redirects
5. OAuth → `/oauth-callback` → `/oauth-finalize` pages handle the redirect flow

## Forms

All forms use React Hook Form + Zod resolver:

```typescript
const schema = z.object({ name: z.string().min(1) });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

shadcn/ui `<Form>` components wrap RHF field state for accessible error messages.

## Styling conventions

- TailwindCSS v4 — utility-first, no custom CSS unless unavoidable
- `cn()` from [`src/lib/utils.ts`](src/lib/utils.ts) merges class names (clsx + tailwind-merge)
- Dark/light theme via `next-themes`; avoid hard-coding `text-black` or `bg-white` — use semantic tokens
- shadcn/ui components live in `src/components/ui/` — regenerate with `npx shadcn@latest add <component>`, don't hand-edit
- Use `tailwind-variants` for component variants instead of long ternary strings

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL e.g. `https://api.liftforge.app` |

## Development

```bash
yarn dev        # start Vite dev server
yarn build      # tsc + vite build → dist/
yarn preview    # preview production build locally
yarn lint       # ESLint
```

Path alias: `@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Adding a new page

1. Create `src/pages/<feature>/<PageName>.tsx`
2. Import and add the route to [`src/routes.tsx`](src/routes.tsx) with appropriate `ProtectedRoute` + `RequireRole`
3. If it needs an API call, create or extend the API client in `src/api/<feature>/`
4. Add a sidebar link in the layout component if needed

## Adding a new API client

1. Create `src/api/<domain>/<domain>.api.ts` extending `BaseApi`
2. Create `src/api/<domain>/<domain>.types.ts` for request/response types
3. Use the singleton `getInstance()` pattern
4. Return typed `ApiSuccessResponse<T>` — access `.data` at the call site

## Docker deployment (Hetzner)

The frontend is built as static files (`yarn build` → `dist/`) and served by nginx. nginx also proxies `/api` requests to the NestJS container. In CI:
1. Run `yarn build`
2. Copy `dist/` into an nginx Docker image
3. Configure nginx to `try_files $uri /index.html` for SPA routing
