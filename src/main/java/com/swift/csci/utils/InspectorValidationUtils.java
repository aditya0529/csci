package com.swift.csci.utils;

import com.swift.csci.model.SuppressionData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Pattern;

/**
 * Utility class for Inspector-specific validation logic (J1-J7)
 */
public class InspectorValidationUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(InspectorValidationUtils.class);

    // Validation patterns
    private static final Pattern INVALID_ID_CHARS = Pattern.compile("[^a-zA-Z0-9\\-*,]");
    private static final String WILDCARD = "*";

    /**
     * Validation result containing status and error message
     */
    public static class ValidationResult {
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

    /**
     * Validates Inspector-specific input fields (J1-J7)
     * @param input The suppression data to validate
     * @return ValidationResult with status and error message if invalid
     */
    public static ValidationResult validate(SuppressionData input) {
        String id = input.getId();
        String resourcePattern = input.getResourcePattern();
        String resourceType = input.getResourceType();

        // J1-J3: ID Validation
        if (id == null || id.trim().isEmpty()) {
            LOGGER.error("Inspector validation failed: Vulnerability ID is required");
            return ValidationResult.error("Vulnerability ID is required");
        }

        String trimmedId = id.trim();

        // J3: Block invalid characters
        if (INVALID_ID_CHARS.matcher(trimmedId).find()) {
            LOGGER.error("Inspector validation failed: ID contains invalid characters - " + trimmedId);
            return ValidationResult.error("ID contains invalid characters. Only alphanumeric, hyphens, commas, and asterisk are allowed.");
        }

        // J2: Block partial wildcards (contains * but is not exactly *)
        if (trimmedId.contains(WILDCARD) && !trimmedId.equals(WILDCARD)) {
            LOGGER.error("Inspector validation failed: Partial wildcards not allowed in ID - " + trimmedId);
            return ValidationResult.error("Partial wildcards (CVE-*, CWE-*) not allowed in ID. Use exact CVE/CWE or * only.");
        }


        // J4-J5: ResourcePattern + ID cross-validation
        if (resourcePattern != null && !resourcePattern.trim().isEmpty()) {
            if (trimmedId.equals(WILDCARD) && resourcePattern.contains(WILDCARD)) {
                LOGGER.error("Inspector validation failed: ResourcePattern cannot have wildcards when ID is * - " + resourcePattern);
                return ValidationResult.error("ResourcePattern must be exact ARN when ID is *. Wildcards not allowed.");
            }
            // J5: Allow wildcards in ResourcePattern when ID is specific - no action needed
        }

        // J6: ResourceType wildcard validation
        if (resourceType != null && !resourceType.trim().isEmpty()) {
            if (resourceType.contains(WILDCARD)) {
                LOGGER.error("Inspector validation failed: Wildcards not allowed in ResourceType - " + resourceType);
                return ValidationResult.error("Wildcards not allowed in ResourceType");
            }
        }

        // J7: Cross-field validation (at least one resource field required)
        boolean hasResourcePattern = resourcePattern != null && !resourcePattern.trim().isEmpty();
        boolean hasResourceType = resourceType != null && !resourceType.trim().isEmpty();
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
