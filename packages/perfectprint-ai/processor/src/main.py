"""
PerfectPrint AI - Processing Server
FastAPI server for image processing pipeline
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
from typing import Optional
import io
from PIL import Image

from services.background import BackgroundRemovalService
from services.vectorizer import VectorizerService
from services.upscaler import UpscalerService
from utils.logger import logger
from utils.image_utils import encode_image_to_base64, decode_base64_to_image

# Initialize FastAPI app
app = FastAPI(
    title="PerfectPrint AI Processor",
    description="Automated artwork preparation for DTF/UV DTF printing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (loaded once at startup)
background_service = BackgroundRemovalService()
vectorizer_service = VectorizerService()
upscaler_service = UpscalerService()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("🚀 Starting PerfectPrint AI Processor")
    logger.info("📦 Loading models...")
    
    # Models are lazy-loaded on first use
    # This keeps startup fast
    
    logger.info("✅ Server ready!")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "PerfectPrint AI Processor",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "process": "/process",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "background_removal": "ready",
            "vectorization": "ready",
            "upscaling": "ready"
        }
    }

@app.post("/process")
async def process_image(
    file: UploadFile = File(...),
    upscale: bool = Form(False),
    remove_background: bool = Form(True),
    vectorize: bool = Form(True)
):
    """
    Process an image through the PerfectPrint AI pipeline
    
    Args:
        file: Image file (PNG, JPG, etc.)
        upscale: Whether to upscale the image
        remove_background: Whether to remove background
        vectorize: Whether to vectorize the image
        
    Returns:
        JSON with processed images and metrics
    """
    try:
        start_time = time.time()
        metrics = {}
        
        logger.info(f"📥 Processing image: {file.filename}")
        logger.info(f"   Options: upscale={upscale}, remove_bg={remove_background}, vectorize={vectorize}")
        
        # Read uploaded file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        logger.info(f"   Original size: {image.size}")
        
        # Store original for comparison
        original_base64 = encode_image_to_base64(image)
        
        processed_image = image
        
        # Step 1: Upscaling (if requested)
        if upscale:
            step_start = time.time()
            logger.info("⬆️  Step 1: Upscaling...")
            processed_image = await upscaler_service.upscale(processed_image)
            metrics['upscale_time'] = round(time.time() - step_start, 2)
            logger.info(f"   ✅ Upscaled to {processed_image.size} in {metrics['upscale_time']}s")
        
        # Step 2: Background Removal (if requested)
        if remove_background:
            step_start = time.time()
            logger.info("🎨 Step 2: Removing background...")
            processed_image = await background_service.remove_background(processed_image)
            metrics['background_removal_time'] = round(time.time() - step_start, 2)
            logger.info(f"   ✅ Background removed in {metrics['background_removal_time']}s")
        
        # Convert processed image to base64
        processed_png_base64 = encode_image_to_base64(processed_image)
        
        # Step 3: Vectorization (if requested)
        svg_content = None
        if vectorize:
            step_start = time.time()
            logger.info("🎯 Step 3: Vectorizing...")
            svg_content = await vectorizer_service.vectorize(processed_image)
            metrics['vectorization_time'] = round(time.time() - step_start, 2)
            logger.info(f"   ✅ Vectorized in {metrics['vectorization_time']}s")
        
        # Calculate total time
        total_time = round(time.time() - start_time, 2)
        metrics['total_time'] = total_time
        
        logger.info(f"✅ Processing complete in {total_time}s")
        
        # Return results
        return JSONResponse({
            "success": True,
            "results": {
                "original": original_base64,
                "processed_png": processed_png_base64,
                "processed_svg": svg_content,
                "original_size": list(image.size),
                "processed_size": list(processed_image.size)
            },
            "metrics": metrics,
            "steps_completed": {
                "upscale": upscale,
                "remove_background": remove_background,
                "vectorize": vectorize
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-url")
async def process_image_url(
    url: str = Form(...),
    upscale: bool = Form(False),
    remove_background: bool = Form(True),
    vectorize: bool = Form(True)
):
    """
    Process an image from a URL
    
    Args:
        url: URL to the image
        upscale: Whether to upscale the image
        remove_background: Whether to remove background
        vectorize: Whether to vectorize the image
        
    Returns:
        JSON with processed images and metrics
    """
    try:
        import requests
        
        logger.info(f"📥 Downloading image from URL: {url}")
        
        # Download image
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(response.content))
        
        # Process using the same logic as file upload
        # (This would call the same processing functions)
        
        return {"success": True, "message": "URL processing not yet implemented"}
        
    except Exception as e:
        logger.error(f"❌ Error processing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (dev only)
        log_level="info"
    )

