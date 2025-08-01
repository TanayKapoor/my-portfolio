// Script to generate bcrypt hash for production admin password
// Run this with: node hash-production-password.js

import bcrypt from 'bcrypt';

async function hashPassword() {
  const password = 'jump6bladder*dias0youse';
  const saltRounds = 10;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password to hash:', password);
    console.log('Bcrypt hash:', hashedPassword);
    console.log('\nUse this hash in your production database INSERT statement.');
    console.log('\nComplete SQL command:');
    console.log(`
INSERT INTO users (
  username, 
  email, 
  password, 
  first_name, 
  last_name, 
  is_admin,
  created_at,
  updated_at
) VALUES (
  'tanay',
  'tanay@admin.com',
  '${hashedPassword}',
  'Tanay',
  'Admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();
    `);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword();