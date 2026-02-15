const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    const r = await client.query('SELECT count(*) FROM materials')
    console.log('materials count:', r.rows[0].count)
  } catch (err) {
    console.error('Query failed', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
