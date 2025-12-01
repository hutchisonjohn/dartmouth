-- Check for tickets
SELECT COUNT(*) as ticket_count FROM tickets;

-- Check for emails
SELECT COUNT(*) as email_count FROM emails;

-- Show recent tickets
SELECT ticket_number, customer_email, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 5;

-- Show recent emails
SELECT from_email, subject, received_at FROM emails ORDER BY received_at DESC LIMIT 5;


