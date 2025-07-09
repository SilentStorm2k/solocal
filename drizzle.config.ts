import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl)
  throw new Error('DATABASE_URL not defined in environment variables');

export default defineConfig({
  out: './drizzle/migrations', // where drizzle with output migration files
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: databaseUrl,
  },
});
