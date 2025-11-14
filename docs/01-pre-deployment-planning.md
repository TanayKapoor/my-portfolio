# Phase 0: Pre-Deployment Planning

## Goal
Establish a clear deployment strategy, gather requirements, and prepare the necessary AWS accounts and tools before making any code changes.

---

## Todo List

### 1. AWS Account Setup
- [ ] Create or access existing AWS account
- [ ] Enable billing alerts (set budget to $100/month initially)
- [ ] Set up MFA (Multi-Factor Authentication) on root account
- [ ] Create IAM user for deployment with appropriate permissions
- [ ] Configure AWS CLI with credentials
- [ ] Verify AWS CLI access: `aws sts get-caller-identity`

### 2. Domain & DNS Planning
- [ ] Decide on domain name (e.g., `portfolio.yourdomain.com`)
- [ ] Purchase domain (Route 53 or external registrar)
- [ ] Document DNS requirements

### 3. Environment Planning
- [ ] Decide on AWS region (recommend: `us-east-1` or closest to target users)
- [ ] Plan environment names: `production`, `staging` (optional)
- [ ] Document required environment variables
- [ ] Plan secrets management strategy

### 4. Infrastructure Planning
- [ ] Review architecture diagram (in overview)
- [ ] Decide on ECS configuration (Fargate vs EC2)
- [ ] Plan VPC structure
- [ ] Decide on high availability requirements (single AZ vs multi-AZ)

### 5. Cost Planning
- [ ] Review cost estimates in overview
- [ ] Set up AWS Budget alerts
- [ ] Enable Cost Explorer
- [ ] Configure billing notifications

### 6. Tool Installation & Verification
- [ ] Install Docker Desktop
- [ ] Install AWS CLI v2
- [ ] Install `ecs-cli` (optional)
- [ ] Install session-manager-plugin (for ECS exec)
- [ ] Verify all tools are working

### 7. Backup Current System
- [ ] Export current Neon database (if migrating)
- [ ] Download all files from Replit Object Storage
- [ ] Backup current environment variables
- [ ] Document current system configuration

### 8. Security Planning
- [ ] Plan security groups structure
- [ ] Decide on SSL/TLS strategy (ACM recommended)
- [ ] Review IAM permissions needed
- [ ] Plan secrets rotation strategy
- [ ] Review CORS requirements for S3

---

## Detailed Steps

### Step 1: AWS Account Setup

#### 1.1 Create IAM User for Deployment

```bash
# Create IAM user (via AWS Console or CLI)
aws iam create-user --user-name portfolio-deployer

# Attach required policies
aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

aws iam attach-user-policy \
  --user-name portfolio-deployer \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Create access keys
aws iam create-access-key --user-name portfolio-deployer
```

Save the Access Key ID and Secret Access Key securely.

#### 1.2 Configure AWS CLI

```bash
# Configure AWS CLI with new credentials
aws configure

# Input when prompted:
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: us-east-1  (or your chosen region)
# Default output format: json

# Verify configuration
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/portfolio-deployer"
# }
```

#### 1.3 Set Up Billing Alerts

```bash
# Enable billing alerts
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

Create `budget.json`:
```json
{
  "BudgetName": "PortfolioMonthlyBudget",
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

Create `notifications.json`:
```json
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "your-email@example.com"
      }
    ]
  }
]
```

### Step 2: Environment Variables Documentation

Create a file to track all required environment variables:

**Environment Variables Checklist:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server
PORT=5000
NODE_ENV=production

# Session
SESSION_SECRET=<generate-random-string>

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=portfolio-uploads
AWS_ACCESS_KEY_ID=<not-needed-if-using-IAM-roles>
AWS_SECRET_ACCESS_KEY=<not-needed-if-using-IAM-roles>

# Application
CORS_ORIGIN=https://yourdomain.com
```

### Step 3: Choose AWS Region

**Factors to consider:**
- **Latency**: Choose region closest to your target users
- **Cost**: Pricing varies by region
- **Compliance**: Data residency requirements

**Recommended regions:**
- `us-east-1` (N. Virginia): Cheapest, most services
- `us-west-2` (Oregon): Good for West Coast
- `eu-west-1` (Ireland): Good for Europe
- `ap-southeast-1` (Singapore): Good for Asia

**Decision:** _____________________ (fill in your choice)

### Step 4: Install Required Tools

#### Docker Desktop

**macOS:**
```bash
# Download from https://www.docker.com/products/docker-desktop
# Or using Homebrew:
brew install --cask docker

# Verify installation
docker --version
docker compose version
```

**Linux:**
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
```

**Windows:**
```powershell
# Download from https://www.docker.com/products/docker-desktop
# Verify
docker --version
```

#### AWS CLI v2

**macOS:**
```bash
# Download and install
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify
aws --version
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

**Windows:**
```powershell
# Download MSI installer from:
# https://awscli.amazonaws.com/AWSCLIV2.msi
# Run installer and verify:
aws --version
```

#### Session Manager Plugin (for ECS debugging)

**macOS:**
```bash
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"
unzip sessionmanager-bundle.zip
sudo ./sessionmanager-bundle/install -i /usr/local/sessionmanagerplugin -b /usr/local/bin/session-manager-plugin

# Verify
session-manager-plugin --version
```

### Step 5: Backup Current System

#### Export Neon Database

```bash
# If using Neon, export via pg_dump
# Replace with your Neon connection string
pg_dump "postgresql://user:password@your-neon-host/dbname" \
  --no-owner --no-acl \
  -f backup-$(date +%Y%m%d).sql

# Verify backup
ls -lh backup-*.sql
```

#### Document Current Environment

Create `current-environment.md`:
```markdown
# Current Environment Configuration

## Database
- Provider: Neon
- Connection: <redacted>
- Tables: users, projects, work_experiences, commands, newsletters, contact_emails, sessions

## File Storage
- Provider: Replit Object Storage
- Current usage: <check current usage>
- File types: Images (PNG, JPG, WEBP)

## Application
- Running on: Replit
- Current URL: <your-replit-url>
- Session storage: PostgreSQL

## Performance Baseline
- Average response time: <measure>
- Concurrent users: <estimate>
- Database size: <check>
- File storage size: <check>
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **AWS Account Ready**
   - IAM user created with appropriate permissions
   - AWS CLI configured and verified
   - Billing alerts set up

2. **Tools Installed**
   - Docker Desktop running
   - AWS CLI v2 installed
   - Session Manager plugin installed

3. **Planning Documents**
   - Environment variables documented
   - AWS region selected
   - Current system backed up
   - Cost budget established

4. **Infrastructure Decisions Made**
   - Region: `___________`
   - Domain: `___________`
   - High Availability: Yes / No
   - Staging Environment: Yes / No

### ✅ Validation Checklist

Run these commands to verify readiness:

```bash
# 1. AWS CLI configured
aws sts get-caller-identity
# Should return your user ARN

# 2. Docker running
docker ps
# Should not error

# 3. AWS access
aws s3 ls
# Should list buckets or return empty (not error)

# 4. Region set
aws configure get region
# Should return your chosen region

# 5. Billing alerts
aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text)
# Should list your budget
```

### 📊 Success Metrics

- [ ] All commands above execute without errors
- [ ] Backup files created and verified
- [ ] Budget alerts configured and tested
- [ ] All planning documents completed
- [ ] Team/stakeholders informed of timeline

---

## Next Steps

Once all items are checked and validated, proceed to:
**[Phase 1: Code Preparation →](./02-code-preparation.md)**

---

## Troubleshooting

### AWS CLI Issues

**Problem**: `aws: command not found`
```bash
# Verify installation path
which aws
# Add to PATH if needed
export PATH=$PATH:/usr/local/bin
```

**Problem**: Access Denied errors
```bash
# Check IAM permissions
aws iam get-user
# Verify policies attached
aws iam list-attached-user-policies --user-name portfolio-deployer
```

### Docker Issues

**Problem**: Docker daemon not running
```bash
# macOS/Windows: Start Docker Desktop application
# Linux:
sudo systemctl start docker
sudo systemctl enable docker
```

**Problem**: Permission denied
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Logout and login again
```

---

## Additional Resources

- [AWS Account Setup Best Practices](https://docs.aws.amazon.com/accounts/latest/reference/best-practices.html)
- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
- [Docker Installation Guide](https://docs.docker.com/engine/install/)
- [AWS Cost Management](https://aws.amazon.com/aws-cost-management/)
