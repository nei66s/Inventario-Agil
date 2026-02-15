const { Client } = require('pg')
const path = require('path')
const fs = require('fs')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  const sku = 'MAT-001'
  try {
    const exists = await client.query('SELECT id FROM materials WHERE sku = $1', [sku])
    if (exists.rowCount > 0) {
      console.log('Material with sku', sku, 'already exists (id=', exists.rows[0].id,')')
      await client.end()
      return
    }

    const res = await client.query(
      `INSERT INTO materials (sku, name, description, unit) VALUES ($1,$2,$3,$4) RETURNING id`,
      [sku, 'Microcontrolador X1', 'Material seed para teste', 'EA']
    )

    console.log('Inserted material id=', res.rows[0].id)
  } catch (err) {
    console.error('Seed failed', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
