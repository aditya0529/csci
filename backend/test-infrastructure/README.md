# Inspector Validation Test Infrastructure (L1, L2, L5, L6)

This directory contains CloudFormation templates and scripts to test the Inspector validation changes.

## What Changed (Original vs Modified)

### `_validate_rule()` Method

| Rule | Original Behavior | New Behavior |
|------|-------------------|--------------|
| **L1** | Blocked ALL wildcards in `resource_pattern` | ✅ ALLOW wildcards when ID is specific (CVE/CWE) |
| **L2** | Blocked ALL wildcards in `resource_pattern` | ✅ BLOCK wildcards only when ID is `*` |
| **L5** | Blocked wildcards in `resource_type` | Same - blocks wildcards in `resource_type` |

> **Note:** L3 (ID format validation) and L4 (partial wildcard blocking) are NOT implemented.

### `matches()` Method

| Original | New (L6) |
|----------|----------|
| `id_prefix = re.compile(r'^' + self.id.strip("*"))` | **REMOVED** |
| Partial matching: `CVE-*` matches `CVE-2025-12345` | **NO partial matching** |
| N/A | Only exact match OR `*` matches all |

---

## Deployment Steps

### 1. Deploy CloudFormation Stack

```bash
# Deploy the test infrastructure
aws cloudformation deploy \
  --template-file test-lambda-v2.template.yaml \
  --stack-name inspector-validation-test \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=test \
  --region us-east-1
```

### 2. Populate Test Data

```bash
# Install boto3 if needed
pip install boto3

# Populate DynamoDB with test rules
python populate-test-data.py \
  --table-name inspector-suppression-rules-test \
  --region us-east-1
```

### 3. Run Validation Tests

```bash
# Test all rules in DynamoDB
aws lambda invoke \
  --function-name inspector-validation-test-test \
  --payload '{"action": "validate_rules"}' \
  --cli-binary-format raw-in-base64-out \
  response.json && cat response.json | jq
```

---

## Test Cases

### Valid Rules (Should Pass)

| ID | Resource Pattern | Description |
|----|------------------|-------------|
| `CVE-2025-12345` | `arn:aws:ec2:*:*:instance/*` | L1: Wildcard pattern with specific ID |
| `CWE-409` | `*` | L1: Full wildcard with specific ID |
| `*` | `arn:aws:ec2:us-east-1:123:instance/i-abc` | L2: Exact ARN with wildcard ID |

### Invalid Rules (Should Fail)

| ID | Resource Pattern | Expected Error |
|----|------------------|----------------|
| `*` | `arn:aws:*` | L2: Wildcard pattern when ID is * |
| `CVE-*` | `arn:aws:ec2:*` | L4: Partial wildcard in ID |
| `CVE-25-12345` | `arn:aws:ec2:*` | L3: Invalid CVE format |
| `CVE-2025-11111` | (resource_type: `AWS::EC2::*`) | L5: Wildcard in resource_type |

---

## Lambda Test Events

### Validate All Rules
```json
{
  "action": "validate_rules"
}
```

### Validate Single Rule
```json
{
  "action": "validate_single",
  "rule": {
    "id": "CVE-2025-12345",
    "product_name": "Inspector",
    "resource_pattern": "arn:aws:ec2:*",
    "resource_type": ""
  }
}
```

### Test L6 Matching
```json
{
  "action": "test_matching",
  "rule_id": "*",
  "finding_id": "CVE-2025-12345"
}
```

---

## Expected Results

### Validation Output
```json
{
  "total": 15,
  "valid": 6,
  "invalid": 9,
  "rules": [
    {"id": "CVE-2025-12345", "valid": true, "error": null},
    {"id": "CVE-*", "valid": false, "error": "Partial wildcards not allowed in ID: CVE-*"}
  ]
}
```

### L6 Matching Output
```json
{
  "rule_id": "*",
  "finding_id": "CVE-2025-12345",
  "matches": true,
  "logic": "wildcard_all"
}
```

---

## Cleanup

```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack \
  --stack-name inspector-validation-test \
  --region us-east-1
```

---

## Files

| File | Description |
|------|-------------|
| `test-lambda-v2.template.yaml` | CloudFormation template with Lambda + DynamoDB |
| `populate-test-data.py` | Script to populate test data |
| `README.md` | This file |
