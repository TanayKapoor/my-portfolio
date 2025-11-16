// Fix session table by dropping and recreating it properly
import { pool } from './server/db';

async function fixSessionTable() {
  const client = await pool.connect();

  try {
    console.log('Fixing session table...\n');

    // Drop the index if it exists
    console.log('1. Dropping existing index...');
    await client.query('DROP INDEX IF EXISTS "IDX_session_expire"');
    console.log('   ✅ Dropped\n');

    // Drop the session table if it exists
    console.log('2. Dropping existing session table...');
    await client.query('DROP TABLE IF EXISTS "session" CASCADE');
    console.log('   ✅ Dropped\n');

    // Create the session table with the correct schema
    console.log('3. Creating session table...');
    await client.query(`
      CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    console.log('   ✅ Created\n');

    // Add primary key
    console.log('4. Adding primary key...');
    await client.query(`
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    `);
    console.log('   ✅ Added\n');

    // Create index on expire column
    console.log('5. Creating index on expire...');
    await client.query(`
      CREATE INDEX "IDX_session_expire" ON "session" ("expire");
    `);
    console.log('   ✅ Created\n');

    console.log('✅ Session table fixed successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSessionTable();
