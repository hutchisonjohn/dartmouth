/**
 * Calculation Handler
 * 
 * Handles calculation requests using the CalculationEngine for accurate results.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class CalculationHandler implements Handler {
  name = 'CalculationHandler';
  version = '1.0.0';

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
    const calcParams = this.extractArtworkParams(message);

    // Use CalculationEngine for accurate calculations
    let result: any;
    let responseText: string;

    if (calcParams && context.calculationEngine) {
      // Use CalculationEngine.preCompute for artwork calculations
      result = context.calculationEngine.preCompute(
        'artwork-' + Date.now(),
        calcParams.widthPixels,
        calcParams.heightPixels,
        calcParams.dpi
      );
      responseText = this.formatCalculationResponse(result, calcParams);
    } else {
      responseText = "I can help with print size calculations. Please provide artwork dimensions in pixels and desired DPI (e.g., '4000x6000 pixels at 300 DPI').";
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

  private formatCalculationResponse(result: any, params: any): string {
    if (!result || !result.sizes) {
      return "I couldn't perform that calculation. Could you provide artwork dimensions and DPI?";
    }

    // Format response with print sizes
    const sizeList = Object.entries(result.sizes as Record<string, any>)
      .map(([size, data]: [string, any]) => {
        if (data.available) {
          return `${size}: ${data.widthCm}cm x ${data.heightCm}cm (${data.widthIn}" x ${data.heightIn}")`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');

    return `For artwork ${params.widthPixels}x${params.heightPixels} pixels at ${params.dpi} DPI, you can print: ${sizeList}`;
  }
}

