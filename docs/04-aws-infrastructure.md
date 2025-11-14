# Phase 3: AWS Infrastructure Setup

## Goal
Set up all required AWS infrastructure including VPC, ECS cluster, RDS database, S3 bucket, load balancer, and security groups using Infrastructure as Code principles.

---

## Todo List

### 1. Prepare AWS Account
- [ ] Verify AWS account and billing
- [ ] Set up AWS CLI credentials
- [ ] Choose AWS region
- [ ] Enable required AWS services

### 2. Create VPC and Networking
- [ ] Create VPC
- [ ] Create public subnets
- [ ] Create private subnets (optional)
- [ ] Create Internet Gateway
- [ ] Create NAT Gateway (optional, for private subnets)
- [ ] Configure route tables
- [ ] Set up security groups

### 3. Create S3 Bucket
- [ ] Create S3 bucket for file uploads
- [ ] Configure bucket policy
- [ ] Enable CORS
- [ ] Set up lifecycle rules
- [ ] Configure encryption

### 4. Create RDS Database
- [ ] Create DB subnet group
- [ ] Configure security group for RDS
- [ ] Create PostgreSQL RDS instance
- [ ] Configure backup settings
- [ ] Set up parameter group

### 5. Create ECS Resources
- [ ] Create ECS cluster
- [ ] Create ECR repository
- [ ] Create task execution role
- [ ] Create task role
- [ ] Configure CloudWatch log groups

### 6. Create Load Balancer
- [ ] Create Application Load Balancer
- [ ] Create target group
- [ ] Configure health checks
- [ ] Set up listeners
- [ ] Request SSL certificate (optional)

### 7. Create Secrets Manager Secrets
- [ ] Store database credentials
- [ ] Store session secret
- [ ] Configure IAM permissions for secrets access

---

## Detailed Steps

### Step 1: Set Up AWS CLI and Region

```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Set default region (use your chosen region)
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1

# Create environment file for AWS resources
cat > aws-config.env << EOF
AWS_REGION=us-east-1
PROJECT_NAME=portfolio
ENVIRONMENT=production
EOF

source aws-config.env
```

### Step 2: Create VPC and Networking

#### 2.1 Create VPC

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=portfolio-vpc},{Key=Project,Value=portfolio}]' \
  --query 'Vpc.VpcId' \
  --output text)

echo "VPC ID: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
  --vpc-id $VPC_ID \
  --enable-dns-hostnames
```

#### 2.2 Create Subnets

```bash
# Get availability zones
AZ_1=$(aws ec2 describe-availability-zones \
  --query 'AvailabilityZones[0].ZoneName' \
  --output text)

AZ_2=$(aws ec2 describe-availability-zones \
  --query 'AvailabilityZones[1].ZoneName' \
  --output text)

echo "Using availability zones: $AZ_1, $AZ_2"

# Create public subnet 1
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone $AZ_1 \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=portfolio-public-subnet-1},{Key=Type,Value=public}]' \
  --query 'Subnet.SubnetId' \
  --output text)

# Create public subnet 2
PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone $AZ_2 \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=portfolio-public-subnet-2},{Key=Type,Value=public}]' \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Public Subnet 1: $PUBLIC_SUBNET_1"
echo "Public Subnet 2: $PUBLIC_SUBNET_2"

# Enable auto-assign public IP on public subnets
aws ec2 modify-subnet-attribute \
  --subnet-id $PUBLIC_SUBNET_1 \
  --map-public-ip-on-launch

aws ec2 modify-subnet-attribute \
  --subnet-id $PUBLIC_SUBNET_2 \
  --map-public-ip-on-launch
```

#### 2.3 Create Internet Gateway

```bash
# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=portfolio-igw}]' \
  --query 'InternetGateway.InternetGatewayId' \
  --output text)

echo "Internet Gateway: $IGW_ID"

# Attach to VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID
```

#### 2.4 Create Route Tables

```bash
# Create public route table
PUBLIC_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=portfolio-public-rt}]' \
  --query 'RouteTable.RouteTableId' \
  --output text)

echo "Public Route Table: $PUBLIC_RT"

# Add route to Internet Gateway
aws ec2 create-route \
  --route-table-id $PUBLIC_RT \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID

# Associate subnets with route table
aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_1 \
  --route-table-id $PUBLIC_RT

aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_2 \
  --route-table-id $PUBLIC_RT
```

#### 2.5 Create Security Groups

```bash
# Security group for ALB
ALB_SG=$(aws ec2 create-security-group \
  --group-name portfolio-alb-sg \
  --description "Security group for Portfolio ALB" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "ALB Security Group: $ALB_SG"

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Security group for ECS tasks
ECS_SG=$(aws ec2 create-security-group \
  --group-name portfolio-ecs-sg \
  --description "Security group for Portfolio ECS tasks" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "ECS Security Group: $ECS_SG"

# Allow traffic from ALB only
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp \
  --port 5000 \
  --source-group $ALB_SG

# Security group for RDS
RDS_SG=$(aws ec2 create-security-group \
  --group-name portfolio-rds-sg \
  --description "Security group for Portfolio RDS" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "RDS Security Group: $RDS_SG"

# Allow PostgreSQL from ECS tasks only
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $ECS_SG
```

#### 2.6 Save Infrastructure IDs

```bash
# Save all resource IDs for later use
cat > aws-resources.env << EOF
VPC_ID=$VPC_ID
PUBLIC_SUBNET_1=$PUBLIC_SUBNET_1
PUBLIC_SUBNET_2=$PUBLIC_SUBNET_2
IGW_ID=$IGW_ID
PUBLIC_RT=$PUBLIC_RT
ALB_SG=$ALB_SG
ECS_SG=$ECS_SG
RDS_SG=$RDS_SG
AZ_1=$AZ_1
AZ_2=$AZ_2
EOF

echo "✅ VPC and networking created successfully"
echo "Resource IDs saved to aws-resources.env"
```

### Step 3: Create S3 Bucket

```bash
source aws-resources.env

# Generate unique bucket name
S3_BUCKET="portfolio-uploads-$(date +%s)"

# Create bucket
aws s3 mb s3://$S3_BUCKET --region $AWS_REGION

# Block public access (we'll use signed URLs or CloudFront)
aws s3api put-public-access-block \
  --bucket $S3_BUCKET \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Enable versioning (optional but recommended)
aws s3api put-bucket-versioning \
  --bucket $S3_BUCKET \
  --versioning-configuration Status=Enabled

# Configure CORS
cat > s3-cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket $S3_BUCKET \
  --cors-configuration file://s3-cors.json

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket $S3_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Lifecycle rule to transition old files to cheaper storage
cat > s3-lifecycle.json << EOF
{
  "Rules": [
    {
      "Id": "TransitionOldFiles",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket $S3_BUCKET \
  --lifecycle-configuration file://s3-lifecycle.json

# Save bucket name
echo "S3_BUCKET=$S3_BUCKET" >> aws-resources.env

echo "✅ S3 bucket created: $S3_BUCKET"
```

### Step 4: Create RDS Database

#### 4.1 Create DB Subnet Group

```bash
source aws-resources.env

# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name portfolio-db-subnet-group \
  --db-subnet-group-description "Subnet group for Portfolio database" \
  --subnet-ids $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
  --tags Key=Name,Value=portfolio-db-subnet-group Key=Project,Value=portfolio

echo "✅ DB subnet group created"
```

#### 4.2 Generate Database Password

```bash
# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated DB password: $DB_PASSWORD"
echo "⚠️  Save this password securely!"

# Save to file (secure this file!)
echo "DB_PASSWORD=$DB_PASSWORD" >> aws-resources.env
chmod 600 aws-resources.env
```

#### 4.3 Create RDS Instance

```bash
source aws-resources.env

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier portfolio-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username portfolioadmin \
  --master-user-password "$DB_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name portfolio-db-subnet-group \
  --db-name portfolio \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --enable-cloudwatch-logs-exports '["postgresql","upgrade"]' \
  --deletion-protection \
  --publicly-accessible \
  --tags Key=Name,Value=portfolio-db Key=Project,Value=portfolio

echo "⏳ RDS instance creating... This takes 5-10 minutes"
echo "Check status with: aws rds describe-db-instances --db-instance-identifier portfolio-db --query 'DBInstances[0].DBInstanceStatus'"
```

#### 4.4 Wait for RDS and Get Endpoint

```bash
# Wait for RDS to be available
echo "Waiting for RDS instance to be available..."
aws rds wait db-instance-available \
  --db-instance-identifier portfolio-db

# Get RDS endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier portfolio-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

DB_PORT=$(aws rds describe-db-instances \
  --db-instance-identifier portfolio-db \
  --query 'DBInstances[0].Endpoint.Port' \
  --output text)

echo "✅ RDS instance created"
echo "Endpoint: $DB_ENDPOINT:$DB_PORT"

# Save endpoint
echo "DB_ENDPOINT=$DB_ENDPOINT" >> aws-resources.env
echo "DB_PORT=$DB_PORT" >> aws-resources.env

# Construct DATABASE_URL
DATABASE_URL="postgresql://portfolioadmin:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/portfolio"
echo "DATABASE_URL=$DATABASE_URL" >> aws-resources.env
```

### Step 5: Create Secrets Manager Secrets

```bash
source aws-resources.env

# Create database credentials secret
aws secretsmanager create-secret \
  --name portfolio/production/database \
  --description "Portfolio database credentials" \
  --secret-string "{\"username\":\"portfolioadmin\",\"password\":\"$DB_PASSWORD\",\"host\":\"$DB_ENDPOINT\",\"port\":$DB_PORT,\"dbname\":\"portfolio\",\"url\":\"$DATABASE_URL\"}" \
  --tags Key=Project,Value=portfolio Key=Environment,Value=production

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 48 | tr -d "=+/")

# Create session secret
aws secretsmanager create-secret \
  --name portfolio/production/session-secret \
  --description "Portfolio session secret" \
  --secret-string "$SESSION_SECRET" \
  --tags Key=Project,Value=portfolio Key=Environment,Value=production

echo "✅ Secrets created in Secrets Manager"
echo "SESSION_SECRET=$SESSION_SECRET" >> aws-resources.env
```

### Step 6: Create ECS Resources

#### 6.1 Create ECS Cluster

```bash
source aws-resources.env

# Create ECS cluster
aws ecs create-cluster \
  --cluster-name portfolio-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1,base=1 \
  --tags key=Name,value=portfolio-cluster key=Project,value=portfolio

echo "✅ ECS cluster created: portfolio-cluster"
```

#### 6.2 Create ECR Repository

```bash
# Create ECR repository
ECR_URI=$(aws ecr create-repository \
  --repository-name portfolio-app \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --tags Key=Name,Value=portfolio-app Key=Project,Value=portfolio \
  --query 'repository.repositoryUri' \
  --output text)

echo "✅ ECR repository created: $ECR_URI"
echo "ECR_URI=$ECR_URI" >> aws-resources.env

# Get ECR login command
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_URI

echo "✅ Logged into ECR"
```

#### 6.3 Create IAM Roles

**Task Execution Role (for ECS to pull images and write logs):**

```bash
# Create trust policy
cat > ecs-task-execution-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name portfolioTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json \
  --tags Key=Project,Value=portfolio

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name portfolioTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create custom policy for Secrets Manager access
cat > ecs-secrets-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:*:secret:portfolio/*"
      ]
    }
  ]
}
EOF

# Create and attach secrets policy
aws iam put-role-policy \
  --role-name portfolioTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document file://ecs-secrets-policy.json

TASK_EXECUTION_ROLE_ARN=$(aws iam get-role \
  --role-name portfolioTaskExecutionRole \
  --query 'Role.Arn' \
  --output text)

echo "TASK_EXECUTION_ROLE_ARN=$TASK_EXECUTION_ROLE_ARN" >> aws-resources.env
```

**Task Role (for application to access AWS services):**

```bash
# Create task role
aws iam create-role \
  --role-name portfolioTaskRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json \
  --tags Key=Project,Value=portfolio

# Create policy for S3 access
cat > ecs-task-s3-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$S3_BUCKET",
        "arn:aws:s3:::$S3_BUCKET/*"
      ]
    }
  ]
}
EOF

# Attach S3 policy
aws iam put-role-policy \
  --role-name portfolioTaskRole \
  --policy-name S3Access \
  --policy-document file://ecs-task-s3-policy.json

TASK_ROLE_ARN=$(aws iam get-role \
  --role-name portfolioTaskRole \
  --query 'Role.Arn' \
  --output text)

echo "TASK_ROLE_ARN=$TASK_ROLE_ARN" >> aws-resources.env

echo "✅ IAM roles created"
```

#### 6.4 Create CloudWatch Log Group

```bash
# Create log group
aws logs create-log-group \
  --log-group-name /ecs/portfolio-app \
  --tags Key=Project,Value=portfolio

# Set retention policy (14 days)
aws logs put-retention-policy \
  --log-group-name /ecs/portfolio-app \
  --retention-in-days 14

echo "✅ CloudWatch log group created"
```

### Step 7: Create Application Load Balancer

#### 7.1 Create Target Group

```bash
source aws-resources.env

# Create target group
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name portfolio-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher HttpCode=200 \
  --tags Key=Name,Value=portfolio-tg Key=Project,Value=portfolio \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "TARGET_GROUP_ARN=$TARGET_GROUP_ARN" >> aws-resources.env
echo "✅ Target group created"
```

#### 7.2 Create Application Load Balancer

```bash
# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name portfolio-alb \
  --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --tags Key=Name,Value=portfolio-alb Key=Project,Value=portfolio \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

echo "ALB_ARN=$ALB_ARN" >> aws-resources.env

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "ALB_DNS=$ALB_DNS" >> aws-resources.env

echo "✅ Application Load Balancer created"
echo "ALB DNS: $ALB_DNS"
```

#### 7.3 Create Listener (HTTP)

```bash
# Create HTTP listener (will redirect to HTTPS in production)
LISTENER_ARN=$(aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
  --query 'Listeners[0].ListenerArn' \
  --output text)

echo "LISTENER_ARN=$LISTENER_ARN" >> aws-resources.env
echo "✅ HTTP listener created"
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Network Infrastructure**
   - ✅ VPC created with CIDR 10.0.0.0/16
   - ✅ 2 public subnets in different AZs
   - ✅ Internet Gateway attached
   - ✅ Route tables configured
   - ✅ Security groups created (ALB, ECS, RDS)

2. **Storage Resources**
   - ✅ S3 bucket created and configured
   - ✅ CORS enabled
   - ✅ Encryption enabled
   - ✅ Lifecycle rules configured

3. **Database**
   - ✅ RDS PostgreSQL instance created
   - ✅ DB subnet group configured
   - ✅ Automated backups enabled
   - ✅ Security group configured

4. **Container Infrastructure**
   - ✅ ECS cluster created
   - ✅ ECR repository created
   - ✅ IAM roles created
   - ✅ CloudWatch log group created

5. **Load Balancer**
   - ✅ ALB created
   - ✅ Target group configured
   - ✅ Health checks configured
   - ✅ HTTP listener created

6. **Secrets Management**
   - ✅ Database credentials stored
   - ✅ Session secret stored

### ✅ Validation Checklist

```bash
# Load environment
source aws-resources.env

# 1. Verify VPC
aws ec2 describe-vpcs --vpc-ids $VPC_ID
# Expected: State = available

# 2. Verify subnets
aws ec2 describe-subnets --subnet-ids $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2
# Expected: 2 subnets in different AZs

# 3. Verify S3 bucket
aws s3 ls s3://$S3_BUCKET
# Expected: No error

# 4. Verify RDS
aws rds describe-db-instances --db-instance-identifier portfolio-db
# Expected: DBInstanceStatus = available

# 5. Verify ECS cluster
aws ecs describe-clusters --clusters portfolio-cluster
# Expected: status = ACTIVE

# 6. Verify ECR repository
aws ecr describe-repositories --repository-names portfolio-app
# Expected: Repository exists

# 7. Verify ALB
aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN
# Expected: State = active

# 8. Test ALB DNS (should return 503 - no targets yet)
curl http://$ALB_DNS
# Expected: HTTP 503 (no targets registered yet)
```

### 📊 Resource Summary

After completion, review your resources:

```bash
# Display all created resources
echo "=== Portfolio AWS Infrastructure ==="
echo ""
echo "VPC ID: $VPC_ID"
echo "Public Subnets: $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
echo ""
echo "S3 Bucket: $S3_BUCKET"
echo ""
echo "RDS Endpoint: $DB_ENDPOINT:$DB_PORT"
echo "Database Name: portfolio"
echo ""
echo "ECS Cluster: portfolio-cluster"
echo "ECR Repository: $ECR_URI"
echo ""
echo "Load Balancer DNS: $ALB_DNS"
echo "Access URL: http://$ALB_DNS"
echo ""
echo "All resource IDs saved in: aws-resources.env"
```

### 💰 Cost Monitoring

Set up cost alerts for these resources:

```bash
# Check estimated costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project
```

---

## Next Steps

Your AWS infrastructure is now ready. Proceed to:
**[Phase 4: Database Migration →](./05-database-migration.md)**

---

## Troubleshooting

### VPC/Network Issues

**Problem**: Cannot access subnets
```bash
# Verify route table associations
aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID"
```

### RDS Issues

**Problem**: RDS creation fails
```bash
# Check RDS events
aws rds describe-events \
  --source-identifier portfolio-db \
  --source-type db-instance
```

**Problem**: Cannot connect to RDS
```bash
# Verify security group
aws ec2 describe-security-groups --group-ids $RDS_SG

# Test connection (from a machine in the VPC or with VPN)
psql -h $DB_ENDPOINT -U portfolioadmin -d portfolio
```

### S3 Issues

**Problem**: S3 bucket already exists
```bash
# Use a different bucket name
S3_BUCKET="portfolio-uploads-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -d'-' -f1)"
```
