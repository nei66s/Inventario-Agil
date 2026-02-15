import { Pool } from 'pg'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  throw new Error('DATABASE_URL is not set')
}

export const pool = new Pool({ connectionString: dbUrl })

export async function query<T = any>(text: string, params?: unknown[]) {
  const res = await pool.query<T>(text, params)
  return res
}

export default pool
