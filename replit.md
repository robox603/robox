# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### المتجر الإلكتروني (`artifacts/store`)

Arabic RTL e-commerce storefront, **frontend-only** (no backend, no DB). Built
to deploy on GitHub Pages or any static host.

- **Stack**: React + Vite + TypeScript, wouter (HashRouter), Tailwind v4,
  shadcn/ui, react-hook-form + zod, lucide-react.
- **Theme**: sky-blue gradient palette, Cairo/Tajawal Arabic fonts, RTL.
- **Persistence**: everything in `localStorage` (products, categories, orders,
  store settings, admin session, cart). Image uploads are resized to base64
  and stored inline.
- **Admin**: hard-coded credentials `admin / admin111` (set in
  `src/lib/storage.ts`). Routes under `/admin/*` redirect unauthenticated
  visitors to `/login`.
- **Checkout flow**: customer enters triple name + phone → order is saved →
  user is redirected to `https://wa.me/<store-whatsapp>` with a pre-filled
  message containing all items and the total. Phone is normalized
  `05XXXXXXXX` → `9665XXXXXXXX`.
- **Default WhatsApp number**: `0556285956` (editable via Admin → الإعدادات).
- **Routing**: HashRouter (`#/path`) plus `base: "./"` in `vite.config.ts` so
  the build works at any sub-path on GitHub Pages without configuration.
- **Build**: `pnpm --filter @workspace/store run build` → output in
  `artifacts/store/dist/public`.
- **Important files**:
  - `src/lib/storage.ts` — typed localStorage layer + admin auth
  - `src/lib/cart.tsx` — cart context
  - `src/lib/image.ts` — image resize + price formatting
  - `src/pages/checkout.tsx` — WhatsApp deep link builder
  - `src/components/site-header.tsx` — shows "لوحة التحكم" when admin signed in
  - `src/components/admin-layout.tsx` — admin sidebar + auth guard
