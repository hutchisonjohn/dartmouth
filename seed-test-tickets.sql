-- Seed test tickets with variety of statuses, priorities, sentiments, and assignments

-- John's tickets (5)
INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-001', 'cust-001', 'alice@example.com', 'Alice Johnson', 'Order delayed - need urgent update', 'My order was supposed to arrive 3 days ago. This is unacceptable!', 'open', 'urgent', 'shipping', 'email', '00000000-0000-0000-0000-000000000001', 'angry', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-002', 'cust-002', 'bob@example.com', 'Bob Smith', 'Question about product specifications', 'Hi, I''d like to know more about the material used in product XYZ.', 'in-progress', 'normal', 'product_inquiry', 'email', '00000000-0000-0000-0000-000000000001', 'neutral', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-003', 'cust-003', 'carol@example.com', 'Carol White', 'Thank you for excellent service!', 'Just wanted to say thanks for the quick delivery and great quality.', 'resolved', 'low', 'feedback', 'email', '00000000-0000-0000-0000-000000000001', 'positive', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-004', 'cust-004', 'david@example.com', 'David Brown', 'Need help with custom artwork', 'I''m having trouble uploading my artwork file. Can someone assist?', 'snoozed', 'high', 'technical', 'email', '00000000-0000-0000-0000-000000000001', 'neutral', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-005', 'cust-005', 'emma@example.com', 'Emma Davis', 'URGENT: Wrong item received', 'I received the wrong product! This is completely unacceptable. I need this fixed immediately!', 'open', 'critical', 'order_issue', 'email', '00000000-0000-0000-0000-000000000001', 'angry', 0, datetime('now'), datetime('now'));

-- Ted's tickets (5)
INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-006', 'cust-006', 'frank@example.com', 'Frank Miller', 'Bulk order inquiry', 'I''d like to place a bulk order for 500 units. What''s your best price?', 'in-progress', 'high', 'sales', 'email', '00000000-0000-0000-0000-000000000002', 'positive', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-007', 'cust-007', 'grace@example.com', 'Grace Lee', 'Shipping address change', 'Can I change my shipping address? Order #12345', 'open', 'normal', 'order_modification', 'email', '00000000-0000-0000-0000-000000000002', 'neutral', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-008', 'cust-008', 'henry@example.com', 'Henry Wilson', 'Product quality issue', 'The product I received has some defects. Not happy with this.', 'in-progress', 'high', 'quality', 'email', '00000000-0000-0000-0000-000000000002', 'negative', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-009', 'cust-009', 'iris@example.com', 'Iris Chen', 'VIP discount not applied', 'I''m a VIP member but my discount wasn''t applied to my recent order.', 'snoozed', 'urgent', 'billing', 'email', '00000000-0000-0000-0000-000000000002', 'negative', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-010', 'cust-010', 'jack@example.com', 'Jack Taylor', 'Payment confirmation', 'Just confirming my payment went through for order #67890', 'resolved', 'low', 'billing', 'email', '00000000-0000-0000-0000-000000000002', 'neutral', 0, datetime('now'), datetime('now'));

-- Sam's tickets (5)
INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-011', 'cust-011', 'karen@example.com', 'Karen Martinez', 'Refund request', 'I''d like to request a refund for my order. Not satisfied with the quality.', 'open', 'high', 'refund', 'email', '00000000-0000-0000-0000-000000000003', 'negative', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-012', 'cust-012', 'leo@example.com', 'Leo Anderson', 'Amazing product quality!', 'Just received my order and I''m blown away by the quality. Will definitely order again!', 'resolved', 'low', 'feedback', 'email', '00000000-0000-0000-0000-000000000003', 'positive', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-013', 'cust-013', 'maria@example.com', 'Maria Garcia', 'Custom design consultation', 'I need help designing a custom product for my business. Can we schedule a call?', 'in-progress', 'normal', 'consultation', 'email', '00000000-0000-0000-0000-000000000003', 'positive', 1, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-014', 'cust-014', 'nathan@example.com', 'Nathan Clark', 'CRITICAL: Order not received', 'It''s been 2 weeks and I still haven''t received my order! This is ridiculous!', 'open', 'critical', 'shipping', 'email', '00000000-0000-0000-0000-000000000003', 'angry', 0, datetime('now'), datetime('now'));

INSERT INTO tickets (ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description, status, priority, category, channel, assigned_to, sentiment, vip, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'TKT-015', 'cust-015', 'olivia@example.com', 'Olivia Rodriguez', 'Tracking number request', 'Could you please provide the tracking number for my order?', 'snoozed', 'normal', 'shipping', 'email', '00000000-0000-0000-0000-000000000003', 'neutral', 0, datetime('now'), datetime('now'));

