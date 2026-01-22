#!/usr/bin/env python3
"""
DynamoDB Test Data Population Script for Inspector Validation (L1-L6)

This script populates the DynamoDB test table with various test cases
to validate the L1-L6 Inspector validation rules.

Usage:
    python populate-test-data.py --table-name inspector-suppression-rules-test --region us-east-1

Or set environment variables:
    export TABLE_NAME=inspector-suppression-rules-test
    export AWS_REGION=us-east-1
    python populate-test-data.py
"""

import boto3
import os
import argparse
from datetime import datetime, timedelta

# ============================================================================
# TEST DATA - Rules that should PASS validation
# ============================================================================
VALID_RULES = [
    # L1: Specific CVE with wildcard in resource_pattern (ALLOWED)
    {
        "id": "CVE-2025-12345",
        "ser_id": "SER-001",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "arn:aws:ec2:*:*:instance/*",
        "resource_type": "",
        "finding_title": "Test CVE with wildcard pattern",
        "description": "L1: Wildcard in resource_pattern allowed when ID is specific"
    },
    # L1: Specific CWE with wildcard in resource_pattern (ALLOWED)
    {
        "id": "CWE-409",
        "ser_id": "SER-002",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "*",
        "resource_type": "",
        "finding_title": "Test CWE with full wildcard pattern",
        "description": "L1: Full wildcard in resource_pattern allowed when ID is specific"
    },
    # L2: Wildcard ID with exact ARN (ALLOWED)
    {
        "id": "*",
        "ser_id": "SER-003",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0",
        "resource_type": "",
        "finding_title": "Wildcard ID with exact ARN",
        "description": "L2: Exact ARN allowed when ID is *"
    },
    # Valid CVE with resource_type only
    {
        "id": "CVE-2024-1234",
        "ser_id": "SER-004",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "",
        "resource_type": "AWS::EC2::Instance",
        "finding_title": "CVE with resource_type",
        "description": "Valid rule with resource_type only"
    },
    # Valid CVE with both resource fields
    {
        "id": "CVE-2023-54321",
        "ser_id": "SER-005",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "arn:aws:lambda:*:*:function:my-function",
        "resource_type": "AWS::Lambda::Function",
        "finding_title": "CVE with both resource fields",
        "description": "Valid rule with both resource_pattern and resource_type"
    },
    # Security Hub rule (not affected by Inspector validation)
    {
        "id": "aws-foundational-security-best-practices/v/1.0.0/S3.1",
        "ser_id": "SER-006",
        "product_name": "Security Hub",
        "finding_type": "Industry and Regulatory Standards",
        "resource_pattern": "arn:aws:s3:::my-bucket",
        "resource_type": "",
        "finding_title": "Security Hub rule",
        "description": "Security Hub rules not affected by Inspector validation"
    },
]

# ============================================================================
# TEST DATA - Rules that should FAIL validation (L1, L2, L5 only - L3, L4 removed)
# ============================================================================
INVALID_RULES = [
    # L2: Wildcard ID with wildcard resource_pattern (BLOCKED)
    {
        "id": "*",
        "ser_id": "SER-INVALID-001",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "arn:aws:*",
        "resource_type": "",
        "finding_title": "INVALID: Wildcard ID with wildcard pattern",
        "description": "L2: SHOULD FAIL - wildcard in resource_pattern when ID is *",
        "expected_error": "ResourcePattern cannot have wildcards when ID is *"
    },
    # L5: Wildcard in resource_type (BLOCKED)
    {
        "id": "CVE-2025-11111",
        "ser_id": "SER-INVALID-002",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "",
        "resource_type": "AWS::EC2::*",
        "finding_title": "INVALID: Wildcard in resource_type",
        "description": "L5: SHOULD FAIL - wildcard in resource_type",
        "expected_error": "Wildcards not allowed in resource_type"
    },
    # Cross-field: No resource fields
    {
        "id": "CVE-2025-22222",
        "ser_id": "SER-INVALID-003",
        "product_name": "Inspector",
        "finding_type": "Vulnerabilities",
        "resource_pattern": "",
        "resource_type": "",
        "finding_title": "INVALID: No resource fields",
        "description": "SHOULD FAIL - neither resource_pattern nor resource_type",
        "expected_error": "ResourcePattern or ResourceType is required"
    },
]

# ============================================================================
# TEST DATA - Rules for L6 Matching Tests
# ============================================================================
MATCHING_TEST_CASES = [
    {"rule_id": "CVE-2025-12345", "finding_id": "CVE-2025-12345", "expected_match": True, "reason": "Exact match"},
    {"rule_id": "*", "finding_id": "CVE-2025-12345", "expected_match": True, "reason": "Wildcard matches all"},
    {"rule_id": "*", "finding_id": "CWE-409", "expected_match": True, "reason": "Wildcard matches CWE too"},
    {"rule_id": "CVE-2025-12345", "finding_id": "CVE-2025-54321", "expected_match": False, "reason": "Different CVE"},
    {"rule_id": "CVE-2025", "finding_id": "CVE-2025-12345", "expected_match": False, "reason": "L6: NO partial matching"},
    {"rule_id": "CWE-4", "finding_id": "CWE-409", "expected_match": False, "reason": "L6: NO partial matching"},
]


def get_dynamodb_client(region: str):
    """Create DynamoDB client"""
    return boto3.resource('dynamodb', region_name=region)


def populate_table(table_name: str, region: str, include_invalid: bool = True):
    """Populate DynamoDB table with test data"""
    dynamodb = get_dynamodb_client(region)
    table = dynamodb.Table(table_name)
    
    print(f"\n{'='*70}")
    print(f"Populating table: {table_name} in region: {region}")
    print(f"{'='*70}")
    
    # Add valid rules
    print(f"\n📗 Adding {len(VALID_RULES)} VALID rules...")
    for rule in VALID_RULES:
        item = {
            **rule,
            "created_at": datetime.utcnow().isoformat(),
            "due_date": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
            "extra_resource_pattern": "",
            "ser_link": f"https://jira.example.com/{rule['ser_id']}",
            "account_exception": "",
            "account_inclusion": "",
            "from_severity": "",
            "to_severity": ""
        }
        table.put_item(Item=item)
        print(f"  ✅ Added: {rule['id']} ({rule['ser_id']})")
    
    # Add invalid rules (for testing validation)
    if include_invalid:
        print(f"\n📕 Adding {len(INVALID_RULES)} INVALID rules (for validation testing)...")
        for rule in INVALID_RULES:
            item = {
                **rule,
                "created_at": datetime.utcnow().isoformat(),
                "due_date": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
                "extra_resource_pattern": "",
                "ser_link": f"https://jira.example.com/{rule['ser_id']}",
                "account_exception": "",
                "account_inclusion": "",
                "from_severity": "",
                "to_severity": ""
            }
            table.put_item(Item=item)
            print(f"  ❌ Added (should fail): {rule['id']} ({rule['ser_id']})")
    
    print(f"\n{'='*70}")
    print(f"✅ Done! Total rules added: {len(VALID_RULES) + (len(INVALID_RULES) if include_invalid else 0)}")
    print(f"{'='*70}")


def clear_table(table_name: str, region: str):
    """Clear all items from the table"""
    dynamodb = get_dynamodb_client(region)
    table = dynamodb.Table(table_name)
    
    print(f"\n🗑️  Clearing table: {table_name}...")
    
    scan = table.scan()
    with table.batch_writer() as batch:
        for item in scan.get('Items', []):
            batch.delete_item(Key={'id': item['id'], 'ser_id': item['ser_id']})
            print(f"  Deleted: {item['id']}")
    
    print("✅ Table cleared!")


def print_matching_tests():
    """Print L6 matching test cases for manual testing"""
    print(f"\n{'='*70}")
    print("L6 MATCHING TEST CASES")
    print("Use these to test the Lambda's matching logic")
    print(f"{'='*70}")
    
    for i, test in enumerate(MATCHING_TEST_CASES, 1):
        expected = "✅ MATCH" if test['expected_match'] else "❌ NO MATCH"
        print(f"\nTest {i}: {test['reason']}")
        print(f"  Rule ID:    {test['rule_id']}")
        print(f"  Finding ID: {test['finding_id']}")
        print(f"  Expected:   {expected}")
        print(f"\n  Lambda event:")
        print(f'  {{"action": "test_matching", "rule_id": "{test["rule_id"]}", "finding_id": "{test["finding_id"]}"}}')


def main():
    parser = argparse.ArgumentParser(description='Populate DynamoDB with test data for Inspector validation')
    parser.add_argument('--table-name', default=os.environ.get('TABLE_NAME', 'inspector-suppression-rules-test'),
                        help='DynamoDB table name')
    parser.add_argument('--region', default=os.environ.get('AWS_REGION', 'us-east-1'),
                        help='AWS region')
    parser.add_argument('--clear', action='store_true', help='Clear table before populating')
    parser.add_argument('--valid-only', action='store_true', help='Only add valid rules')
    parser.add_argument('--show-matching-tests', action='store_true', help='Show L6 matching test cases')
    
    args = parser.parse_args()
    
    if args.show_matching_tests:
        print_matching_tests()
        return
    
    if args.clear:
        clear_table(args.table_name, args.region)
    
    populate_table(args.table_name, args.region, include_invalid=not args.valid_only)
    
    print("\n📋 To invoke Lambda validation test:")
    print(f'aws lambda invoke --function-name inspector-validation-test-test \\')
    print(f'  --payload \'{{"action": "validate_rules"}}\' \\')
    print(f'  --cli-binary-format raw-in-base64-out response.json && cat response.json')
    
    print_matching_tests()


if __name__ == "__main__":
    main()
