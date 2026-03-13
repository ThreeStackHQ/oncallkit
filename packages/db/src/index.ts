import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export * from './schema';

// Re-export drizzle operators so web app uses the same instance
export {
  eq,
  and,
  or,
  not,
  gt,
  gte,
  lt,
  lte,
  ne,
  sql,
  asc,
  desc,
  count,
  inArray,
  notInArray,
  isNull,
  isNotNull,
} from 'drizzle-orm';
