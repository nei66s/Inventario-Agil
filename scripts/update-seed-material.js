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
    const sku = 'MAT-001'
    const res = await client.query(
      `UPDATE materials SET min_stock=$1, reorder_point=$2, setup_time_minutes=$3, production_time_per_unit_minutes=$4, color_options=$5 WHERE sku=$6 RETURNING id`,
      [120, 180, 20, 2, JSON.stringify(['Preto', 'Cinza']), sku]
    )
    if (res.rowCount === 0) {
      console.log('No material updated for sku', sku)
    } else {
      console.log('Updated material id=', res.rows[0].id)
    }
  } catch (err) {
    console.error('Update failed', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
