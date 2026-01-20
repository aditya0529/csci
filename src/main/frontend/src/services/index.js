/**
 * Services Index
 * 
 * Central export point for all services.
 * Import from here for cleaner imports in components.
 * 
 * @example
 * import { apiService, validateInspectorId } from '../services';
 */

// API Service
export { 
  apiService, 
  mockApiService,
  resetMockData,
  getMockData,
  addMockItem 
} from './mockApiService';

// Inspector Validation
export {
  validateInspectorId,
  validateResourcePattern,
  validateResourceType,
  validateResourceFields,
  validateInspectorForm,
  hasWildcard,
  isFullWildcard,
  VALIDATION_PATTERNS
} from './inspectorValidation';
