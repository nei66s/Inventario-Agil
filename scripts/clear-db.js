#!/usr/bin/env node
// Trunca todas as tabelas do schema público (exceto schema_migrations) e reinicia sequences.
// Usa DATABASE_URL da env local.
const { Client } = require('pg')

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL não está configurado. Exporte DATABASE_URL antes de rodar.')
    process.exit(1)
  }

  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  try {
    const res = await client.query(
      `SELECT table_schema, table_name
       FROM information_schema.tables
       WHERE table_type='BASE TABLE'
         AND table_schema NOT IN ('pg_catalog','information_schema')
         AND table_name <> 'schema_migrations'`
    )
    const tables = res.rows.map((r) => `${r.table_schema}.${r.table_name}`)
    if (tables.length === 0) {
      console.log('Nenhuma tabela encontrada para truncar.')
      return
    }

    const quoted = tables.map((t) => '"' + t.replace('.', '"."') + '"')
    const sql = `TRUNCATE ${quoted.join(', ')} RESTART IDENTITY CASCADE;`
    console.log('Executando:', sql)
    await client.query(sql)
    console.log('Banco limpo com sucesso.')
  } catch (err) {
    console.error('Erro ao limpar banco:', err)
    process.exitCode = 2
  } finally {
    await client.end()
  }
}

main()
