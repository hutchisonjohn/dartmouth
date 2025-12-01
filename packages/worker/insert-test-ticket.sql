-- Insert a test ticket
INSERT INTO tickets (
  ticket_id, 
  ticket_number, 
  customer_id, 
  customer_email, 
  customer_name, 
  subject,
  description,
  channel, 
  status, 
  priority, 
  category,
  sentiment,
  created_at, 
  updated_at
) VALUES (
  'test-ticket-001',
  'T-00001',
  'test-customer-001',
  'test@example.com',
  'Test Customer',
  'Test inquiry about order',
  'I would like to know the status of my order #12345',
  'email',
  'open',
  'normal',
  'order_status',
  'neutral',
  datetime('now'),
  datetime('now')
);


