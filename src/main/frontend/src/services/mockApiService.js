/**
 * Mock API Service
 * 
 * Provides mock API responses for local development without calling csci.swift.com.
 * Follows Repository Pattern - abstracts data access from business logic.
 * 
 * Usage:
 * - Import { apiService } from './services/mockApiService'
 * - Call apiService.createItem(data), apiService.listItems(), etc.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Simulated network delay in milliseconds
 */
const MOCK_DELAY_MS = 300;

// ============================================================================
// MOCK DATA STORE
// ============================================================================

/**
 * In-memory data store for mock suppression rules
 * Includes reference data from user requirements
 */
let mockSuppressionRules = [
  // Use Case 1: sw-oasis-esf Lambda Functions
  {
    id: 'CVE-2025-66418',
    finding_title: 'urllib3 vulnerability in sw-oasis-esf functions',
    product_name: 'Inspector',
    findingType: 'Vulnerabilities',
    ser_id: 'SER-2025-001',
    ser_link: 'https://jira.swift.com/browse/SER-2025-001',
    due_date: '2025-03-01',
    resource_pattern: 'arn:aws:lambda:*:*:function:sw-oasis-esf-*:*',
    resource_type: '',
    description: 'Suppress urllib3 CVE for sw-oasis-esf Lambda functions',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  },
  {
    id: 'CVE-2025-66471',
    finding_title: 'urllib3 vulnerability variant',
    product_name: 'Inspector',
    findingType: 'Vulnerabilities',
    ser_id: 'SER-2025-002',
    ser_link: 'https://jira.swift.com/browse/SER-2025-002',
    due_date: '2025-03-01',
    resource_pattern: 'arn:aws:lambda:*:*:function:sw-oasis-esf-*:*',
    resource_type: '',
    description: 'Suppress urllib3 CVE variant for sw-oasis-esf Lambda functions',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  },
  {
    id: 'CWE-117,93',
    finding_title: 'Log injection vulnerability',
    product_name: 'Inspector',
    findingType: 'Vulnerabilities',
    ser_id: 'SER-2025-003',
    ser_link: 'https://jira.swift.com/browse/SER-2025-003',
    due_date: '2025-04-15',
    resource_pattern: 'arn:aws:lambda:*:*:function:sw-oasis-esf-*:*',
    resource_type: '',
    description: 'Suppress log injection CWE for sw-oasis-esf Lambda functions',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  },
  // Use Case 2: AWS Control Tower Lambda Functions
  {
    id: 'CWE-409',
    finding_title: 'Zip bomb attack vulnerability',
    product_name: 'Inspector',
    findingType: 'Vulnerabilities',
    ser_id: 'SER-2025-010',
    ser_link: 'https://jira.swift.com/browse/SER-2025-010',
    due_date: '2025-02-28',
    resource_pattern: 'arn:aws:lambda:*:*:function:AWS_Control_Tower_Upgrade-*:*',
    resource_type: '',
    description: 'Suppress zip bomb CWE for Control Tower Lambda functions',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  },
  {
    id: 'CWE-22',
    finding_title: 'Path traversal vulnerability',
    product_name: 'Inspector',
    findingType: 'Vulnerabilities',
    ser_id: 'SER-2025-011',
    ser_link: 'https://jira.swift.com/browse/SER-2025-011',
    due_date: '2025-02-28',
    resource_pattern: 'arn:aws:lambda:*:*:function:AWS_Control_Tower_Upgrade-*:*',
    resource_type: '',
    description: 'Suppress path traversal CWE for Control Tower Lambda functions',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  },
  // Security Hub example
  {
    id: 'ELB.6',
    finding_title: 'Application Load Balancer deletion protection should be enabled',
    product_name: 'Security Hub',
    findingType: 'Industry and Regulatory Standards',
    ser_id: 'SER-2024-500',
    ser_link: 'https://jira.swift.com/browse/SER-2024-500',
    due_date: '2025-06-30',
    resource_pattern: 'arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*',
    resource_type: 'AwsElbv2LoadBalancer',
    description: 'Suppress ELB.6 for specific load balancers',
    account_inclusion: '',
    account_exception: '',
    from_severity: '',
    to_severity: '',
    extra_resource_pattern: ''
  }
];

/**
 * Mock user profile data
 */
const mockUserProfile = {
  username: 'test-user',
  email: 'test.user@swift.com',
  roles: ['CSCI_USER', 'CSCI_ADMIN']
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simulates network delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Resolves after delay
 */
const delay = (ms = MOCK_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a unique ID for new items
 * @returns {string} Unique identifier
 */
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Creates a mock HTTP response object
 * @param {Object} data - Response data
 * @param {boolean} ok - Whether response is successful
 * @param {number} status - HTTP status code
 * @returns {Object} Mock response object
 */
const createMockResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
});

// ============================================================================
// MOCK API METHODS
// ============================================================================

/**
 * Mock implementation of createItem API
 * @param {Object} itemData - The item data to create
 * @returns {Promise<Object>} Mock response
 */
const mockCreateItem = async (itemData) => {
  await delay();
  
  // Add to mock store
  const newItem = {
    ...itemData,
    _mockId: generateId(),
    _createdAt: new Date().toISOString()
  };
  
  mockSuppressionRules.push(newItem);
  
  console.log('[MockAPI] Created item:', newItem);
  
  return createMockResponse({
    message: 'Created item successfully',
    item: newItem
  });
};

/**
 * Mock implementation of listItems API
 * @returns {Promise<Object>} Mock response with list of items
 */
const mockListItems = async () => {
  await delay();
  
  console.log('[MockAPI] Listing items, count:', mockSuppressionRules.length);
  
  return createMockResponse(mockSuppressionRules);
};

/**
 * Mock implementation of updateItem API
 * @param {Object} itemData - The item data to update
 * @returns {Promise<Object>} Mock response
 */
const mockUpdateItem = async (itemData) => {
  await delay();
  
  const index = mockSuppressionRules.findIndex(item => item.id === itemData.id);
  
  if (index === -1) {
    return createMockResponse({ error: 'Item not found' }, false, 404);
  }
  
  mockSuppressionRules[index] = {
    ...mockSuppressionRules[index],
    ...itemData,
    _updatedAt: new Date().toISOString()
  };
  
  console.log('[MockAPI] Updated item:', mockSuppressionRules[index]);
  
  return createMockResponse({
    message: 'Updated item successfully',
    item: mockSuppressionRules[index]
  });
};

/**
 * Mock implementation of deleteItem API
 * @param {string} id - The item ID to delete
 * @returns {Promise<Object>} Mock response
 */
const mockDeleteItem = async (id) => {
  await delay();
  
  const index = mockSuppressionRules.findIndex(item => item.id === id);
  
  if (index === -1) {
    return createMockResponse({ error: 'Item not found' }, false, 404);
  }
  
  const deleted = mockSuppressionRules.splice(index, 1)[0];
  
  console.log('[MockAPI] Deleted item:', deleted);
  
  return createMockResponse({
    message: 'Deleted item successfully',
    item: deleted
  });
};

/**
 * Mock implementation of userProfile API
 * @returns {Promise<Object>} Mock response with user profile
 */
const mockUserProfileApi = async () => {
  await delay();
  
  console.log('[MockAPI] Returning user profile');
  
  return createMockResponse(mockUserProfile);
};

// ============================================================================
// API SERVICE INTERFACE
// ============================================================================

/**
 * Mock API Service
 * Provides same interface as real API for seamless switching
 */
export const mockApiService = {
  /**
   * Create a new suppression rule
   * @param {Object} data - Rule data
   * @param {Object} options - Request options (headers, etc.)
   * @returns {Promise<Response>} API response
   */
  createItem: async (data, options = {}) => {
    console.log('[MockAPI] createItem called with:', data);
    return mockCreateItem(data);
  },

  /**
   * List all suppression rules
   * @returns {Promise<Response>} API response with rules array
   */
  listItems: async () => {
    console.log('[MockAPI] listItems called');
    return mockListItems();
  },

  /**
   * Update an existing suppression rule
   * @param {Object} data - Updated rule data
   * @param {Object} options - Request options
   * @returns {Promise<Response>} API response
   */
  updateItem: async (data, options = {}) => {
    console.log('[MockAPI] updateItem called with:', data);
    return mockUpdateItem(data);
  },

  /**
   * Delete a suppression rule
   * @param {string} id - Rule ID to delete
   * @returns {Promise<Response>} API response
   */
  deleteItem: async (id) => {
    console.log('[MockAPI] deleteItem called for:', id);
    return mockDeleteItem(id);
  },

  /**
   * Get user profile
   * @returns {Promise<Response>} API response with user data
   */
  userProfile: async () => {
    console.log('[MockAPI] userProfile called');
    return mockUserProfileApi();
  }
};

// ============================================================================
// EXPORTED API SERVICE
// ============================================================================

/**
 * API Service - Mock implementation for local development
 * Import this in your components:
 * 
 * import { apiService } from '../services/mockApiService';
 * 
 * // Then use:
 * const response = await apiService.createItem(data);
 */
export const apiService = mockApiService;

// ============================================================================
// MOCK DATA MANAGEMENT (for testing)
// ============================================================================

/**
 * Reset mock data to initial state
 * Useful for testing
 */
export const resetMockData = () => {
  mockSuppressionRules = [...initialMockData];
};

/**
 * Get current mock data
 * @returns {Array} Current mock suppression rules
 */
export const getMockData = () => [...mockSuppressionRules];

/**
 * Add custom mock data
 * @param {Object} item - Item to add
 */
export const addMockItem = (item) => {
  mockSuppressionRules.push(item);
};

// Store initial data for reset
const initialMockData = [...mockSuppressionRules];
