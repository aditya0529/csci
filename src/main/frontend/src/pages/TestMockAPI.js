import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Card, ListGroup } from 'react-bootstrap';

/**
 * Test component to verify mock API functionality
 */
const TestMockAPI = () => {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateItem = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { apiService } = await import('../services/mockApiService');
      
      const testItem = {
        id: 'CVE-2025-TEST-' + Date.now(),
        ser_id: 'SER-TEST-' + Date.now(),
        finding_title: 'Test Finding for Mock API',
        product_name: 'Inspector',
        ser_link: 'https://jira.swift.com/browse/SER-TEST-001',
        due_date: '2025-03-01',
        description: 'Test description for mock API validation',
        account_inclusion: '',
        account_exception: '',
        from_severity: '',
        to_severity: '',
        resource_type: 'AwsLambdaFunction',
        resource_pattern: 'arn:aws:lambda:*:*:function:test-*',
        extra_resource_pattern: ''
      };

      console.log('Creating test item:', testItem);
      const response = await apiService.createItem(testItem);
      
      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Created: ${result.item.id}`);
        loadItems(); // Refresh list
      } else {
        setMessage('❌ Create failed');
      }
    } catch (error) {
      console.error('Create error:', error);
      setMessage('❌ Create error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    
    try {
      const { apiService } = await import('../services/mockApiService');
      console.log('Loading items...');
      const response = await apiService.listItems();
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setMessage(`📋 Loaded ${data.length} items`);
      } else {
        setMessage('❌ Load failed');
      }
    } catch (error) {
      console.error('Load error:', error);
      setMessage('❌ Load error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateItem = async () => {
    if (items.length === 0) {
      setMessage('❌ No items to update. Create an item first.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const { apiService } = await import('../services/mockApiService');
      
      const itemToUpdate = items[0];
      const updatedItem = {
        ...itemToUpdate,
        ser_link: 'https://jira.swift.com/browse/UPDATED-' + Date.now(),
        description: 'Updated description at ' + new Date().toISOString()
      };

      console.log('Updating item:', updatedItem);
      const response = await apiService.updateItem(updatedItem);
      
      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Updated: ${result.item.id}`);
        loadItems(); // Refresh list
      } else {
        setMessage('❌ Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage('❌ Update error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Mock API Test Page</h2>
      
      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'}>
          {message}
        </Alert>
      )}
      
      <div className="mb-3">
        <Button 
          variant="primary" 
          onClick={testCreateItem} 
          disabled={loading}
          className="me-2"
        >
          {loading ? 'Creating...' : 'Test Create'}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={loadItems} 
          disabled={loading}
          className="me-2"
        >
          {loading ? 'Loading...' : 'Refresh List'}
        </Button>
        
        <Button 
          variant="warning" 
          onClick={testUpdateItem} 
          disabled={loading || items.length === 0}
        >
          {loading ? 'Updating...' : 'Test Update'}
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5>Items ({items.length})</h5>
        </Card.Header>
        <Card.Body>
          {items.length === 0 ? (
            <p>No items found</p>
          ) : (
            <ListGroup>
              {items.map((item, index) => (
                <ListGroup.Item key={index}>
                  <strong>{item.id}</strong> - {item.finding_title}
                  <br />
                  <small>SER: {item.ser_id} | Link: {item.ser_link}</small>
                  {item._createdAt && (
                    <><br /><small>Created: {item._createdAt}</small></>
                  )}
                  {item._updatedAt && (
                    <><br /><small>Updated: {item._updatedAt}</small></>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestMockAPI;
