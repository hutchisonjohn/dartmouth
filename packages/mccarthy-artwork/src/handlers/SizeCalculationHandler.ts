/**
 * SizeCalculationHandler
 * 
 * Handles reverse DPI calculations when user specifies a size and wants to know the DPI.
 * 
 * Examples:
 * - "if my artwork is 26.6 × 24.0 cm what dpi is that?"
 * - "what dpi would I get at 30 × 25 cm?"
 * - "at 10 inches wide what's my dpi?"
 */

import type { Intent, Response, HandlerContext } from '../../../worker/src/types/shared';

export class SizeCalculationHandler {
  name = 'size-calculation';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    // FIXED 2025-11-25: Intent doesn't have originalMessage field
    // The IntentDetector already determined this is a 'calculation' intent
    // So we just need to check the intent type
    return intent.type === 'calculation';
  }

  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    const startTime = Date.now();
    
    try {
      console.log('[SizeCalculationHandler] CALLED - message:', message);
      console.log('[SizeCalculationHandler] CALLED - intent:', intent.type);
      
      // Use message parameter or fallback to intent.originalMessage
      const userMessage = message || intent.originalMessage || '';
      
      // DEBUG: Log what we're receiving
      console.log('[SizeCalculationHandler] DEBUG - context.state:', JSON.stringify(context.state?.metadata, null, 2));
      
      // Get artwork data from context
      const artworkData = context.state?.metadata?.artworkData;
      
      console.log('[SizeCalculationHandler] DEBUG - artworkData:', artworkData ? 'EXISTS' : 'NULL');
    
    if (!artworkData || !artworkData.dimensions?.pixels) {
      return {
        content: "I need artwork data to calculate DPI. Please upload an artwork first!",
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.8
        }
      };
    }

    // Check for MULTIPLE DPI values (e.g., "show me sizes for 300, 250, and 200 DPI")
    const multipleDPI = this.extractMultipleDPI(userMessage);
    if (multipleDPI) {
      let response = "Here are the maximum print sizes for each DPI:\n\n";
      
      for (const dpi of multipleDPI) {
        const widthInches = artworkData.dimensions.pixels.width / dpi;
        const heightInches = artworkData.dimensions.pixels.height / dpi;
        const widthCm = widthInches * 2.54;
        const heightCm = heightInches * 2.54;
        
        const qualityEmoji = dpi >= 250 ? '✨' : dpi >= 200 ? '👌' : '⚠️';
        const quality = dpi >= 250 ? 'Optimal' : dpi >= 200 ? 'Good' : 'Poor';
        
        response += `• **${dpi} DPI**: ${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}") ${qualityEmoji} **${quality}**\n`;
      }
      
      return {
        content: response.trim(),
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 1.0
        }
      };
    }

    // Check if this is a REVERSE calculation (DPI → size)
    const reverseCalc = this.extractReverseDPI(userMessage);
    if (reverseCalc) {
      // Calculate size from DPI
      const widthInches = artworkData.dimensions.pixels.width / reverseCalc.dpi;
      const heightInches = artworkData.dimensions.pixels.height / reverseCalc.dpi;
      const widthCm = widthInches * 2.54;
      const heightCm = heightInches * 2.54;
      
      const qualityEmoji = reverseCalc.dpi >= 250 ? '✨' : reverseCalc.dpi >= 200 ? '👌' : '⚠️';
      const quality = reverseCalc.dpi >= 250 ? 'Optimal' : reverseCalc.dpi >= 200 ? 'Good' : 'Poor';
      
      return {
        content: `At **${reverseCalc.dpi} DPI**, you can print up to **${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm** (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}"). ${qualityEmoji} **Quality: ${quality}**`,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 1.0
        }
      };
    }

    // Extract size from message (FORWARD calculation: size → DPI)
    const sizeInfo = this.extractSize(userMessage);
    
    if (!sizeInfo) {
      // ADDED 2025-11-23: Check if user is asking about current slider position
      const askingAboutCurrent = /current|this|now|my.*dpi|what.*dpi.*at.*this/i.test(userMessage);
      
      if (askingAboutCurrent && context.state?.metadata?.currentSliderPosition) {
        const slider = context.state.metadata.currentSliderPosition;
        const qualityEmoji = slider.quality === 'Optimal' ? '✨' : slider.quality === 'Good' ? '👌' : '⚠️';
        
        return {
          content: `You're currently at **${slider.widthCm.toFixed(1)} × ${slider.heightCm.toFixed(1)} cm** (${slider.widthInches.toFixed(2)}" × ${slider.heightInches.toFixed(2)}"), **DPI ${slider.dpi}**. ${qualityEmoji} **Quality: ${slider.quality}**`,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            cached: false,
            confidence: 1.0
          }
        };
      }
      
      return {
        content: "I couldn't understand the size you mentioned. Could you specify it like '26.6 × 24.0 cm' or '10 × 9 inches'?",
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.5
        }
      };
    }

    // FIXED 2025-11-25: If height is -1, calculate from aspect ratio
    if (sizeInfo.heightCm === -1) {
      const aspectRatio = artworkData.dimensions.pixels.height / artworkData.dimensions.pixels.width;
      sizeInfo.heightCm = sizeInfo.widthCm * aspectRatio;
    }

    // Calculate DPI
    const result = this.calculateDPI(
      artworkData.dimensions.pixels.width,
      artworkData.dimensions.pixels.height,
      sizeInfo.widthCm,
      sizeInfo.heightCm
    );

    // Format response
    const responseText = this.formatResponse(result);

      return {
        content: responseText,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 1.0
        }
      };
    } catch (error) {
      console.error('[SizeCalculationHandler] ERROR:', error);
      return {
        content: `Error in SizeCalculationHandler: ${error.message}`,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.0
        }
      };
    }
  }

  /**
   * Extract DPI for reverse calculation (DPI → size)
   */
  private extractReverseDPI(message: string): { dpi: number } | null {
    // Patterns: "what size at 300 DPI", "show me sizes for 250 DPI", "what about 250 DPI?", "and 200 DPI?"
    const reversePatterns = [
      /what size.*?at (\d+)\s*dpi/i,
      /size.*?for (\d+)\s*dpi/i,
      /(\d+)\s*dpi.*?size/i,
      /print.*?at (\d+)\s*dpi/i,
      /max.*?size.*?(\d+)\s*dpi/i,
      /(?:what about|and|also)\s*(\d+)\s*dpi/i,  // Follow-up questions
      /^(\d+)\s*dpi\??$/i,  // Just "250 DPI?" or "200 DPI"
      /at\s*(\d+)\s*dpi/i   // "at 250 DPI"
    ];
    
    for (const pattern of reversePatterns) {
      const match = message.match(pattern);
      if (match) {
        return { dpi: parseInt(match[1]) };
      }
    }
    
    return null;
  }

  /**
   * Extract multiple DPI values for batch calculation
   */
  private extractMultipleDPI(message: string): number[] | null {
    // Pattern: "show me sizes for 300, 250, and 200 DPI"
    const multiPattern = /(\d+)(?:\s*,\s*|\s+and\s+)(\d+)(?:\s*,?\s*and\s+|\s*,\s*)(\d+)\s*dpi/i;
    const match = message.match(multiPattern);
    
    if (match) {
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      ];
    }
    
    return null;
  }

  /**
   * Extract size from user message
   */
  private extractSize(message: string): { widthCm: number; heightCm: number } | null {
    // Try to extract CM dimensions first
    const cmPattern = /(\d+\.?\d*)\s*[×x]\s*(\d+\.?\d*)\s*cm/i;
    const cmMatch = message.match(cmPattern);
    
    if (cmMatch) {
      return {
        widthCm: parseFloat(cmMatch[1]),
        heightCm: parseFloat(cmMatch[2])
      };
    }

    // Try to extract inch dimensions and convert to CM
    const inchPattern = /(\d+\.?\d*)\s*[×x]\s*(\d+\.?\d*)\s*(?:inch|inches|")/i;
    const inchMatch = message.match(inchPattern);
    
    if (inchMatch) {
      return {
        widthCm: parseFloat(inchMatch[1]) * 2.54,
        heightCm: parseFloat(inchMatch[2]) * 2.54
      };
    }

    // Try single dimension with "wide" or "width"
    const singleWidthPattern = /(\d+\.?\d*)\s*(?:cm|centimeter)?\s*(?:wide|width)/i;
    const singleWidthMatch = message.match(singleWidthPattern);
    
    if (singleWidthMatch) {
      const width = parseFloat(singleWidthMatch[1]);
      // We have width only - need to calculate height based on aspect ratio
      // This will be handled in the handle() method where we have access to artwork data
      return {
        widthCm: width,
        heightCm: -1 // Flag to calculate from aspect ratio
      };
    }

    // Try single dimension (assume square)
    const singleCmPattern = /(\d+\.?\d*)\s*cm/i;
    const singleCmMatch = message.match(singleCmPattern);
    
    if (singleCmMatch) {
      const size = parseFloat(singleCmMatch[1]);
      return {
        widthCm: size,
        heightCm: size // Assume square if only one dimension given
      };
    }

    return null;
  }

  /**
   * Calculate DPI from pixel dimensions and physical size
   */
  private calculateDPI(
    pixelWidth: number,
    pixelHeight: number,
    widthCm: number,
    heightCm: number
  ): {
    widthCm: number;
    heightCm: number;
    widthInches: number;
    heightInches: number;
    dpiWidth: number;
    dpiHeight: number;
    dpiAverage: number;
    quality: 'Optimal' | 'Good' | 'Poor';
  } {
    // Convert CM to inches
    const widthInches = widthCm / 2.54;
    const heightInches = heightCm / 2.54;

    // Calculate DPI
    const dpiWidth = Math.round(pixelWidth / widthInches);
    const dpiHeight = Math.round(pixelHeight / heightInches);
    const dpiAverage = Math.round((dpiWidth + dpiHeight) / 2);

    // Determine quality
    let quality: 'Optimal' | 'Good' | 'Poor';
    if (dpiAverage >= 250) {
      quality = 'Optimal';
    } else if (dpiAverage >= 200) {
      quality = 'Good';
    } else {
      quality = 'Poor';
    }

    return {
      widthCm: Math.round(widthCm * 10) / 10,
      heightCm: Math.round(heightCm * 10) / 10,
      widthInches: Math.round(widthInches * 100) / 100,
      heightInches: Math.round(heightInches * 100) / 100,
      dpiWidth,
      dpiHeight,
      dpiAverage,
      quality
    };
  }

  /**
   * Format response for user
   */
  private formatResponse(result: ReturnType<typeof this.calculateDPI>): string {
    const emoji = result.quality === 'Optimal' ? '✨' : result.quality === 'Good' ? '👌' : '⚠️';
    
    return `At **${result.widthCm} × ${result.heightCm} cm** (${result.widthInches}" × ${result.heightInches}"), your DPI would be **${result.dpiAverage}**. ${emoji} **Quality: ${result.quality}**`;
  }
}

