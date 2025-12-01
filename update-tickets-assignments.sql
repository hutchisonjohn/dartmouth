-- Assign tickets to John (5 tickets with variety)
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000001', status = 'open', priority = 'urgent', sentiment = 'angry', vip = 1 WHERE ticket_number = 'TKT-000002';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000001', status = 'in-progress', priority = 'normal', sentiment = 'neutral', vip = 0 WHERE ticket_number = 'TKT-000003';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000001', status = 'resolved', priority = 'low', sentiment = 'positive', vip = 0 WHERE ticket_number = 'TKT-000004';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000001', status = 'snoozed', priority = 'high', sentiment = 'neutral', vip = 1 WHERE ticket_number = 'TKT-000005';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000001', status = 'open', priority = 'critical', sentiment = 'angry', vip = 0 WHERE ticket_number = 'TKT-000006';

-- Assign tickets to Ted (5 tickets with variety)
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000002', status = 'in-progress', priority = 'high', sentiment = 'positive', vip = 1 WHERE ticket_number = 'TKT-000007';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000002', status = 'open', priority = 'normal', sentiment = 'neutral', vip = 0 WHERE ticket_number = 'TKT-000008';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000002', status = 'in-progress', priority = 'high', sentiment = 'negative', vip = 0 WHERE ticket_number = 'TKT-000009';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000002', status = 'snoozed', priority = 'urgent', sentiment = 'negative', vip = 1 WHERE ticket_number = 'TKT-000010';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000002', status = 'resolved', priority = 'low', sentiment = 'neutral', vip = 0 WHERE ticket_number = 'TKT-000011';

-- Assign tickets to Sam (5 tickets with variety)
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000003', status = 'open', priority = 'high', sentiment = 'negative', vip = 0 WHERE ticket_number = 'TKT-000012';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000003', status = 'resolved', priority = 'low', sentiment = 'positive', vip = 1 WHERE ticket_number = 'TKT-000013';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000003', status = 'in-progress', priority = 'normal', sentiment = 'positive', vip = 1 WHERE ticket_number = 'TKT-000014';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000003', status = 'open', priority = 'critical', sentiment = 'angry', vip = 0 WHERE ticket_number = 'TKT-000015';
UPDATE tickets SET assigned_to = '00000000-0000-0000-0000-000000000003', status = 'snoozed', priority = 'normal', sentiment = 'neutral', vip = 0 WHERE ticket_number = 'TKT-000016';

