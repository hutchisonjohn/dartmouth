# 🎨 PerfectPrint AI - Frontend

**React + Vite + TypeScript + Tailwind CSS**

Beautiful UI for artwork processing with before/after slider comparison.

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
npm install
```

### **2. Configure Environment**

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8787
```

### **3. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Features

### **✅ File Upload**
- Drag & drop interface
- File type validation (PNG, JPG, WEBP)
- Size limit (10MB)
- Progress indicator

### **✅ Processing Options**
- Background removal (BRIA-RMBG-2.0)
- Image upscaling (Lanczos)
- Vectorization (VTracer)

### **✅ Before/After Slider**
- Interactive comparison slider
- Smooth drag interaction
- Visual labels

### **✅ Download Results**
- PNG download
- SVG download (if vectorized)
- Processing metrics
- File information

---

## 🎨 UI Components

```
src/
├── components/
│   ├── FileUpload.tsx           ← Drag & drop upload
│   ├── ProcessingOptions.tsx    ← Options selector
│   ├── ImageComparison.tsx      ← Before/After slider
│   └── DownloadResults.tsx      ← Download buttons
├── pages/
│   └── ProcessPage.tsx          ← Main page
├── api/
│   └── client.ts                ← API calls
└── types/
    └── index.ts                 ← TypeScript types
```

---

## 🔌 API Integration

Connects to Cloudflare Worker API:

- `POST /api/upload` - Upload file
- `POST /api/process` - Process image
- `GET /api/status/:jobId` - Check status

---

## 🎯 User Flow

1. **Upload** - Drag & drop artwork
2. **Configure** - Select processing options
3. **Process** - Wait 30-60 seconds
4. **Compare** - Use slider to see before/after
5. **Download** - Get PNG and/or SVG

---

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling (matching Tailwind UI)
- **react-dropzone** - File upload
- **react-compare-slider** - Before/After slider
- **react-router** - Routing

---

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)

---

## 🚀 Build for Production

```bash
npm run build
```

Output in `dist/` folder.

---

## 🎨 Styling

Uses **Tailwind CSS 4** with consistent design system:

- Colors: Blue (primary), Green (success), Red (error)
- Spacing: 4px base unit
- Rounded corners: 8px
- Shadows: Subtle elevation

**Matches Tailwind UI design patterns!**

---

## 🧪 Testing Locally

1. Start API: `cd ../api && npm run dev`
2. Start Frontend: `npm run dev`
3. Upload test image
4. Process and compare!

---

## 📊 Performance

- **Initial Load:** < 1s
- **Upload:** < 2s (10MB file)
- **Processing:** 30-60s (server-side)
- **Download:** Instant

---

**Status:** ✅ Complete!  
**Next:** Deploy to Cloudflare Pages

