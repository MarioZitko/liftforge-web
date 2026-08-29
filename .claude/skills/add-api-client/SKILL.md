---
name: add-api-client
description: Use when adding a new API domain client to talk to a new backend resource — triggers like "add an API client for X", "wire up the frontend to the new <resource> endpoint", "create an api folder for X". Scaffolds the singleton class extending BaseApi plus its types file, following the existing pattern in src/api/. Do NOT use this for adding a single method to an existing domain — just add the method to the existing <domain>.api.ts file.
---

# Add a new API domain client

Scaffolds `src/api/<domain>/` following the pattern documented in the root
[`CLAUDE.md`](../../CLAUDE.md) ("API client pattern") and
[`.claude/docs/01-coding-standards.md`](../docs/01-coding-standards.md) ("API calls").

## Before you start — gather

- The backend resource path (e.g. `/exercises`) — confirm it against the API repo's controller if
  you have access, don't guess.
- The response shape(s) — model them in the types file from the actual backend DTO, not from
  assumption.

## Steps

1. Create `src/api/<domain>/<domain>.types.ts` — request/response types for this domain.
2. Create `src/api/<domain>/<domain>.api.ts` — the singleton class.
3. Use it directly from the page/component that needs it (there is no separate data-fetching-hook
   layer in this codebase — see [`.claude/docs/01-coding-standards.md`](../docs/01-coding-standards.md)).

## Template — `src/api/<domain>/<domain>.types.ts`

```typescript
export interface <Domain> {
  id: number;
  // ...fields matching the backend DTO exactly
}

export interface Create<Domain>Dto {
  // ...
}
```

## Template — `src/api/<domain>/<domain>.api.ts`

```typescript
import BaseApi from "@/lib/base.api";
import type { ApiSuccessResponse } from "@/api/types";
import type { <Domain>, Create<Domain>Dto } from "./<domain>.types";

export default class <Domain>ApiClient extends BaseApi {
  private static instance: <Domain>ApiClient;

  private constructor() {
    super("/<resource-path>");
  }

  public static getInstance(): <Domain>ApiClient {
    if (!<Domain>ApiClient.instance) {
      <Domain>ApiClient.instance = new <Domain>ApiClient();
    }
    return <Domain>ApiClient.instance;
  }

  async getAll(): Promise<ApiSuccessResponse<<Domain>[]>> {
    return (await this.axiosInstance.get("/")).data;
  }

  async create(dto: Create<Domain>Dto): Promise<ApiSuccessResponse<<Domain>>> {
    return (await this.axiosInstance.post("/", dto)).data;
  }
}
```

## Calling it from a component

```tsx
const [data, setData] = useState<Domain[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  <Domain>ApiClient.getInstance()
    .getAll()
    .then((res) => setData(res.data))
    .catch((err) => showError(err, "Failed to load <domain>"))
    .finally(() => setLoading(false));
}, []);
```

## Checklist (must all be true)

- [ ] Class extends `BaseApi`, uses the private-constructor + `getInstance()` singleton pattern.
- [ ] Every method returns `Promise<ApiSuccessResponse<T>>` (or `void` for deletes) — access
  `.data` at the call site, not inside the client.
- [ ] Types live in `<domain>.types.ts`, not inlined in the `.api.ts` file.
- [ ] Errors surfaced via `showError(err, fallback)` with the caught error actually bound — never
  a bare `catch { showError("...") }` (see [`.claude/docs/04-refactor-backlog.md`](../docs/04-refactor-backlog.md)
  for why this matters).
- [ ] No new data-fetching-hook abstraction invented for this one domain, unless explicitly asked.
