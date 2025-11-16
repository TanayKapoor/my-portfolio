#!/bin/bash

# AWS Budget Creation Script
# Reads configuration from .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env
if [ -f ../.env ]; then
    echo -e "${GREEN}Loading environment variables from .env...${NC}"
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file in the project root with the required variables."
    exit 1
fi

# Check required variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: AWS_ACCOUNT_ID not set in .env${NC}"
    exit 1
fi

if [ -z "$AWS_NOTIFICATION_EMAIL" ]; then
    echo -e "${RED}Error: AWS_NOTIFICATION_EMAIL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}Configuration:${NC}"
echo "  AWS Account ID: $AWS_ACCOUNT_ID"
echo "  Notification Email: $AWS_NOTIFICATION_EMAIL"
echo "  Region: ${AWS_REGION:-us-east-1}"
echo ""

# Update notifications.json with email from .env
echo -e "${YELLOW}Updating notifications.json with email from .env...${NC}"
sed "s/your-email@example.com/$AWS_NOTIFICATION_EMAIL/g" notifications.json > notifications.tmp.json

# Create budget
echo -e "${YELLOW}Creating AWS budget...${NC}"
aws budgets create-budget \
    --account-id "$AWS_ACCOUNT_ID" \
    --budget file://budget.json \
    --notifications-with-subscribers file://notifications.tmp.json

# Clean up temp file
rm notifications.tmp.json

echo -e "${GREEN}✓ Budget created successfully!${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "  1. Check your email ($AWS_NOTIFICATION_EMAIL) for confirmation from AWS SNS"
echo "  2. Click the confirmation link to activate notifications"
echo ""
echo "To verify budget creation, run:"
echo "  aws budgets describe-budget --account-id $AWS_ACCOUNT_ID --budget-name PortfolioMonthlyBudget"
