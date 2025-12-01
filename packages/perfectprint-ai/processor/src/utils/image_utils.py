"""
Image utility functions
"""

import base64
import io
from PIL import Image
from typing import Union

def encode_image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """
    Convert PIL Image to base64 string
    
    Args:
        image: PIL Image object
        format: Image format (PNG, JPEG, etc.)
        
    Returns:
        Base64 encoded string
    """
    buffered = io.BytesIO()
    image.save(buffered, format=format)
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    return f"data:image/{format.lower()};base64,{img_base64}"

def decode_base64_to_image(base64_string: str) -> Image.Image:
    """
    Convert base64 string to PIL Image
    
    Args:
        base64_string: Base64 encoded image string
        
    Returns:
        PIL Image object
    """
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64
    img_bytes = base64.b64decode(base64_string)
    
    # Convert to PIL Image
    image = Image.open(io.BytesIO(img_bytes))
    
    return image

def resize_image(image: Image.Image, max_width: int = 2048, max_height: int = 2048) -> Image.Image:
    """
    Resize image if it exceeds max dimensions (maintains aspect ratio)
    
    Args:
        image: PIL Image object
        max_width: Maximum width
        max_height: Maximum height
        
    Returns:
        Resized PIL Image object
    """
    width, height = image.size
    
    if width <= max_width and height <= max_height:
        return image
    
    # Calculate scaling factor
    scale = min(max_width / width, max_height / height)
    
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

def get_image_info(image: Image.Image) -> dict:
    """
    Get information about an image
    
    Args:
        image: PIL Image object
        
    Returns:
        Dictionary with image info
    """
    return {
        "size": image.size,
        "width": image.size[0],
        "height": image.size[1],
        "mode": image.mode,
        "format": image.format,
        "has_transparency": image.mode in ('RGBA', 'LA', 'P')
    }

