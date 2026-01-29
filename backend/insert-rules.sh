#!/bin/bash

# Simple DynamoDB insert for your 3 rules
# Usage: ./insert-rules.sh [table-name] [region]

TABLE_NAME=${1:-suppression-rules-dev}
REGION=${2:-us-east-1}

echo "📝 Inserting 3 rules into DynamoDB table: ${TABLE_NAME}"
echo ""

# Rule 1: python/path-traversal@v1.0
aws dynamodb put-item \
    --table-name "${TABLE_NAME}" \
    --region "${REGION}" \
    --item '{
        "id": {"S": "python/path-traversal@v1.0"},
        "ser_id": {"S": "GS-5896"},
        "account_inclusion": {"S": ""},
        "due_date": {"S": "2026-05-21"},
        "finding_title": {"S": "Lambda vulnerability suppression for sw-oasis-esf"},
        "finding_type": {"S": "Vulnerabilities"},
        "product_name": {"S": "Inspector"},
        "resource_pattern": {"S": "arn:aws:lambda:eu-west-1:593000275026:function:aws-controltower-customiz-CustomControlTowerLELamb-1TZ7YXNEXYP39:\\$LATEST"},
        "resource_type": {"S": ""},
        "ser_link": {"S": "https://jira.swift.com/browse/GS-5896"},
        "account_exception": {"S": ""},
        "extra_resource_pattern": {"S": ""},
        "from_severity": {"S": ""},
        "to_severity": {"S": ""}
    }'

# Rule 2: CVE-2025-66418
aws dynamodb put-item \
    --table-name "${TABLE_NAME}" \
    --region "${REGION}" \
    --item '{
        "id": {"S": "CVE-2025-66418"},
        "ser_id": {"S": "TARM-4678"},
        "account_inclusion": {"S": ""},
        "due_date": {"S": "2026-09-18"},
        "finding_title": {"S": "Lambda vulnerability suppression for sw-landing-zone-config-aggregator"},
        "finding_type": {"S": "Vulnerabilities"},
        "product_name": {"S": "Inspector"},
        "resource_pattern": {"S": "arn:aws:lambda:.*:.*:function:aws-landing-zone-config.*:\\$LATEST"},
        "resource_type": {"S": ""},
        "ser_link": {"S": "https://jira.swift.com/browse/TARM-4678"},
        "account_exception": {"S": ""},
        "extra_resource_pattern": {"S": ""},
        "from_severity": {"S": ""},
        "to_severity": {"S": ""}
    }'

# Rule 3: python/zip-bomb-attack@v1.0
aws dynamodb put-item \
    --table-name "${TABLE_NAME}" \
    --region "${REGION}" \
    --item '{
        "id": {"S": "python/zip-bomb-attack@v1.0"},
        "ser_id": {"S": "GS-5896"},
        "account_inclusion": {"S": ""},
        "due_date": {"S": "2026-05-21"},
        "finding_title": {"S": "Lambda vulnerability suppression for {agile,aws}-controltower-custom*:$LATEST"},
        "finding_type": {"S": "Vulnerabilities"},
        "product_name": {"S": "Inspector"},
        "resource_pattern": {"S": "arn:aws:lambda:.*:.*:function:.*-controltower-custom.*:\\$LATEST"},
        "resource_type": {"S": ""},
        "ser_link": {"S": "https://jira.swift.com/browse/GS-5896"},
        "account_exception": {"S": ""},
        "extra_resource_pattern": {"S": ""},
        "from_severity": {"S": ""},
        "to_severity": {"S": ""}
    }'

echo ""
echo "✅ All 3 rules inserted successfully!"
