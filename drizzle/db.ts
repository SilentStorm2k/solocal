import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Initializing the Neon client using the Database_URL from env variables
const sql = neon(process.env.DATABASE_URL!);

// Creating and export the Drizzle ORM instance, with neon client and schema for type-safe queries
export const db = drizzle(sql, { schema });
