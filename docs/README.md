# AWS Deployment Documentation

Complete guide for deploying this portfolio application to AWS using a Dockerized, production-ready architecture.

## 📚 Documentation Structure

This documentation is organized into 9 phases, taking you from planning to production deployment:

| Phase | Document | Duration | Description |
|-------|----------|----------|-------------|
| 0 | [Deployment Overview](./00-deployment-overview.md) | - | Architecture overview, costs, timeline |
| 1 | [Pre-Deployment Planning](./01-pre-deployment-planning.md) | 1-2h | AWS account setup, tool installation, planning |
| 2 | [Code Preparation](./02-code-preparation.md) | 2-4h | Remove Replit deps, implement S3, add security |
| 3 | [Docker Setup](./03-docker-setup.md) | 2-3h | Create Dockerfile, Docker Compose, local testing |
| 4 | [AWS Infrastructure](./04-aws-infrastructure.md) | 3-5h | VPC, ECS, RDS, S3, ALB setup |
| 5 | [Database Migration](./05-database-migration.md) | 1-2h | Migrate data from Neon to RDS |
| 6 | [Container Deployment](./06-container-deployment.md) | 2-3h | Push to ECR, deploy to ECS |
| 7 | [Production Configuration](./07-production-configuration.md) | 2-3h | SSL, domain, monitoring, security |
| 8 | [Testing & Monitoring](./08-testing-monitoring.md) | 2-4h | Load testing, security tests, monitoring |
| 9 | [Post-Deployment](./09-post-deployment.md) | 2-3h | Cost optimization, operations, documentation |

**Total Estimated Time:** 17-29 hours (2-4 days)

## 🚀 Quick Start

### Prerequisites

- AWS Account with billing enabled
- Docker Desktop installed
- AWS CLI v2 installed
- Node.js 20.x installed
- Domain name (optional but recommended)

### Recommended Path

1. **Start with the Overview**
   ```bash
   open docs/00-deployment-overview.md
   ```
   Understand the architecture, costs, and timeline.

2. **Follow Phases in Order**
   Each phase builds on the previous one. Complete all tasks in a phase before moving to the next.

3. **Use the Checklists**
   Each phase has:
   - **Goal**: What you'll accomplish
   - **Todo List**: Step-by-step tasks
   - **Outcome**: Validation checklist
   - **Troubleshooting**: Common issues and fixes

4. **Track Your Progress**
   Use the validation checklists at the end of each phase to ensure everything is working before proceeding.

## 📖 How to Use This Guide

### For First-Time Deployment

Follow phases 1-9 in order:

```bash
# Phase 1: Planning
docs/01-pre-deployment-planning.md

# Phase 2: Code
docs/02-code-preparation.md

# ... continue through Phase 9
```

### For Updates and Maintenance

Jump to relevant sections:

- **Deploy New Version**: Phase 6 → Container Deployment
- **Update Domain/SSL**: Phase 7 → Production Configuration
- **Performance Issues**: Phase 8 → Testing & Monitoring
- **Cost Concerns**: Phase 9 → Post-Deployment

### For Troubleshooting

Each phase includes a troubleshooting section. Also see:
- `INCIDENT_RESPONSE.md` - Incident handling
- `DISASTER_RECOVERY.md` - Recovery procedures
- `DEPLOYMENT_RUNBOOK.md` - Standard deployment process

## 🏗️ Architecture Overview

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
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS ECS Cluster (Fargate)                    │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │   Container 1  │  │   Container 2  │  (Auto-scaling)         │
│  │  Node.js App   │  │  Node.js App   │                         │
│  └────────────────┘  └────────────────┘                         │
└─────────┬──────────────────────┬───────────────────────────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐      ┌──────────────────┐
│   AWS RDS        │      │     AWS S3       │
│   PostgreSQL     │      │   File Storage   │
└──────────────────┘      └──────────────────┘
```

### Technology Stack

**Current:**
- Frontend: React 18 + Vite
- Backend: Express.js + Node.js
- Database: Neon PostgreSQL
- Storage: Replit Object Storage

**AWS Target:**
- Compute: ECS Fargate
- Database: RDS PostgreSQL
- Storage: S3
- CDN: CloudFront (optional)
- Monitoring: CloudWatch
- Secrets: Secrets Manager

## 💰 Cost Estimation

### Monthly Costs

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| ECS Fargate | 0.25 vCPU, 0.5 GB, 2 tasks | $15-20 |
| ALB | Application Load Balancer | $16-20 |
| RDS | db.t3.micro | $15-20 |
| S3 | 10 GB + requests | $1-3 |
| ECR | Container storage | $1-2 |
| CloudWatch | Logs + Metrics | $5-10 |
| Route 53 | DNS | $1-2 |
| **Total** | | **$60-95/month** |

### Cost Optimization

See [Phase 9 - Post-Deployment](./09-post-deployment.md) for:
- Right-sizing resources
- Using Spot instances
- S3 lifecycle policies
- Savings plans

## 🔒 Security Features

- ✅ HTTPS/TLS encryption
- ✅ AWS WAF (Web Application Firewall)
- ✅ Security groups (network isolation)
- ✅ Secrets Manager (credential management)
- ✅ IAM roles (least privilege access)
- ✅ Encrypted storage (S3, RDS)
- ✅ GuardDuty (threat detection)
- ✅ Access logging

## 📊 Monitoring & Alerting

- **CloudWatch Dashboards**: Real-time metrics
- **CloudWatch Alarms**: CPU, memory, error rates
- **SNS Notifications**: Email/SMS alerts
- **Log Insights**: Query and analyze logs
- **Health Checks**: Automated endpoint monitoring

## 🔄 CI/CD (Optional)

GitHub Actions workflow included for automated deployments:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Build Docker image
    - Push to ECR
    - Update ECS service
```

## 📝 Key Files

### Configuration
```
.env.example          # Environment variables template
aws-config.env        # AWS configuration
aws-resources.env     # Created during setup - resource IDs
```

### Docker
```
Dockerfile            # Multi-stage production build
docker-compose.yml    # Local development
.dockerignore         # Build optimization
```

### Scripts
```
scripts/
  deploy.sh          # Deploy to production
  rollback.sh        # Rollback deployment
  logs.sh            # View CloudWatch logs
  docker-build.sh    # Build Docker image
```

### Documentation
```
docs/
  00-deployment-overview.md
  01-pre-deployment-planning.md
  02-code-preparation.md
  03-docker-setup.md
  04-aws-infrastructure.md
  05-database-migration.md
  06-container-deployment.md
  07-production-configuration.md
  08-testing-monitoring.md
  09-post-deployment.md
  ARCHITECTURE.md      # System architecture
  API.md               # API documentation
  DEPLOYMENT_RUNBOOK.md
  INCIDENT_RESPONSE.md
  DISASTER_RECOVERY.md
```

## 🎯 Success Criteria

### Technical
- ✅ Application accessible via HTTPS
- ✅ Zero downtime deployments
- ✅ Response time < 500ms (p95)
- ✅ 99.9% uptime
- ✅ Automated backups
- ✅ Security best practices

### Business
- ✅ Monthly cost < $100
- ✅ Deployment time < 10 minutes
- ✅ Rollback time < 5 minutes
- ✅ Complete documentation

## 🆘 Getting Help

### Documentation
1. Check the relevant phase documentation
2. Look in the Troubleshooting section
3. Review INCIDENT_RESPONSE.md

### Common Issues

**Build Fails:**
- Check Docker installation
- Verify Node version (20.x)
- Review build logs

**Deployment Fails:**
- Check AWS credentials
- Verify security groups
- Review ECS events

**High Costs:**
- Review Phase 9 cost optimization
- Check CloudWatch dashboard
- Analyze Cost Explorer

### AWS Support
- [AWS Documentation](https://docs.aws.amazon.com/)
- [ECS Troubleshooting](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/troubleshooting.html)
- [AWS Support Center](https://console.aws.amazon.com/support/)

## 🔗 Useful Links

### AWS Services
- [ECS Console](https://console.aws.amazon.com/ecs/)
- [RDS Console](https://console.aws.amazon.com/rds/)
- [S3 Console](https://console.aws.amazon.com/s3/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- [Cost Explorer](https://console.aws.amazon.com/cost-management/home)

### Documentation
- [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tools
- [AWS Cost Calculator](https://calculator.aws/)
- [SSL Test](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)

## 📅 Maintenance Schedule

### Daily
- Check application health
- Review error logs
- Monitor costs

### Weekly
- Performance review
- Security alerts
- Update dependencies

### Monthly
- Cost optimization
- Backup testing
- Security patching
- Documentation updates

### Quarterly
- Architecture review
- Disaster recovery drill
- Capacity planning
- Roadmap review

## 🎓 Learning Path

### Beginner
Start here if new to AWS:
1. Complete Phase 1-3 locally
2. Set up AWS account (Phase 1)
3. Follow each phase carefully
4. Use validation checklists

### Intermediate
Familiar with AWS basics:
1. Review architecture overview
2. Jump to Phase 4 (Infrastructure)
3. Customize for your needs
4. Implement optional features

### Advanced
Experienced with AWS:
1. Review architecture
2. Use as reference guide
3. Implement automation (CI/CD)
4. Add advanced features (CloudFront, ElastiCache)

## 🤝 Contributing

Found an issue or have an improvement?

1. Document the issue
2. Propose a solution
3. Test thoroughly
4. Update relevant documentation

## 📄 License

MIT License - See main repository for details

---

## Ready to Deploy?

**Start here:** [Phase 0: Deployment Overview →](./00-deployment-overview.md)

Good luck with your deployment! 🚀

---

**Questions?** Create an issue in the repository or refer to the troubleshooting sections in each phase.
