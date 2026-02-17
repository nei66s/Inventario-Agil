const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const operators = [
  'Flavio',
  'Graciela',
  'Jean',
  'Pedro',
  'Rodrigo',
  'Vitor',
  'Vinicius',
  'Sallu',
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
    await client.query("DELETE FROM users WHERE email LIKE '%@gmail.com'");
    const passwordHash = bcrypt.hashSync('12345', 10);
    for (const name of operators) {
      const id = `usr-${name.toLowerCase()}`;
      const email = `${name.toLowerCase()}@gmail.com`;
      await client.query(
        'INSERT INTO users(id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)',
        [id, name, email, passwordHash, 'Picker']
      );
    }
    await client.query('COMMIT');
    console.log(`Seeded ${operators.length} operator accounts.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed operators', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
