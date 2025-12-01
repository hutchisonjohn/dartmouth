"""
Upscaling Service using Real-ESRGAN

Real-ESRGAN is the best open-source AI upscaling model.
- Excellent quality for print graphics
- 3-8 second processing time
- Released by Tencent ARC Lab
- License: BSD-3-Clause (commercial use allowed)

Source: https://github.com/xinntao/Real-ESRGAN
"""

from PIL import Image
import numpy as np
import time
import cv2
from typing import Optional, Tuple

from utils.logger import logger

# Try to import Real-ESRGAN
try:
    from realesrgan import RealESRGANer
    from realesrgan.archs.srvgg_arch import SRVGGNetCompact
    REALESRGAN_AVAILABLE = True
except ImportError:
    REALESRGAN_AVAILABLE = False
    logger.warning("⚠️  Real-ESRGAN not available. Using high-quality Lanczos resampling instead.")


class UpscalerService:
    """
    Service for upscaling images using Real-ESRGAN
    
    Real-ESRGAN provides AI-powered upscaling that:
    - Fixes pixelation and blur
    - Adds realistic detail
    - Perfect for low-res customer artwork
    """
    
    def __init__(self):
        """Initialize the upscaler service"""
        self.target_dpi = 300
        self.use_ai_upscaling = REALESRGAN_AVAILABLE
        self.upsampler = None
        
        if REALESRGAN_AVAILABLE:
            self._load_model()
        
    async def upscale(
        self, 
        image: Image.Image,
        target_dpi: Optional[int] = None,
        max_dimension: int = 4096
    ) -> Image.Image:
        """
        Upscale an image to target DPI
        
        Args:
            image: PIL Image object
            target_dpi: Target DPI (default: 300)
            max_dimension: Maximum width or height (safety limit)
            
        Returns:
            Upscaled PIL Image object
        """
        try:
            start_time = time.time()
            
            target_dpi = target_dpi or self.target_dpi
            
            # Calculate if upscaling is needed
            current_width, current_height = image.size
            
            # Assume 72 DPI if not specified (web standard)
            current_dpi = image.info.get('dpi', (72, 72))[0]
            
            # Calculate scale factor needed
            scale_factor = target_dpi / current_dpi
            
            # Only upscale if needed (don't downscale)
            if scale_factor <= 1.0:
                logger.info(f"   Image already at {current_dpi} DPI, no upscaling needed")
                return image
            
            # Calculate new dimensions
            new_width = int(current_width * scale_factor)
            new_height = int(current_height * scale_factor)
            
            # Apply safety limit
            if new_width > max_dimension or new_height > max_dimension:
                scale = min(max_dimension / new_width, max_dimension / new_height)
                new_width = int(new_width * scale)
                new_height = int(new_height * scale)
                logger.warning(f"⚠️  Limiting size to {new_width}x{new_height} (max: {max_dimension})")
            
            logger.info(f"   Upscaling from {current_width}x{current_height} to {new_width}x{new_height}")
            logger.info(f"   Scale factor: {scale_factor:.2f}x ({current_dpi} → {target_dpi} DPI)")
            
            # Use AI upscaling if available, otherwise high-quality resize
            if self.use_ai_upscaling:
                upscaled = await self._ai_upscale(image, new_width, new_height)
            else:
                upscaled = self._high_quality_resize(image, new_width, new_height)
            
            # Set DPI metadata
            upscaled.info['dpi'] = (target_dpi, target_dpi)
            
            process_time = time.time() - start_time
            logger.info(f"   Upscaled in {process_time:.2f}s")
            
            return upscaled
            
        except Exception as e:
            logger.error(f"❌ Upscaling failed: {str(e)}")
            return image  # Return original on failure
    
    def _high_quality_resize(
        self, 
        image: Image.Image, 
        width: int, 
        height: int
    ) -> Image.Image:
        """
        High-quality resize using Lanczos resampling
        
        Args:
            image: PIL Image object
            width: Target width
            height: Target height
            
        Returns:
            Resized PIL Image object
        """
        # Lanczos is the highest quality resampling filter
        return image.resize((width, height), Image.Resampling.LANCZOS)
    
    def _load_model(self):
        """Load Real-ESRGAN model"""
        try:
            logger.info("📦 Loading Real-ESRGAN model...")
            logger.info("   Using RealESRGAN_x4plus_anime_6B (lightweight, works on Python 3.14)")
            
            # Use lightweight model that doesn't need numba/basicsr
            model = SRVGGNetCompact(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_conv=32,
                upscale=4,
                act_type='prelu'
            )
            
            # Initialize upsampler with lightweight model
            self.upsampler = RealESRGANer(
                scale=4,
                model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-animevideov3.pth',
                model=model,
                tile=0,
                tile_pad=10,
                pre_pad=0,
                half=False
            )
            
            logger.info("✅ Real-ESRGAN model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load Real-ESRGAN: {str(e)}")
            logger.warning("   Falling back to Lanczos resampling")
            self.use_ai_upscaling = False
            self.upsampler = None
    
    async def _ai_upscale(
        self, 
        image: Image.Image, 
        width: int, 
        height: int
    ) -> Image.Image:
        """
        AI-powered upscaling using Real-ESRGAN
        
        This fixes pixelation, blur, and adds realistic detail!
        
        Args:
            image: PIL Image object
            width: Target width
            height: Target height
            
        Returns:
            Upscaled PIL Image object
        """
        if not self.upsampler:
            logger.warning("⚠️  Real-ESRGAN not available, using Lanczos resize")
            return self._high_quality_resize(image, width, height)
        
        try:
            logger.info("   Using AI upscaling (Real-ESRGAN) - Fixing pixelation...")
            
            # Convert PIL to OpenCV format
            img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Run Real-ESRGAN
            output, _ = self.upsampler.enhance(img_cv, outscale=4)
            
            # Convert back to PIL
            output_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
            upscaled = Image.fromarray(output_rgb)
            
            # Resize to exact target dimensions if needed
            if upscaled.size != (width, height):
                upscaled = upscaled.resize((width, height), Image.Resampling.LANCZOS)
            
            logger.info("   ✨ AI upscaling complete - Pixelation fixed!")
            return upscaled
            
        except Exception as e:
            logger.error(f"❌ AI upscaling failed: {str(e)}")
            logger.info("   Falling back to Lanczos resize")
            return self._high_quality_resize(image, width, height)
    
    def calculate_print_size(
        self, 
        image: Image.Image, 
        dpi: int = 300
    ) -> Tuple[float, float]:
        """
        Calculate print size in inches at given DPI
        
        Args:
            image: PIL Image object
            dpi: DPI to calculate for
            
        Returns:
            (width_inches, height_inches)
        """
        width_px, height_px = image.size
        width_inches = width_px / dpi
        height_inches = height_px / dpi
        return (width_inches, height_inches)
    
    def needs_upscaling(
        self, 
        image: Image.Image, 
        target_dpi: int = 300
    ) -> bool:
        """
        Check if an image needs upscaling
        
        Args:
            image: PIL Image object
            target_dpi: Target DPI
            
        Returns:
            True if upscaling is needed
        """
        current_dpi = image.info.get('dpi', (72, 72))[0]
        return current_dpi < target_dpi
    
    def get_service_info(self) -> dict:
        """
        Get information about the upscaler service
        
        Returns:
            Dictionary with service information
        """
        return {
            "upscaler": "Real-ESRGAN (planned) / Lanczos (current)",
            "current_method": "AI" if self.use_ai_upscaling else "High-quality resize",
            "target_dpi": self.target_dpi,
            "source": "https://github.com/xinntao/Real-ESRGAN",
            "license": "BSD-3-Clause",
            "typical_speed": "3-8 seconds (AI) / <1 second (Lanczos)"
        }


# Create a singleton instance
_upscaler_service_instance = None

def get_upscaler_service() -> UpscalerService:
    """
    Get or create the upscaler service singleton
    
    Returns:
        UpscalerService instance
    """
    global _upscaler_service_instance
    if _upscaler_service_instance is None:
        _upscaler_service_instance = UpscalerService()
    return _upscaler_service_instance

