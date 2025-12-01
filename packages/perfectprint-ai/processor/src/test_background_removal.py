"""
Simple test for Background Removal (BRIA-RMBG-2.0)
This is the MVP - the most important feature!
"""

import asyncio
from PIL import Image, ImageDraw
import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(__file__))

# Set Hugging Face token
os.environ['HUGGING_FACE_HUB_TOKEN'] = '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'

from services.background import BackgroundRemovalService
from utils.logger import logger


async def test_background_removal():
    """Test background removal with a simple test image"""
    logger.info("=" * 60)
    logger.info("🎨 PERFECTPRINT AI - BACKGROUND REMOVAL TEST")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Testing BRIA-RMBG-2.0 (Best-in-class background removal)")
    logger.info("")
    
    # Create service
    service = BackgroundRemovalService()
    
    # Create a test image (red logo on white background)
    logger.info("📸 Creating test image...")
    test_image = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(test_image)
    
    # Draw a simple logo shape
    draw.ellipse([200, 150, 600, 450], fill='red', outline='darkred', width=5)
    draw.rectangle([350, 200, 450, 400], fill='white')
    draw.text((400, 300), "PP", fill='red', font=None, anchor="mm")
    
    logger.info(f"   Size: {test_image.size}")
    logger.info(f"   Mode: {test_image.mode}")
    logger.info("")
    
    # Save original
    output_dir = "test_outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    original_path = os.path.join(output_dir, "01_original.png")
    test_image.save(original_path)
    logger.info(f"💾 Saved original: {original_path}")
    logger.info("")
    
    # Remove background
    logger.info("🚀 Starting background removal...")
    logger.info("   (First run will download BRIA model ~2GB - be patient!)")
    logger.info("")
    
    result = await service.remove_background(test_image)
    
    logger.info("")
    logger.info("✅ Background removal complete!")
    logger.info(f"   Result size: {result.size}")
    logger.info(f"   Result mode: {result.mode}")
    logger.info(f"   Has transparency: {result.mode == 'RGBA'}")
    logger.info("")
    
    # Save result
    result_path = os.path.join(output_dir, "02_background_removed.png")
    result.save(result_path)
    logger.info(f"💾 Saved result: {result_path}")
    logger.info("")
    
    # Create a comparison image (side by side)
    comparison = Image.new('RGB', (1600, 600), color='white')
    comparison.paste(test_image, (0, 0))
    comparison.paste(result, (800, 0))
    
    # Add labels
    draw = ImageDraw.Draw(comparison)
    draw.text((400, 550), "ORIGINAL", fill='black', anchor="mm")
    draw.text((1200, 550), "BACKGROUND REMOVED", fill='black', anchor="mm")
    
    comparison_path = os.path.join(output_dir, "03_comparison.png")
    comparison.save(comparison_path)
    logger.info(f"💾 Saved comparison: {comparison_path}")
    logger.info("")
    
    # Show model info
    model_info = service.get_model_info()
    logger.info("📊 Model Information:")
    for key, value in model_info.items():
        logger.info(f"   {key}: {value}")
    logger.info("")
    
    logger.info("=" * 60)
    logger.info("✅ TEST COMPLETE!")
    logger.info("=" * 60)
    logger.info("")
    logger.info(f"Check the '{output_dir}' folder for results:")
    logger.info(f"  1. {original_path}")
    logger.info(f"  2. {result_path}")
    logger.info(f"  3. {comparison_path}")
    logger.info("")
    
    return True


if __name__ == "__main__":
    asyncio.run(test_background_removal())

