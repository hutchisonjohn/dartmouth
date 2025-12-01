# 🔌 PerfectPrint AI - API Layer

**Cloudflare Worker API for PerfectPrint AI**

---

## 🎯 What This Does

Handles API requests between the frontend and Python processor:

1. **Upload:** Receive image files from frontend
2. **Store:** Save to R2 storage
3. **Process:** Trigger Python processor (Google Cloud Run)
4. **Track:** Store job status in D1 database
5. **Return:** Send results back to frontend

---

## 📦 Structure

```
api/
├── src/
│   ├── index.ts           ← Main Hono app
│   ├── routes/
│   │   ├── upload.ts      ← File upload endpoint
│   │   ├── process.ts     ← Process image endpoint
│   │   └── status.ts      ← Job status endpoint
│   ├── services/
│   │   ├── r2.ts          ← R2 storage operations
│   │   ├── database.ts    ← D1 database operations
│   │   └── processor.ts   ← Call Python processor
│   └── types/
│       └── index.ts       ← TypeScript types
├── package.json
├── wrangler.toml          ← Cloudflare config
└── README.md              ← This file
```

---

## 🔗 API Endpoints

### **POST /api/upload**
Upload an image file

**Request:**
```typescript
FormData {
  file: File
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc123",
  "fileUrl": "https://r2.../original.png"
}
```

### **POST /api/process**
Process an uploaded image

**Request:**
```json
{
  "jobId": "abc123",
  "options": {
    "removeBackground": true,
    "upscale": false,
    "vectorize": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "processing"
}
```

### **GET /api/status/:jobId**
Check job status

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "abc123",
    "status": "completed",
    "results": {
      "original": "https://r2.../original.png",
      "processed": "https://r2.../processed.png",
      "svg": "https://r2.../processed.svg"
    },
    "metrics": {
      "processingTime": 7.2
    }
  }
}
```

---

## 🛠️ Setup

### **1. Install Dependencies**

```bash
cd packages/perfectprint-ai/api
npm install
```

### **2. Configure Cloudflare**

Edit `wrangler.toml`:
```toml
name = "perfectprint-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "PERFECTPRINT_STORAGE"
bucket_name = "perfectprint-files"

[[d1_databases]]
binding = "DB"
database_name = "perfectprint-db"
database_id = "your-database-id"

[vars]
PROCESSOR_URL = "https://your-cloud-run-url.run.app"
```

### **3. Create R2 Bucket**

```bash
npx wrangler r2 bucket create perfectprint-files
```

### **4. Create D1 Database**

```bash
npx wrangler d1 create perfectprint-db
```

### **5. Run Migrations**

```bash
npx wrangler d1 execute perfectprint-db --file=./migrations/001_initial.sql
```

---

## 🧪 Testing

### **Local Development**

```bash
npm run dev
```

Server runs on `http://localhost:8787`

### **Test Upload**

```bash
curl -X POST http://localhost:8787/api/upload \
  -F "file=@test-image.png"
```

---

## 🚀 Deployment

```bash
npm run deploy
```

---

## 💰 Cost

**Cloudflare Workers (Free Tier):**
- 100,000 requests/day FREE
- R2: 10GB storage FREE
- D1: 5GB storage FREE

**Total:** $0/month for MVP! 🎉

---

## 🔐 Security

- ✅ File type validation
- ✅ File size limits (10MB max)
- ✅ CORS configured
- ✅ Rate limiting
- ✅ Authentication (optional)

---

**Status:** In Development  
**Next:** Build endpoints

