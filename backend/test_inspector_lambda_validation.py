#!/usr/bin/env python3
"""
Lambda Inspector Validation Test Script (L1-L6)
Tests the NEW validation logic without modifying the CloudFormation template.

Run: python test_inspector_lambda_validation.py
"""

import re
from dataclasses import dataclass
from typing import Optional, Tuple

# ============================================================================
# NEW VALIDATION LOGIC (L1-L6) - To be implemented in Lambda
# ============================================================================

# Validation patterns
CVE_PATTERN = re.compile(r'^CVE-\d{4}-\d{4,7}$')
CWE_PATTERN = re.compile(r'^CWE-\d{1,4}(,\d{1,4})*$')
INVALID_ID_CHARS = re.compile(r'[^a-zA-Z0-9\-*,]')
WILDCARD = "*"


@dataclass
class InspectorRule:
    """Represents an Inspector suppression rule"""
    id: str
    resource_pattern: str = ""
    resource_type: str = ""
    product_name: str = "Inspector"
    
    
def validate_inspector_id(id_value: str) -> Tuple[bool, str]:
    """
    L3-L4: Validate Inspector ID format and block partial wildcards
    
    Returns: (is_valid, error_message)
    """
    if not id_value or not id_value.strip():
        return False, "Vulnerability ID is required"
    
    trimmed_id = id_value.strip()
    
    # L3: Check for invalid characters
    if INVALID_ID_CHARS.search(trimmed_id):
        return False, f"ID contains invalid characters: {trimmed_id}"
    
    # L4: Block partial wildcards (contains * but is not exactly *)
    if WILDCARD in trimmed_id and trimmed_id != WILDCARD:
        return False, f"Partial wildcards not allowed in ID: {trimmed_id}"
    
    # L3: Validate ID format (CVE-YYYY-NNNNN, CWE-NNN, or *)
    if trimmed_id != WILDCARD:
        # Must be either valid CVE or valid CWE format
        is_valid_cve = CVE_PATTERN.match(trimmed_id)
        is_valid_cwe = CWE_PATTERN.match(trimmed_id)
        
        if not is_valid_cve and not is_valid_cwe:
            if trimmed_id.upper().startswith("CVE"):
                return False, f"Invalid CVE format: {trimmed_id}. Use CVE-YYYY-NNNNN"
            elif trimmed_id.upper().startswith("CWE"):
                return False, f"Invalid CWE format: {trimmed_id}. Use CWE-NNN"
            else:
                return False, f"Invalid ID format: {trimmed_id}. Use CVE-YYYY-NNNNN or CWE-NNN"
    
    return True, ""


def validate_resource_pattern(id_value: str, resource_pattern: str) -> Tuple[bool, str]:
    """
    L1-L2: Validate resource_pattern based on ID value
    
    L1: ALLOW wildcards when ID is specific (exact CVE/CWE)
    L2: BLOCK wildcards when ID is *
    """
    if not resource_pattern or not resource_pattern.strip():
        return True, ""  # Empty is allowed (cross-validation handles this)
    
    trimmed_id = id_value.strip() if id_value else ""
    
    # L2: Block wildcards in resource_pattern when ID is *
    if trimmed_id == WILDCARD and WILDCARD in resource_pattern:
        return False, "ResourcePattern cannot have wildcards when ID is *"
    
    # L1: Allow wildcards in resource_pattern when ID is specific - PASS
    return True, ""


def validate_resource_type(resource_type: str) -> Tuple[bool, str]:
    """
    L5: Block wildcards in resource_type ALWAYS
    """
    if not resource_type or not resource_type.strip():
        return True, ""  # Empty is allowed (cross-validation handles this)
    
    if WILDCARD in resource_type:
        return False, f"Wildcards not allowed in ResourceType: {resource_type}"
    
    return True, ""


def validate_cross_fields(resource_pattern: str, resource_type: str) -> Tuple[bool, str]:
    """
    Cross-field validation: At least one resource field required
    """
    has_pattern = resource_pattern and resource_pattern.strip()
    has_type = resource_type and resource_type.strip()
    
    if not has_pattern and not has_type:
        return False, "ResourcePattern or ResourceType is required"
    
    return True, ""


def validate_rule(rule: InspectorRule) -> Tuple[bool, str]:
    """
    Full validation for Inspector rules (L1-L6)
    
    Returns: (is_valid, error_message)
    """
    if rule.product_name.lower() != "inspector":
        return True, ""  # Not an Inspector rule, skip validation
    
    # L3-L4: Validate ID
    valid, error = validate_inspector_id(rule.id)
    if not valid:
        return False, error
    
    # L1-L2: Validate ResourcePattern + ID combination
    valid, error = validate_resource_pattern(rule.id, rule.resource_pattern)
    if not valid:
        return False, error
    
    # L5: Validate ResourceType
    valid, error = validate_resource_type(rule.resource_type)
    if not valid:
        return False, error
    
    # Cross-field validation
    valid, error = validate_cross_fields(rule.resource_pattern, rule.resource_type)
    if not valid:
        return False, error
    
    return True, ""


# ============================================================================
# NEW MATCHING LOGIC (L6) - To be implemented in Lambda
# ============================================================================

def matches_id(rule_id: str, finding_id: str) -> bool:
    """
    L6: NEW matching logic - exact match or * matches all
    
    OLD (removed): id_prefix = re.compile(r'^' + self.id.strip("*"))
    NEW: Only exact match OR * matches all
    """
    if not rule_id or not finding_id:
        return False
    
    rule_id = rule_id.strip()
    finding_id = finding_id.strip()
    
    # * matches all findings
    if rule_id == WILDCARD:
        return True
    
    # Exact match only
    return rule_id == finding_id


# ============================================================================
# TEST SUITE
# ============================================================================

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []
    
    def add(self, name: str, passed: bool, details: str = ""):
        self.tests.append((name, passed, details))
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_report(self):
        print("\n" + "=" * 70)
        print("LAMBDA INSPECTOR VALIDATION TEST REPORT (L1-L6)")
        print("=" * 70)
        
        for name, passed, details in self.tests:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} | {name}")
            if details and not passed:
                print(f"       └─ {details}")
        
        print("-" * 70)
        print(f"TOTAL: {self.passed + self.failed} | PASSED: {self.passed} | FAILED: {self.failed}")
        print("=" * 70)


def run_tests():
    results = TestResult()
    
    # -------------------------------------------------------------------------
    # L3: ID Format Validation Tests
    # -------------------------------------------------------------------------
    print("\n📋 Testing L3: ID Format Validation...")
    
    # Valid CVE formats
    for cve in ["CVE-2025-12345", "CVE-2024-1234", "CVE-2023-1234567"]:
        valid, _ = validate_inspector_id(cve)
        results.add(f"L3: Valid CVE format - {cve}", valid)
    
    # Invalid CVE formats
    for cve in ["CVE-25-12345", "CVE-2025-123", "CVE-2025-12345678", "CVE2025-12345"]:
        valid, error = validate_inspector_id(cve)
        results.add(f"L3: Invalid CVE format blocked - {cve}", not valid, error)
    
    # Valid CWE formats
    for cwe in ["CWE-409", "CWE-1", "CWE-9999"]:
        valid, _ = validate_inspector_id(cwe)
        results.add(f"L3: Valid CWE format - {cwe}", valid)
    
    # Invalid CWE formats
    for cwe in ["CWE-99999", "CWE409", "CWE-"]:
        valid, error = validate_inspector_id(cwe)
        results.add(f"L3: Invalid CWE format blocked - {cwe}", not valid, error)
    
    # Wildcard allowed
    valid, _ = validate_inspector_id("*")
    results.add("L3: Wildcard (*) allowed as ID", valid)
    
    # Empty ID blocked
    valid, error = validate_inspector_id("")
    results.add("L3: Empty ID blocked", not valid, error)
    
    # -------------------------------------------------------------------------
    # L4: Partial Wildcard Blocking Tests
    # -------------------------------------------------------------------------
    print("\n📋 Testing L4: Partial Wildcard Blocking...")
    
    for partial in ["CVE-*", "CWE-*", "CVE-2025-*", "*-12345", "C*E-2025-12345"]:
        valid, error = validate_inspector_id(partial)
        results.add(f"L4: Partial wildcard blocked - {partial}", not valid, error)
    
    # -------------------------------------------------------------------------
    # L1-L2: ResourcePattern + ID Cross-Validation Tests
    # -------------------------------------------------------------------------
    print("\n📋 Testing L1-L2: ResourcePattern + ID Cross-Validation...")
    
    # L1: Allow wildcards in resource_pattern when ID is specific
    valid, _ = validate_resource_pattern("CVE-2025-12345", "arn:aws:*")
    results.add("L1: Allow wildcard in resource_pattern when ID is specific", valid)
    
    valid, _ = validate_resource_pattern("CWE-409", "*")
    results.add("L1: Allow * in resource_pattern when ID is CWE", valid)
    
    # L2: Block wildcards in resource_pattern when ID is *
    valid, error = validate_resource_pattern("*", "arn:aws:*")
    results.add("L2: Block wildcard in resource_pattern when ID is *", not valid, error)
    
    valid, error = validate_resource_pattern("*", "*")
    results.add("L2: Block * in resource_pattern when ID is *", not valid, error)
    
    # L2: Allow exact ARN when ID is *
    valid, _ = validate_resource_pattern("*", "arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0")
    results.add("L2: Allow exact ARN in resource_pattern when ID is *", valid)
    
    # -------------------------------------------------------------------------
    # L5: ResourceType Wildcard Blocking Tests
    # -------------------------------------------------------------------------
    print("\n📋 Testing L5: ResourceType Wildcard Blocking...")
    
    for rt in ["*", "AWS::EC2::*", "AWS::*::Instance"]:
        valid, error = validate_resource_type(rt)
        results.add(f"L5: Block wildcard in resource_type - {rt}", not valid, error)
    
    valid, _ = validate_resource_type("AWS::EC2::Instance")
    results.add("L5: Allow exact resource_type", valid)
    
    # -------------------------------------------------------------------------
    # L6: Matching Logic Tests (NEW - exact match or * only)
    # -------------------------------------------------------------------------
    print("\n📋 Testing L6: Matching Logic (Exact or * Only)...")
    
    # Exact match
    results.add("L6: Exact CVE match", matches_id("CVE-2025-12345", "CVE-2025-12345"))
    results.add("L6: Exact CWE match", matches_id("CWE-409", "CWE-409"))
    
    # * matches all
    results.add("L6: Wildcard matches any CVE", matches_id("*", "CVE-2025-12345"))
    results.add("L6: Wildcard matches any CWE", matches_id("*", "CWE-409"))
    
    # No partial matching (OLD behavior removed)
    results.add("L6: NO partial CVE match (CVE-2025 != CVE-2025-12345)", 
                not matches_id("CVE-2025", "CVE-2025-12345"))
    results.add("L6: NO partial CWE match (CWE-4 != CWE-409)", 
                not matches_id("CWE-4", "CWE-409"))
    
    # Different IDs don't match
    results.add("L6: Different CVEs don't match", 
                not matches_id("CVE-2025-12345", "CVE-2025-54321"))
    
    # -------------------------------------------------------------------------
    # Full Rule Validation Tests
    # -------------------------------------------------------------------------
    print("\n📋 Testing Full Rule Validation...")
    
    # Valid rules
    valid_rules = [
        InspectorRule(id="CVE-2025-12345", resource_pattern="arn:aws:ec2:*"),
        InspectorRule(id="CVE-2025-12345", resource_type="AWS::EC2::Instance"),
        InspectorRule(id="*", resource_pattern="arn:aws:ec2:us-east-1:123456789012:instance/i-abc"),
        InspectorRule(id="CWE-409", resource_pattern="*", resource_type="AWS::EC2::Instance"),
    ]
    for rule in valid_rules:
        valid, error = validate_rule(rule)
        results.add(f"Valid rule: id={rule.id}, rp={rule.resource_pattern[:20] if rule.resource_pattern else 'N/A'}...", valid, error)
    
    # Invalid rules
    invalid_rules = [
        (InspectorRule(id="CVE-*", resource_pattern="arn:aws:*"), "L4: Partial wildcard in ID"),
        (InspectorRule(id="*", resource_pattern="*"), "L2: Wildcard pattern with wildcard ID"),
        (InspectorRule(id="CVE-2025-12345", resource_type="*"), "L5: Wildcard in resource_type"),
        (InspectorRule(id="CVE-2025-12345"), "Cross-field: No resource fields"),
        (InspectorRule(id="", resource_pattern="arn:aws:*"), "L3: Empty ID"),
    ]
    for rule, desc in invalid_rules:
        valid, error = validate_rule(rule)
        results.add(f"Invalid rule blocked: {desc}", not valid, error)
    
    # Print final report
    results.print_report()
    
    return results.failed == 0


if __name__ == "__main__":
    print("\n🔍 Running Lambda Inspector Validation Tests (L1-L6)...\n")
    success = run_tests()
    exit(0 if success else 1)
