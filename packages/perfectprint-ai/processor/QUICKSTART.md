# 🚀 Quick Start Guide - PerfectPrint AI Processor

Get the processor running in 5 minutes!

---

## ✅ Prerequisites

- Python 3.11+ installed
- pip installed
- (Optional) CUDA-capable GPU for faster processing

---

## 📦 Step 1: Install Dependencies

```bash
# Navigate to processor directory
cd packages/perfectprint-ai/processor

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Note:** First install will download ~2GB of models (BRIA-RMBG-2.0). This is one-time only!

---

## 🧪 Step 2: Test Locally (Recommended)

Run the test script to verify everything works:

```bash
# Run local tests
python src/test_local.py
```

**Expected output:**
```
🚀 PERFECTPRINT AI - LOCAL TESTING
🧪 Testing Background Removal (BRIA-RMBG-2.0)
📸 Created test image: 500x500 with red square
📦 Loading BRIA-RMBG-2.0 model...
✅ BRIA-RMBG-2.0 loaded in 3.2s
✅ Background removed in 2.1s
💾 Saved to: test_output_background.png

... (more tests)

📊 TEST SUMMARY
✅ PASS      Background Removal
✅ PASS      Vectorization
✅ PASS      Upscaling
✅ PASS      Full Pipeline
```

**Test outputs created:**
- `test_output_background.png` - Background removed
- `test_output_vector.svg` - Vectorized
- `test_output_upscaled.png` - Upscaled
- `test_output_final.png` - Full pipeline result
- `test_output_final.svg` - Full pipeline SVG

---

## 🌐 Step 3: Start the Server

```bash
# Start FastAPI server
python src/run_server.py
```

**Server will start on:** http://localhost:8000

**API documentation:** http://localhost:8000/docs (interactive Swagger UI)

---

## 📤 Step 4: Test the API

### Option A: Use the Swagger UI (Easiest)

1. Open http://localhost:8000/docs in your browser
2. Click on `POST /process`
3. Click "Try it out"
4. Upload an image file
5. Check the options you want (upscale, remove_background, vectorize)
6. Click "Execute"
7. See the results!

### Option B: Use cURL

```bash
# Test with an image file
curl -X POST http://localhost:8000/process \
  -F "file=@your-image.png" \
  -F "upscale=false" \
  -F "remove_background=true" \
  -F "vectorize=true"
```

### Option C: Use Python

```python
import requests

# Upload and process an image
with open('your-image.png', 'rb') as f:
    files = {'file': f}
    data = {
        'upscale': False,
        'remove_background': True,
        'vectorize': True
    }
    response = requests.post('http://localhost:8000/process', files=files, data=data)
    result = response.json()
    
print(result['metrics'])  # Processing times
# result['results']['processed_png'] contains base64 image
# result['results']['processed_svg'] contains SVG content
```

---

## 🎯 What Each Step Does

### **Background Removal (BRIA-RMBG-2.0)**
- Removes background from images
- 98% accuracy
- ~2-3 seconds
- Returns image with transparent background (RGBA)

### **Vectorization (VTracer)**
- Converts raster to vector (SVG)
- High quality, matches Adobe Illustrator
- ~1-3 seconds
- Perfect for logos and artwork

### **Upscaling (Lanczos)**
- Upscales images to 300 DPI
- High-quality resampling
- <1 second
- (Real-ESRGAN AI upscaling coming soon!)

---

## 🐛 Troubleshooting

### **"Module not found" errors**
```bash
# Make sure you're in the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### **"CUDA out of memory" errors**
```bash
# The processor will automatically fall back to CPU
# No action needed, just slower processing
```

### **"Model download failed"**
```bash
# Check internet connection
# Models are downloaded from Hugging Face on first run
# Total size: ~2GB
```

### **Port 8000 already in use**
```bash
# Change port in src/run_server.py
# Or kill the process using port 8000
```

---

## 📊 Performance Expectations

**On CPU (no GPU):**
- Background Removal: 5-8 seconds
- Vectorization: 1-3 seconds
- Upscaling: <1 second
- **Total: 6-12 seconds**

**On GPU (CUDA):**
- Background Removal: 2-3 seconds
- Vectorization: 1-3 seconds
- Upscaling: <1 second
- **Total: 3-7 seconds**

---

## 🎉 Next Steps

Once the processor is working locally:

1. **Deploy to Google Cloud Run** (see DEPLOYMENT.md)
2. **Connect to Cloudflare Worker API** (see ../api/README.md)
3. **Build the frontend UI** (see ../frontend/README.md)

---

## 💡 Tips

- **First run is slow** - Models are downloaded and cached
- **Subsequent runs are fast** - Models load from cache
- **Use GPU if available** - 2-3x faster processing
- **Test locally first** - Easier to debug than in production

---

**Need help?** Check the main README or API documentation!

