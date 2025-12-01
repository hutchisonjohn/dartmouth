#!/bin/bash
# ============================================================================
# Dartmouth Agent Army - Deployment Script
# ============================================================================
# This script automates the deployment process to Cloudflare Workers
# Run from packages/worker directory: ./deploy.sh

set -e  # Exit on error

echo "🚀 Dartmouth Agent Army - Deployment Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: wrangler.toml not found${NC}"
    echo "Please run this script from packages/worker directory"
    exit 1
fi

# Step 1: Check authentication
echo -e "${BLUE}Step 1: Checking Cloudflare authentication...${NC}"
if npx wrangler whoami > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Already authenticated${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated. Running login...${NC}"
    npx wrangler login
fi
echo ""

# Step 2: TypeScript check
echo -e "${BLUE}Step 2: Running TypeScript check...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found. Please fix before deploying.${NC}"
    npm run lint
    exit 1
fi
echo ""

# Step 3: Check if database exists
echo -e "${BLUE}Step 3: Checking D1 database...${NC}"
if npx wrangler d1 list | grep -q "agent-army-db"; then
    echo -e "${GREEN}✅ Database exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database not found. Please create it first:${NC}"
    echo "   npx wrangler d1 create agent-army-db"
    echo "   Then update database_id in wrangler.toml"
    exit 1
fi
echo ""

# Step 4: Check database_id in wrangler.toml
echo -e "${BLUE}Step 4: Checking database configuration...${NC}"
if grep -q 'database_id = ""' wrangler.toml; then
    echo -e "${RED}❌ database_id not set in wrangler.toml${NC}"
    echo "Please update database_id with the value from 'npx wrangler d1 list'"
    exit 1
else
    echo -e "${GREEN}✅ Database configured${NC}"
fi
echo ""

# Step 5: Check KV namespaces
echo -e "${BLUE}Step 5: Checking KV namespaces...${NC}"
if grep -q 'id = ""' wrangler.toml; then
    echo -e "${YELLOW}⚠️  KV namespace IDs not set in wrangler.toml${NC}"
    echo "Please create namespaces and update IDs:"
    echo "   npx wrangler kv:namespace create APP_CONFIG"
    echo "   npx wrangler kv:namespace create CACHE"
    exit 1
else
    echo -e "${GREEN}✅ KV namespaces configured${NC}"
fi
echo ""

# Step 6: Check secrets
echo -e "${BLUE}Step 6: Checking secrets...${NC}"
SECRET_COUNT=$(npx wrangler secret list 2>/dev/null | grep -c "ANTHROPIC_API_KEY\|OPENAI_API_KEY\|GOOGLE_API_KEY" || true)
if [ "$SECRET_COUNT" -lt 1 ]; then
    echo -e "${YELLOW}⚠️  API key secrets not set${NC}"
    echo "Please set at least one API key:"
    echo "   npx wrangler secret put ANTHROPIC_API_KEY"
    echo "   npx wrangler secret put OPENAI_API_KEY"
    echo "   npx wrangler secret put GOOGLE_API_KEY"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Secrets configured${NC}"
fi
echo ""

# Step 7: Deploy
echo -e "${BLUE}Step 7: Deploying to Cloudflare Workers...${NC}"
npx wrangler deploy
echo ""

# Step 8: Get worker URL
echo -e "${BLUE}Step 8: Getting worker URL...${NC}"
WORKER_URL=$(npx wrangler deployments list 2>/dev/null | grep -oP 'https://[^\s]+' | head -1 || echo "")
if [ -z "$WORKER_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not determine worker URL${NC}"
    echo "Check Cloudflare dashboard for your worker URL"
else
    echo -e "${GREEN}✅ Worker deployed at: ${WORKER_URL}${NC}"
fi
echo ""

# Step 9: Test deployment
echo -e "${BLUE}Step 9: Testing deployment...${NC}"
if [ -n "$WORKER_URL" ]; then
    echo "Testing health endpoint..."
    if curl -s "${WORKER_URL}/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed or returned unexpected response${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping health check (no worker URL)${NC}"
fi
echo ""

# Summary
echo "==========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test your endpoints:"
if [ -n "$WORKER_URL" ]; then
    echo "   curl ${WORKER_URL}/health"
    echo "   curl ${WORKER_URL}/"
    echo "   curl -X POST ${WORKER_URL}/test/chat -H 'Content-Type: application/json' -d '{\"message\":\"Hello!\"}'"
fi
echo ""
echo "2. Monitor logs:"
echo "   npx wrangler tail"
echo ""
echo "3. View dashboard:"
echo "   https://dash.cloudflare.com/"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"

