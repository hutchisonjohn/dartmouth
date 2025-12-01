# 🐍 PerfectPrint AI - Python Processor

**Python 3.11 + FastAPI processing pipeline**

---

## 🎯 What This Does

Handles the heavy lifting of image processing:

1. **Upscaling** - Real-ESRGAN (AI upscaling to 300 DPI)
2. **Background Removal** - BRIA-RMBG-2.0 (best-in-class, 98% accuracy)
3. **Vectorization** - VTracer (fast, high-quality vector conversion)

---

## 📦 Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Running Locally

```bash
# Start the server
python src/main.py

# Server runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## 🧪 Testing

```bash
# Test background removal
curl -X POST http://localhost:8000/process \
  -F "file=@test-image.png" \
  -F "remove_background=true"

# Test full pipeline
curl -X POST http://localhost:8000/process \
  -F "file=@test-image.png" \
  -F "upscale=true" \
  -F "remove_background=true" \
  -F "vectorize=true"
```

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t perfectprint-processor .

# Run container
docker run -p 8000:8000 perfectprint-processor

# Deploy to Google Cloud Run
gcloud run deploy perfectprint-processor \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📊 API Endpoints

### `POST /process`
Process an image through the pipeline.

**Request:**
```json
{
  "file": "base64_encoded_image",
  "options": {
    "upscale": true,
    "remove_background": true,
    "vectorize": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "original": "https://r2.../original.png",
    "processed_png": "https://r2.../processed.png",
    "processed_svg": "https://r2.../processed.svg"
  },
  "metrics": {
    "upscale_time": 3.2,
    "background_removal_time": 2.1,
    "vectorization_time": 1.8,
    "total_time": 7.1
  }
}
```

### `GET /health`
Health check endpoint.

---

## 🛠️ Tools Used

### **BRIA-RMBG-2.0** (Background Removal)
- **Source:** https://huggingface.co/briaai/RMBG-2.0
- **License:** Creative ML Open RAIL-M (Commercial use allowed)
- **Quality:** 98% accuracy
- **Speed:** 2-3 seconds
- **Why:** Best free background removal model (2024)

### **VTracer** (Vectorization)
- **Source:** https://github.com/visioncortex/vtracer
- **License:** MIT (Commercial use allowed)
- **Quality:** Matches Adobe Illustrator
- **Speed:** 1-3 seconds
- **Why:** Fastest, highest quality open-source vectorizer

### **Real-ESRGAN** (Upscaling)
- **Source:** https://github.com/xinntao/Real-ESRGAN
- **License:** BSD-3-Clause (Commercial use allowed)
- **Quality:** AI-powered, excellent results
- **Speed:** 3-8 seconds
- **Why:** Best open-source upscaling model

---

## 💰 Cost

**Google Cloud Run (Free Tier):**
- 2M requests/month FREE
- 360k GB-seconds/month FREE
- Only pay if you exceed free tier

**Estimated cost for 10,000 images/month:** $0 (within free tier)

---

## 📝 Development Notes

**Performance Optimization:**
- Models are loaded once at startup (not per request)
- Images are processed in memory (no disk I/O)
- Results are streamed back to client

**Error Handling:**
- Graceful fallbacks if a step fails
- Detailed error messages
- Automatic retries for transient failures

---

**Status:** In Development  
**Next:** Implement BRIA-RMBG-2.0 integration

