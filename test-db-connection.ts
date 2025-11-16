import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Hide password in output for security
  const sanitizedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log(`📝 Connection string: ${sanitizedUrl}\n`);

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // Test basic connection
    console.log('⏳ Attempting to connect...');

    // Get PostgreSQL version
    const versionResult = await sql`SELECT version()`;
    console.log('✅ Successfully connected to database!\n');

    console.log('📊 Database Information:');
    console.log(`   PostgreSQL Version: ${versionResult[0].version}\n`);

    // Get current database name
    const dbResult = await sql`SELECT current_database()`;
    console.log(`   Current Database: ${dbResult[0].current_database}`);

    // Get current user
    const userResult = await sql`SELECT current_user`;
    console.log(`   Current User: ${userResult[0].current_user}`);

    // List tables in the database
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`\n📋 Tables in database (${tablesResult.length}):`);
    if (tablesResult.length === 0) {
      console.log('   (No tables found - database is empty)');
    } else {
      tablesResult.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }

    await sql.end();

    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error details:', error);

    if (error instanceof Error) {
      console.error('\nCommon issues:');
      console.error('  • Check if PostgreSQL is running on your home server');
      console.error('  • Verify the host/IP address is correct and accessible');
      console.error('  • Ensure the port (usually 5432) is correct');
      console.error('  • Check username and password are correct');
      console.error('  • Verify the database name exists');
      console.error('  • Check firewall settings allow connections');
      console.error('  • Ensure pg_hba.conf allows connections from your IP');
    }

    await sql.end();
    process.exit(1);
  }
}

testConnection();
