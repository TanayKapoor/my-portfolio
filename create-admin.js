import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

// Create admin user for testing
async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Hash the password
    const password = 'admin123'; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert admin user
    const result = await pool.query(`
      INSERT INTO users (username, email, password, first_name, last_name, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        is_admin = EXCLUDED.is_admin
      RETURNING id, username, email, is_admin
    `, ['admin', 'admin@example.com', hashedPassword, 'Admin', 'User', true]);
    
    console.log('Admin user created/updated:', result.rows[0]);
    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
createAdminUser();