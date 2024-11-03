import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/15d5b22b60f2c2f30e122554f818108e6ce0892b562d9eec3096fc73ce737600.sqlite" // file: prefix is required by libsql
  }
})
