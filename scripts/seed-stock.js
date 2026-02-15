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
    // ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_balances (
        id SERIAL PRIMARY KEY,
        material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        on_hand NUMERIC(12,4) DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `)

    const sku = 'MAT-001'
    const mat = await client.query('SELECT id FROM materials WHERE sku = $1', [sku])
    if (mat.rowCount === 0) {
      console.error('Material', sku, 'not found')
      process.exit(1)
    }
    const materialId = mat.rows[0].id

    // upsert balance (set on_hand = 100)
    const onHand = 100
    const exists = await client.query('SELECT id FROM stock_balances WHERE material_id = $1', [materialId])
    if (exists.rowCount > 0) {
      await client.query('UPDATE stock_balances SET on_hand = $1, updated_at = now() WHERE material_id = $2', [onHand, materialId])
      console.log('Updated stock_balances for material', sku)
    } else {
      await client.query('INSERT INTO stock_balances (material_id, on_hand) VALUES ($1,$2)', [materialId, onHand])
      console.log('Inserted stock_balances for material', sku)
    }
  } catch (err) {
    console.error('Seed stock failed', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
