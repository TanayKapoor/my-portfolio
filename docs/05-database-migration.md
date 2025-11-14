# Phase 4: Database Migration

## Goal
Safely migrate your database from the current provider (Neon) to AWS RDS PostgreSQL, including schema, data, and verification.

---

## Todo List

### 1. Backup Current Database
- [ ] Export current database schema
- [ ] Export current database data
- [ ] Verify backup integrity
- [ ] Store backup securely

### 2. Prepare RDS Database
- [ ] Test RDS connectivity
- [ ] Run Drizzle migrations on RDS
- [ ] Verify schema creation
- [ ] Set up database users and permissions

### 3. Migrate Data
- [ ] Transfer data to RDS
- [ ] Verify data integrity
- [ ] Update sequences and indexes
- [ ] Test data accessibility

### 4. Update Application Configuration
- [ ] Update DATABASE_URL
- [ ] Test application with new database
- [ ] Verify all database operations
- [ ] Update connection pooling settings

### 5. Migration Validation
- [ ] Compare row counts
- [ ] Verify relationships
- [ ] Test all CRUD operations
- [ ] Performance testing

---

## Detailed Steps

### Step 1: Backup Current Database

#### 1.1 Export from Current Database (Neon)

```bash
# Set your current database URL
CURRENT_DB_URL="<your-neon-database-url>"

# Create backup directory
mkdir -p backups
cd backups

# Export schema only
pg_dump "$CURRENT_DB_URL" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f schema-$(date +%Y%m%d-%H%M%S).sql

# Export data only
pg_dump "$CURRENT_DB_URL" \
  --data-only \
  --no-owner \
  --no-acl \
  -f data-$(date +%Y%m%d-%H%M%S).sql

# Export complete database (schema + data)
pg_dump "$CURRENT_DB_URL" \
  --no-owner \
  --no-acl \
  -f full-backup-$(date +%Y%m%d-%H%M%S).sql

echo "✅ Database backup completed"
ls -lh *.sql
```

#### 1.2 Verify Backup

```bash
# Check backup file is not empty
wc -l full-backup-*.sql

# Grep for table names to verify content
grep "CREATE TABLE" schema-*.sql

# Check for data
grep "COPY" data-*.sql | head -n 5
```

#### 1.3 Get Current Database Statistics

```bash
# Count records in each table
psql "$CURRENT_DB_URL" << 'EOF'
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
EOF

# Save statistics for comparison
psql "$CURRENT_DB_URL" -c "\dt" > current-db-stats.txt
```

### Step 2: Prepare RDS Database

#### 2.1 Test RDS Connectivity

```bash
# Load AWS resources
source ../aws-resources.env

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"

# Expected output: PostgreSQL version information
```

#### 2.2 Install Required Extensions

```bash
# Connect to RDS and install extensions
psql "$DATABASE_URL" << 'EOF'
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable additional extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\dx
EOF

echo "✅ Extensions installed"
```

#### 2.3 Run Drizzle Migrations

```bash
# Go back to project root
cd ..

# Update .env with RDS connection
cat > .env.production << EOF
DATABASE_URL=$DATABASE_URL
PORT=5000
NODE_ENV=production
SESSION_SECRET=$SESSION_SECRET
AWS_REGION=$AWS_REGION
AWS_S3_BUCKET=$S3_BUCKET
EOF

# Run migrations using Drizzle
DATABASE_URL=$DATABASE_URL npm run db:push

# Verify tables created
psql "$DATABASE_URL" -c "\dt"
```

Expected tables:
- sessions
- users
- projects
- work_experiences
- commands
- newsletters
- contact_emails

### Step 3: Migrate Data

#### 3.1 Option A: Direct Data Migration (Recommended)

```bash
cd backups

# Restore data only (since schema is already created by Drizzle)
psql "$DATABASE_URL" < data-*.sql

echo "✅ Data imported to RDS"
```

#### 3.2 Option B: Full Database Restore

```bash
# If you want to restore everything (drop tables first)
psql "$DATABASE_URL" << 'EOF'
-- Drop all tables (be careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO portfolioadmin;
GRANT ALL ON SCHEMA public TO public;
EOF

# Restore full backup
psql "$DATABASE_URL" < full-backup-*.sql

echo "✅ Full database restored"
```

#### 3.3 Option C: Selective Table Migration

For migrating specific tables:

```bash
# Export specific table
pg_dump "$CURRENT_DB_URL" \
  --table=projects \
  --data-only \
  --no-owner \
  --no-acl \
  -f projects-data.sql

# Import to RDS
psql "$DATABASE_URL" < projects-data.sql

# Repeat for each table
for table in users work_experiences commands newsletters contact_emails; do
  echo "Migrating $table..."
  pg_dump "$CURRENT_DB_URL" \
    --table=$table \
    --data-only \
    --no-owner \
    --no-acl \
    -f ${table}-data.sql

  psql "$DATABASE_URL" < ${table}-data.sql
done
```

#### 3.4 Fix Sequences

After importing data, sequences might not be updated:

```bash
psql "$DATABASE_URL" << 'EOF'
-- Reset sequences to max ID (if using SERIAL)
-- For UUID-based IDs, this is not needed

-- Example for any integer-based auto-increment fields:
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Verify sequences
SELECT sequence_name, last_value
FROM information_schema.sequences;
EOF
```

### Step 4: Verify Migration

#### 4.1 Compare Row Counts

```bash
# Get row counts from RDS
psql "$DATABASE_URL" << 'EOF' > rds-stats.txt
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
EOF

# Compare with current database
diff current-db-stats.txt rds-stats.txt
```

#### 4.2 Verify Data Integrity

```bash
# Check specific records
psql "$DATABASE_URL" << 'EOF'
-- Verify users
SELECT id, username, email FROM users LIMIT 5;

-- Verify projects
SELECT id, title, featured FROM projects LIMIT 5;

-- Verify work experiences
SELECT id, position, company FROM work_experiences LIMIT 5;

-- Verify relationships (foreign keys)
SELECT
  c.id,
  c.command,
  p.title as project_title
FROM commands c
JOIN projects p ON c.project_id = p.id
LIMIT 5;
EOF
```

#### 4.3 Verify Indexes and Constraints

```bash
psql "$DATABASE_URL" << 'EOF'
-- List all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- List all foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
EOF
```

### Step 5: Test Application with RDS

#### 5.1 Update Local Environment

```bash
# Create .env.rds for testing
cat > .env.rds << EOF
DATABASE_URL=$DATABASE_URL
PORT=5000
NODE_ENV=development
SESSION_SECRET=$SESSION_SECRET
AWS_REGION=$AWS_REGION
AWS_S3_BUCKET=$S3_BUCKET
# Add AWS credentials for local testing
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
EOF
```

#### 5.2 Test Application Locally with RDS

```bash
# Load RDS environment
export $(cat .env.rds | xargs)

# Start application
npm run dev

# In another terminal, test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/projects
curl http://localhost:5000/api/work-experiences
```

#### 5.3 Test CRUD Operations

```bash
# Test creating a new project (requires authentication)
# Use your admin credentials

# Test reading
curl http://localhost:5000/api/projects

# Test updating (requires auth)
# Test deleting (requires auth)
```

### Step 6: Performance Optimization

#### 6.1 Analyze Database

```bash
psql "$DATABASE_URL" << 'EOF'
-- Analyze all tables
ANALYZE;

-- Get table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;
EOF
```

#### 6.2 Create Additional Indexes (if needed)

```bash
psql "$DATABASE_URL" << 'EOF'
-- Example: Index on frequently queried columns
-- CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
-- CREATE INDEX IF NOT EXISTS idx_projects_order ON projects("order");
-- CREATE INDEX IF NOT EXISTS idx_work_experiences_type ON work_experiences(type);

-- Verify indexes created
\di
EOF
```

#### 6.3 Configure Connection Pooling

Update your database configuration to use connection pooling:

**File:** `server/db.ts` (if you have one, or create it)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Configure connection pool
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 10, // Maximum pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export const db = drizzle(client, { schema });
```

### Step 7: Create Migration Rollback Plan

#### 7.1 Document Rollback Procedure

**File:** `backups/ROLLBACK.md`

```markdown
# Database Migration Rollback Procedure

In case the migration needs to be rolled back:

## Step 1: Switch Application Back to Old Database

```bash
# Update environment variable
DATABASE_URL=<old-neon-url>

# Restart application
```

## Step 2: Verify Old Database is Still Accessible

```bash
psql "<old-neon-url>" -c "SELECT COUNT(*) FROM users;"
```

## Step 3: Export Any New Data from RDS (if needed)

```bash
# Export data created after migration
pg_dump "$RDS_DATABASE_URL" \
  --data-only \
  --table=... \
  -f new-data.sql
```

## Step 4: Clean Up RDS (optional)

```bash
# Drop all data from RDS
psql "$RDS_DATABASE_URL" << 'EOF'
TRUNCATE users, projects, work_experiences, commands, newsletters, contact_emails CASCADE;
EOF
```

## Backup Information

- Current Database URL: <redacted>
- RDS Database URL: <redacted>
- Backup Date: $(date)
- Backup Location: ./backups/
```

#### 7.2 Keep Old Database Active (Temporarily)

Don't delete your old database immediately. Keep it active for at least 2 weeks after successful migration.

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Backup**
   - ✅ Full database backup created
   - ✅ Backup verified and tested
   - ✅ Backup stored securely

2. **RDS Database**
   - ✅ Schema migrated successfully
   - ✅ Data migrated successfully
   - ✅ Indexes and constraints created
   - ✅ Extensions installed

3. **Validation**
   - ✅ Row counts match
   - ✅ Data integrity verified
   - ✅ Foreign keys working
   - ✅ Application tested with RDS

4. **Optimization**
   - ✅ Database analyzed
   - ✅ Indexes optimized
   - ✅ Connection pooling configured

5. **Rollback Plan**
   - ✅ Rollback procedure documented
   - ✅ Old database still accessible
   - ✅ Emergency contacts identified

### ✅ Validation Checklist

```bash
# Load environment
source aws-resources.env
cd backups

# 1. Verify backup exists
ls -lh full-backup-*.sql
# Expected: Backup file exists and is not empty

# 2. Test RDS connection
psql "$DATABASE_URL" -c "SELECT version();"
# Expected: PostgreSQL version displayed

# 3. Verify row counts
psql "$DATABASE_URL" << 'EOF'
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM work_experiences) as work_experiences,
  (SELECT COUNT(*) FROM commands) as commands;
EOF
# Expected: Counts match original database

# 4. Test application
cd ..
npm run dev &
sleep 5
curl http://localhost:5000/api/projects | jq '.[] | .title'
# Expected: Project titles displayed

# 5. Test database writes
# Create a test project via API (requires authentication)

# 6. Verify foreign keys
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM commands c JOIN projects p ON c.project_id = p.id;"
# Expected: No errors
```

### 📊 Migration Statistics

Document your migration results:

```bash
# Create migration report
cat > migration-report.txt << EOF
=== Database Migration Report ===
Date: $(date)
Source: Neon PostgreSQL
Destination: AWS RDS PostgreSQL ($DB_ENDPOINT)

Tables Migrated:
- users
- projects
- work_experiences
- commands
- newsletters
- contact_emails
- sessions

Row Counts:
$(psql "$DATABASE_URL" -t -c "
SELECT tablename || ': ' || n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
")

Migration Duration: <record duration>
Downtime: <record any downtime>
Issues Encountered: <list any issues>

Verification:
- Data integrity: PASS
- Foreign keys: PASS
- Indexes: PASS
- Application tests: PASS
EOF

cat migration-report.txt
```

---

## Next Steps

Database migration complete! Proceed to:
**[Phase 5: Container Deployment →](./06-container-deployment.md)**

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to RDS
```bash
# Verify security group allows your IP
MY_IP=$(curl -s ifconfig.me)
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 5432 \
  --cidr $MY_IP/32

# Test connection again
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Migration Errors

**Problem**: Duplicate key errors during data import
```bash
# Truncate tables before reimporting
psql "$DATABASE_URL" << 'EOF'
TRUNCATE users, projects, work_experiences, commands, newsletters, contact_emails CASCADE;
EOF

# Reimport
psql "$DATABASE_URL" < data-*.sql
```

**Problem**: Foreign key constraint violations
```bash
# Temporarily disable foreign key checks
psql "$DATABASE_URL" << 'EOF'
SET session_replication_role = replica;
-- Import data
\i data-*.sql
SET session_replication_role = DEFAULT;
EOF
```

### Performance Issues

**Problem**: Slow queries after migration
```bash
# Analyze and vacuum
psql "$DATABASE_URL" << 'EOF'
VACUUM ANALYZE;
REINDEX DATABASE portfolio;
EOF
```
