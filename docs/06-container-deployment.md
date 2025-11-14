# Phase 5: Container Registry & Deployment

## Goal
Build the Docker image, push it to AWS ECR, create an ECS task definition, and deploy the containerized application to AWS ECS Fargate.

---

## Todo List

### 1. Build and Test Docker Image Locally
- [ ] Build production Docker image
- [ ] Test image locally
- [ ] Verify image size
- [ ] Security scan image

### 2. Push Image to ECR
- [ ] Authenticate with ECR
- [ ] Tag image for ECR
- [ ] Push image to ECR
- [ ] Verify image in ECR

### 3. Create ECS Task Definition
- [ ] Define container configuration
- [ ] Set environment variables
- [ ] Configure secrets
- [ ] Set resource limits
- [ ] Configure logging

### 4. Create ECS Service
- [ ] Create service definition
- [ ] Configure auto-scaling
- [ ] Set up load balancer integration
- [ ] Configure deployment settings

### 5. Deploy Application
- [ ] Start initial deployment
- [ ] Monitor deployment
- [ ] Verify health checks
- [ ] Test application access

### 6. Configure CI/CD (Optional)
- [ ] Create deployment scripts
- [ ] Set up GitHub Actions
- [ ] Configure automated deployments

---

## Detailed Steps

### Step 1: Build and Test Docker Image

#### 1.1 Final Build Test

```bash
# Clean previous builds
docker system prune -af
rm -rf dist node_modules

# Install dependencies
npm ci

# Build locally to verify
npm run build

# Verify build output
ls -la dist/
ls -la dist/public/
```

#### 1.2 Build Production Docker Image

```bash
# Build image
docker build -t portfolio-app:latest .

# Check image size
docker images portfolio-app:latest

# Target size: < 200MB
```

#### 1.3 Test Image Locally

```bash
source aws-resources.env

# Run container with production settings
docker run --rm \
  --name portfolio-test \
  -p 5000:5000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e AWS_REGION="$AWS_REGION" \
  -e AWS_S3_BUCKET="$S3_BUCKET" \
  portfolio-app:latest

# In another terminal, test
curl http://localhost:5000/health
curl http://localhost:5000/api/projects

# Stop container
docker stop portfolio-test
```

#### 1.4 Security Scan

```bash
# Scan for vulnerabilities
docker scout cves portfolio-app:latest

# Or use Trivy
trivy image portfolio-app:latest --severity HIGH,CRITICAL

# Address any critical vulnerabilities before proceeding
```

### Step 2: Push Image to ECR

#### 2.1 Authenticate with ECR

```bash
source aws-resources.env

# Get ECR login password and authenticate
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_URI

echo "✅ Authenticated with ECR"
```

#### 2.2 Tag and Push Image

```bash
# Tag image for ECR
docker tag portfolio-app:latest $ECR_URI:latest
docker tag portfolio-app:latest $ECR_URI:v1.0.0

# Push both tags
docker push $ECR_URI:latest
docker push $ECR_URI:v1.0.0

echo "✅ Image pushed to ECR"
```

#### 2.3 Verify Image in ECR

```bash
# List images in repository
aws ecr describe-images \
  --repository-name portfolio-app \
  --query 'imageDetails[*].[imageTags[0],imageSizeInBytes,imagePushedAt]' \
  --output table

# Get image digest
IMAGE_DIGEST=$(aws ecr describe-images \
  --repository-name portfolio-app \
  --image-ids imageTag=latest \
  --query 'imageDetails[0].imageDigest' \
  --output text)

echo "IMAGE_DIGEST=$IMAGE_DIGEST" >> aws-resources.env
```

### Step 3: Create ECS Task Definition

#### 3.1 Create Task Definition JSON

**File:** `ecs-task-definition.json`

```json
{
  "family": "portfolio-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "TASK_EXECUTION_ROLE_ARN_PLACEHOLDER",
  "taskRoleArn": "TASK_ROLE_ARN_PLACEHOLDER",
  "containerDefinitions": [
    {
      "name": "portfolio-app",
      "image": "ECR_URI_PLACEHOLDER:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "AWS_REGION",
          "value": "AWS_REGION_PLACEHOLDER"
        },
        {
          "name": "AWS_S3_BUCKET",
          "value": "S3_BUCKET_PLACEHOLDER"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:AWS_REGION_PLACEHOLDER:ACCOUNT_ID:secret:portfolio/production/database:url::"
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:AWS_REGION_PLACEHOLDER:ACCOUNT_ID:secret:portfolio/production/session-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/portfolio-app",
          "awslogs-region": "AWS_REGION_PLACEHOLDER",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### 3.2 Replace Placeholders and Register Task Definition

```bash
source aws-resources.env

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Update DATABASE_URL secret with proper format
aws secretsmanager update-secret \
  --secret-id portfolio/production/database \
  --secret-string "{\"url\":\"$DATABASE_URL\",\"username\":\"portfolioadmin\",\"password\":\"$DB_PASSWORD\",\"host\":\"$DB_ENDPOINT\",\"port\":$DB_PORT,\"dbname\":\"portfolio\"}"

# Get secret ARNs
DB_SECRET_ARN=$(aws secretsmanager describe-secret \
  --secret-id portfolio/production/database \
  --query ARN --output text)

SESSION_SECRET_ARN=$(aws secretsmanager describe-secret \
  --secret-id portfolio/production/session-secret \
  --query ARN --output text)

# Create task definition with substitutions
cat ecs-task-definition.json | \
  sed "s|TASK_EXECUTION_ROLE_ARN_PLACEHOLDER|$TASK_EXECUTION_ROLE_ARN|g" | \
  sed "s|TASK_ROLE_ARN_PLACEHOLDER|$TASK_ROLE_ARN|g" | \
  sed "s|ECR_URI_PLACEHOLDER|$ECR_URI|g" | \
  sed "s|AWS_REGION_PLACEHOLDER|$AWS_REGION|g" | \
  sed "s|S3_BUCKET_PLACEHOLDER|$S3_BUCKET|g" | \
  sed "s|ACCOUNT_ID|$ACCOUNT_ID|g" \
  > ecs-task-definition-final.json

# Register task definition
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition-final.json \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "TASK_DEF_ARN=$TASK_DEF_ARN" >> aws-resources.env
echo "✅ Task definition registered: $TASK_DEF_ARN"
```

### Step 4: Create ECS Service

#### 4.1 Create Service

```bash
source aws-resources.env

# Create ECS service
SERVICE_ARN=$(aws ecs create-service \
  --cluster portfolio-cluster \
  --service-name portfolio-service \
  --task-definition portfolio-app \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={
    subnets=[$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2],
    securityGroups=[$ECS_SG],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=portfolio-app,containerPort=5000" \
  --health-check-grace-period-seconds 60 \
  --deployment-configuration "minimumHealthyPercent=50,maximumPercent=200" \
  --tags key=Name,value=portfolio-service key=Project,value=portfolio \
  --query 'service.serviceArn' \
  --output text)

echo "SERVICE_ARN=$SERVICE_ARN" >> aws-resources.env
echo "✅ ECS service created"
```

#### 4.2 Configure Auto-Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy - CPU-based
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name portfolio-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 60,
    "ScaleOutCooldown": 60
  }'

# Create scaling policy - Memory-based
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name portfolio-memory-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 80.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
    },
    "ScaleInCooldown": 60,
    "ScaleOutCooldown": 60
  }'

echo "✅ Auto-scaling configured"
```

### Step 5: Monitor Deployment

#### 5.1 Watch Service Status

```bash
# Watch service deployment
watch -n 5 'aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query "services[0].{
    Status:status,
    Running:runningCount,
    Desired:desiredCount,
    Pending:pendingCount,
    Deployments:deployments[*].{
      Status:status,
      Running:runningCount,
      Desired:desiredCount
    }
  }" \
  --output table'

# Press Ctrl+C when deployment is stable
```

#### 5.2 Check Task Status

```bash
# List running tasks
aws ecs list-tasks \
  --cluster portfolio-cluster \
  --service-name portfolio-service \
  --query 'taskArns' \
  --output table

# Describe tasks
TASK_ARN=$(aws ecs list-tasks \
  --cluster portfolio-cluster \
  --service-name portfolio-service \
  --query 'taskArns[0]' \
  --output text)

aws ecs describe-tasks \
  --cluster portfolio-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].{
    Status:lastStatus,
    Health:healthStatus,
    Started:startedAt,
    CPU:cpu,
    Memory:memory
  }' \
  --output table
```

#### 5.3 View Logs

```bash
# Get log stream name
LOG_STREAM=$(aws logs describe-log-streams \
  --log-group-name /ecs/portfolio-app \
  --order-by LastEventTime \
  --descending \
  --max-items 1 \
  --query 'logStreams[0].logStreamName' \
  --output text)

# View logs
aws logs tail /ecs/portfolio-app \
  --follow \
  --format short

# Or view specific log stream
aws logs get-log-events \
  --log-group-name /ecs/portfolio-app \
  --log-stream-name $LOG_STREAM \
  --limit 50
```

### Step 6: Test Deployed Application

#### 6.1 Test Load Balancer

```bash
source aws-resources.env

# Test health endpoint
curl http://$ALB_DNS/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":...}

# Test API endpoints
curl http://$ALB_DNS/api/projects | jq '.[0]'

# Test specific routes
curl http://$ALB_DNS/api/work-experiences
curl http://$ALB_DNS/api/projects/[project-id]
```

#### 6.2 Load Testing

```bash
# Simple load test with Apache Bench
ab -n 1000 -c 10 http://$ALB_DNS/health

# Expected:
# - Requests per second: > 100
# - Time per request: < 100ms
# - Failed requests: 0

# More comprehensive test with wrk (if installed)
wrk -t4 -c100 -d30s http://$ALB_DNS/health

# Monitor ECS metrics during load test
watch -n 2 'aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query "services[0].runningCount"'
```

#### 6.3 Verify Target Health

```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn $TARGET_GROUP_ARN \
  --query 'TargetHealthDescriptions[*].{
    Target:Target.Id,
    Port:Target.Port,
    Health:TargetHealth.State,
    Reason:TargetHealth.Reason
  }' \
  --output table

# All targets should show: Health = healthy
```

### Step 7: Create Deployment Scripts

#### 7.1 Deployment Script

**File:** `scripts/deploy.sh`

```bash
#!/bin/bash

set -e

# Load environment
source aws-resources.env

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment...${NC}"

# Step 1: Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t portfolio-app:latest .

# Step 2: Tag for ECR
echo -e "${YELLOW}Tagging image for ECR...${NC}"
VERSION_TAG="v$(date +%Y%m%d-%H%M%S)"
docker tag portfolio-app:latest $ECR_URI:latest
docker tag portfolio-app:latest $ECR_URI:$VERSION_TAG

# Step 3: Push to ECR
echo -e "${YELLOW}Pushing to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_URI

docker push $ECR_URI:latest
docker push $ECR_URI:$VERSION_TAG

echo -e "${GREEN}✅ Image pushed: $ECR_URI:$VERSION_TAG${NC}"

# Step 4: Update ECS service (force new deployment)
echo -e "${YELLOW}Updating ECS service...${NC}"
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment \
  --no-cli-pager

echo -e "${GREEN}✅ Deployment initiated${NC}"

# Step 5: Wait for deployment to stabilize
echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
aws ecs wait services-stable \
  --cluster portfolio-cluster \
  --services portfolio-service

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application URL: http://$ALB_DNS${NC}"
```

Make it executable:

```bash
chmod +x scripts/deploy.sh
```

#### 7.2 Rollback Script

**File:** `scripts/rollback.sh`

```bash
#!/bin/bash

set -e

source aws-resources.env

# Get previous task definition
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

if [ -z "$PREVIOUS_TASK_DEF" ]; then
  echo "No previous deployment found"
  exit 1
fi

echo "Rolling back to: $PREVIOUS_TASK_DEF"

# Update service to use previous task definition
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --task-definition $PREVIOUS_TASK_DEF \
  --force-new-deployment

echo "✅ Rollback initiated"

# Wait for stability
aws ecs wait services-stable \
  --cluster portfolio-cluster \
  --services portfolio-service

echo "✅ Rollback completed"
```

Make it executable:

```bash
chmod +x scripts/rollback.sh
```

#### 7.3 Logs Script

**File:** `scripts/logs.sh`

```bash
#!/bin/bash

source aws-resources.env

# Tail logs
aws logs tail /ecs/portfolio-app \
  --follow \
  --format short \
  --filter-pattern "${1:-}"
```

Make it executable:

```bash
chmod +x scripts/logs.sh
```

### Step 8: Set Up GitHub Actions (Optional)

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: portfolio-app
  ECS_CLUSTER: portfolio-cluster
  ECS_SERVICE: portfolio-service

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE }} \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_SERVICE }}
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Docker Image**
   - ✅ Built and tested locally
   - ✅ Security scanned
   - ✅ Pushed to ECR
   - ✅ Tagged with version

2. **ECS Configuration**
   - ✅ Task definition created
   - ✅ Service running
   - ✅ Auto-scaling configured
   - ✅ Load balancer integrated

3. **Deployment**
   - ✅ Application deployed
   - ✅ Health checks passing
   - ✅ Logs accessible
   - ✅ Metrics available

4. **Automation**
   - ✅ Deployment script created
   - ✅ Rollback script created
   - ✅ CI/CD pipeline (optional)

### ✅ Validation Checklist

```bash
source aws-resources.env

# 1. Verify image in ECR
aws ecr describe-images --repository-name portfolio-app
# Expected: Images listed

# 2. Verify ECS service running
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].status'
# Expected: ACTIVE

# 3. Verify tasks running
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].runningCount'
# Expected: >= 1

# 4. Test application
curl http://$ALB_DNS/health
# Expected: {"status":"healthy",...}

# 5. Verify target health
aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN
# Expected: All targets healthy

# 6. Check logs
aws logs tail /ecs/portfolio-app --since 5m
# Expected: Application logs visible
```

---

## Next Steps

Your application is now deployed! Proceed to:
**[Phase 6: Production Configuration →](./07-production-configuration.md)**

---

## Troubleshooting

### Deployment Failures

**Problem**: Tasks fail to start
```bash
# Check task logs
./scripts/logs.sh

# Describe stopped tasks
aws ecs describe-tasks \
  --cluster portfolio-cluster \
  --tasks $(aws ecs list-tasks --cluster portfolio-cluster --desired-status STOPPED --query 'taskArns[0]' --output text)
```

**Problem**: Health checks failing
```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN

# View application logs
./scripts/logs.sh "ERROR"
```

### Service Not Starting

**Problem**: Service stuck in pending
```bash
# Check service events
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].events[0:5]'
```
