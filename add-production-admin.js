// Direct script to add admin user to production database
// Run this with: node add-production-admin.js

import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

async function addProductionAdmin() {
  // Use your production database URL
  const productionDbUrl = process.env.DATABASE_URL; // Make sure this points to production
  
  if (!productionDbUrl) {
    console.error('DATABASE_URL environment variable not found');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: productionDbUrl });
  
  try {
    console.log('Connecting to production database...');
    
    // The password and hashed version
    const password = 'jump6bladder*dias0youse';
    const hashedPassword = '$2b$10$MW7qO3f54Bx4mTX2tdEsQubwadL9GT.d/b0/kyclM1hXrWYXkzmQa';
    
    // Insert admin user
    const result = await pool.query(`
      INSERT INTO users (
        username, 
        email, 
        password, 
        first_name, 
        last_name, 
        is_admin,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        is_admin = EXCLUDED.is_admin,
        updated_at = NOW()
      RETURNING id, username, email, is_admin
    `, ['tanay', 'tanay@admin.com', hashedPassword, 'Tanay', 'Admin', true]);
    
    console.log('✅ Admin user created/updated successfully:');
    console.log(result.rows[0]);
    console.log('\n📝 Login credentials:');
    console.log('Username: tanay');
    console.log('Password: jump6bladder*dias0youse');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await pool.end();
  }
}

// Run the script
addProductionAdmin();