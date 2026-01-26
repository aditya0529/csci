package com.swift.csci.utils;

import com.swift.csci.model.SuppressionData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Pattern;

public final class InspectorValidationUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(InspectorValidationUtils.class);

    // Validation patterns
    private static final Pattern INVALID_ID_CHARS = Pattern.compile("[^a-zA-Z0-9\\-*,]");
    private static final String WILDCARD = "*";

    // Private constructor to prevent instantiation
    private InspectorValidationUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Validation result containing status and error message
     */
    public static final class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult error(String message) {
            return new ValidationResult(false, message);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    public static ValidationResult validate(SuppressionData input) {

        String id = input.getId() != null ? input.getId().strip() : "";
        String resourcePattern = input.getResourcePattern() != null ? input.getResourcePattern().strip() : "";
        String resourceType = input.getResourceType() != null ? input.getResourceType().strip() : "";

        // ID Required
        if (id.isBlank()) {
            LOGGER.error("Inspector validation failed: Vulnerability ID is required");
            return ValidationResult.error("Vulnerability ID is required");
        }

        // Invalid characters check
        if (INVALID_ID_CHARS.matcher(id).find()) {
            LOGGER.error("Inspector validation failed: ID contains invalid characters - {}", id);
            return ValidationResult.error("ID contains invalid characters. Only alphanumeric, hyphens, commas, and asterisk are allowed.");
        }

        // Partial wildcards not allowed (e.g., CVE-*, CWE-*)
        if (id.contains(WILDCARD) && !id.equals(WILDCARD)) {
            LOGGER.error("Inspector validation failed: Partial wildcards not allowed in ID - {}", id);
            return ValidationResult.error("Partial wildcards (CVE-*, CWE-*) not allowed in ID. Use exact CVE/CWE or * only.");
        }

        // ResourcePattern + ID cross-validation
        boolean isWildcardId = id.equals(WILDCARD);
        boolean hasResourcePattern = !resourcePattern.isBlank();
        if (hasResourcePattern && isWildcardId && resourcePattern.contains(WILDCARD)) {
            LOGGER.error("Inspector validation failed: ResourcePattern cannot have wildcards when ID is * - {}", resourcePattern);
            return ValidationResult.error("ResourcePattern must be exact ARN when ID is *. Wildcards not allowed.");
        }

        // ResourceType wildcard validation
        boolean hasResourceType = !resourceType.isBlank();
        if (hasResourceType && resourceType.contains(WILDCARD)) {
            LOGGER.error("Inspector validation failed: Wildcards not allowed in ResourceType - {}", resourceType);
            return ValidationResult.error("Wildcards not allowed in ResourceType");
        }

        // At least one resource field required
        if (!hasResourcePattern && !hasResourceType) {
            LOGGER.error("Inspector validation failed: ResourcePattern or ResourceType is required");
            return ValidationResult.error("Provide ResourcePattern or ResourceType");
        }

        return ValidationResult.success();
    }

    /**
     * Check if product is Inspector
     */
    public static boolean isInspector(String productName) {
        return productName != null && productName.equalsIgnoreCase("Inspector");
    }
}
