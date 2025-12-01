# Seed test tickets with variety of statuses, priorities, sentiments, and assignments

Write-Host "Creating test tickets with variety..." -ForegroundColor Yellow

# Staff IDs
$john = "00000000-0000-0000-0000-000000000001"
$ted = "00000000-0000-0000-0000-000000000002"
$sam = "00000000-0000-0000-0000-000000000003"

# Create 15 test tickets (5 per staff member)
$tickets = @(
    # John's tickets
    @{
        ticket_number = "TKT-001"
        customer_name = "Alice Johnson"
        customer_email = "alice@example.com"
        subject = "Order delayed - need urgent update"
        description = "My order was supposed to arrive 3 days ago. This is unacceptable!"
        status = "open"
        priority = "urgent"
        sentiment = "angry"
        assigned_to = $john
        vip = 1
    },
    @{
        ticket_number = "TKT-002"
        customer_name = "Bob Smith"
        customer_email = "bob@example.com"
        subject = "Question about product specifications"
        description = "Hi, I'd like to know more about the material used in product XYZ."
        status = "in-progress"
        priority = "normal"
        sentiment = "neutral"
        assigned_to = $john
        vip = 0
    },
    @{
        ticket_number = "TKT-003"
        customer_name = "Carol White"
        customer_email = "carol@example.com"
        subject = "Thank you for excellent service!"
        description = "Just wanted to say thanks for the quick delivery and great quality."
        status = "resolved"
        priority = "low"
        sentiment = "positive"
        assigned_to = $john
        vip = 0
    },
    @{
        ticket_number = "TKT-004"
        customer_name = "David Brown"
        customer_email = "david@example.com"
        subject = "Need help with custom artwork"
        description = "I'm having trouble uploading my artwork file. Can someone assist?"
        status = "snoozed"
        priority = "high"
        sentiment = "neutral"
        assigned_to = $john
        vip = 1
    },
    @{
        ticket_number = "TKT-005"
        customer_name = "Emma Davis"
        customer_email = "emma@example.com"
        subject = "URGENT: Wrong item received"
        description = "I received the wrong product! This is completely unacceptable. I need this fixed immediately!"
        status = "open"
        priority = "critical"
        sentiment = "angry"
        assigned_to = $john
        vip = 0
    },
    
    # Ted's tickets
    @{
        ticket_number = "TKT-006"
        customer_name = "Frank Miller"
        customer_email = "frank@example.com"
        subject = "Bulk order inquiry"
        description = "I'd like to place a bulk order for 500 units. What's your best price?"
        status = "in-progress"
        priority = "high"
        sentiment = "positive"
        assigned_to = $ted
        vip = 1
    },
    @{
        ticket_number = "TKT-007"
        customer_name = "Grace Lee"
        customer_email = "grace@example.com"
        subject = "Shipping address change"
        description = "Can I change my shipping address? Order #12345"
        status = "open"
        priority = "normal"
        sentiment = "neutral"
        assigned_to = $ted
        vip = 0
    },
    @{
        ticket_number = "TKT-008"
        customer_name = "Henry Wilson"
        customer_email = "henry@example.com"
        subject = "Product quality issue"
        description = "The product I received has some defects. Not happy with this."
        status = "in-progress"
        priority = "high"
        sentiment = "negative"
        assigned_to = $ted
        vip = 0
    },
    @{
        ticket_number = "TKT-009"
        customer_name = "Iris Chen"
        customer_email = "iris@example.com"
        subject = "VIP discount not applied"
        description = "I'm a VIP member but my discount wasn't applied to my recent order."
        status = "snoozed"
        priority = "urgent"
        sentiment = "negative"
        assigned_to = $ted
        vip = 1
    },
    @{
        ticket_number = "TKT-010"
        customer_name = "Jack Taylor"
        customer_email = "jack@example.com"
        subject = "Payment confirmation"
        description = "Just confirming my payment went through for order #67890"
        status = "resolved"
        priority = "low"
        sentiment = "neutral"
        assigned_to = $ted
        vip = 0
    },
    
    # Sam's tickets
    @{
        ticket_number = "TKT-011"
        customer_name = "Karen Martinez"
        customer_email = "karen@example.com"
        subject = "Refund request"
        description = "I'd like to request a refund for my order. Not satisfied with the quality."
        status = "open"
        priority = "high"
        sentiment = "negative"
        assigned_to = $sam
        vip = 0
    },
    @{
        ticket_number = "TKT-012"
        customer_name = "Leo Anderson"
        customer_email = "leo@example.com"
        subject = "Amazing product quality!"
        description = "Just received my order and I'm blown away by the quality. Will definitely order again!"
        status = "resolved"
        priority = "low"
        sentiment = "positive"
        assigned_to = $sam
        vip = 1
    },
    @{
        ticket_number = "TKT-013"
        customer_name = "Maria Garcia"
        customer_email = "maria@example.com"
        subject = "Custom design consultation"
        description = "I need help designing a custom product for my business. Can we schedule a call?"
        status = "in-progress"
        priority = "normal"
        sentiment = "positive"
        assigned_to = $sam
        vip = 1
    },
    @{
        ticket_number = "TKT-014"
        customer_name = "Nathan Clark"
        customer_email = "nathan@example.com"
        subject = "CRITICAL: Order not received"
        description = "It's been 2 weeks and I still haven't received my order! This is ridiculous!"
        status = "open"
        priority = "critical"
        sentiment = "angry"
        assigned_to = $sam
        vip = 0
    },
    @{
        ticket_number = "TKT-015"
        customer_name = "Olivia Rodriguez"
        customer_email = "olivia@example.com"
        subject = "Tracking number request"
        description = "Could you please provide the tracking number for my order?"
        status = "snoozed"
        priority = "normal"
        sentiment = "neutral"
        assigned_to = $sam
        vip = 0
    }
)

Write-Host "Inserting $($tickets.Count) test tickets..." -ForegroundColor Cyan

foreach ($ticket in $tickets) {
    $description = $ticket.description -replace "'", "''"
    $subject = $ticket.subject -replace "'", "''"
    $sql = @"
INSERT INTO tickets (
    ticket_id, ticket_number, customer_name, customer_email, 
    subject, description, status, priority, sentiment, 
    assigned_to, vip, created_at, updated_at
) VALUES (
    lower(hex(randomblob(16))),
    '$($ticket.ticket_number)',
    '$($ticket.customer_name)',
    '$($ticket.customer_email)',
    '$subject',
    '$description',
    '$($ticket.status)',
    '$($ticket.priority)',
    '$($ticket.sentiment)',
    '$($ticket.assigned_to)',
    $($ticket.vip),
    datetime('now'),
    datetime('now')
);
"@
    
    npx wrangler d1 execute dartmouth-os-db --remote --command $sql
    Write-Host "  ✓ Created $($ticket.ticket_number) - $($ticket.customer_name) (assigned to $(if($ticket.assigned_to -eq $john){'John'}elseif($ticket.assigned_to -eq $ted){'Ted'}else{'Sam'}))" -ForegroundColor Green
}

Write-Host "`n✅ All test tickets created successfully!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - John: 5 tickets" -ForegroundColor Cyan
Write-Host "  - Ted: 5 tickets" -ForegroundColor Cyan
Write-Host "  - Sam: 5 tickets" -ForegroundColor Cyan

