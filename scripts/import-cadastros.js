const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headerLine = lines.shift();
  const headers = headerLine.split(',').map((col, idx) => {
    const trimmed = col.trim();
    if (trimmed) return trimmed;
    return `Column${idx}`;
  });

  return lines.map((line) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? '').trim();
    });
    return row;
  });
}

function buildName(row, index) {
  return (
    row['Produto'] ||
    row['Fibra'] ||
    row['Corda'] ||
    row['Trico'] ||
    row['Fio'] ||
    `Material ${String(index + 1).padStart(3, '0')}`
  );
}

function buildDescription(row) {
  const parts = ['Fibra', 'FibraCor', 'Corda', 'CordaCor', 'Trico', 'TricoCor', 'Fio', 'Fiocor']
    .map((key) => row[key])
    .filter(Boolean);
  return parts.join(' | ') || 'Descrição não especificada';
}

function buildColorOptions(row) {
  const colors = ['FibraCor', 'CordaCor', 'TricoCor', 'Fiocor']
    .map((key) => row[key])
    .filter((value, index, array) => value && array.indexOf(value) === index);
  return colors;
}

async function main() {
  const [, , csvPathArg] = process.argv;
  if (!csvPathArg) {
    console.error('Usage: node scripts/import-cadastros.js <path-to-cadastros.csv>');
    process.exit(1);
  }

  const csvPath = path.isAbsolute(csvPathArg) ? csvPathArg : path.join(process.cwd(), csvPathArg);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(content).filter((row) => Object.values(row).some((value) => value !== ''));
  if (rows.length === 0) {
    console.log('No rows found in CSV. Nothing to import.');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE materials RESTART IDENTITY CASCADE');

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const sku = row['Código'] || `CAD-${String(i + 1).padStart(3, '0')}`;
      const name = buildName(row, i);
      const description = buildDescription(row);
      const unit = row['Tipos'] || row['Data'] || 'EA';
      const colorOptions = buildColorOptions(row);
      const metadata = { ...row };

      await client.query(
        `
        INSERT INTO materials
          (sku, name, description, unit, min_stock, reorder_point, setup_time_minutes, production_time_per_unit_minutes, color_options, metadata)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
        [
          sku,
          name,
          description,
          unit,
          0,
          0,
          0,
          0,
          JSON.stringify(colorOptions),
          JSON.stringify(metadata),
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Imported ${rows.length} rows into materials.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to import cadastros', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
