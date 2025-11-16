// Check if user exists and test password
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function checkUser() {
  try {
    console.log('Checking user in database...\n');

    // Get user by username
    const [user] = await db.select().from(users).where(eq(users.username, 'tanay'));

    if (!user) {
      console.log('❌ User "tanay" not found in database');
      return;
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   isAdmin:', user.isAdmin);
    console.log('   Password hash:', user.password);

    // Test password
    const testPassword = 'jump6bladder*dias0youse';
    const passwordMatch = await bcrypt.compare(testPassword, user.password);

    console.log('\n🔐 Password test:');
    console.log('   Testing password:', testPassword);
    console.log('   Password matches:', passwordMatch ? '✅ YES' : '❌ NO');

    if (!passwordMatch) {
      console.log('\n⚠️  Password does not match! Re-hashing the password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('   New hash:', newHash);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

checkUser();
