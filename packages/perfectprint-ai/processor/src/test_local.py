"""
Local testing script for PerfectPrint AI processor

Run this to test the processing pipeline locally without the full server
"""

import asyncio
from PIL import Image
import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(__file__))

from services.background import BackgroundRemovalService
from services.vectorizer import VectorizerService
from services.upscaler import UpscalerService
from utils.logger import logger


async def test_background_removal():
    """Test background removal service"""
    logger.info("=" * 60)
    logger.info("🧪 Testing Background Removal (BRIA-RMBG-2.0)")
    logger.info("=" * 60)
    
    service = BackgroundRemovalService()
    
    # Create a test image (red square on white background)
    test_image = Image.new('RGB', (500, 500), color='white')
    from PIL import ImageDraw
    draw = ImageDraw.Draw(test_image)
    draw.rectangle([100, 100, 400, 400], fill='red')
    
    logger.info("📸 Created test image: 500x500 with red square")
    
    # Remove background
    result = await service.remove_background(test_image)
    
    logger.info(f"✅ Result: {result.size}, mode: {result.mode}")
    logger.info(f"✅ Has transparency: {result.mode == 'RGBA'}")
    
    # Save result
    output_path = "test_output_background.png"
    result.save(output_path)
    logger.info(f"💾 Saved to: {output_path}")
    
    return True


async def test_vectorization():
    """Test vectorization service"""
    logger.info("=" * 60)
    logger.info("🧪 Testing Vectorization (VTracer)")
    logger.info("=" * 60)
    
    service = VectorizerService()
    
    # Create a test image (simple shape)
    test_image = Image.new('RGB', (300, 300), color='white')
    from PIL import ImageDraw
    draw = ImageDraw.Draw(test_image)
    draw.ellipse([50, 50, 250, 250], fill='blue', outline='black', width=5)
    
    logger.info("📸 Created test image: 300x300 with blue circle")
    
    # Vectorize
    svg_content = await service.vectorize(test_image)
    
    logger.info(f"✅ SVG generated: {len(svg_content)} characters")
    logger.info(f"✅ Contains <svg>: {'<svg' in svg_content}")
    
    # Save result
    output_path = "test_output_vector.svg"
    with open(output_path, 'w') as f:
        f.write(svg_content)
    logger.info(f"💾 Saved to: {output_path}")
    
    return True


async def test_upscaling():
    """Test upscaling service"""
    logger.info("=" * 60)
    logger.info("🧪 Testing Upscaling (Lanczos)")
    logger.info("=" * 60)
    
    service = UpscalerService()
    
    # Create a small test image
    test_image = Image.new('RGB', (200, 200), color='green')
    test_image.info['dpi'] = (72, 72)
    
    logger.info(f"📸 Created test image: {test_image.size} at 72 DPI")
    
    # Calculate print size before
    before_size = service.calculate_print_size(test_image, 72)
    logger.info(f"   Print size at 72 DPI: {before_size[0]:.2f}\" x {before_size[1]:.2f}\"")
    
    # Upscale
    result = await service.upscale(test_image, target_dpi=300)
    
    # Calculate print size after
    after_size = service.calculate_print_size(result, 300)
    logger.info(f"✅ Result: {result.size}")
    logger.info(f"✅ Print size at 300 DPI: {after_size[0]:.2f}\" x {after_size[1]:.2f}\"")
    
    # Save result
    output_path = "test_output_upscaled.png"
    result.save(output_path, dpi=(300, 300))
    logger.info(f"💾 Saved to: {output_path}")
    
    return True


async def test_full_pipeline():
    """Test the complete pipeline"""
    logger.info("=" * 60)
    logger.info("🧪 Testing FULL PIPELINE")
    logger.info("=" * 60)
    
    # Create test image
    test_image = Image.new('RGB', (400, 400), color='white')
    from PIL import ImageDraw
    draw = ImageDraw.Draw(test_image)
    draw.rectangle([100, 100, 300, 300], fill='purple', outline='black', width=3)
    test_image.info['dpi'] = (72, 72)
    
    logger.info(f"📸 Created test image: {test_image.size} at 72 DPI")
    
    # Step 1: Upscale
    upscaler = UpscalerService()
    upscaled = await upscaler.upscale(test_image, target_dpi=300)
    logger.info(f"✅ Step 1 complete: Upscaled to {upscaled.size}")
    
    # Step 2: Remove background
    bg_remover = BackgroundRemovalService()
    no_bg = await bg_remover.remove_background(upscaled)
    logger.info(f"✅ Step 2 complete: Background removed ({no_bg.mode})")
    
    # Step 3: Vectorize
    vectorizer = VectorizerService()
    svg = await vectorizer.vectorize(no_bg)
    logger.info(f"✅ Step 3 complete: Vectorized ({len(svg)} chars)")
    
    # Save results
    no_bg.save("test_output_final.png", dpi=(300, 300))
    with open("test_output_final.svg", 'w') as f:
        f.write(svg)
    
    logger.info("💾 Saved final results:")
    logger.info("   - test_output_final.png")
    logger.info("   - test_output_final.svg")
    
    return True


async def main():
    """Run all tests"""
    logger.info("\n" + "🚀 " * 20)
    logger.info("PERFECTPRINT AI - LOCAL TESTING")
    logger.info("🚀 " * 20 + "\n")
    
    tests = [
        ("Background Removal", test_background_removal),
        ("Vectorization", test_vectorization),
        ("Upscaling", test_upscaling),
        ("Full Pipeline", test_full_pipeline)
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = await test_func()
            results.append((name, "✅ PASS" if result else "❌ FAIL"))
            logger.info("")
        except Exception as e:
            logger.error(f"❌ {name} failed: {str(e)}")
            results.append((name, f"❌ ERROR: {str(e)}"))
            logger.info("")
    
    # Summary
    logger.info("=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    for name, result in results:
        logger.info(f"{result:12} {name}")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

