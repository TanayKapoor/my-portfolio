// Add admin user using TypeScript and existing setup
import { db } from './server/db';
import { users } from './shared/schema';
import bcrypt from 'bcrypt';

async function addAdminUser() {
  try {
    console.log('Adding admin user to production database...');
    
    // Hash the password
    const password = 'jump6bladder*dias0youse';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert admin user using Drizzle
    const result = await db
      .insert(users)
      .values({
        username: 'tanay',
        email: 'tanay@admin.com',
        password: hashedPassword,
        firstName: 'Tanay',
        lastName: 'Admin',
        isAdmin: true,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: {
          password: hashedPassword,
          isAdmin: true,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
      });
    
    console.log('✅ Admin user created successfully:');
    console.log(result[0]);
    console.log('\n📝 Login credentials:');
    console.log('Username: tanay');
    console.log('Password: jump6bladder*dias0youse');
    
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    
    // If it's a missing table error, suggest running migrations
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 It looks like the users table might not exist.');
      console.log('Try running: npm run db:push');
    }
  }
}

addAdminUser();