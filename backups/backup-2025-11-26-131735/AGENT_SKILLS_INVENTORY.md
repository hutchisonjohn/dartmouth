# 🤖 DARTMOUTH OS - AGENT SKILLS INVENTORY

**Date:** 2025-11-22  
**Purpose:** Define all agents and their specialized skills  
**Architecture:** Every Agent = FAM + Specialized Skills

---

## 🧠 **FOUNDATIONAL AGENT MCCARTHY (FAM)**

**Base capabilities ALL agents inherit:**
- ✅ Conversational intelligence
- ✅ Intent detection
- ✅ Memory system (remember context)
- ✅ RAG (knowledge base search)
- ✅ LLM integration (GPT-4)
- ✅ Error handling
- ✅ Response validation
- ✅ Multi-turn conversations

**Every agent below = FAM + Additional Skills**

---

## 🤖 **UNIVERSAL AGENTS (Any Business/Person)**

### **1. McCarthy PA Agent** 🤖
**Extends:** FAM  
**Specialized Skills:**
- Task management (create, update, complete, list)
- Calendar integration (Google Calendar)
- Reminder system (time-based, location-based)
- Note-taking (create, search, organize)
- Shopping lists (add, remove, check off)
- Voice input/output (STT, TTS)
- Family coordination (multi-user)
- Context awareness (knows your schedule, preferences)

**Use Cases:**
- "Remind me to pick up kids at 3pm"
- "What's on my calendar tomorrow?"
- "Add milk to shopping list"
- "Create task: Call dentist"

---

### **2. McCarthy Sales Agent** 💰 (NEW!)
**Extends:** FAM  
**Specialized Skills:**
- Pricing Intelligence
  - Calculate product prices from catalog
  - Apply volume discounts, tiered pricing, regional pricing
  - Calculate tax/GST based on customer location
  - Apply coupon/promotion codes
  - Explain pricing breakdown
  - Handle price objections
- Sales Strategy & Recommendations
  - Upsell recommendations (suggest premium options)
  - Cross-sell suggestions (frequently bought together)
  - Bundle deals (package discounts)
  - Product alternatives
  - Increase order value intelligently
- Quote Builder
  - Structure quotes (line items, quantities, pricing)
  - Calculate subtotal, tax, total
  - Add payment terms (Net 30, 50% deposit, etc.)
  - Set validity period (quote expires in X days)
  - Generate PDF quotes (using jsPDF)
  - Email quotes to customers
- Customer Qualification
  - Ask discovery questions (What do you need? When? Budget?)
  - Conditional logic (if they say X, ask Y)
  - Understand needs, budget, timeline
  - Identify urgency/intent (hot lead vs browsing)
  - Customer segmentation (tag as wholesale, retail, etc.)
  - Lead qualification scoring
- Negotiation (within business rules)
  - Handle objections ("Too expensive", "Need it faster")
  - Offer alternatives to close sale
  - Know when to escalate to human
  - Stay within guardrails (never discount below X%)
  - Suggest payment plans/options
  - Create urgency (limited time offer, stock running low)

**Knowledge Domains:**
- `products` (read) - Product catalog from Shopify
- `pricing` (read) - Pricing rules, discounts
- `policies` (read) - Business policies, payment terms

**Integrations:**
- ShopifyIntegrationService (products, pricing, inventory)
- RAGEngine (multi-domain knowledge search)
- EmailService (send quotes)
- AgentRouter (seamless agent handoff)

**Use Cases:**
- "How much for 100 custom t-shirts?"
- "Quote for 50 tumblers with custom wrap + 100 stickers"
- "Can you give me a discount if I order 200?"
- "I need this by Friday, is that possible?"
- "What's the best deal you can offer?"

**Agent Collaboration:**
- ANY agent can route pricing questions to Sales Agent
- Sales Agent can route technical questions to other agents
- Seamless handoffs preserve conversation context

---

### **3. Customer Service Agent** 📞
**Extends:** FAM  
**Specialized Skills:**
- Ticket creation (from chat, email, phone)
- FAQ answering (knowledge base search)
- Escalation logic (when to escalate to human)
- Multi-channel support (chat, email, phone)
- Customer history (remember past interactions)
- Sentiment analysis (detect frustrated customers)
- Canned responses (quick replies)
- Integration with helpdesk (Zendesk, Intercom)

**Use Cases:**
- "Where is my order?"
- "I need to return this product"
- "How do I use this feature?"
- "I'm not happy with the service"

---

### **4. Research Agent** 🔍
**Extends:** FAM  
**Specialized Skills:**
- Web scraping (extract data from websites)
- Company research (find company info, size, industry)
- Contact finding (emails, phone numbers, LinkedIn)
- LinkedIn scraping (profiles, company pages)
- Data enrichment (add missing data)
- List building (create prospect lists)
- Export data (CSV, JSON, Excel)
- Verify data (check email validity, phone numbers)

**Use Cases:**
- "Find all printing companies in Sunshine Coast"
- "Get contact details for marketing managers"
- "Research competitors in my industry"
- "Find companies with 10-50 employees in tech"

---

### **5. Copywriter Agent** ✍️
**Extends:** FAM  
**Specialized Skills:**
- Email copywriting (cold emails, newsletters, follow-ups)
- Ad copywriting (Facebook, Google, LinkedIn ads)
- Product descriptions (e-commerce, catalogs)
- Blog posts (SEO-optimized, engaging)
- Social media captions (platform-specific)
- Landing page copy (conversion-focused)
- Personalization (use prospect data)
- Brand voice matching (maintain consistency)
- Multiple variations (A/B testing)
- Tone adjustment (professional, casual, friendly)

**Use Cases:**
- "Write a cold email about our printing services"
- "Create 3 Facebook ad variations"
- "Write product description for UV DTF stickers"
- "Draft newsletter about new products"

---

### **6. Cold Outreach Agent** 📧
**Extends:** FAM  
**Specialized Skills:**
- Email sending (SMTP, Gmail API, SendGrid)
- Personalization (merge fields, dynamic content)
- Scheduling (send at optimal times)
- Follow-up sequences (automated drip campaigns)
- Open/click tracking (monitor engagement)
- Reply detection (identify responses)
- Bounce handling (remove invalid emails)
- Unsubscribe management (compliance)
- CRM integration (sync with Salesforce, HubSpot)
- Rate limiting (avoid spam filters)
- A/B testing (test subject lines, content)

**Use Cases:**
- "Send cold emails to 50 companies per day"
- "Follow up with non-responders after 3 days"
- "Track who opened and clicked"
- "Stop campaign when someone replies"

---

### **7. Content Creator Agent** 📝
**Extends:** FAM  
**Specialized Skills:**
- Blog post writing (long-form, SEO)
- Social media posts (platform-specific)
- Image generation (DALL-E, Midjourney, Stable Diffusion)
- Image editing (resize, crop, filters)
- Graphic design (templates, layouts)
- Video scripts (YouTube, TikTok, Reels)
- Infographics (data visualization)
- Multi-format output (text, images, video scripts)
- Content calendar (plan ahead)
- Hashtag suggestions (trending, relevant)

**Use Cases:**
- "Create a blog post about UV DTF printing"
- "Generate 5 Instagram posts for this week"
- "Create infographic about our services"
- "Write YouTube script about print quality"

---

### **8. Social Media Publisher Agent** 📱
**Extends:** FAM  
**Specialized Skills:**
- Platform APIs (Facebook, Instagram, LinkedIn, Twitter, TikTok)
- Post scheduling (optimal times, time zones)
- Multi-platform posting (post to all at once)
- Image/video upload (format optimization)
- Hashtag management (add relevant hashtags)
- Caption formatting (platform-specific)
- First comment posting (engagement boost)
- Story posting (Instagram, Facebook)
- Analytics tracking (engagement, reach, clicks)
- Response monitoring (comments, DMs)
- Content approval workflow (review before posting)

**Use Cases:**
- "Post this to Instagram and Facebook at 9am tomorrow"
- "Schedule 10 posts across all platforms this week"
- "Monitor comments and notify me of questions"
- "Show me engagement stats for last month"

---

## 🎨 **PRINTING INDUSTRY AGENTS (Specialized)**

### **9. Artwork Analyser Agent** 🎨
**Extends:** FAM  
**Specialized Skills:**
- Image analysis (dimensions, DPI, format)
- DPI calculation (at different print sizes)
- Print quality assessment (optimal, good, low)
- File format validation (PNG, JPG, PDF, AI, EPS)
- Color analysis (RGB, CMYK, palette extraction)
- Transparency detection (alpha channel)
- UV DTF requirements check (text size, line thickness)
- DTF requirements check (DPI, colors, format)
- Print size recommendations (based on DPI)
- Issue reporting (what needs fixing)
- Suggest PerfectPrint AI (when fixes needed)

**Use Cases:**
- "Analyze this artwork for printing"
- "What DPI will this be at 30x40cm?"
- "Is this suitable for UV DTF?"
- "What issues does this artwork have?"

---

### **10. PerfectPrint AI Agent** 🖨️
**Extends:** FAM  
**Specialized Skills:**
- Image upscaling (AI-based, preserve quality)
- Background removal (AI-based, precise)
- Vectorization (convert raster to vector)
- Color separation (CMYK, spot colors)
- Halftone conversion (screen printing)
- Format conversion (PNG, JPG, PDF, AI, EPS, SVG)
- DPI optimization (upscale to 300 DPI)
- Transparency handling (flatten or preserve)
- Print-ready export (correct format, DPI, color space)
- Batch processing (multiple files at once)
- Quality preview (before/after comparison)

**Use Cases:**
- "Upscale this image to 300 DPI"
- "Remove background from this logo"
- "Convert this to vector format"
- "Prepare this for screen printing"

---

### **11. CreativeStudio AI Agent** 🎨
**Extends:** FAM  
**Specialized Skills:**
- Pattern generation (seamless, tileable)
- Wrap creation (300 DPI, product-specific)
- Mockup generation (realistic product previews)
- DREA (Design Reverse-Engineering Agent)
  - Analyze existing designs
  - Extract motifs, colors, patterns
  - Generate similar but unique versions
- QC engine (quality control, originality check)
- Customer personalization (add names, text, images)
- Multi-product support (tumblers, apparel, packaging)
- Template library (pre-made designs)
- Brand consistency (maintain style)

**Use Cases:**
- "Create a seamless pattern for tumblers"
- "Generate mockup of this design on a t-shirt"
- "Analyze this design and create 5 variations"
- "Create personalized version with customer name"

---

### **12. AdFusion AI Agent** 📢
**Extends:** FAM  
**Specialized Skills:**
- Ad analysis (visual + copy)
  - Scene understanding (Qwen-VL)
  - Copy framework detection (AIDA, PAS, PASTOR)
  - Emotional analysis (persuasion triggers)
  - Brand voice extraction
- Creative generation
  - Multi-format ads (Facebook, Instagram, Google, LinkedIn)
  - A/B test variations (test different hooks)
  - Platform optimization (safe zones, dimensions)
- Psychology-based copywriting
  - Scarcity, urgency, social proof
  - Emotional triggers
  - Audience segmentation
- Performance prediction (estimate CTR, conversions)
- Brand consistency (match existing style)
- Compliance checking (platform policies)

**Use Cases:**
- "Analyze our top-performing ads"
- "Create 10 Facebook ad variations"
- "Generate ads for different audience segments"
- "Predict which ad will perform best"

---

## 🔧 **SHARED SERVICES (Used by Multiple Agents)**

These are NOT agents, but services agents use:

### **Image Processing Service** 🎨
**Used by:** PerfectPrint, Artwork Analyser, CreativeStudio, Content Creator, Social Media Publisher
- Background removal
- Scaling/upscaling
- Vectorization
- Format conversion
- Optimization
- Cropping, resizing
- Filters, effects

### **Vision/Analysis Service** 👁️
**Used by:** AdFusion, CreativeStudio, Artwork Analyser, Content Creator
- Image analysis (Qwen-VL, CLIP)
- OCR (text extraction)
- Object detection
- Style analysis
- Color palette extraction
- Composition analysis

### **Content Generation Service** ✍️
**Used by:** Copywriter, AdFusion, Content Creator, Cold Outreach, Social Media Publisher
- Text generation (GPT-4)
- Templates
- Brand voice
- Personalization
- Tone adjustment

### **Research/Scraping Service** 🔍
**Used by:** Research Agent, Cold Outreach
- Web scraping
- LinkedIn scraping
- Company data
- Contact finding
- Data enrichment

### **Email/Outreach Service** 📧
**Used by:** Cold Outreach, Customer Service, PA Agent
- Email sending
- Tracking
- Personalization
- Follow-ups
- Bounce handling

### **Social Media Service** 📱
**Used by:** Social Media Publisher, AdFusion, Content Creator
- Platform APIs
- Scheduling
- Publishing
- Analytics
- Monitoring

---

## 🔄 **WORKFLOW EXAMPLE:**

### **Cold Outreach (Sunshine Coast)**

**User Input:**
```
Find all companies in Sunshine Coast, write email about our printed 
workwear services, get approval, send 50/day, track responses, 
notify sales team, update dashboard.
```

**Dartmouth OS Orchestrates:**

```
Step 1: Research Agent
├── Skill: Web scraping + Company research + Contact finding
├── Input: { location: "Sunshine Coast", industry: "any" }
├── Output: List of 500 companies with contacts
└── Pass to: Copywriter Agent

Step 2: Copywriter Agent
├── Skill: Email copywriting + Personalization
├── Input: { companies: [500 companies], service: "printed workwear" }
├── Output: Personalized email for each company
└── Pass to: USER for approval

Step 3: USER Approval
├── Reviews email template
├── Makes edits if needed
└── Approves

Step 4: Cold Outreach Agent
├── Skill: Email sending + Scheduling + Tracking
├── Input: { emails: [500 emails], rate: 50/day }
├── Action: Send 50 emails per day
├── Track: Opens, clicks, replies
└── Pass responses to: Sales Team Notification

Step 5: Customer Service Agent (monitors replies)
├── Skill: Reply detection + Ticket creation
├── Input: { replies: [incoming emails] }
├── Action: Create ticket for each reply
└── Notify: Sales team

Step 6: Dashboard Update
├── Show: Progress (250/500 sent)
├── Show: Stats (25 opens, 5 clicks, 2 replies)
└── Show: Status (In Progress / Complete)
```

---

## ✅ **SUMMARY:**

### **12 Defined Agents:**
1. ✅ McCarthy PA Agent (personal assistant)
2. ✅ **McCarthy Sales Agent** 💰 (pricing, quotes, sales intelligence) - **NEW!**
3. ✅ Customer Service Agent (support)
4. ✅ Research Agent (data gathering)
5. ✅ Copywriter Agent (content writing)
6. ✅ Cold Outreach Agent (email campaigns)
7. ✅ Content Creator Agent (multi-format content)
8. ✅ Social Media Publisher (posting & analytics)
9. ✅ Artwork Analyser Agent (print analysis)
10. ✅ PerfectPrint AI Agent (image processing)
11. ✅ CreativeStudio AI Agent (design automation)
12. ✅ AdFusion AI Agent (ad intelligence)

### **6 Shared Services:**
1. Image Processing
2. Vision/Analysis
3. Content Generation
4. Research/Scraping
5. Email/Outreach
6. Social Media

### **Workflow Engine:**
- User creates workflows (natural language)
- Dartmouth OS orchestrates agents
- Agents use their specialized skills
- Data flows between agents
- User gets results

---

**Next:** Build the agents + services + workflow engine! 🚀

