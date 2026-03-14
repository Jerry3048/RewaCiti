---
name: react-modular-architecture
description: >
  Senior React frontend developer rules and patterns for refactoring, modularising, and scaling
  React codebases with clean API integration. Use this skill whenever the user wants to improve
  React code quality, structure a project for scalability, add or refactor API calls, create reusable
  components, set up custom hooks, establish folder conventions, or asks how to "clean up", "modularise",
  "restructure", or "scale" a React codebase. Also trigger for: separating concerns, avoiding prop
  drilling, creating a service/API layer, designing component libraries, or any refactoring of
  existing React/Next.js/Vite projects. If the user mentions components, hooks, context, fetching,
  or API integration in a React context — use this skill.
---

# React Modular Architecture Skill

A senior-level ruleset for building, refactoring, and scaling React codebases with modularity,
clean API integration, and long-term maintainability as first-class goals.

---

## Core Philosophy

> **"Every file should do one thing well. Every abstraction should earn its place."**

- Prefer **explicit over implicit** — name things clearly, avoid magic
- **Co-locate** related logic (component + styles + tests + types in one folder)
- **Separate concerns** strictly: UI, state, data fetching, business logic
- **Delay abstraction** — extract only when a pattern repeats 3+ times
- Write code that **new developers can navigate in under 10 minutes**

---

## 1. Folder Structure

Use a **feature-first** folder structure. Group by domain/feature, not by file type.

```
src/
├── app/                    # App shell, routing, providers
│   ├── App.tsx
│   ├── Router.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── features/               # ← Primary domain folders
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   ├── LoginForm.styles.ts
│   │   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts        # Public API of the feature
│   │
│   └── dashboard/
│       └── ...
│
├── shared/                 # Truly reusable across features
│   ├── components/
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Table/
│   ├── hooks/
│   │   ├── usePagination.ts
│   │   └── useDebounce.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
│
├── lib/                    # Third-party integrations & config
│   ├── axios.ts
│   ├── queryClient.ts
│   └── dayjs.ts
│
└── types/                  # Global/shared TypeScript types
    ├── api.types.ts
    └── env.d.ts
```

**Rules:**
- Features own their data — never import one feature directly into another
- Cross-feature communication happens via shared state or events
- `index.ts` barrel files expose only the public API of each feature/component

---

## 2. Component Architecture

### Component Types (in order of responsibility)

| Type | Purpose | Location |
|---|---|---|
| **Page** | Route-level, composes features | `app/pages/` or `features/*/pages/` |
| **Feature Component** | Domain-aware, connected to state/API | `features/*/components/` |
| **Shared/UI Component** | Dumb, reusable, no business logic | `shared/components/` |
| **Layout Component** | Structural scaffolding | `shared/components/layouts/` |

### Component Rules

```tsx
// ✅ DO: Single responsibility, typed props, named export
interface UserCardProps {
  userId: string;
  onSelect?: (id: string) => void;
  variant?: 'compact' | 'full';
}

export const UserCard = ({ userId, onSelect, variant = 'full' }: UserCardProps) => {
  const { user, isLoading } = useUser(userId); // data fetching in hook, not inline

  if (isLoading) return <Skeleton />;

  return (
    <Card onClick={() => onSelect?.(userId)}>
      <UserAvatar src={user.avatar} />
      {variant === 'full' && <UserDetails user={user} />}
    </Card>
  );
};

// ❌ AVOID: Fetching inline, untyped props, default exports for components
export default function UserCard(props: any) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetch('/api/user').then(...) }, []);  // ← move to hook
  ...
}
```

### Component Checklist
- [ ] Single responsibility — does it do one thing?
- [ ] Props are typed with an interface
- [ ] No direct `fetch` / `axios` calls inside the component
- [ ] No business logic — that lives in hooks or services
- [ ] Exports via `index.ts` barrel

---

## 3. Custom Hooks

Hooks are the **primary abstraction layer** between components and data/logic.

### Hook Categories

```
useXxx()          → data fetching hooks (wrap React Query / SWR)
useXxxState()     → local UI state management
useXxxForm()      → form state + validation
useXxxActions()   → mutation / side-effect triggers
```

### Pattern: Data Fetching Hook

```ts
// features/users/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { User } from '../types/user.types';

export const useUser = (userId: string) => {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
};
```

### Pattern: Mutation Hook

```ts
// features/users/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.update,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
};
```

### Hook Rules
- Prefix with `use`, always
- Return consistent shape: `{ data, isLoading, error, ...actions }`
- Never call hooks conditionally
- One hook = one concern. Split if it grows beyond ~80 lines

---

## 4. API / Service Layer

All API communication goes through **service files**. Components and hooks never call
`fetch`/`axios` directly.

### Service File Pattern

```ts
// features/users/services/user.service.ts
import { apiClient } from '@/lib/axios';
import type { User, CreateUserDTO, UpdateUserDTO } from '../types/user.types';

export const userService = {
  getAll: (): Promise<User[]> =>
    apiClient.get('/users').then(r => r.data),

  getById: (id: string): Promise<User> =>
    apiClient.get(`/users/${id}`).then(r => r.data),

  create: (payload: CreateUserDTO): Promise<User> =>
    apiClient.post('/users', payload).then(r => r.data),

  update: ({ id, ...payload }: UpdateUserDTO): Promise<User> =>
    apiClient.patch(`/users/${id}`, payload).then(r => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/users/${id}`),
};
```

### Axios Client Setup

```ts
// lib/axios.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Environment Variables

```ts
// types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
}
```

---

## 5. State Management

Choose the **right tool for the right scope:**

| Scope | Tool |
|---|---|
| Server/async state | React Query (`@tanstack/react-query`) |
| Global UI state (small) | Zustand |
| Global UI state (complex) | Zustand with slices |
| Component-local state | `useState` / `useReducer` |
| Form state | React Hook Form |
| URL state | `useSearchParams` |

### Zustand Store Pattern

```ts
// features/auth/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Rules:**
- Never put server data in Zustand — that's React Query's job
- Zustand is for **UI state** (modals, sidebar open, theme, user session)
- Avoid React Context for frequently updating values — causes re-renders

---

## 6. TypeScript Conventions

```ts
// ✅ Use interfaces for props and object shapes
interface UserProps { id: string; name: string; }

// ✅ Use type aliases for unions, intersections, utilities
type Status = 'idle' | 'loading' | 'success' | 'error';
type UserOrAdmin = User | AdminUser;

// ✅ DTOs for API payloads (separate from domain types)
interface CreateUserDTO { name: string; email: string; role: Role; }
interface UpdateUserDTO extends Partial<CreateUserDTO> { id: string; }

// ✅ Use generics for reusable data structures
interface ApiResponse<T> { data: T; message: string; success: boolean; }
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number; page: number; limit: number;
}

// ❌ Avoid: `any`, enums (use const objects), non-null assertion (!)
```

---

## 7. Error Handling

### API Error Handling

```ts
// shared/utils/error.utils.ts
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
```

### Error Boundaries

```tsx
// shared/components/ErrorBoundary/ErrorBoundary.tsx
// Use react-error-boundary package
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert">
    <p>Something went wrong: {error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Wrap feature roots with error boundaries
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <UserDashboard />
</ErrorBoundary>
```

---

## 8. Performance Patterns

```tsx
// Memoize expensive components
export const UserList = memo(({ users }: UserListProps) => { ... });

// Stable callbacks with useCallback
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []); // empty deps = stable forever

// Expensive computations
const sortedUsers = useMemo(() =>
  [...users].sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);

// Lazy-load feature routes
const Dashboard = lazy(() => import('@/features/dashboard'));
```

**When to memoize:**
- `memo` → component renders frequently with same props, or is in a large list
- `useCallback` → function passed as prop to a memoized child
- `useMemo` → computation is expensive (>1ms, large arrays/objects)

---

## 9. Refactoring Workflow

When refactoring an existing codebase, follow this sequence:

### Phase 1 — Audit (no code changes)
1. Map all API calls — where do they live? (inline fetches, useEffects, services?)
2. Identify duplicated logic (same fetch in 3 components = extract to hook)
3. List components doing too many things (>150 lines is a smell)
4. Find all `any` types and untyped props

### Phase 2 — Extract the API Layer
1. Create `lib/axios.ts` with the configured client
2. Create `features/*/services/*.service.ts` for each domain
3. Move all raw API calls into service files
4. Add TypeScript types for all request/response shapes

### Phase 3 — Extract Custom Hooks
1. For each component doing data fetching: extract a `useXxx` hook
2. Wrap with React Query (`useQuery` / `useMutation`)
3. Remove `useEffect` + `useState` data fetching patterns

### Phase 4 — Modularise Components
1. Apply feature-first folder structure
2. Split large components by responsibility
3. Move shared UI into `shared/components/`
4. Add `index.ts` barrel exports

### Phase 5 — State Cleanup
1. Replace prop drilling (3+ levels) with Zustand or Context
2. Replace server data in Redux/Context with React Query
3. Move URL-driven state to `useSearchParams`

---

## 10. Code Review Checklist

Before submitting or merging any React code:

**Architecture**
- [ ] No API calls directly in components
- [ ] Custom hook per data dependency
- [ ] Feature folder is self-contained
- [ ] Shared components have no business logic

**TypeScript**
- [ ] No `any` types
- [ ] Props typed with interface
- [ ] API response types defined

**Performance**
- [ ] No unnecessary re-renders (check memo/useCallback usage)
- [ ] Large lists use virtualisation (react-virtual) if >100 items
- [ ] Images are lazy-loaded

**Code Quality**
- [ ] Functions < 40 lines
- [ ] Components < 150 lines
- [ ] No commented-out code
- [ ] Named exports (not default) for components

---

## Reference Files

For deeper patterns, see:
- `references/api-patterns.md` — Advanced API patterns (pagination, optimistic updates, polling)
- `references/testing-patterns.md` — Component and hook testing strategies
- `references/migration-guide.md` — Step-by-step legacy codebase migration playbook