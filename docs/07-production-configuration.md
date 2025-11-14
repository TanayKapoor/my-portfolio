# Phase 6: Production Configuration

## Goal
Configure production-ready features including SSL/TLS, custom domain, monitoring, alerting, and security hardening.

---

## Todo List

### 1. SSL/TLS Configuration
- [ ] Request SSL certificate
- [ ] Validate domain ownership
- [ ] Configure HTTPS listener
- [ ] Set up HTTP to HTTPS redirect

### 2. Custom Domain Setup
- [ ] Configure Route 53 hosted zone
- [ ] Create DNS records
- [ ] Point domain to load balancer
- [ ] Verify DNS propagation

### 3. Monitoring & Alerting
- [ ] Set up CloudWatch dashboards
- [ ] Configure metric alarms
- [ ] Set up log insights
- [ ] Enable X-Ray tracing (optional)

### 4. Security Hardening
- [ ] Configure WAF (Web Application Firewall)
- [ ] Enable GuardDuty
- [ ] Set up Security Hub
- [ ] Configure backup policies
- [ ] Enable access logging

### 5. Performance Optimization
- [ ] Configure CloudFront CDN (optional)
- [ ] Enable compression
- [ ] Optimize caching headers
- [ ] Configure connection draining

### 6. Backup & Disaster Recovery
- [ ] Configure automated RDS snapshots
- [ ] Set up S3 versioning and lifecycle
- [ ] Create disaster recovery runbook
- [ ] Test recovery procedures

---

## Detailed Steps

### Step 1: SSL/TLS Configuration

#### 1.1 Request SSL Certificate

```bash
source aws-resources.env

# Set your domain name
DOMAIN_NAME="portfolio.yourdomain.com"
ROOT_DOMAIN="yourdomain.com"

# Request certificate
CERTIFICATE_ARN=$(aws acm request-certificate \
  --domain-name $DOMAIN_NAME \
  --subject-alternative-names "*.$ROOT_DOMAIN" $ROOT_DOMAIN \
  --validation-method DNS \
  --tags Key=Name,Value=portfolio-cert Key=Project,Value=portfolio \
  --region $AWS_REGION \
  --query 'CertificateArn' \
  --output text)

echo "CERTIFICATE_ARN=$CERTIFICATE_ARN" >> aws-resources.env
echo "✅ Certificate requested: $CERTIFICATE_ARN"
```

#### 1.2 Get DNS Validation Records

```bash
# Get validation records
aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region $AWS_REGION \
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord' \
  --output table

# Save for manual entry or use Route 53 automation below
```

#### 1.3 Create Route 53 Hosted Zone (if needed)

```bash
# Create hosted zone
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name $ROOT_DOMAIN \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' \
  --output text | cut -d'/' -f3)

echo "HOSTED_ZONE_ID=$HOSTED_ZONE_ID" >> aws-resources.env

# Get name servers
aws route53 get-hosted-zone \
  --id $HOSTED_ZONE_ID \
  --query 'DelegationSet.NameServers' \
  --output table

echo "⚠️  Update your domain registrar with these name servers"
```

#### 1.4 Automate Certificate Validation with Route 53

```bash
# Get validation CNAME record
VALIDATION_RECORD=$(aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
  --output json)

VALIDATION_NAME=$(echo $VALIDATION_RECORD | jq -r '.Name')
VALIDATION_VALUE=$(echo $VALIDATION_RECORD | jq -r '.Value')

# Create validation record
cat > /tmp/acm-validation.json << EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "$VALIDATION_NAME",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "$VALIDATION_VALUE"}]
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file:///tmp/acm-validation.json

# Wait for validation
echo "⏳ Waiting for certificate validation..."
aws acm wait certificate-validated \
  --certificate-arn $CERTIFICATE_ARN \
  --region $AWS_REGION

echo "✅ Certificate validated"
```

#### 1.5 Add HTTPS Listener to ALB

```bash
source aws-resources.env

# Create HTTPS listener
HTTPS_LISTENER_ARN=$(aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERTIFICATE_ARN \
  --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
  --query 'Listeners[0].ListenerArn' \
  --output text)

echo "HTTPS_LISTENER_ARN=$HTTPS_LISTENER_ARN" >> aws-resources.env
echo "✅ HTTPS listener created"
```

#### 1.6 Configure HTTP to HTTPS Redirect

```bash
# Modify HTTP listener to redirect to HTTPS
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions Type=redirect,RedirectConfig="{
    Protocol=HTTPS,
    Port=443,
    StatusCode=HTTP_301
  }"

echo "✅ HTTP→HTTPS redirect configured"
```

### Step 2: Custom Domain Setup

#### 2.1 Create DNS Records for ALB

```bash
source aws-resources.env

# Get ALB hosted zone ID
ALB_ZONE_ID=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].CanonicalHostedZoneId' \
  --output text)

# Create A record (alias to ALB)
cat > /tmp/dns-record.json << EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "$DOMAIN_NAME",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "$ALB_ZONE_ID",
        "DNSName": "$ALB_DNS",
        "EvaluateTargetHealth": true
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file:///tmp/dns-record.json

echo "✅ DNS record created for $DOMAIN_NAME"
```

#### 2.2 Create WWW Redirect (Optional)

```bash
# Create www subdomain that redirects to main domain
cat > /tmp/www-redirect.json << EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "www.$DOMAIN_NAME",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "$ALB_ZONE_ID",
        "DNSName": "$ALB_DNS",
        "EvaluateTargetHealth": true
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file:///tmp/www-redirect.json
```

#### 2.3 Verify DNS Propagation

```bash
# Check DNS resolution
dig $DOMAIN_NAME +short

# Should return ALB IP addresses

# Test HTTPS access
curl -I https://$DOMAIN_NAME/health

# Expected: HTTP/2 200 with SSL
```

### Step 3: Monitoring & Alerting

#### 3.1 Create CloudWatch Dashboard

```bash
source aws-resources.env

# Create dashboard
cat > /tmp/dashboard.json << 'EOF'
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "AWS_REGION",
        "title": "ECS Metrics",
        "yAxis": {"left": {"min": 0, "max": 100}}
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
          [".", "RequestCount", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "AWS_REGION",
        "title": "ALB Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "CPUUtilization", {"stat": "Average"}],
          [".", "DatabaseConnections", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "AWS_REGION",
        "title": "RDS Metrics"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/ecs/portfolio-app'\n| fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 20",
        "region": "AWS_REGION",
        "title": "Recent Errors"
      }
    }
  ]
}
EOF

# Replace region placeholder
sed -i.bak "s/AWS_REGION/$AWS_REGION/g" /tmp/dashboard.json

# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name PortfolioDashboard \
  --dashboard-body file:///tmp/dashboard.json

echo "✅ CloudWatch dashboard created"
echo "View at: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=PortfolioDashboard"
```

#### 3.2 Configure CloudWatch Alarms

```bash
source aws-resources.env

# Alarm: High CPU
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-high-cpu \
  --alarm-description "Alert when ECS CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=portfolio-service Name=ClusterName,Value=portfolio-cluster \
  --alarm-actions arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):portfolio-alerts

# Alarm: High Memory
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-high-memory \
  --alarm-description "Alert when ECS memory is high" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=portfolio-service Name=ClusterName,Value=portfolio-cluster

# Alarm: Unhealthy targets
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-unhealthy-targets \
  --alarm-description "Alert when targets are unhealthy" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=TargetGroup,Value=$(echo $TARGET_GROUP_ARN | cut -d':' -f6)

# Alarm: High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-high-error-rate \
  --alarm-description "Alert on high 5xx error rate" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

echo "✅ CloudWatch alarms created"
```

#### 3.3 Create SNS Topic for Alerts

```bash
# Create SNS topic
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name portfolio-alerts \
  --query 'TopicArn' \
  --output text)

# Subscribe your email
aws sns subscribe \
  --topic-arn $SNS_TOPIC_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com

echo "✅ SNS topic created: $SNS_TOPIC_ARN"
echo "⚠️  Check your email and confirm subscription"

echo "SNS_TOPIC_ARN=$SNS_TOPIC_ARN" >> aws-resources.env
```

#### 3.4 Set Up Log Insights Queries

```bash
# Saved query: Error analysis
aws logs put-query-definition \
  --name "Portfolio Error Analysis" \
  --log-group-names "/ecs/portfolio-app" \
  --query-string 'fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)'

# Saved query: Slow requests
aws logs put-query-definition \
  --name "Portfolio Slow Requests" \
  --log-group-names "/ecs/portfolio-app" \
  --query-string 'fields @timestamp, @message
| filter @message like /duration/
| parse @message /duration=(?<duration>\d+)/
| filter duration > 1000
| sort @timestamp desc'

echo "✅ Log Insights queries saved"
```

### Step 4: Security Hardening

#### 4.1 Configure AWS WAF (Optional)

```bash
# Create WAF web ACL
WAF_ACL_ARN=$(aws wafv2 create-web-acl \
  --name portfolio-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules '[
    {
      "Name": "RateLimitRule",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": {"Block": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "RateLimitRule"
      }
    }
  ]' \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=portfolio-waf \
  --region $AWS_REGION \
  --query 'Summary.ARN' \
  --output text)

# Associate WAF with ALB
aws wafv2 associate-web-acl \
  --web-acl-arn $WAF_ACL_ARN \
  --resource-arn $ALB_ARN \
  --region $AWS_REGION

echo "WAF_ACL_ARN=$WAF_ACL_ARN" >> aws-resources.env
echo "✅ WAF configured"
```

#### 4.2 Enable ALB Access Logs

```bash
# Create S3 bucket for ALB logs
ALB_LOGS_BUCKET="portfolio-alb-logs-$(date +%s)"

aws s3 mb s3://$ALB_LOGS_BUCKET --region $AWS_REGION

# Set bucket policy for ALB logging
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Get ELB service account ID for your region
# us-east-1: 127311923021, us-west-2: 797873946194
# See: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/enable-access-logging.html
ELB_ACCOUNT_ID="127311923021"  # us-east-1

cat > /tmp/alb-logs-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::$ELB_ACCOUNT_ID:root"},
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::$ALB_LOGS_BUCKET/*"
  }]
}
EOF

aws s3api put-bucket-policy \
  --bucket $ALB_LOGS_BUCKET \
  --policy file:///tmp/alb-logs-policy.json

# Enable access logging on ALB
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn $ALB_ARN \
  --attributes \
    Key=access_logs.s3.enabled,Value=true \
    Key=access_logs.s3.bucket,Value=$ALB_LOGS_BUCKET \
    Key=access_logs.s3.prefix,Value=alb-logs

echo "✅ ALB access logging enabled to s3://$ALB_LOGS_BUCKET"
```

#### 4.3 Enable GuardDuty

```bash
# Enable GuardDuty
aws guardduty create-detector \
  --enable \
  --finding-publishing-frequency FIFTEEN_MINUTES

echo "✅ GuardDuty enabled"
```

### Step 5: Performance Optimization

#### 5.1 Configure CloudFront CDN (Optional)

```bash
source aws-resources.env

# Create CloudFront distribution
cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "portfolio-$(date +%s)",
  "Comment": "Portfolio CDN",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "alb-origin",
      "DomainName": "$ALB_DNS",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only",
        "OriginSslProtocols": {
          "Quantity": 1,
          "Items": ["TLSv1.2"]
        }
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "alb-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {"Forward": "all"},
      "Headers": {
        "Quantity": 1,
        "Items": ["Host"]
      }
    }
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERTIFICATE_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["$DOMAIN_NAME"]
  }
}
EOF

# Note: CloudFront distribution creation is complex
# Consider using AWS Console for initial setup
echo "⚠️  CloudFront configuration prepared"
echo "Create distribution via Console or use AWS CLI with the config file"
```

#### 5.2 Enable Compression on ALB

```bash
# Already handled in Dockerfile with compression middleware
# Verify it's working:
curl -H "Accept-Encoding: gzip" -I https://$DOMAIN_NAME/api/projects

# Should see: Content-Encoding: gzip
```

### Step 6: Backup & Disaster Recovery

#### 6.1 Configure RDS Automated Backups

```bash
# Modify RDS instance for automated backups
aws rds modify-db-instance \
  --db-instance-identifier portfolio-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier portfolio-db \
  --db-snapshot-identifier portfolio-db-initial-snapshot-$(date +%Y%m%d)

echo "✅ RDS backups configured"
```

#### 6.2 Enable S3 Versioning

```bash
source aws-resources.env

# Enable versioning on uploads bucket
aws s3api put-bucket-versioning \
  --bucket $S3_BUCKET \
  --versioning-configuration Status=Enabled

echo "✅ S3 versioning enabled"
```

#### 6.3 Create Disaster Recovery Runbook

**File:** `docs/DISASTER_RECOVERY.md`

```markdown
# Disaster Recovery Runbook

## RDS Database Recovery

### Restore from Automated Backup
\`\`\`bash
# List available backups
aws rds describe-db-snapshots \
  --db-instance-identifier portfolio-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier portfolio-db-restored \
  --db-snapshot-identifier <snapshot-id>
\`\`\`

### Point-in-Time Recovery
\`\`\`bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier portfolio-db \
  --target-db-instance-identifier portfolio-db-pitr \
  --restore-time 2024-01-01T00:00:00Z
\`\`\`

## ECS Service Recovery

### Rollback Deployment
\`\`\`bash
./scripts/rollback.sh
\`\`\`

### Force New Deployment
\`\`\`bash
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
\`\`\`

## S3 Data Recovery

### Restore Previous Version
\`\`\`bash
# List versions
aws s3api list-object-versions \
  --bucket $S3_BUCKET \
  --prefix icon/

# Restore specific version
aws s3api copy-object \
  --bucket $S3_BUCKET \
  --copy-source $S3_BUCKET/icon/file.png?versionId=<version-id> \
  --key icon/file.png
\`\`\`

## Complete Infrastructure Recovery

1. Restore RDS from snapshot
2. Update DATABASE_URL in Secrets Manager
3. Redeploy ECS service
4. Verify application health
5. Update DNS if needed

## Contact Information

- AWS Support: [Link]
- On-call Engineer: [Contact]
- Escalation Path: [Details]
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **SSL/TLS**
   - ✅ SSL certificate issued and validated
   - ✅ HTTPS listener configured
   - ✅ HTTP→HTTPS redirect enabled
   - ✅ Custom domain configured

2. **Monitoring**
   - ✅ CloudWatch dashboard created
   - ✅ Alarms configured
   - ✅ SNS notifications set up
   - ✅ Log Insights queries saved

3. **Security**
   - ✅ WAF configured (optional)
   - ✅ Access logging enabled
   - ✅ GuardDuty enabled
   - ✅ Security groups hardened

4. **Backup & DR**
   - ✅ RDS automated backups configured
   - ✅ S3 versioning enabled
   - ✅ Disaster recovery runbook created
   - ✅ Manual snapshots created

### ✅ Validation Checklist

```bash
source aws-resources.env

# 1. Test HTTPS access
curl -I https://$DOMAIN_NAME/health
# Expected: HTTP/2 200

# 2. Test HTTP redirect
curl -I http://$DOMAIN_NAME
# Expected: 301 redirect to HTTPS

# 3. Verify SSL certificate
echo | openssl s_client -servername $DOMAIN_NAME -connect $DOMAIN_NAME:443 2>/dev/null | openssl x509 -noout -dates

# 4. Check CloudWatch alarms
aws cloudwatch describe-alarms --state-value ALARM
# Expected: No alarms in ALARM state

# 5. Verify backups
aws rds describe-db-snapshots --db-instance-identifier portfolio-db
# Expected: Recent snapshots listed

# 6. Test monitoring
aws cloudwatch get-dashboard --dashboard-name PortfolioDashboard
# Expected: Dashboard exists
```

---

## Next Steps

Production configuration complete! Proceed to:
**[Phase 7: Testing & Monitoring →](./08-testing-monitoring.md)**
