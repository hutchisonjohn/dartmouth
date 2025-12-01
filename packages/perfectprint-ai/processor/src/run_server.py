"""
Run the PerfectPrint AI processing server

Simple script to start the FastAPI server
"""

import uvicorn
import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("🚀 Starting PerfectPrint AI Processor")
    print("📍 Server will run on: http://localhost:8000")
    print("📖 API docs available at: http://localhost:8000/docs")
    print("")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

