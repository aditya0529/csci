/**
 * Inspector Validation Service
 * 
 * Rules:
 * - ID: Exact CVE-YYYY-NNNNN, CWE-NNN, or "*" only (no partial wildcards)
 * - ResourcePattern: Wildcards allowed only when ID is specific
 * - ResourceType: No wildcards allowed
 * - At least one of ResourcePattern or ResourceType required
 */

// Patterns
const CVE_PATTERN = /^CVE-\d{4}-\d{4,7}$/;  // e.g. CVE-2025-66418
const CWE_PATTERN = /^CWE-\d{1,4}(,\d{1,4})*$/;  // e.g. CWE-409, CWE-117,93
const HAS_WILDCARD = /\*/;

// ID Validation
export const validateInspectorId = (id) => {
  if (!id || id.trim() === '') {
    return { valid: false, message: 'Vulnerability ID is required' };
  }

  const trimmed = id.trim();
  
  if (trimmed === '*') {
    return { valid: true, isFullWildcard: true };
  }
  
  if (trimmed.startsWith('CVE-') && CVE_PATTERN.test(trimmed)) {
    return { valid: true, isFullWildcard: false };
  }
  
  if (trimmed.startsWith('CWE-') && CWE_PATTERN.test(trimmed)) {
    return { valid: true, isFullWildcard: false };
  }
  
  return { 
    valid: false, 
    message: 'Invalid format. Use CVE-YYYY-NNNNN, CWE-NNN, or "*"' 
  };
};

// ResourcePattern Validation
export const validateResourcePattern = (pattern, isIdWildcard) => {
  if (!pattern || pattern.trim() === '') {
    return { valid: true, isEmpty: true };
  }
  
  const hasWildcard = HAS_WILDCARD.test(pattern);
  
  if (isIdWildcard && hasWildcard) {
    return { 
      valid: false, 
      message: 'When ID is "*", Resource Pattern must be exact ARN (no wildcards)' 
    };
  }
  
  return { valid: true, hasWildcard };
};

// ResourceType Validation
export const validateResourceType = (resourceType) => {
  if (!resourceType || resourceType.trim() === '') {
    return { valid: true, isEmpty: true };
  }
  
  if (HAS_WILDCARD.test(resourceType)) {
    return { 
      valid: false, 
      message: 'Wildcards not allowed in Resource Type' 
    };
  }
  
  return { valid: true };
};

// Cross-field Validation
export const validateResourceFields = (pattern, type) => {
  const patternEmpty = !pattern || pattern.trim() === '';
  const typeEmpty = !type || type.trim() === '';
  
  if (patternEmpty && typeEmpty) {
    return { 
      valid: false, 
      message: 'Provide at least one: Resource Pattern or Resource Type' 
    };
  }
  
  return { valid: true };
};

// Form Validation (combines all validations)
export const validateInspectorForm = ({ id, resourcePattern, resourceType }) => {
  const errors = {};
  let isValid = true;
  
  const idResult = validateInspectorId(id);
  if (!idResult.valid) {
    errors.id = idResult.message;
    isValid = false;
  }
  
  const isIdWildcard = idResult.isFullWildcard || false;
  
  const patternResult = validateResourcePattern(resourcePattern, isIdWildcard);
  if (!patternResult.valid) {
    errors.resourcePattern = patternResult.message;
    isValid = false;
  }
  
  const typeResult = validateResourceType(resourceType);
  if (!typeResult.valid) {
    errors.resourceType = typeResult.message;
    isValid = false;
  }
  
  const fieldsResult = validateResourceFields(resourcePattern, resourceType);
  if (!fieldsResult.valid) {
    errors.resourceFields = fieldsResult.message;
    isValid = false;
  }
  
  return { valid: isValid, errors };
};

// Utility functions
export const isFullWildcard = (id) => id && id.trim() === '*';
export const hasWildcard = (value) => value && HAS_WILDCARD.test(value);
