"""
Test script for AI Upscaling with Real-ESRGAN

This tests the ability to fix pixelated/low-resolution images
using AI-powered upscaling.
"""

import asyncio
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import time

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from services.upscaler import UpscalerService
from utils.logger import logger


def create_pixelated_test_image(size=(200, 200)) -> Image.Image:
    """
    Create a test image that looks pixelated
    (simulating a low-res customer upload)
    """
    # Create a small image
    small = Image.new('RGB', (50, 50), color='white')
    draw = ImageDraw.Draw(small)
    
    # Draw some shapes (will look pixelated when enlarged)
    draw.rectangle([10, 10, 40, 40], fill='#3B82F6', outline='#1E40AF', width=2)
    draw.ellipse([15, 15, 35, 35], fill='#10B981', outline='#059669', width=1)
    
    # Add some text (will be very pixelated)
    draw.text((25, 25), "AI", fill='white', anchor='mm')
    
    # Enlarge to make it pixelated (simulating low-res upload)
    pixelated = small.resize(size, Image.Resampling.NEAREST)  # NEAREST = pixelated
    
    return pixelated


async def test_upscaling():
    """Test the upscaling service"""
    
    logger.info("=" * 60)
    logger.info("🎨 PERFECTPRINT AI - AI UPSCALING TEST")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Testing Real-ESRGAN for fixing pixelated images")
    logger.info("")
    
    # Create output directory
    output_dir = Path("test_outputs")
    output_dir.mkdir(exist_ok=True)
    
    # Create pixelated test image
    logger.info("📸 Creating pixelated test image...")
    pixelated_image = create_pixelated_test_image((400, 400))
    logger.info(f"   Size: {pixelated_image.size}")
    logger.info(f"   Mode: {pixelated_image.mode}")
    logger.info("")
    
    # Save pixelated image
    pixelated_path = output_dir / "01_pixelated.png"
    pixelated_image.save(pixelated_path)
    logger.info(f"💾 Saved pixelated image: {pixelated_path}")
    logger.info("")
    
    # Initialize upscaler
    logger.info("🚀 Starting AI upscaling...")
    logger.info("   (First run will download Real-ESRGAN model ~17MB)")
    logger.info("")
    
    try:
        service = UpscalerService()
        
        # Test upscaling
        logger.info("📦 Upscaling with Real-ESRGAN...")
        start_time = time.time()
        
        # Upscale to 1600x1600 (4x larger)
        upscaled_image = await service.upscale(
            pixelated_image,
            target_dpi=300,
            max_dimension=1600
        )
        
        process_time = time.time() - start_time
        logger.info(f"   Upscaled in {process_time:.2f}s")
        logger.info("")
        
        # Save upscaled image
        logger.info("✅ AI upscaling complete!")
        logger.info(f"   Result size: {upscaled_image.size}")
        logger.info(f"   Result mode: {upscaled_image.mode}")
        logger.info("")
        
        upscaled_path = output_dir / "02_upscaled_ai.png"
        upscaled_image.save(upscaled_path)
        logger.info(f"💾 Saved upscaled image: {upscaled_path}")
        logger.info("")
        
        # Create comparison (side by side)
        logger.info("📊 Creating comparison image...")
        
        # Resize pixelated to same size for fair comparison
        pixelated_large = pixelated_image.resize(
            upscaled_image.size, 
            Image.Resampling.NEAREST
        )
        
        comparison = Image.new(
            'RGB',
            (upscaled_image.width * 2 + 20, upscaled_image.height),
            color='white'
        )
        comparison.paste(pixelated_large, (0, 0))
        comparison.paste(upscaled_image, (upscaled_image.width + 20, 0))
        
        # Add labels
        draw = ImageDraw.Draw(comparison)
        draw.text((100, 20), "BEFORE (Pixelated)", fill='red', anchor='mm')
        draw.text((upscaled_image.width + 120, 20), "AFTER (AI Fixed)", fill='green', anchor='mm')
        
        comparison_path = output_dir / "03_comparison.png"
        comparison.save(comparison_path)
        logger.info(f"💾 Saved comparison: {comparison_path}")
        logger.info("")
        
        # Get service info
        logger.info("📊 Service Information:")
        info = service.get_service_info()
        for key, value in info.items():
            logger.info(f"   {key}: {value}")
        logger.info("")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    logger.info("=" * 60)
    logger.info("✅ TEST COMPLETE!")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Check the 'test_outputs' folder for results:")
    logger.info(f"  1. {pixelated_path}")
    logger.info(f"  2. {upscaled_path}")
    logger.info(f"  3. {comparison_path}")
    logger.info("")
    logger.info("Compare the images to see how AI fixed the pixelation!")
    logger.info("")


if __name__ == "__main__":
    asyncio.run(test_upscaling())

