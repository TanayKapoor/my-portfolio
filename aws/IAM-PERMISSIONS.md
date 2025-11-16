# IAM Permissions Guide

This document explains the IAM permissions required to deploy and manage the portfolio application on AWS.

## Quick Setup

Run the automated setup script:

```bash
cd aws
./setup-iam-permissions.sh
```

This script will:
- Check your current AWS user
- Show which policies will be attached
- Ask for confirmation before making changes
- Attach all required policies
- Show you the result

## Required IAM Policies

### Core Services

| Policy | Purpose | Why Needed |
|--------|---------|------------|
| **AmazonECS_FullAccess** | ECS container orchestration | Deploy and manage Docker containers |
| **AmazonEC2ContainerRegistryFullAccess** | ECR Docker registry | Push/pull Docker images |
| **AmazonRDSFullAccess** | RDS database management | Create and manage PostgreSQL database |
| **AmazonVPCFullAccess** | VPC networking | Create and configure network infrastructure |

### Storage & Monitoring

| Policy | Purpose | Why Needed |
|--------|---------|------------|
| **AmazonS3FullAccess** | S3 object storage | Store uploaded files (icons, images, screenshots) |
| **CloudWatchLogsFullAccess** | CloudWatch logging | View application logs and metrics |

### Security & Secrets

| Policy | Purpose | Why Needed |
|--------|---------|------------|
| **SecretsManagerReadWrite** | AWS Secrets Manager | Store and retrieve database credentials, session secrets |
| **IAMReadOnlyAccess** | IAM read permissions | View roles and policies (helpful for troubleshooting) |

## Manual Policy Attachment

If you prefer to attach policies manually or need to do it through the AWS Console:

### AWS Console Method

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** in the left sidebar
3. Find and click your username (`tanay@aurvix.xyz`)
4. Click **Add permissions** → **Attach policies directly**
5. Search for and select each policy listed above
6. Click **Add permissions**

### AWS CLI Method

```bash
# Get your username
USERNAME=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)

# Attach each policy
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/IAMReadOnlyAccess
aws iam attach-user-policy --user-name $USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess
```

## Verifying Permissions

### List Attached Policies

```bash
USERNAME=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
aws iam list-attached-user-policies --user-name $USERNAME
```

### Test Specific Service Access

**Test ECS Access:**
```bash
aws ecs list-clusters
```

**Test ECR Access:**
```bash
aws ecr describe-repositories
```

**Test RDS Access:**
```bash
aws rds describe-db-instances
```

**Test S3 Access:**
```bash
aws s3 ls
```

**Test Secrets Manager Access:**
```bash
aws secretsmanager list-secrets
```

## Security Best Practices

### ✅ Recommended

1. **Use IAM User, Not Root**
   - Create a dedicated IAM user for deployments
   - Never use root account for day-to-day operations

2. **Enable MFA**
   ```bash
   # Check MFA status
   aws iam list-mfa-devices --user-name $USERNAME
   ```

3. **Use Least Privilege**
   - Start with read-only access
   - Add write permissions only when needed
   - Remove unused policies

4. **Rotate Access Keys Regularly**
   ```bash
   # Create new access key
   aws iam create-access-key --user-name $USERNAME

   # Delete old access key
   aws iam delete-access-key --user-name $USERNAME --access-key-id OLD_KEY_ID
   ```

5. **Enable CloudTrail**
   - Track all API calls for security auditing

### ⚠️ Caution

- **FullAccess policies** are convenient but grant broad permissions
- Consider using custom policies with minimal permissions in production
- Regularly review and audit permissions

## Custom Policy (Production Alternative)

For production, consider creating a custom policy with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:*",
        "ecr:*",
        "rds:Describe*",
        "rds:CreateDBInstance",
        "rds:ModifyDBInstance",
        "s3:*",
        "secretsmanager:*",
        "logs:*",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups"
      ],
      "Resource": "*"
    }
  ]
}
```

Save this as `custom-policy.json` and attach:

```bash
aws iam put-user-policy \
  --user-name $USERNAME \
  --policy-name PortfolioDeploymentPolicy \
  --policy-document file://custom-policy.json
```

## Troubleshooting

### Permission Denied Errors

**Problem:** Getting "AccessDenied" or "UnauthorizedOperation" errors

**Solutions:**
1. Wait 5-10 seconds for IAM changes to propagate
2. Verify policies are attached: `aws iam list-attached-user-policies --user-name $USERNAME`
3. Check if you're using the correct AWS profile: `aws configure list`
4. Ensure your access keys are active: `aws iam list-access-keys --user-name $USERNAME`

### Can't Attach Policies

**Problem:** Don't have permission to attach policies to yourself

**Solution:** You need an administrator to grant you these permissions. Share this policy list with them:
- AmazonECS_FullAccess
- AmazonEC2ContainerRegistryFullAccess
- AmazonRDSFullAccess
- AmazonS3FullAccess
- SecretsManagerReadWrite
- CloudWatchLogsFullAccess
- AmazonVPCFullAccess

### Using Multiple AWS Profiles

If you have multiple AWS profiles configured:

```bash
# List profiles
cat ~/.aws/config

# Use specific profile
export AWS_PROFILE=my-profile

# Or specify in each command
aws iam list-attached-user-policies --user-name $USERNAME --profile my-profile
```

## Cost Implications

Most of these policies don't have direct costs, but they enable you to create resources that do cost money:

| Service | Typical Monthly Cost |
|---------|---------------------|
| ECS Fargate | $10-30 |
| RDS (db.t3.micro) | $15-20 |
| S3 Storage | $0.50-2 |
| CloudWatch Logs | $0.50-2 |
| Data Transfer | $1-5 |
| **Total Estimate** | **$30-60/month** |

See `budget.json` for the $100/month limit we've set.

## Next Steps

After setting up IAM permissions:

1. ✅ Verify all policies are attached
2. ✅ Test access to each service
3. ✅ Enable MFA for security
4. ✅ Set up billing alerts (already done with `budget.json`)
5. ✅ Proceed with infrastructure setup

## Additional Resources

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Policy Generator](https://awspolicygen.s3.amazonaws.com/policygen.html)
- [IAM Policy Simulator](https://policysim.aws.amazon.com/)
