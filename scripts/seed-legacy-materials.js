const { Client } = require('pg');

const conditionOptions = {
  Fibra: ['Cordão 3,2 mm', 'Cordão 5 mm', 'Meia Cana 6 mm', 'Fita 10 mm', 'Dupla 12 mm', 'Fita 15 mm Fina', 'Fita 15 mm Grossa', 'Fita 20 mm'],
  FibraCor: ['Amarelo', 'Azul BIC', 'Azul Tiffany', 'Azul Royal', 'Azul CVC', 'Azul Acinzentado', 'Azul Marinho', 'Branco', 'Preto', 'Terracota', 'Vinho Bordô', 'Verde Militar', 'Turquesa'],
  Corda: ['Cordão 3,2 mm', 'Cordão 5 mm', 'Dupla 12 mm', 'Fita 10 mm', 'Fita 15 mm Fina', 'Fita 15 mm Grossa', 'Fita 20 mm'],
  CordaCor: ['Amarelo', 'Azul Tiffany', 'Azul CVC', 'Azul Marinho', 'Azul Turquesa', 'Branco', 'Cinza', 'Ferrugem', 'Preto', 'Verde Militar'],
  Trico: ['Meia Cana 6 mm', 'Fita 10 mm', 'Fita 15 mm Fina', 'Fita 15 mm Grossa', 'Fita 20 mm', 'Dupla 12 mm'],
  TricoCor: ['Azul Tiffany', 'Azul CVC', 'Champagne', 'Chumbo', 'Preto', 'Verde Militar', 'Vinho Bordô', 'Terracota', 'Marrom'],
  Fio: ['Fio', 'Fita 10 mm', 'Fita 20 mm'],
  Fiocor: ['Natural', 'Rami', 'Champagne', 'Azul Tiffany', 'Verde Militar', 'Terracota'],
};

const materials = [
  {
    sku: 'M-016',
    name: 'Fibra Sintética',
    description: 'Fibra sintética para cordas e fitas',
    unit: 'KG',
    colorOptions: ['Amarelo', 'Azul Tiffany', 'Verde Militar', 'Branco'],
    metadata: {
      Código: '16',
      Produto: 'Fibra Sintética',
      Tipos: 'Registrado',
      Fibra: conditionOptions.Fibra,
      FibraCor: conditionOptions.FibraCor,
    },
  },
  {
    sku: 'M-022',
    name: 'Corda Náutica',
    description: 'Cordas náuticas trançadas',
    unit: 'KG',
    colorOptions: ['Azul Marinho', 'Terracota', 'Preto', 'Branco'],
    metadata: {
      Código: '22',
      Produto: 'Corda Náutica',
      Tipos: 'Registrado',
      Corda: conditionOptions.Corda,
      CordaCor: conditionOptions.CordaCor,
    },
  },
  {
    sku: 'M-024',
    name: 'Trico Náutico',
    description: 'Tricôs com acabamento náutico',
    unit: 'KG',
    colorOptions: ['Azul CVC', 'Champagne', 'Chumbo', 'Verde Militar'],
    metadata: {
      Código: '24',
      Produto: 'Trico Náutico',
      Tipos: 'Registrado',
      Trico: conditionOptions.Trico,
      TricoCor: conditionOptions.TricoCor,
    },
  },
  {
    sku: 'M-042',
    name: 'Fio',
    description: 'Fios para acabamento e costura',
    unit: 'KG',
    colorOptions: ['Natural', 'Terracota', 'Verde Militar'],
    metadata: {
      Produto: 'Fio',
      Tipos: 'Genérico',
      Fio: conditionOptions.Fio,
      Fiocor: conditionOptions.Fiocor,
    },
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE materials RESTART IDENTITY CASCADE');
    for (const material of materials) {
      await client.query(
        `
        INSERT INTO materials
          (sku, name, description, unit, min_stock, reorder_point, setup_time_minutes, production_time_per_unit_minutes, color_options, metadata)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
        [
          material.sku,
          material.name,
          material.description,
          material.unit,
          0,
          0,
          0,
          0,
          JSON.stringify(material.colorOptions),
          JSON.stringify(material.metadata),
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`Seeded ${materials.length} legacy materials.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed legacy materials', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
