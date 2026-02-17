const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const email = 'admin@gmail.com';
    const passwordHash = bcrypt.hashSync('admin', 10);
    await client.query('DELETE FROM users WHERE email = $1', [email]);
    await client.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)',
      ['usr-admin-gmail', 'Admin Gmail', email, passwordHash, 'Admin']
    );
    console.log('admin@gmail.com inserted with password admin');
  } catch (err) {
    console.error('Failed to add admin@gmail.com', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
