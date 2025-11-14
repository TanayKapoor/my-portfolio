# Phase 8: Post-Deployment & Optimization

## Goal
Fine-tune the production deployment, implement cost optimizations, establish operational procedures, and create documentation for long-term maintenance.

---

## Todo List

### 1. Cost Optimization
- [ ] Analyze current spending
- [ ] Implement cost-saving measures
- [ ] Set up budget alerts
- [ ] Review resource sizing
- [ ] Clean up unused resources

### 2. Performance Optimization
- [ ] Analyze bottlenecks
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Fine-tune auto-scaling
- [ ] Optimize container resources

### 3. Operational Procedures
- [ ] Create runbooks
- [ ] Document deployment process
- [ ] Establish on-call procedures
- [ ] Create troubleshooting guides
- [ ] Set up team access

### 4. Continuous Improvement
- [ ] Set up feedback loops
- [ ] Plan feature rollout strategy
- [ ] Implement A/B testing (optional)
- [ ] Create development workflow

### 5. Documentation
- [ ] Architecture documentation
- [ ] API documentation
- [ ] Operations manual
- [ ] Developer onboarding guide

---

## Detailed Steps

### Step 1: Cost Optimization

#### 1.1 Analyze Current Costs

```bash
# Get cost for last 30 days
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost UnblendedCost \
  --group-by Type=SERVICE \
  --query 'ResultsByTime[0].Groups' \
  --output table

# Get cost by tag
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project \
  --filter '{"Tags":{"Key":"Project","Values":["portfolio"]}}' \
  --output table
```

#### 1.2 Cost Optimization Strategies

**A. Right-size RDS Instance**

```bash
# Check RDS CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=portfolio-db \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum \
  --query 'Datapoints[*].[Timestamp,Average,Maximum]' \
  --output table

# If average < 20%, consider smaller instance
# db.t3.micro → db.t4g.micro (ARM-based, cheaper)
```

**B. Use ECS Fargate Spot (for non-critical workloads)**

```bash
# Update capacity provider strategy
aws ecs put-cluster-capacity-providers \
  --cluster portfolio-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE_SPOT,weight=4,base=0 \
    capacityProvider=FARGATE,weight=1,base=1

# This uses 80% Spot, 20% On-Demand
```

**C. Implement S3 Lifecycle Policies**

```bash
source aws-resources.env

# Move old files to cheaper storage
cat > /tmp/s3-lifecycle.json << EOF
{
  "Rules": [{
    "Id": "MoveToIA",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 90,
      "StorageClass": "STANDARD_IA"
    }, {
      "Days": 180,
      "StorageClass": "GLACIER"
    }],
    "NoncurrentVersionTransitions": [{
      "NoncurrentDays": 30,
      "StorageClass": "STANDARD_IA"
    }]
  }]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket $S3_BUCKET \
  --lifecycle-configuration file:///tmp/s3-lifecycle.json
```

**D. Use Savings Plans**

```bash
# Analyze compute usage
aws ce get-savings-plans-purchase-recommendation \
  --savings-plans-type COMPUTE_SP \
  --term-in-years ONE_YEAR \
  --payment-option NO_UPFRONT \
  --lookback-period-in-days SIXTY_DAYS

# Purchase if significant savings available (via console)
```

**E. Schedule RDS for Development**

Create Lambda function to stop RDS at night (if you have dev/staging):

```python
# lambda_rds_scheduler.py
import boto3
import os

rds = boto3.client('rds')

def lambda_handler(event, context):
    db_instance = os.environ['DB_INSTANCE_ID']
    action = event['action']  # 'stop' or 'start'

    if action == 'stop':
        rds.stop_db_instance(DBInstanceIdentifier=db_instance)
    elif action == 'start':
        rds.start_db_instance(DBInstanceIdentifier=db_instance)

    return {'statusCode': 200, 'body': f'{action} initiated'}
```

#### 1.3 Set Up Cost Alerts

```bash
# Create budget with multiple thresholds
cat > /tmp/budget.json << EOF
{
  "BudgetName": "PortfolioMonthlyBudget",
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
EOF

cat > /tmp/notifications.json << EOF
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 50,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  },
  {
    "Notification": {
      "NotificationType": "FORECASTED",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  }
]
EOF

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws budgets create-budget \
  --account-id $ACCOUNT_ID \
  --budget file:///tmp/budget.json \
  --notifications-with-subscribers file:///tmp/notifications.json
```

#### 1.4 Monthly Cost Review Checklist

**File:** `docs/COST_REVIEW.md`

```markdown
# Monthly Cost Review Checklist

## Date: ___________

### 1. Review AWS Cost Explorer
- [ ] Check total monthly cost: $______
- [ ] Compare to budget: $100
- [ ] Identify top 5 services by cost

### 2. Resource Utilization
- [ ] ECS CPU average: ____%
- [ ] ECS Memory average: ____%
- [ ] RDS CPU average: ____%
- [ ] S3 storage used: _____GB

### 3. Optimization Opportunities
- [ ] Unused resources identified?
- [ ] Oversized instances?
- [ ] Old snapshots to delete?
- [ ] S3 lifecycle rules working?

### 4. Actions Taken
-
-
-

### 5. Projected Next Month
Estimated cost: $_____

### Notes
```

### Step 2: Performance Optimization

#### 2.1 Identify Bottlenecks

```bash
# Analyze slow queries in RDS
source aws-resources.env

psql "$DATABASE_URL" << 'EOF'
-- Enable pg_stat_statements if not already
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
  query,
  calls,
  total_exec_time / 1000 as total_time_seconds,
  mean_exec_time / 1000 as avg_time_seconds,
  max_exec_time / 1000 as max_time_seconds
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF
```

#### 2.2 Implement Database Indexes

```bash
# Add indexes for frequently queried columns
psql "$DATABASE_URL" << 'EOF'
-- Index on project featured and order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_featured_order
ON projects(featured, "order") WHERE featured = true;

-- Index on work experience type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_exp_type_order
ON work_experiences(type, "order");

-- Index on commands by project
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commands_project
ON commands(project_id, "order");

-- Analyze tables after creating indexes
ANALYZE projects;
ANALYZE work_experiences;
ANALYZE commands;

-- Verify indexes created
\di
EOF
```

#### 2.3 Implement Application-Level Caching

Update your Express app to use Redis caching (optional):

```bash
# If implementing Redis caching
# 1. Create ElastiCache Redis cluster
# 2. Install redis client: npm install redis
# 3. Update application code
```

**File:** `server/cache.ts` (optional)

```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
  },
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!client.isOpen) await client.connect();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setInCache(
  key: string,
  value: any,
  expirySeconds: number = 3600
): Promise<void> {
  if (!client.isOpen) await client.connect();
  await client.setEx(key, expirySeconds, JSON.stringify(value));
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!client.isOpen) await client.connect();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}
```

#### 2.4 Fine-Tune Auto-Scaling

```bash
source aws-resources.env

# Update scaling policies with tighter thresholds
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name portfolio-cpu-scaling-optimized \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 60.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 120,
    "ScaleOutCooldown": 60
  }'

# Monitor auto-scaling events
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --max-results 10
```

#### 2.5 Optimize Container Resources

Based on actual usage, adjust task definition:

```bash
# If average CPU usage is consistently < 30%, reduce CPU
# If average memory is < 200MB, reduce memory

# Update task definition
# CPU: 256 → 128 (0.25 vCPU → 0.125 vCPU)
# Memory: 512 → 256 (512MB → 256MB)

# Register new task definition with optimized resources
# Then update service
```

### Step 3: Operational Procedures

#### 3.1 Create Deployment Runbook

**File:** `docs/DEPLOYMENT_RUNBOOK.md`

```markdown
# Deployment Runbook

## Pre-Deployment Checklist

- [ ] All tests passing in CI
- [ ] Code reviewed and approved
- [ ] Database migrations prepared (if any)
- [ ] Rollback plan documented
- [ ] Stakeholders notified

## Deployment Steps

### 1. Prepare Environment

\`\`\`bash
# Load configuration
source aws-resources.env

# Verify current health
curl https://$DOMAIN_NAME/health
\`\`\`

### 2. Build and Push

\`\`\`bash
# Run deployment script
./scripts/deploy.sh

# Verify image pushed
aws ecr describe-images \
  --repository-name portfolio-app \
  --query 'imageDetails[0].imageTags' \
  --output table
\`\`\`

### 3. Monitor Deployment

\`\`\`bash
# Watch deployment
watch -n 5 'aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query "services[0].deployments" \
  --output table'
\`\`\`

### 4. Verify Health

\`\`\`bash
# Wait for stabilization
aws ecs wait services-stable \
  --cluster portfolio-cluster \
  --services portfolio-service

# Check application health
curl https://$DOMAIN_NAME/health
curl https://$DOMAIN_NAME/api/projects | jq '.[0]'
\`\`\`

### 5. Monitor Logs

\`\`\`bash
# Check for errors
./scripts/logs.sh "ERROR"
\`\`\`

## Rollback Procedure

If issues detected:

\`\`\`bash
./scripts/rollback.sh
\`\`\`

## Post-Deployment

- [ ] Verify all endpoints working
- [ ] Check error rates in CloudWatch
- [ ] Monitor performance metrics
- [ ] Update deployment log
- [ ] Notify stakeholders of completion

## Troubleshooting

### Deployment Stuck

1. Check ECS events
2. Verify task definition valid
3. Check security groups
4. Review CloudWatch logs

### Health Checks Failing

1. Check application logs
2. Verify database connectivity
3. Check environment variables
4. Test endpoints manually
```

#### 3.2 Create Incident Response Runbook

**File:** `docs/INCIDENT_RESPONSE.md`

```markdown
# Incident Response Runbook

## Severity Levels

- **P0**: Complete outage, revenue impact
- **P1**: Partial outage, degraded performance
- **P2**: Minor issue, workaround available
- **P3**: Cosmetic issue, no user impact

## P0: Complete Outage

### Symptoms
- Application unreachable
- All health checks failing
- 5xx errors on all requests

### Response Steps

1. **Acknowledge** (2 min)
   - Post in incident channel
   - Page on-call engineer
   - Start incident timeline

2. **Assess** (5 min)
   \`\`\`bash
   # Check ECS service
   aws ecs describe-services \
     --cluster portfolio-cluster \
     --services portfolio-service

   # Check ALB targets
   aws elbv2 describe-target-health \
     --target-group-arn $TARGET_GROUP_ARN

   # Check recent deployments
   aws ecs describe-services \
     --cluster portfolio-cluster \
     --services portfolio-service \
     --query 'services[0].events[0:5]'
   \`\`\`

3. **Mitigate** (10 min)
   - If recent deployment: Rollback
   - If infrastructure: Scale up tasks
   - If database: Check RDS status

4. **Resolve** (30 min)
   - Fix root cause
   - Verify resolution
   - Monitor for 15 minutes

5. **Post-Mortem** (24 hours)
   - Document incident
   - Identify root cause
   - Create action items

## P1: Degraded Performance

### Symptoms
- Slow response times (> 2s)
- Intermittent errors
- Some users affected

### Response Steps

1. **Check metrics**
   - CloudWatch dashboard
   - ECS CPU/Memory
   - RDS connections

2. **Scale if needed**
   \`\`\`bash
   aws ecs update-service \
     --cluster portfolio-cluster \
     --service portfolio-service \
     --desired-count 4
   \`\`\`

3. **Investigate logs**
   \`\`\`bash
   ./scripts/logs.sh "ERROR|WARN"
   \`\`\`

## Common Issues

### Database Connection Pool Exhausted

**Symptoms**: "connection pool exhausted" errors

**Fix**:
\`\`\`bash
# Restart tasks to reset connections
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
\`\`\`

### Out of Memory

**Symptoms**: Tasks stopping with exit code 137

**Fix**:
\`\`\`bash
# Increase memory in task definition
# Register new task definition with 1024MB
\`\`\`

### SSL Certificate Expiring

**Symptoms**: Browser SSL warnings

**Fix**:
\`\`\`bash
# Request new certificate
# Update ALB listener
\`\`\`

## Contact Information

- On-Call: [Phone]
- AWS Support: [Case URL]
- Database Admin: [Contact]
- Manager: [Contact]
```

#### 3.3 Create Monitoring Checklist

**File:** `docs/DAILY_MONITORING.md`

```markdown
# Daily Monitoring Checklist

## Morning Check (5 minutes)

### 1. Health Status
- [ ] Visit https://$DOMAIN_NAME/health
- [ ] Check response time < 100ms
- [ ] Verify uptime metric

### 2. CloudWatch Dashboard
- [ ] Review 24-hour metrics
- [ ] Check for any alarms
- [ ] Review error logs

### 3. Cost Check
- [ ] Review yesterday's spend
- [ ] Compare to daily budget
- [ ] Check for anomalies

## Weekly Check (15 minutes)

### 1. Performance Review
- [ ] Average response times
- [ ] Error rates
- [ ] Traffic patterns

### 2. Resource Utilization
- [ ] ECS CPU/Memory trends
- [ ] RDS CPU/Connections
- [ ] S3 storage growth

### 3. Security
- [ ] Review GuardDuty findings
- [ ] Check WAF blocked requests
- [ ] Review access logs

### 4. Backups
- [ ] Verify RDS snapshots
- [ ] Check S3 versioning
- [ ] Test restore procedure (monthly)

## Monthly Review

- [ ] Run cost optimization review
- [ ] Update dependencies
- [ ] Review and update documentation
- [ ] Test disaster recovery
- [ ] Security patching
```

### Step 4: Documentation

#### 4.1 Architecture Documentation

**File:** `docs/ARCHITECTURE.md`

```markdown
# Portfolio Application Architecture

## Overview

The portfolio application is deployed on AWS using a containerized architecture with the following components:

## Architecture Diagram

\`\`\`
[Users] → [Route53] → [ALB] → [ECS Fargate] → [RDS PostgreSQL]
                                     ↓
                                  [S3 Bucket]
\`\`\`

## Components

### Frontend
- **Technology**: React 18 + Vite
- **Deployment**: Static files served by Express
- **Location**: ECS containers

### Backend
- **Technology**: Node.js + Express
- **Deployment**: Docker containers on ECS Fargate
- **Scaling**: Auto-scaling based on CPU (60-70%)

### Database
- **Technology**: PostgreSQL 16
- **Service**: AWS RDS
- **Instance**: db.t3.micro
- **Backups**: Automated daily, 7-day retention

### Storage
- **Service**: AWS S3
- **Bucket**: portfolio-uploads-*
- **Purpose**: User-uploaded images
- **Lifecycle**: 90 days → IA, 180 days → Glacier

### Load Balancer
- **Service**: Application Load Balancer
- **Listeners**: HTTP (80) → HTTPS redirect, HTTPS (443)
- **SSL**: AWS Certificate Manager
- **Health Check**: /health endpoint

### Monitoring
- **Logs**: CloudWatch Logs
- **Metrics**: CloudWatch Metrics
- **Dashboards**: CloudWatch Dashboard
- **Alerts**: SNS notifications

## Network Architecture

### VPC Configuration
- **CIDR**: 10.0.0.0/16
- **Subnets**: 2 public subnets (10.0.1.0/24, 10.0.2.0/24)
- **Availability Zones**: 2 AZs for high availability

### Security Groups
- **ALB SG**: Allow 80, 443 from 0.0.0.0/0
- **ECS SG**: Allow 5000 from ALB SG
- **RDS SG**: Allow 5432 from ECS SG

## Data Flow

1. User request → Route53 DNS
2. Route53 → ALB (HTTPS)
3. ALB → ECS tasks (health check + routing)
4. ECS → RDS (database queries)
5. ECS → S3 (file operations)
6. Response → User

## Deployment Process

1. Build Docker image
2. Push to ECR
3. Update ECS task definition
4. ECS rolling update (blue-green)
5. Health checks
6. Rollback if failed

## Disaster Recovery

- **RTO**: 15 minutes
- **RPO**: 5 minutes
- **Backup Strategy**: Automated RDS snapshots + manual snapshots
- **Recovery**: Point-in-time restore available
```

#### 4.2 API Documentation

**File:** `docs/API.md`

```markdown
# API Documentation

Base URL: `https://portfolio.yourdomain.com/api`

## Authentication

Most endpoints are public. Admin endpoints require authentication via session cookies.

### Login

\`\`\`http
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
\`\`\`

## Projects

### Get All Projects

\`\`\`http
GET /api/projects
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "title": "Project Title",
    "description": "...",
    "technologies": ["React", "Node.js"],
    "featured": true
  }
]
\`\`\`

### Get Project by ID

\`\`\`http
GET /api/projects/:id
\`\`\`

### Create Project (Admin Only)

\`\`\`http
POST /api/projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "...",
  "technologies": ["React"],
  "features": [],
  "challenges": [],
  "results": [],
  "order": 1
}
\`\`\`

[Continue documenting all endpoints...]
```

### Step 5: Future Enhancements

**File:** `docs/ROADMAP.md`

```markdown
# Technical Roadmap

## Q1 2024

### Performance
- [ ] Implement Redis caching
- [ ] Add CloudFront CDN
- [ ] Optimize images with WebP

### Monitoring
- [ ] Add AWS X-Ray tracing
- [ ] Implement custom business metrics
- [ ] Set up synthetic monitoring

### Security
- [ ] Implement rate limiting per user
- [ ] Add API key authentication
- [ ] Set up AWS WAF rules

## Q2 2024

### Features
- [ ] Add GraphQL API
- [ ] Implement real-time updates (WebSocket)
- [ ] Add search functionality

### Infrastructure
- [ ] Multi-region deployment
- [ ] Implement chaos engineering
- [ ] Add staging environment

### DevOps
- [ ] Automated testing in CI/CD
- [ ] Blue-green deployment
- [ ] Canary releases

## Q3 2024

### Scalability
- [ ] Implement microservices architecture
- [ ] Add message queue (SQS)
- [ ] Separate read/write database

### Compliance
- [ ] GDPR compliance
- [ ] SOC 2 certification prep
- [ ] Security audit

## Backlog

- Implement feature flags
- A/B testing framework
- Mobile app
- Analytics dashboard
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Cost Optimization**
   - ✅ Cost analysis completed
   - ✅ Optimization measures implemented
   - ✅ Budget alerts configured
   - ✅ Monthly review process established

2. **Performance**
   - ✅ Bottlenecks identified and addressed
   - ✅ Database optimized
   - ✅ Auto-scaling fine-tuned
   - ✅ Container resources optimized

3. **Operations**
   - ✅ Runbooks created
   - ✅ Incident response procedures documented
   - ✅ Monitoring checklists established
   - ✅ Team access configured

4. **Documentation**
   - ✅ Architecture documented
   - ✅ API documented
   - ✅ Operations manual created
   - ✅ Future roadmap defined

### ✅ Final Validation

```bash
# 1. Cost check
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -d '+30 days' +%Y-%m-%d) \
  --metric BLENDED_COST \
  --granularity MONTHLY
# Expected: Within budget

# 2. Performance check
ab -n 100 -c 10 https://$DOMAIN_NAME/health
# Expected: <100ms average

# 3. Documentation complete
ls docs/
# Expected: All runbooks present

# 4. Monitoring active
aws cloudwatch describe-alarms --state-value OK | jq '.MetricAlarms | length'
# Expected: > 0 alarms configured
```

### 🎉 Deployment Complete!

Your portfolio application is now:
- ✅ Fully deployed on AWS
- ✅ Highly available across multiple AZs
- ✅ Auto-scaling based on demand
- ✅ Monitored and alerted
- ✅ Cost-optimized
- ✅ Secure and compliant
- ✅ Documented and maintainable

### 📈 Success Metrics

- **Availability**: 99.9%+
- **Response Time**: < 500ms p95
- **Cost**: < $100/month
- **Deployment Time**: < 10 minutes
- **Recovery Time**: < 15 minutes

---

## Ongoing Maintenance

### Daily
- Check health status
- Review error logs
- Monitor costs

### Weekly
- Review performance metrics
- Check security alerts
- Update dependencies

### Monthly
- Cost optimization review
- Security patching
- Backup testing
- Documentation updates

### Quarterly
- Architecture review
- Disaster recovery drill
- Capacity planning
- Roadmap review

---

## Congratulations! 🚀

You've successfully deployed your portfolio application to AWS using a production-grade, containerized architecture. Your application is now:

- Scalable
- Resilient
- Secure
- Cost-effective
- Well-monitored
- Fully documented

**Next Steps:**
1. Share your deployment with stakeholders
2. Start monitoring real user traffic
3. Iterate based on feedback
4. Plan next features from roadmap

**Resources:**
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Operational Excellence](https://wa.aws.amazon.com/wat.pillar.operationalExcellence.en.html)
