"""
PerfectPrint AI Services
"""

from .background import BackgroundRemovalService
from .upscaler import UpscalerService

# VTracer is optional (requires Rust to compile)
try:
    from .vectorizer import VectorizerService
    __all__ = ['BackgroundRemovalService', 'VectorizerService', 'UpscalerService']
except ImportError:
    __all__ = ['BackgroundRemovalService', 'UpscalerService']

