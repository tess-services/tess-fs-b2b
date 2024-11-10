# Fullstack application template

## Web

- [Remix](https://remix.run/docs/en/main/start/quickstart) Fullstack application
- [Shadcn UI](https://ui.shadcn.com/) & Tailwind CSS
- [Better auth for authentication](https://www.better-auth.com/docs/introduction)
- TypeScript

## Api

- [Hono JS](https://hono.dev/) - compatible with most of the JS runtime
- [R2](https://www.cloudflare.com/en-au/developer-platform/products/r2/) - 0 egress fee cloud storage by Cloudflare
- [D1](https://www.cloudflare.com/en-au/developer-platform/products/d1/) - Distributed Sqlite databased as service by Cloudflare
- [Cloudflare Pages](https://www.cloudflare.com/en-au/developer-platform/products/pages/)
- [Drizzle ORM](https://orm.drizzle.team/docs/get-started)

## Dev machine setup

1. Download and install bun
2. Run DB Migration script
  `bun run migration:apply:local`
3. Run `bun run dev`

## Useful commands

- To open Drizzle Kit studio on local miniflare DB
  
```sh
bun drizzle-kit studio --config=drizzle-dev.config.ts
```
