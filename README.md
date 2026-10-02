# Todo frontend

Nuxt 3 + Vue 3 + Pinia client for the Laravel todo API in [`LucasRoseira/back-todo-app`](https://github.com/LucasRoseira/back-todo-app).

The UI covers tasks and categories: list, search, filter, paginate, create, update, delete, and task status history. Mutations update the screen immediately and roll back if the API rejects them.

## Stack

- Nuxt 3 (file-based routing, `runtimeConfig`)
- Vue 3 Composition API with `<script setup>`
- Pinia stores for tasks, categories, and toasts
- Tailwind CSS and `@nuxtjs/color-mode`
- VeeValidate + Yup for form validation
- `ofetch` (`$fetch`) for API calls

## Setup

Requirements: Node 20+ and Yarn or npm. The Laravel API should already be running (see that repo for migrations and seed data).

```bash
yarn install
cp .env.example .env
yarn dev
```

npm equivalents: `npm install`, `npm run dev`, `npm run build`.

The app serves on `http://localhost:3000` and calls the API at `NUXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`). No secrets are required. The Laravel app in this assessment allows every origin, so the Nuxt dev server can call it directly.

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Nuxt maps that variable to `runtimeConfig.public.apiBaseUrl`. Do not put tokens or passwords in the frontend; this API does not use authentication.

Production build:

```bash
yarn build
yarn preview
```

## How it talks to Laravel

All requests go to `{apiBaseUrl}/api/...` with `Accept: application/json`. List endpoints expect a Laravel length-aware paginator:

```json
{
  "data": [],
  "current_page": 1,
  "last_page": 1,
  "per_page": 10,
  "total": 0
}
```

| Action | Request |
| --- | --- |
| List tasks | `GET /api/tasks?page&per_page&title&description&status&priority&due_date&category_id&filter_type&responsible_name` |
| Create task | `POST /api/tasks` |
| Update task | `PUT /api/tasks/{id}` |
| Delete task | `DELETE /api/tasks/{id}` |
| Status history | `GET /api/tasks/{id}/history` |
| List categories | `GET /api/categories?page&per_page&name` |
| Create category | `POST /api/categories` `{ "name", "color" }` |
| Update category | `PUT /api/categories/{id}` |
| Delete category | `DELETE /api/categories/{id}` |

`filter_type` matches the API: `today`, `pending`, or `overdue`. Task index responses include the related `category`. Create and update responses are the Eloquent model, so the client reattaches the category from the category store when the relation is missing.

Example create:

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Finish the proposal",
  "description": "Send the draft",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-10-10",
  "category_id": 1,
  "responsible_name": "Noah"
}
```

Validation errors (`422`) look like:

```json
{
  "message": "The status field is invalid.",
  "errors": { "status": ["The status field is invalid."] }
}
```

The client shows the first field message in the form or in a toast.

## Architecture

```
components/     presentational UI (lists, forms, modal, sidebar, toasts)
layouts/        app shell
pages/          route orchestration only
stores/         Pinia state, getters, and actions
middleware/     scroll to top on navigation
utils/          API errors, query cleanup, dates
types/          task, category, and pagination contracts
```

Each store has one job:

- `useTaskStore` — task list, filters, pagination, history, and task mutations
- `useCategoriesStore` — category pages plus a 100-item options list for task selects
- `useToastStore` — transient success and error messages

Components do not call `$fetch`. Pages call store actions and render the result. Shared chrome (sidebar, toasts, modal, pagination, empty and loading states) lives outside the feature components.

`public/shared` was the wrong place for Vue files: Nuxt serves `public/` as static assets and does not compile them. The sidebar, toast, and loading overlay now live in `components/`, and the misspelled `puglins` plugin was removed. Toasts are a Pinia store rendered by `ToastHost` in the default layout, instead of a second Vue app mounted from `public/`.

Routing:

- `/` redirects to `/tasks`
- `/tasks` and `/categories` use the default layout
- `middleware/scroll-top.global.ts` resets scroll on each navigation

## Optimistic updates and errors

Creates insert a temporary row, then replace it with the server record. Updates and status toggles change the row in place. Deletes remove the row immediately. If the request fails, the previous list is restored and the message from the API is shown. Status history for that task is dropped after a successful status change so the next open refetches it.

`$fetch` is used instead of `useFetch` so mutations and filter changes are not stuck on a cached URL.

Network failures (API not running, wrong base URL) use a single message that points at `NUXT_PUBLIC_API_BASE_URL`. List failures stay on the page with a retry button. Form failures stay inside the dialog. Deletes, status toggles, and history failures use toasts.

## Assumptions and trade-offs

- The API has no auth. The UI does not send tokens.
- Category rows are `name` and `color` only. The old active/archived filter is gone because the table has no status column.
- The category picker loads at most 100 categories (`per_page` max on the API).
- Creating a task with status `in_progress` is allowed. Updating an existing task to `in_progress` is not: `TaskUpdateRequest` only allows `pending` and `completed`. The edit form warns about that, and a `422` is shown if it is submitted anyway. The checkbox only toggles completed and pending, which the update endpoint accepts.
- New tasks cannot use a past due date (`after_or_equal:today`). Updates can.
- Task order is whatever the API returns (`orderBy('priority')`, which is alphabetical). The UI does not reorder a page.
- The task index does not filter by `category_id` (the repository never applies that query param). The category control is on the task form, not in the list filters, so the UI does not offer a filter the API would ignore.
- Deleting a category nulls `category_id` on tasks (`onDelete('set null')`). The UI says so in the confirm dialog.
- The API may send mail when a task is updated or deleted. A mail failure comes back as a normal API error and the optimistic change is rolled back.
- Data is loaded on the client (`onMounted`) so `nuxt build` does not need a running API.

## Completed features

- Task list with search, quick views (all, today, pending, overdue), advanced filters, and pagination
- Create, edit, complete/reopen, and delete tasks
- Per-task status history
- Category list with name search, color, pagination, create, edit, and delete
- Create a category from the task form and select it
- Optimistic mutations with rollback
- Inline validation, API error messages, toasts, loading skeletons, and empty states
- Light and dark mode, keyboard focus, labeled controls, and dialog semantics
- Configurable API base URL

## Known limitations

- No automated test suite in this repo.
- No authentication, realtime updates, or offline queue.
- A filtered list can briefly show a new task or category that the active filter would exclude. Creates stay in the local list so the save feels immediate.
- More than 100 categories will not all appear in the task dropdown.
- Updating a task to "In progress" fails until the Laravel `TaskUpdateRequest` allows that status.
- Status history is loaded when a row is expanded, not with the list.
