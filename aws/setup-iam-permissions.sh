#!/usr/bin/env bash

# AWS IAM Permissions Setup Script
# Attaches required policies for ECS, ECR, RDS, S3, Secrets Manager, and CloudWatch

set -e

# Require bash 4+ for associative arrays, or fall back to simple approach
if [[ "${BASH_VERSINFO[0]}" -lt 4 ]]; then
    echo "Note: Using Bash ${BASH_VERSION}. Using simplified policy list."
    USE_SIMPLE=true
else
    USE_SIMPLE=false
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}AWS IAM Permissions Setup${NC}"
echo "=========================================="
echo ""

# Get current user information
echo -e "${YELLOW}Checking current AWS user...${NC}"
CURRENT_USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
CURRENT_USER_NAME=$(echo "$CURRENT_USER_ARN" | cut -d'/' -f2)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${GREEN}Current User:${NC} $CURRENT_USER_NAME"
echo -e "${GREEN}Account ID:${NC} $ACCOUNT_ID"
echo -e "${GREEN}ARN:${NC} $CURRENT_USER_ARN"
echo ""

# Check if user is root (not recommended)
if [[ "$CURRENT_USER_ARN" == *":root" ]]; then
    echo -e "${RED}WARNING: You are using the root account!${NC}"
    echo -e "${YELLOW}It's recommended to create an IAM user instead.${NC}"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [[ "$CONTINUE" != "yes" ]]; then
        echo "Exiting..."
        exit 0
    fi
fi

# Define required policies (simple array format for compatibility)
POLICY_NAMES=(
    "AmazonECS_FullAccess"
    "AmazonEC2ContainerRegistryFullAccess"
    "AmazonRDSFullAccess"
    "AmazonS3FullAccess"
    "SecretsManagerReadWrite"
    "CloudWatchLogsFullAccess"
    "IAMReadOnlyAccess"
    "AmazonVPCFullAccess"
)

echo -e "${YELLOW}The following policies will be attached:${NC}"
for policy_name in "${POLICY_NAMES[@]}"; do
    echo "  - $policy_name"
done
echo ""

read -p "Do you want to proceed? (yes/no): " PROCEED
if [[ "$PROCEED" != "yes" ]]; then
    echo "Exiting..."
    exit 0
fi

echo ""
echo -e "${YELLOW}Attaching policies...${NC}"

# Function to attach policy
attach_policy() {
    local policy_name=$1
    local policy_arn="arn:aws:iam::aws:policy/$policy_name"

    echo -n "  Attaching $policy_name... "

    # Check if policy is already attached
    if aws iam list-attached-user-policies --user-name "$CURRENT_USER_NAME" \
        --query "AttachedPolicies[?PolicyArn=='$policy_arn'].PolicyName" \
        --output text | grep -q "$policy_name"; then
        echo -e "${BLUE}(already attached)${NC}"
        return 0
    fi

    # Try to attach policy
    if aws iam attach-user-policy \
        --user-name "$CURRENT_USER_NAME" \
        --policy-arn "$policy_arn" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        echo -e "    ${YELLOW}You may need administrator privileges to attach this policy${NC}"
    fi
}

# Attach all policies
for policy_name in "${POLICY_NAMES[@]}"; do
    attach_policy "$policy_name"
done

echo ""
echo -e "${GREEN}✓ Policy attachment complete!${NC}"
echo ""

# Show currently attached policies
echo -e "${YELLOW}Currently attached policies:${NC}"
aws iam list-attached-user-policies --user-name "$CURRENT_USER_NAME" \
    --query 'AttachedPolicies[*].PolicyName' --output table

echo ""
echo -e "${BLUE}Note:${NC} Policy changes may take a few seconds to propagate."
echo -e "${BLUE}Note:${NC} If you got permission errors, ask your AWS administrator to attach these policies."
