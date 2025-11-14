# Quick Reference Guide

Essential commands and information for managing your AWS deployment.

## 🔧 Essential Commands

### Deployment

```bash
# Deploy latest version
./scripts/deploy.sh

# Rollback to previous version
./scripts/rollback.sh

# View logs
./scripts/logs.sh

# View errors only
./scripts/logs.sh "ERROR"
```

### Docker

```bash
# Build image locally
docker build -t portfolio-app:latest .

# Run locally
docker-compose up -d

# Stop local environment
docker-compose down

# Clean up
docker system prune -af
```

### AWS Resources

```bash
# Load environment variables
source aws-resources.env

# Check ECS service status
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

# Check application health
curl https://$DOMAIN_NAME/health

# View CloudWatch logs
aws logs tail /ecs/portfolio-app --follow

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier portfolio-db \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Database

```bash
# Connect to RDS
psql "$DATABASE_URL"

# Run migrations
npm run db:push

# Create backup
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Restore backup
psql "$DATABASE_URL" < backup.sql
```

## 📊 Monitoring

### CloudWatch Dashboard
```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=PortfolioDashboard
```

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Utilization | > 70% | Scale up |
| Memory Utilization | > 80% | Increase memory |
| Response Time (p95) | > 500ms | Investigate |
| Error Rate | > 1% | Check logs |
| Unhealthy Targets | > 0 | Restart tasks |

### Useful CloudWatch Queries

**Error frequency:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)
```

**Slow requests:**
```
fields @timestamp, @message
| filter @message like /duration/
| parse @message /duration=(?<duration>\d+)/
| filter duration > 1000
| sort @timestamp desc
```

**Request distribution:**
```
fields @timestamp, @message
| filter @message like /GET|POST/
| parse @message /(?<method>\w+) (?<path>\/\S+)/
| stats count() by path
| sort count desc
```

## 🚨 Common Issues & Fixes

### Application Not Responding

```bash
# 1. Check ECS tasks
aws ecs list-tasks --cluster portfolio-cluster --service-name portfolio-service

# 2. Check target health
aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN

# 3. Restart service
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
```

### High CPU/Memory

```bash
# Check current utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=portfolio-service Name=ClusterName,Value=portfolio-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Scale up manually
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --desired-count 4
```

### Database Connection Issues

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1"

# Check RDS status
aws rds describe-db-instances --db-instance-identifier portfolio-db

# Check security group
aws ec2 describe-security-groups --group-ids $RDS_SG
```

### Deployment Stuck

```bash
# Check service events
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].events[0:10]'

# Force new deployment
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
```

## 💰 Cost Management

### Check Current Costs

```bash
# This month's cost
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost

# Forecast next month
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -d '+30 days' +%Y-%m-%d) \
  --metric BLENDED_COST \
  --granularity MONTHLY
```

### Cost Optimization Quick Wins

1. **Use Spot Instances (50-70% savings)**
   ```bash
   # Update to use more Spot
   aws ecs put-cluster-capacity-providers \
     --cluster portfolio-cluster \
     --capacity-providers FARGATE FARGATE_SPOT \
     --default-capacity-provider-strategy \
       capacityProvider=FARGATE_SPOT,weight=4,base=0 \
       capacityProvider=FARGATE,weight=1,base=1
   ```

2. **Stop RDS When Not in Use** (staging/dev only)
   ```bash
   aws rds stop-db-instance --db-instance-identifier portfolio-db
   aws rds start-db-instance --db-instance-identifier portfolio-db
   ```

3. **Clean Up Old Resources**
   ```bash
   # Delete old ECR images
   aws ecr list-images --repository-name portfolio-app
   aws ecr batch-delete-image --repository-name portfolio-app --image-ids imageTag=old-tag

   # Delete old RDS snapshots
   aws rds describe-db-snapshots --db-instance-identifier portfolio-db
   aws rds delete-db-snapshot --db-snapshot-identifier old-snapshot-id
   ```

## 🔒 Security

### Check Security Status

```bash
# SSL certificate expiry
echo | openssl s_client -servername $DOMAIN_NAME -connect $DOMAIN_NAME:443 2>/dev/null | \
  openssl x509 -noout -dates

# GuardDuty findings
aws guardduty list-findings --detector-id $(aws guardduty list-detectors --query 'DetectorIds[0]' --output text)

# WAF blocked requests (if configured)
aws wafv2 get-web-acl \
  --name portfolio-waf \
  --scope REGIONAL \
  --id <web-acl-id>
```

### Rotate Secrets

```bash
# Update session secret
NEW_SECRET=$(openssl rand -base64 48 | tr -d "=+/")
aws secretsmanager update-secret \
  --secret-id portfolio/production/session-secret \
  --secret-string "$NEW_SECRET"

# Force new deployment to pick up new secret
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
```

## 📦 Backup & Restore

### Create Backup

```bash
# Database snapshot
aws rds create-db-snapshot \
  --db-instance-identifier portfolio-db \
  --db-snapshot-identifier portfolio-manual-$(date +%Y%m%d)

# Export database to file
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Backup S3 bucket
aws s3 sync s3://$S3_BUCKET s3://portfolio-backup-bucket/$(date +%Y%m%d)/
```

### Restore Backup

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier portfolio-db-restored \
  --db-snapshot-identifier portfolio-manual-20240115

# Restore from SQL file
psql "$DATABASE_URL" < backup-20240115.sql

# Restore S3 files
aws s3 sync s3://portfolio-backup-bucket/20240115/ s3://$S3_BUCKET/
```

## 🔄 Scaling

### Manual Scaling

```bash
# Scale ECS service
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --desired-count 5

# Scale RDS (change instance type)
aws rds modify-db-instance \
  --db-instance-identifier portfolio-db \
  --db-instance-class db.t3.small \
  --apply-immediately
```

### Auto-Scaling Limits

```bash
# Update min/max capacity
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/portfolio-cluster/portfolio-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 20
```

## 📞 Emergency Contacts

| Role | Contact | When to Use |
|------|---------|-------------|
| AWS Support | [Support Center](https://console.aws.amazon.com/support/) | Infrastructure issues |
| On-Call Engineer | [Your Phone] | Application emergencies |
| Database Admin | [Contact] | Database issues |
| Security Team | [Contact] | Security incidents |

## 🔗 Quick Links

### AWS Consoles
- [ECS](https://console.aws.amazon.com/ecs/home?region=us-east-1#/clusters)
- [RDS](https://console.aws.amazon.com/rds/home?region=us-east-1#databases:)
- [S3](https://console.aws.amazon.com/s3/home?region=us-east-1)
- [CloudWatch](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1)
- [Cost Explorer](https://console.aws.amazon.com/cost-management/home)

### External Tools
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## 📋 Resource IDs

After deployment, keep these handy (also in `aws-resources.env`):

```bash
# Network
VPC_ID=vpc-xxxxx
PUBLIC_SUBNET_1=subnet-xxxxx
PUBLIC_SUBNET_2=subnet-xxxxx

# Security
ALB_SG=sg-xxxxx
ECS_SG=sg-xxxxx
RDS_SG=sg-xxxxx

# Storage
S3_BUCKET=portfolio-uploads-xxxxx

# Database
DB_ENDPOINT=portfolio-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_URL=postgresql://user:pass@host:5432/db

# Container
ECR_URI=123456789012.dkr.ecr.us-east-1.amazonaws.com/portfolio-app
ECS_CLUSTER=portfolio-cluster
ECS_SERVICE=portfolio-service

# Load Balancer
ALB_DNS=portfolio-alb-xxxxx.us-east-1.elb.amazonaws.com
TARGET_GROUP_ARN=arn:aws:elasticloadbalancing:...

# Domain
DOMAIN_NAME=portfolio.yourdomain.com
CERTIFICATE_ARN=arn:aws:acm:...
```

## 🎯 Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time (avg) | < 200ms | > 300ms |
| Response Time (p95) | < 500ms | > 800ms |
| Error Rate | < 0.1% | > 1% |
| Uptime | > 99.9% | < 99% |
| CPU Usage | < 60% | > 80% |
| Memory Usage | < 70% | > 85% |
| Database Connections | < 20 | > 50 |

## 📝 Daily Checklist

```bash
# Morning checks (5 minutes)
curl https://$DOMAIN_NAME/health
aws ecs describe-services --cluster portfolio-cluster --services portfolio-service --query 'services[0].runningCount'
aws cloudwatch describe-alarms --state-value ALARM
aws ce get-cost-and-usage --time-period Start=$(date -d '1 day ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) --granularity DAILY --metrics BlendedCost
```

---

**Keep this guide handy for quick reference!**

For detailed procedures, see the main documentation phases.
