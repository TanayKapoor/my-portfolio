# AWS Configuration Files

This directory contains AWS-specific configuration files for budget management and deployment.

## Files

### budget.json
AWS Budget configuration with $100/month spending limit.

**Features:**
- Monthly budget of $100 USD
- Includes all cost types (tax, subscriptions, support, etc.)
- Valid until 2087 (effectively permanent)

**To create this budget in AWS:**
```bash
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://aws/budget.json \
  --notifications-with-subscribers file://aws/notifications.json
```

### notifications.json
Budget notification configuration with multiple alert thresholds.

**Alert Thresholds:**
- **80% actual spend** - Warning alert when you've spent $80
- **100% actual spend** - Critical alert when you've reached $100
- **100% forecasted spend** - Predictive alert if AWS forecasts you'll exceed budget

**Before using:**
1. Replace `your-email@example.com` with your actual email address
2. You'll receive a confirmation email from AWS SNS - click to confirm

## Setup Instructions

### Prerequisites
- AWS CLI installed and configured
- `.env` file configured in project root

### Step 1: Configure Environment Variables

Create or update `.env` in the project root:

```bash
# AWS Configuration
AWS_ACCOUNT_ID=your-aws-account-id
AWS_REGION=us-east-1
AWS_NOTIFICATION_EMAIL=your-email@example.com
```

To get your AWS Account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

### Step 2: Run the Creation Script

```bash
cd aws
./create-budget.sh
```

The script will:
- Load configuration from `.env`
- Update notification email automatically
- Create the budget with all alert thresholds

### Step 3: Confirm Email Subscription
Check your email and click the confirmation link from AWS SNS.

### Manual Creation (Alternative)

If you prefer to create the budget manually:

```bash
# Export variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Create budget
aws budgets create-budget \
  --account-id "$AWS_ACCOUNT_ID" \
  --budget file://aws/budget.json \
  --notifications-with-subscribers file://aws/notifications.json
```

## Verifying Budget Creation

### List All Budgets
```bash
aws budgets describe-budgets --account-id YOUR_ACCOUNT_ID
```

### Get Specific Budget Details
```bash
aws budgets describe-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget-name PortfolioMonthlyBudget
```

### Check Budget Notifications
```bash
aws budgets describe-notifications-for-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget-name PortfolioMonthlyBudget
```

## Updating Budget

### Update Budget Limit
Edit `budget.json` and change the `Amount` value, then:
```bash
aws budgets update-budget \
  --account-id YOUR_ACCOUNT_ID \
  --new-budget file://aws/budget.json
```

### Add More Notification Thresholds
Edit `notifications.json` to add more alerts (e.g., 50%, 90%), then:
```bash
aws budgets create-notification \
  --account-id YOUR_ACCOUNT_ID \
  --budget-name PortfolioMonthlyBudget \
  --notification file://path-to-new-notification.json \
  --subscribers SubscriptionType=EMAIL,Address=your-email@example.com
```

## Deleting Budget

```bash
aws budgets delete-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget-name PortfolioMonthlyBudget
```

## Cost Monitoring Tips

### View Current Spend
```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### View Spend by Service
```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Enable Cost Explorer
Visit: https://console.aws.amazon.com/cost-management/home#/cost-explorer

## Notification Examples

### 80% Threshold Alert Email
```
Subject: AWS Budgets: PortfolioMonthlyBudget has exceeded your alert threshold

Your AWS Account XXXX has exceeded 80% of your PortfolioMonthlyBudget
budget for the month.

Current spend: $80.00
Budget limit: $100.00
```

### 100% Threshold Alert Email
```
Subject: AWS Budgets: PortfolioMonthlyBudget has exceeded your budget

Your AWS Account XXXX has exceeded 100% of your PortfolioMonthlyBudget
budget for the month.

Current spend: $100.00
Budget limit: $100.00
```

## Troubleshooting

### "Invalid email address" error
Make sure the email address in `notifications.json` is valid and properly formatted.

### "Budget name already exists" error
Either delete the existing budget first or use a different budget name.

### Not receiving email notifications
1. Check spam folder
2. Verify email subscription is confirmed in AWS SNS
3. Check notification configuration:
```bash
aws budgets describe-notifications-for-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget-name PortfolioMonthlyBudget
```

## Best Practices

1. **Set multiple thresholds** - Get early warnings (50%, 80%, 100%)
2. **Use forecasted alerts** - Get notified before you exceed budget
3. **Review monthly** - Check Cost Explorer regularly
4. **Tag resources** - Use tags to track costs by project/environment
5. **Set up billing alerts** - Enable in AWS Billing console as backup

## Additional Resources

- [AWS Budgets Documentation](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)
- [AWS Pricing Calculator](https://calculator.aws/)
