# AWS Dockerized Deployment - Overview

## Table of Contents

1. [Phase 0: Pre-Deployment Planning](./01-pre-deployment-planning.md)
2. [Phase 1: Code Preparation](./02-code-preparation.md)
3. [Phase 2: Docker Setup](./03-docker-setup.md)
4. [Phase 3: AWS Infrastructure Setup](./04-aws-infrastructure.md)
5. [Phase 4: Database Migration](./05-database-migration.md)
6. [Phase 5: Container Registry & Deployment](./06-container-deployment.md)
7. [Phase 6: Production Configuration](./07-production-configuration.md)
8. [Phase 7: Testing & Monitoring](./08-testing-monitoring.md)
9. [Phase 8: Post-Deployment & Optimization](./09-post-deployment.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Route 53 (DNS)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          Application Load Balancer (ALB) + SSL/TLS              │
│                   (Certificate Manager)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS ECS Cluster                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ECS Service (Fargate)                       │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │   Task 1       │  │   Task 2       │  (Auto-scaling) │   │
│  │  │ ┌────────────┐ │  │ ┌────────────┐ │                 │   │
│  │  │ │ Container  │ │  │ │ Container  │ │                 │   │
│  │  │ │ (Node.js)  │ │  │ │ (Node.js)  │ │                 │   │
│  │  │ │ Port: 5000 │ │  │ │ Port: 5000 │ │                 │   │
│  │  │ └────────────┘ │  │ └────────────┘ │                 │   │
│  │  └────────────────┘  └────────────────┘                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   AWS RDS            │      │     AWS S3           │
│   PostgreSQL         │      │   File Storage       │
│   (Database)         │      │   (Images/Assets)    │
└──────────────────────┘      └──────────────────────┘
```

## Technology Stack

### Current Setup
- **Frontend**: React 18 + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon Serverless)
- **Storage**: Replit Object Storage
- **Session**: PostgreSQL with connect-pg-simple
- **Authentication**: Passport.js (local strategy)

### AWS Target Setup
- **Compute**: AWS ECS (Elastic Container Service) with Fargate
- **Container Registry**: AWS ECR (Elastic Container Registry)
- **Database**: AWS RDS PostgreSQL
- **Storage**: AWS S3
- **Load Balancer**: Application Load Balancer (ALB)
- **SSL/TLS**: AWS Certificate Manager
- **DNS**: AWS Route 53
- **Secrets**: AWS Secrets Manager
- **Logging**: AWS CloudWatch
- **Monitoring**: AWS CloudWatch + X-Ray

## Deployment Strategy

### Build Strategy
**Multi-stage Docker Build** - Optimized for production:
1. Build frontend assets (Vite)
2. Build backend (esbuild)
3. Create minimal runtime image

### Deployment Pattern
**Blue-Green Deployment** via ECS:
- Zero-downtime deployments
- Automatic rollback on failure
- Health check validation

### Scaling Strategy
**Auto-scaling based on**:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- Request count per target

## Cost Estimation

### Monthly Costs (Estimated)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| **ECS Fargate** | 0.25 vCPU, 0.5 GB RAM, 2 tasks | $15-20 |
| **ALB** | Application Load Balancer | $16-20 |
| **RDS PostgreSQL** | db.t3.micro (1 vCPU, 1GB RAM) | $15-20 |
| **S3** | 10 GB storage + requests | $1-3 |
| **ECR** | Container image storage | $1-2 |
| **CloudWatch** | Logs + Metrics | $5-10 |
| **Data Transfer** | Outbound data | $5-15 |
| **Route 53** | Hosted zone + queries | $1-2 |
| **Secrets Manager** | 5 secrets | $2-3 |
| **NAT Gateway** | (Optional) High availability | $30-40 |

**Total Estimate**: $60-95/month (without NAT Gateway)
**Total Estimate**: $90-135/month (with NAT Gateway for HA)

### Cost Optimization Tips
1. Use AWS Free Tier where applicable
2. Enable RDS auto-pause for development
3. Use S3 Intelligent-Tiering
4. Set up CloudWatch alarms for cost monitoring
5. Use Spot instances for non-critical workloads
6. Consider AWS Savings Plans for committed usage

## Prerequisites

### Local Development
- Docker Desktop installed (v20.10+)
- AWS CLI installed (v2.x)
- Node.js 20.x
- Git

### AWS Account
- AWS Account with billing enabled
- IAM user with appropriate permissions
- AWS CLI configured with credentials

### Domain (Optional but Recommended)
- Domain name (can use Route 53 or external)
- Access to DNS settings

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0: Planning | 1-2 hours | None |
| Phase 1: Code Prep | 2-4 hours | Phase 0 |
| Phase 2: Docker | 2-3 hours | Phase 1 |
| Phase 3: AWS Infra | 3-5 hours | Phase 2 |
| Phase 4: DB Migration | 1-2 hours | Phase 3 |
| Phase 5: Deployment | 2-3 hours | Phase 4 |
| Phase 6: Production Config | 2-3 hours | Phase 5 |
| Phase 7: Testing | 2-4 hours | Phase 6 |
| Phase 8: Optimization | 2-3 hours | Phase 7 |

**Total Estimated Time**: 17-29 hours (2-4 days)

## Risk Assessment

### High Risk
- **Database migration data loss**: Mitigated by thorough backup and testing
- **Downtime during migration**: Mitigated by blue-green deployment
- **Security misconfiguration**: Mitigated by security checklists

### Medium Risk
- **Cost overrun**: Mitigated by budget alerts and monitoring
- **Performance degradation**: Mitigated by load testing
- **SSL/TLS certificate issues**: Mitigated by ACM automation

### Low Risk
- **Container build failures**: Mitigated by local testing
- **Environment variable errors**: Mitigated by validation scripts

## Success Criteria

### Technical
- [ ] Application accessible via HTTPS
- [ ] Zero downtime during deployments
- [ ] Response time < 500ms for 95th percentile
- [ ] 99.9% uptime
- [ ] Automated backups configured
- [ ] All security best practices implemented

### Business
- [ ] Total monthly cost within budget
- [ ] Deployment time < 10 minutes
- [ ] Rollback time < 5 minutes
- [ ] Monitoring and alerting active
- [ ] Documentation complete

## Support & Resources

### AWS Documentation
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS PostgreSQL Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [S3 Developer Guide](https://docs.aws.amazon.com/s3/)

### Tools
- [AWS Cost Calculator](https://calculator.aws/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Ready to begin?** Start with [Phase 0: Pre-Deployment Planning](./01-pre-deployment-planning.md)
