/**
 * Calculation Handler
 * 
 * Handles calculation requests using the CalculationEngine for accurate results.
 */

import type { Intent, Response } from '@agent-army/shared';
import type { Handler, HandlerContext } from '@agent-army/shared';
import type { CalculationEngine } from '../components/CalculationEngine';

export class CalculationHandler implements Handler {
  name = 'CalculationHandler';
  version = '1.0.0';
  private calculationEngine: CalculationEngine;

  constructor(calculationEngine: CalculationEngine) {
    this.calculationEngine = calculationEngine;
  }

  canHandle(intent: Intent): boolean {
    return intent.type === 'calculation';
  }

  async handle(
    message: string,
    _intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    // Extract calculation parameters from message (pixels and DPI)
    let calcParams = this.extractArtworkParams(message);

    // If no params in message, try to get from artwork context
    if (!calcParams && context.conversationState?.messages) {
      calcParams = this.extractArtworkFromContext(context.conversationState.messages);
    }

    // Check if user is asking "what size at X DPI?" (e.g., "what will be the size with 150 dpi")
    const targetDPI = this.extractTargetDPI(message);
    if (targetDPI) {
      console.log(`[CalculationHandler] Detected target DPI: ${targetDPI}`);
      
      // Try to find artwork context in conversation history
      if (context.conversationState?.messages) {
        const sizeAtDPI = this.findSizeAtDPI(targetDPI, context.conversationState.messages);
        if (sizeAtDPI) {
          console.log(`[CalculationHandler] Found size at DPI from history: ${sizeAtDPI}`);
          return {
            content: sizeAtDPI,
            metadata: {
              handlerName: this.name,
              handlerVersion: this.version,
              processingTime: Date.now() - startTime,
              cached: false,
              confidence: 1.0
            }
          };
        } else {
          console.log(`[CalculationHandler] findSizeAtDPI returned null from history`);
        }
      }
      
      // Fallback: Try to extract from current message's artwork context
      const contextMatch = message.match(/\[Artwork Context: ({.*?})\]/s);
      if (contextMatch) {
        console.log(`[CalculationHandler] Found artwork context in current message`);
        try {
          const artworkContext = JSON.parse(contextMatch[1]);
          const dimMatch = artworkContext.dimensions?.match(/(\d+)x(\d+)/);
          
          if (dimMatch) {
            const widthPixels = parseInt(dimMatch[1]);
            const heightPixels = parseInt(dimMatch[2]);
            const widthInches = widthPixels / targetDPI;
            const heightInches = heightPixels / targetDPI;
            const widthCm = widthInches * 2.54;
            const heightCm = heightInches * 2.54;
            
            let quality: string;
            let emoji: string;
            if (targetDPI >= 250) {
              quality = 'Optimal';
              emoji = '✨';
            } else if (targetDPI >= 200) {
              quality = 'Good';
              emoji = '👌';
            } else {
              quality = 'Poor';
              emoji = '⚠️';
            }
            
            return {
              content: `At **${targetDPI} DPI**, your artwork will be:\n\n📏 **${widthCm.toFixed(2)} × ${heightCm.toFixed(2)} cm** (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}")\n\n${emoji} **Quality: ${quality}**`,
              metadata: {
                handlerName: this.name,
                handlerVersion: this.version,
                processingTime: Date.now() - startTime,
                cached: false,
                confidence: 1.0
              }
            };
          }
        } catch (e) {
          console.log(`[CalculationHandler] Error parsing artwork context from current message:`, e);
        }
      }
      
      console.log(`[CalculationHandler] No artwork context found anywhere`);
    }

    // Use CalculationEngine for accurate calculations
    let result: any;
    let responseText: string;

    if (calcParams && this.calculationEngine) {
      // Check if user is asking for DPI at a specific size
      const targetSize = this.extractTargetSize(message);
      
      if (targetSize) {
        // Calculate DPI at target size
        responseText = this.calculateDPIAtSize(calcParams, targetSize);
      } else {
        // Use CalculationEngine.preCompute for artwork calculations
        result = this.calculationEngine.preCompute(
          'artwork-' + Date.now(),
          calcParams.widthPixels,
          calcParams.heightPixels,
          calcParams.dpi
        );
        responseText = this.formatCalculationResponse(result, calcParams);
      }
    } else {
      // Use LLM fallback
      return {
        content: '',
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.3,
          useLLMFallback: true
        }
      };
    }

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: result ? 1.0 : 0.5,
        calculationResult: result
      }
    };
  }

  private extractArtworkParams(message: string): { widthPixels: number; heightPixels: number; dpi: number } | null {
    // Extract dimensions like "4000x6000 pixels" or "2000 x 3000 px"
    const dimensionPattern = /(\d+)\s*x\s*(\d+)\s*(pixels?|px)?/i;
    const dimensionMatch = message.match(dimensionPattern);
    
    // Extract DPI like "at 300 DPI" or "300dpi"
    const dpiPattern = /(\d+)\s*dpi/i;
    const dpiMatch = message.match(dpiPattern);
    
    if (dimensionMatch) {
      const width = parseInt(dimensionMatch[1]);
      const height = parseInt(dimensionMatch[2]);
      const dpi = dpiMatch ? parseInt(dpiMatch[1]) : 300; // Default to 300 DPI
      
      return {
        widthPixels: width,
        heightPixels: height,
        dpi
      };
    }
    
    return null;
  }

  private extractArtworkFromContext(messages: any[]): { widthPixels: number; heightPixels: number; dpi: number } | null {
    // Look for artwork context in recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.content && msg.content.includes('[Artwork Context:')) {
        const contextMatch = msg.content.match(/\[Artwork Context: ({.*?})\]/s);
        if (contextMatch) {
          try {
            const context = JSON.parse(contextMatch[1]);
            // Extract pixel dimensions from "2811x2539 pixels"
            const dimMatch = context.dimensions?.match(/(\d+)x(\d+)/);
            const dpi = parseInt(context.dpi) || 300;
            
            if (dimMatch) {
              return {
                widthPixels: parseInt(dimMatch[1]),
                heightPixels: parseInt(dimMatch[2]),
                dpi
              };
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    return null;
  }

  private extractTargetDPI(message: string): number | null {
    // Extract DPI like "150 dpi", "at 72 dpi", "with 300 dpi", "and 150 dpi"
    const dpiPattern = /(?:at|with|and|@)?\s*(\d+)\s*dpi/i;
    const dpiMatch = message.match(dpiPattern);
    
    if (dpiMatch) {
      return parseInt(dpiMatch[1]);
    }
    
    return null;
  }

  private findSizeAtDPI(targetDPI: number, messages: any[]): string | null {
    console.log(`[findSizeAtDPI] Looking for artwork context in ${messages.length} messages`);
    
    // Look for artwork context with pixel dimensions in recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.content && msg.content.includes('[Artwork Context:')) {
        console.log(`[findSizeAtDPI] Found artwork context in message ${i}`);
        const contextMatch = msg.content.match(/\[Artwork Context: ({.*?})\]/s);
        if (contextMatch) {
          try {
            const context = JSON.parse(contextMatch[1]);
            console.log(`[findSizeAtDPI] Parsed context:`, context);
            
            // Extract pixel dimensions from "2811x2539 pixels"
            const dimMatch = context.dimensions?.match(/(\d+)x(\d+)/);
            
            if (dimMatch) {
              const widthPixels = parseInt(dimMatch[1]);
              const heightPixels = parseInt(dimMatch[2]);
              console.log(`[findSizeAtDPI] Extracted dimensions: ${widthPixels}x${heightPixels}`);
              
              // Calculate size at target DPI
              const widthInches = widthPixels / targetDPI;
              const heightInches = heightPixels / targetDPI;
              const widthCm = widthInches * 2.54;
              const heightCm = heightInches * 2.54;
              
              // Determine quality
              let quality: string;
              let emoji: string;
              if (targetDPI >= 250) {
                quality = 'Optimal';
                emoji = '✨';
              } else if (targetDPI >= 200) {
                quality = 'Good';
                emoji = '👌';
              } else {
                quality = 'Poor';
                emoji = '⚠️';
              }
              
              return `At **${targetDPI} DPI**, your artwork will be:\n\n📏 **${widthCm.toFixed(2)} × ${heightCm.toFixed(2)} cm** (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}")\n\n${emoji} **Quality: ${quality}**`;
            } else {
              console.log(`[findSizeAtDPI] No dimension match in context`);
            }
          } catch (e) {
            console.log(`[findSizeAtDPI] Error parsing context:`, e);
          }
        }
      }
    }
    console.log(`[findSizeAtDPI] No artwork context found, returning null`);
    return null;
  }

  private extractTargetSize(message: string): { widthCm: number; heightCm: number } | { widthInches: number; heightInches: number } | null {
    // Extract CM dimensions like "37.5 × 33.9 cm" or "37.5 x 33.9 cm"
    const cmPattern = /([\d.]+)\s*[×x]\s*([\d.]+)\s*cm/i;
    const cmMatch = message.match(cmPattern);
    
    if (cmMatch) {
      return {
        widthCm: parseFloat(cmMatch[1]),
        heightCm: parseFloat(cmMatch[2])
      };
    }
    
    // Extract inch dimensions like "10 × 12 inches" or "10 x 12 in"
    const inchPattern = /([\d.]+)\s*[×x]\s*([\d.]+)\s*(inches?|in|")/i;
    const inchMatch = message.match(inchPattern);
    
    if (inchMatch) {
      return {
        widthInches: parseFloat(inchMatch[1]),
        heightInches: parseFloat(inchMatch[2])
      };
    }
    
    return null;
  }

  private calculateDPIAtSize(params: { widthPixels: number; heightPixels: number; dpi: number }, targetSize: any): string {
    let widthInches: number;
    let heightInches: number;
    let widthCm: number;
    let heightCm: number;
    
    if ('widthCm' in targetSize) {
      widthCm = targetSize.widthCm;
      heightCm = targetSize.heightCm;
      widthInches = widthCm / 2.54;
      heightInches = heightCm / 2.54;
    } else {
      widthInches = targetSize.widthInches;
      heightInches = targetSize.heightInches;
      widthCm = widthInches * 2.54;
      heightCm = heightInches * 2.54;
    }
    
    // Calculate DPI
    const dpiWidth = params.widthPixels / widthInches;
    const dpiHeight = params.heightPixels / heightInches;
    const avgDPI = Math.round((dpiWidth + dpiHeight) / 2);
    
    // Determine quality (CORRECT RANGES)
    let quality: string;
    let emoji: string;
    if (avgDPI >= 250) {
      quality = 'Optimal';
      emoji = '✨';
    } else if (avgDPI >= 200) {
      quality = 'Good';
      emoji = '👌';
    } else {
      quality = 'Poor';
      emoji = '⚠️';
    }
    
    return `At **${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm** (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}"), your artwork will be **${avgDPI} DPI**.\n\n${emoji} **Quality: ${quality}**\n\nYour artwork is ${params.widthPixels} × ${params.heightPixels} pixels.`;
  }

  private formatCalculationResponse(result: any, params: any): string {
    if (!result || !result.maxSizes) {
      return "I couldn't perform that calculation. Could you provide artwork dimensions and DPI?";
    }

    // Get the actual size at the user's DPI
    const actualDPI = params.dpi;
    const widthInches = params.widthPixels / actualDPI;
    const heightInches = params.heightPixels / actualDPI;
    const widthCm = widthInches * 2.54;
    const heightCm = heightInches * 2.54;

    // Determine quality based on DPI (CORRECT RANGES)
    let quality = 'optimal';
    let qualityAdvice = '';
    
    if (actualDPI >= 250) {
      quality = 'optimal';
      qualityAdvice = "That's excellent quality for professional printing! 🎨";
    } else if (actualDPI >= 200) {
      quality = 'good';
      qualityAdvice = "That's good quality - suitable for most printing needs.";
    } else {
      quality = 'poor';
      qualityAdvice = "⚠️ This DPI is too low for quality printing. You'll likely see pixelation. For best results, I'd recommend at least 200 DPI for good quality, or 250-300 DPI for optimal quality.";
    }

    // Format the response with personality
    let response = `Great question! Let me break this down for you:\n\n`;
    response += `📐 **Your Artwork:** ${params.widthPixels} x ${params.heightPixels} pixels at ${actualDPI} DPI\n\n`;
    response += `📏 **Print Size:** ${widthCm.toFixed(2)}cm x ${heightCm.toFixed(2)}cm (${widthInches.toFixed(2)}" x ${heightInches.toFixed(2)}")\n\n`;
    response += `✨ **Quality:** ${quality.toUpperCase()}\n${qualityAdvice}`;

    // Add recommendations for low DPI
    if (actualDPI < 200) {
      const recommendedWidthIn = params.widthPixels / 300;
      const recommendedHeightIn = params.heightPixels / 300;
      const recommendedWidthCm = (recommendedWidthIn * 2.54).toFixed(1);
      const recommendedHeightCm = (recommendedHeightIn * 2.54).toFixed(1);
      response += `\n\n💡 **My Recommendation:** For sharp, professional prints, try printing at ${recommendedWidthCm} × ${recommendedHeightCm} cm (${recommendedWidthIn.toFixed(2)}" × ${recommendedHeightIn.toFixed(2)}") at 300 DPI instead. The smaller size will look much better!`;
    }

    return response;
  }
}

