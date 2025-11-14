# Phase 7: Testing & Monitoring

## Goal
Perform comprehensive testing of the deployed application, establish monitoring baselines, and ensure the system is production-ready.

---

## Todo List

### 1. Functional Testing
- [ ] Test all API endpoints
- [ ] Verify database operations
- [ ] Test file upload/download
- [ ] Verify authentication flows
- [ ] Test admin functions

### 2. Performance Testing
- [ ] Load testing
- [ ] Stress testing
- [ ] Endurance testing
- [ ] Spike testing
- [ ] Establish performance baselines

### 3. Security Testing
- [ ] SSL/TLS verification
- [ ] Security headers check
- [ ] CORS testing
- [ ] Authentication testing
- [ ] SQL injection testing
- [ ] XSS testing

### 4. Monitoring Setup
- [ ] Configure CloudWatch metrics
- [ ] Set up custom metrics
- [ ] Create monitoring dashboards
- [ ] Verify alerting
- [ ] Test log aggregation

### 5. Disaster Recovery Testing
- [ ] Test database restore
- [ ] Test service rollback
- [ ] Verify backup procedures
- [ ] Document recovery times

---

## Detailed Steps

### Step 1: Functional Testing

#### 1.1 Create Test Script

**File:** `tests/functional-tests.sh`

```bash
#!/bin/bash

# Functional tests for deployed application

set -e

BASE_URL="${BASE_URL:-https://portfolio.yourdomain.com}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
  local name=$1
  local endpoint=$2
  local expected_code=$3

  echo -n "Testing $name... "

  response_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")

  if [ "$response_code" -eq "$expected_code" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $response_code)"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}FAIL${NC} (Expected HTTP $expected_code, got $response_code)"
    ((TESTS_FAILED++))
  fi
}

echo "========================================="
echo "Functional Testing Suite"
echo "Base URL: $BASE_URL"
echo "========================================="

# Health check
test_endpoint "Health check" "/health" 200

# API endpoints
test_endpoint "Get all projects" "/api/projects" 200
test_endpoint "Get all work experiences" "/api/work-experiences" 200

# Test specific project (replace with actual ID)
test_endpoint "Get specific project" "/api/projects/test-id" 404

# Test authentication
echo -n "Testing authentication... "
auth_response=$(curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$auth_response" | grep -q "success\|token"; then
  echo -e "${GREEN}PASS${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}FAIL${NC}"
  ((TESTS_FAILED++))
fi

# Test static files
test_endpoint "Frontend" "/" 200
test_endpoint "Static assets" "/assets/" 404

echo ""
echo "========================================="
echo "Test Results"
echo "========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
  exit 1
fi
```

Make it executable:

```bash
chmod +x tests/functional-tests.sh
```

#### 1.2 Run Functional Tests

```bash
# Set your domain
export BASE_URL="https://portfolio.yourdomain.com"

# Run tests
./tests/functional-tests.sh
```

#### 1.3 Test Database Operations

```bash
source aws-resources.env

# Test read operations
curl https://$DOMAIN_NAME/api/projects | jq '.[] | {id, title}'

# Test create (requires authentication)
# Login first and get session cookie
COOKIE=$(curl -c - -X POST https://$DOMAIN_NAME/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}' | grep SESSION)

# Create test project (if authenticated)
# curl -b "$COOKIE" -X POST https://$DOMAIN_NAME/api/projects \
#   -H "Content-Type: application/json" \
#   -d @test-project.json
```

### Step 2: Performance Testing

#### 2.1 Install Testing Tools

```bash
# Apache Bench (comes with Apache)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Or install wrk (more advanced)
# macOS: brew install wrk
# Ubuntu: sudo apt-get install wrk

# Or use Artillery
npm install -g artillery
```

#### 2.2 Load Testing with Apache Bench

```bash
source aws-resources.env

# Basic load test
echo "Running basic load test..."
ab -n 1000 -c 10 https://$DOMAIN_NAME/health

# API endpoint test
echo "Testing API endpoint..."
ab -n 500 -c 5 https://$DOMAIN_NAME/api/projects

# Analyze results:
# - Requests per second (target: > 100)
# - Time per request (target: < 500ms for p95)
# - Failed requests (target: 0)
```

#### 2.3 Load Testing with Artillery

Create test scenario:

**File:** `tests/artillery-test.yml`

```yaml
config:
  target: "https://portfolio.yourdomain.com"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  defaults:
    headers:
      User-Agent: "Artillery Load Test"

scenarios:
  - name: "Browse portfolio"
    flow:
      - get:
          url: "/health"
      - think: 2
      - get:
          url: "/api/projects"
      - think: 3
      - get:
          url: "/api/work-experiences"
      - think: 2
      - get:
          url: "/"
```

Run test:

```bash
artillery run tests/artillery-test.yml --output test-results.json

# Generate HTML report
artillery report test-results.json --output test-report.html
```

#### 2.4 Monitor During Load Test

```bash
# In separate terminal, watch ECS metrics
watch -n 5 'aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query "services[0].{Running:runningCount,CPU:deployments[0].rolloutState}" \
  --output table'

# Watch ALB metrics
watch -n 5 'aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=app/portfolio-alb/... \
  --start-time $(date -u -d "5 minutes ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --query "Datapoints[0].Sum"'
```

#### 2.5 Establish Performance Baselines

Document baseline metrics:

**File:** `docs/PERFORMANCE_BASELINES.md`

```markdown
# Performance Baselines

Date: $(date)
Environment: Production

## Response Times (95th percentile)

| Endpoint | Baseline | Threshold |
|----------|----------|-----------|
| /health | 50ms | 100ms |
| /api/projects | 150ms | 500ms |
| /api/work-experiences | 120ms | 400ms |
| / (Frontend) | 200ms | 1000ms |

## Throughput

- Requests per second: 150 RPS
- Concurrent users: 50

## Resource Utilization

- ECS CPU: 30% average, 60% peak
- ECS Memory: 40% average, 70% peak
- RDS CPU: 20% average, 50% peak
- RDS Connections: 5 average, 20 peak

## Load Test Results

- Test duration: 5 minutes
- Total requests: 45,000
- Failed requests: 0
- Average response time: 180ms
- 95th percentile: 320ms
- 99th percentile: 450ms

## Recommendations

- Scale up at 70% CPU utilization
- Alert on > 500ms p95 latency
- Monitor RDS connections > 50
```

### Step 3: Security Testing

#### 3.1 SSL/TLS Verification

```bash
source aws-resources.env

# Test SSL certificate
echo | openssl s_client -servername $DOMAIN_NAME -connect $DOMAIN_NAME:443 2>/dev/null | openssl x509 -noout -text

# Check SSL grade with SSL Labs (wait for scan)
curl "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN_NAME"

# Test TLS versions
echo "Testing TLS 1.2..."
openssl s_client -connect $DOMAIN_NAME:443 -tls1_2 < /dev/null

echo "Testing TLS 1.3..."
openssl s_client -connect $DOMAIN_NAME:443 -tls1_3 < /dev/null

# Verify certificate chain
openssl s_client -connect $DOMAIN_NAME:443 -showcerts < /dev/null
```

#### 3.2 Security Headers Check

```bash
# Check security headers
curl -I https://$DOMAIN_NAME

# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - X-XSS-Protection

# Detailed check with external tool
curl -s https://securityheaders.com/?q=$DOMAIN_NAME
```

#### 3.3 CORS Testing

```bash
# Test CORS headers
curl -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://$DOMAIN_NAME/api/projects \
  -v 2>&1 | grep -i "access-control"

# Should reject unauthorized origins
```

#### 3.4 Basic Security Scan

```bash
# Using OWASP ZAP (if installed)
# docker run -t owasp/zap2docker-stable zap-baseline.py -t https://$DOMAIN_NAME

# Or use online scanner
echo "Run manual security scan at:"
echo "https://observatory.mozilla.org/analyze/$DOMAIN_NAME"
echo "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN_NAME"
```

### Step 4: Monitoring Setup

#### 4.1 Create Custom Metrics

**File:** `scripts/publish-metrics.sh`

```bash
#!/bin/bash

# Publish custom application metrics to CloudWatch

source aws-resources.env

# Get application metrics from /health endpoint
HEALTH_DATA=$(curl -s https://$DOMAIN_NAME/health)
UPTIME=$(echo $HEALTH_DATA | jq -r '.uptime')

# Publish to CloudWatch
aws cloudwatch put-metric-data \
  --namespace Portfolio/Application \
  --metric-name Uptime \
  --value $UPTIME \
  --unit Seconds

# Get database connection count (if exposed)
# DB_CONNECTIONS=$(curl -s https://$DOMAIN_NAME/health/detailed | jq '.database.connections')

# aws cloudwatch put-metric-data \
#   --namespace Portfolio/Database \
#   --metric-name Connections \
#   --value $DB_CONNECTIONS \
#   --unit Count

echo "✅ Metrics published"
```

Set up cron job to run every 5 minutes:

```bash
# Add to crontab
*/5 * * * * /path/to/scripts/publish-metrics.sh
```

#### 4.2 Create Comprehensive Dashboard

Update CloudWatch dashboard with more widgets:

```bash
# See Phase 6 for dashboard creation
# Add additional widgets for:
# - Custom application metrics
# - S3 metrics
# - Cost metrics
# - User activity
```

#### 4.3 Set Up Log Insights Queries

```bash
# Query: Request distribution by endpoint
aws logs start-query \
  --log-group-name /ecs/portfolio-app \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message
    | filter @message like /GET|POST|PUT|DELETE/
    | parse @message /(?<method>\w+) (?<path>\/\S+)/
    | stats count() by path
    | sort count desc'

# Query: Error patterns
aws logs start-query \
  --log-group-name /ecs/portfolio-app \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message
    | filter @message like /ERROR/
    | stats count() by bin(5m)'
```

#### 4.4 Test Alerting

```bash
# Trigger test alarm
aws cloudwatch set-alarm-state \
  --alarm-name portfolio-high-cpu \
  --state-value ALARM \
  --state-reason "Testing alerting system"

# Check email notification arrives
# Reset alarm
aws cloudwatch set-alarm-state \
  --alarm-name portfolio-high-cpu \
  --state-value OK \
  --state-reason "Test complete"
```

### Step 5: Disaster Recovery Testing

#### 5.1 Test Database Backup

```bash
source aws-resources.env

# Create manual snapshot
SNAPSHOT_ID="portfolio-db-test-$(date +%Y%m%d-%H%M%S)"

aws rds create-db-snapshot \
  --db-instance-identifier portfolio-db \
  --db-snapshot-identifier $SNAPSHOT_ID

# Wait for snapshot
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier $SNAPSHOT_ID

echo "✅ Snapshot created: $SNAPSHOT_ID"

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier portfolio-db \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table
```

#### 5.2 Test Service Rollback

```bash
# Get current task definition
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current task definition: $CURRENT_TASK_DEF"

# Trigger update (for testing)
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment

# Wait and then rollback
sleep 30

./scripts/rollback.sh

echo "✅ Rollback test completed"
```

#### 5.3 Measure Recovery Times

Document actual recovery times:

**File:** `docs/RTO_RPO.md`

```markdown
# Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

## Measured Recovery Times

| Scenario | RTO Target | RTO Actual | RPO Target | RPO Actual |
|----------|-----------|-----------|-----------|-----------|
| ECS Service Failure | 5 min | 3 min | 0 | 0 |
| Database Failure | 30 min | 15 min | 5 min | 1 min |
| Complete Region Failure | 4 hours | N/A | 1 hour | N/A |

## Test Results

### ECS Service Rollback ($(date))
- Detection time: 1 minute
- Decision time: 1 minute
- Execution time: 1 minute
- Validation time: 30 seconds
- Total: 3.5 minutes ✅

### Database Point-in-Time Recovery ($(date))
- Snapshot selection: 2 minutes
- Restore initiation: 1 minute
- Restore completion: 10 minutes
- Connection update: 1 minute
- Verification: 1 minute
- Total: 15 minutes ✅
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Testing**
   - ✅ Functional tests passed
   - ✅ Performance baselines established
   - ✅ Security scans completed
   - ✅ Load testing performed

2. **Monitoring**
   - ✅ Custom metrics configured
   - ✅ Dashboards created
   - ✅ Alerts tested
   - ✅ Log queries saved

3. **Documentation**
   - ✅ Performance baselines documented
   - ✅ RTO/RPO measured
   - ✅ Test results recorded

4. **Disaster Recovery**
   - ✅ Backup procedures tested
   - ✅ Rollback procedures verified
   - ✅ Recovery times measured

### ✅ Validation Checklist

```bash
# 1. Run functional tests
./tests/functional-tests.sh
# Expected: All tests pass

# 2. Check performance
ab -n 100 -c 10 https://$DOMAIN_NAME/health
# Expected: 0 failed requests, <100ms avg response

# 3. Verify SSL grade
curl -s "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN_NAME" | jq '.endpoints[0].grade'
# Expected: "A" or "A+"

# 4. Check monitoring
aws cloudwatch describe-alarms --state-value OK
# Expected: All alarms in OK state

# 5. Verify backups
aws rds describe-db-snapshots --db-instance-identifier portfolio-db | jq '.DBSnapshots | length'
# Expected: > 0
```

### 📊 Test Summary

Create final test report:

```bash
cat > TEST_SUMMARY.md << EOF
# Test Summary

Date: $(date)
Environment: Production

## Functional Tests
- Total endpoints tested: 10
- Passed: 10
- Failed: 0
- Success rate: 100%

## Performance Tests
- Load test duration: 5 minutes
- Peak RPS: 150
- Average latency: 180ms
- P95 latency: 320ms
- P99 latency: 450ms
- Error rate: 0%

## Security Tests
- SSL Grade: A
- Security headers: Present
- CORS: Properly configured
- Vulnerabilities found: 0

## Availability
- Current uptime: 99.99%
- Target: 99.9%
- Status: ✅ Meeting SLA
EOF
```

---

## Next Steps

Testing and monitoring complete! Proceed to:
**[Phase 8: Post-Deployment & Optimization →](./09-post-deployment.md)**

---

## Troubleshooting

### Load Tests Failing

**Problem**: High error rate during load tests
```bash
# Check ECS task count
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN

# Review logs for errors
./scripts/logs.sh "ERROR"
```

### Monitoring Gaps

**Problem**: Missing metrics
```bash
# Verify CloudWatch agent running
aws ecs describe-tasks --cluster portfolio-cluster --tasks $(aws ecs list-tasks --cluster portfolio-cluster --service-name portfolio-service --query 'taskArns[0]' --output text)

# Check metric namespaces
aws cloudwatch list-metrics --namespace Portfolio/Application
```
